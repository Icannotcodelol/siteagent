import { createClient } from '@supabase/supabase-js' // Use standard client for service role
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone'; // Changed to standard Node.js import
import { decrypt } from '@/lib/encryption';
import { getValidCalendlyAccessToken } from '@/lib/calendly';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { canSendMessage, incrementMessageCount } from '@/lib/services/subscriptionService';

// Define ChatMessage type for conversation history
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Define Action type matching DB schema
type Action = {
  id: string;
  chatbot_id: string;
  name: string;
  description: string | null;
  trigger_keywords: string[];
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // More specific type
  url: string;
  headers: object | null; // Change back to generic object for processing
  request_body_template: object | null; // Keep as object for now
  success_message: string | null;
  created_at: string;
};

// --- Constants ---
// Should match the ones used in the authenticated chat route and embedding function
const OPENAI_CHAT_MODEL = 'gpt-4o';
const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-large';
const SIMILARITY_THRESHOLD = 0.65; // Lowered for better recall with complete documents
const MATCH_COUNT = 8; // Increased for better context coverage with complete documents

// NEW: Global base prompt that is always prepended to every chatbot prompt
const SITEAGENT_GLOBAL_BASE_PROMPT = `Always provide helpful, polite, and accurate responses based only on the information and tools provided.
Approach each question or task with logical reasoning, breaking down complex problems into steps if needed. Use any provided data to perform simple calculations or comparisons when appropriate, but only if the context clearly supports it.
Anticipate what logically follows from the user's query or scenario, and when appropriate, offer additional relevant guidance or information even if it wasn't explicitly requested.
If a question cannot be answered using the provided information, clearly admit that you do not know or cannot answer. Do not guess or provide information that isn't supported by the context.
Maintain a polite and respectful tone at all times. Do not adopt any specific persona or style beyond what the user's instructions specify.
Use only the knowledge and resources provided (via the conversation context or authorized tools). Do not use outside information, and do not attempt any web searches or external data retrieval.
When providing Google Maps links, always use the format "https://maps.google.com/maps?q=" followed by the location or address. Never use embedded map URLs or iframe-style Google Maps links.`;

// Shopify API version constant
const SHOPIFY_API_VERSION = '2024-04';

// --- Initialize OpenAI client ---
// Ensure OPENAI_API_KEY is set as a Supabase secret or environment variable
// For API routes, standard process.env should work if set in Vercel/Docker etc.
// If using Supabase secrets, fetching them here is more complex than in Edge Functions.
// Let's assume process.env works for now.
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    console.error("Missing OPENAI_API_KEY environment variable for public chat route.");
    // Avoid throwing error during initialization if possible, handle in request
}
const openai = new OpenAI({ apiKey: openaiApiKey });

// --- Initialize Supabase Admin Client ---
// Use Service Role Key for backend operations that bypass RLS if needed
// Ensure these are set in the environment where the API route runs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Key here!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Role Key environment variables.");
    // Avoid throwing error during initialization if possible, handle in request
}

// Create client ONCE if possible, or per request if env vars might change (less likely)
// Note: Using Service Role Key bypasses RLS - ensure database functions/queries are secure.
const supabaseAdmin = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '');

// --- Initialize Pinecone Client ---
const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

let pineconeClient: Pinecone | null = null;
if (pineconeApiKey && pineconeEnvironment) {
  try {
    console.log("Initializing Pinecone client for public chat route (Node.js environment)...");
    // Pass only apiKey; the SDK should pick up PINECONE_ENVIRONMENT from process.env
    pineconeClient = new Pinecone({ apiKey: pineconeApiKey }); 
    console.log("Pinecone client initialized successfully for public chat route.");
  } catch (e: any) {
    console.error("Failed to initialize Pinecone client for public chat route:", e.message);
    // Not throwing here, will be handled during request if pineconeClient is null
  }
} else {
  console.warn("Pinecone API Key or Environment not set. Pinecone features will be disabled.");
}

// Interface for Pinecone query match (basic structure)
interface PineconeMatch {
  id: string;
  score?: number;
  metadata?: {
    chunk_text?: string;
    document_id?: string;
    chatbot_id?: string; // Filter is by chatbot_id, metadata might also contain it
    [key: string]: any; // Allow other metadata properties
  };
  values?: number[]; // Embeddings, if includeValues was true
}

// --- Helper Function for Extracting Vault Secret Names ---
function extractVaultSecretNames(template: object | null): Set<string> {
    const names = new Set<string>();
    if (!template) return names;

    try {
        const templateString = JSON.stringify(template);
        const regex = /{{\s*vault:([\w.-]+)\s*}}/g; // Match {{ vault:SECRET_NAME }}
        let match;
        while ((match = regex.exec(templateString)) !== null) {
            names.add(match[1]); // Add the captured secret name
        }
    } catch (error) {
        console.error("Error extracting vault secret names:", error);
    }
    return names;
}

// --- Helper Function for Templating (Now uses secretsMap) ---
function processTemplate(
    template: object | null,
    context: Record<string, string>,
    secretsMap: Record<string, string>
): object | null {
    if (!template) return null;

    try {
        let templateString = JSON.stringify(template);
        
        // 1. Replace Vault secrets first
        for (const secretName in secretsMap) {
            // Escape for JSON string context
            const jsonEscapedValue = JSON.stringify(secretsMap[secretName]).slice(1, -1); 
            const placeholder = new RegExp(`{{\s*vault:${secretName}\s*}}`, 'g');
            templateString = templateString.replace(placeholder, jsonEscapedValue);
        }
        
        // 2. Replace regular context variables
        for (const key in context) {
             // Escape for JSON string context
            const jsonEscapedValue = JSON.stringify(context[key]).slice(1, -1); 
            const placeholder = new RegExp(`{{\s*${key}\s*}}`, 'g');
            templateString = templateString.replace(placeholder, jsonEscapedValue);
        }

        // Check if any vault placeholders remain (means secret wasn't found/provided)
        const remainingVaultPlaceholder = /{{\s*vault:[\w.-]+\s*}}/.test(templateString);
        if (remainingVaultPlaceholder) {
            console.error("Template processing failed: Not all Vault secrets were substituted.", templateString);
            throw new Error("Failed to substitute all Vault secrets in template.");
        }

        return JSON.parse(templateString);
    } catch (error: any) {
        console.error("Error processing template:", error.message, "Original template:", template);
        return null;
    }
}

// Helper: fetch Shopify order details for the store connected to the *owner* of the supplied chatbot
async function getShopifyOrderDetailsForChatbot({ order_name, chatbot_id }: { order_name: string; chatbot_id: string }) {
    try {
        if (!order_name || !chatbot_id) {
            return { error: 'Missing order name or chatbot id.' };
        }

        // Step 1: Resolve owner (user) of the chatbot so we can look-up their OAuth token
        const { data: chatbotOwnerRow, error: chatbotOwnerErr } = await supabaseAdmin
            .from('chatbots')
            .select('user_id')
            .eq('id', chatbot_id)
            .maybeSingle();

        if (chatbotOwnerErr || !chatbotOwnerRow) {
            console.error('Shopify helper: chatbot owner lookup failed', chatbotOwnerErr);
            return { error: 'Could not resolve chatbot owner.' };
        }

        const userId = chatbotOwnerRow.user_id;

        // Step 2: Fetch encrypted access token & shop metadata
        const { data: tokenRow, error: tokenErr } = await supabaseAdmin
            .from('user_oauth_tokens')
            .select('access_token, metadata')
            .eq('user_id', userId)
            .eq('service_name', 'shopify')
            .maybeSingle();

        if (tokenErr || !tokenRow) {
            console.error('Shopify helper: token lookup failed', tokenErr);
            return { error: 'Shopify not connected for this chatbot.' };
        }

        const encryptedAccessToken: string | null = tokenRow.access_token;
        const shopDomain: string | undefined = tokenRow.metadata?.shop;

        if (!encryptedAccessToken || !shopDomain) {
            return { error: 'Incomplete Shopify credentials.' };
        }

        const accessToken = decrypt(encryptedAccessToken);
        if (!accessToken) {
            return { error: 'Failed to decrypt Shopify access token.' };
        }

        // Normalise order name (remove leading # if present)
        const normalizedOrderName = order_name.replace(/^#/, '').trim();

        const apiUrl = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/orders.json?name=${encodeURIComponent(normalizedOrderName)}&status=any`;

        const resp = await fetch(apiUrl, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
        });

        if (!resp.ok) {
            const errBody = await resp.text();
            console.error('Shopify helper: API request failed', resp.status, errBody);
            return { error: `Shopify API error: ${resp.status}` };
        }

        const json = await resp.json();
        if (!json.orders || json.orders.length === 0) {
            return { error: `Order '${order_name}' not found.` };
        }

        // Strip down the response to essential information to save tokens
        const order = json.orders[0];
        const minimal = {
            id: order.id,
            name: order.name,
            created_at: order.created_at,
            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status,
            total_price: order.total_price,
            currency: order.currency,
            customer: order.customer ? {
                first_name: order.customer.first_name,
                last_name: order.customer.last_name,
                email: order.customer.email,
            } : undefined,
            shipping_address: order.shipping_address ? {
                address1: order.shipping_address.address1,
                city: order.shipping_address.city,
                province: order.shipping_address.province,
                country: order.shipping_address.country,
                zip: order.shipping_address.zip,
            } : undefined,
            order_status_url: order.order_status_url,
        };

        return { data: minimal };
    } catch (err: any) {
        console.error('Shopify helper: unexpected error', err);
        return { error: 'Unexpected server error while fetching order details.' };
    }
}

// Helper: create a single-use Calendly scheduling link for the chatbot owner's account
async function createCalendlySchedulingLink({ chatbot_id, event_type_uri }: { chatbot_id: string; event_type_uri?: string }) {
    try {
        // Resolve owner
        const { data: botRow, error: botErr } = await supabaseAdmin
            .from('chatbots')
            .select('user_id')
            .eq('id', chatbot_id)
            .maybeSingle();

        if (botErr || !botRow) {
            console.error('Calendly helper: chatbot owner lookup failed', botErr);
            return { error: 'Could not resolve chatbot owner.' };
        }

        const ownerId = botRow.user_id as string;

        // Get valid access token
        let accessToken: string;
        try {
            accessToken = await getValidCalendlyAccessToken(ownerId);
        } catch (tokenErr: any) {
            console.error('Calendly helper: token retrieval failed', tokenErr);
            return { error: 'Calendly not connected or token invalid.' };
        }

        const CALENDLY_API_BASE = 'https://api.calendly.com';

        // If no event_type_uri provided, fetch first active
        let evtUri = event_type_uri;
        if (!evtUri) {
            // Get user URI
            const userResp = await fetch(`${CALENDLY_API_BASE}/users/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!userResp.ok) {
                const t = await userResp.text();
                console.error('Calendly helper: user fetch failed', t);
                return { error: 'Failed to fetch Calendly user.' };
            }
            const userJson = await userResp.json();
            const userUri = userJson.resource?.uri;
            if (!userUri) return { error: 'Calendly user URI missing.' };

            const evResp = await fetch(`${CALENDLY_API_BASE}/event_types?user=${encodeURIComponent(userUri)}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!evResp.ok) {
                console.error('Calendly helper: event types fetch failed', await evResp.text());
                return { error: 'Failed to fetch Calendly event types.' };
            }
            const evJson = await evResp.json();
            const firstEvt = evJson.collection?.[0];
            if (!firstEvt) return { error: 'No active Calendly event types.' };
            evtUri = firstEvt.uri;
        }

        // Create scheduling link
        const scheduleResp = await fetch(`${CALENDLY_API_BASE}/scheduling_links`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                owner: evtUri,
                owner_type: 'EventType',
                max_event_start_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                max_event_count: 1,
            }),
        });

        if (!scheduleResp.ok) {
            console.error('Calendly helper: schedule link creation failed', await scheduleResp.text());
            return { error: 'Failed to create Calendly scheduling link.' };
        }

        const schedJson = await scheduleResp.json();
        const url = schedJson.resource?.booking_url ?? schedJson.resource?.url;
        if (!url) return { error: 'Calendly API did not return link.' };

        return { url };
    } catch (err: any) {
        console.error('Calendly helper: unexpected error', err);
        return { error: 'Unexpected server error while generating Calendly link.' };
    }
}

// --- OpenAI tool / function definition ---
const openAiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_shopify_order_details',
            description: 'Fetch details of a Shopify order (status, fulfillment, etc.) for the store connected to this chatbot.',
            parameters: {
                type: 'object',
                properties: {
                    order_name: {
                        type: 'string',
                        description: "The Shopify order name or number, e.g. '1001' or '#1001'.",
                    },
                },
                required: ['order_name'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_calendly_meeting_link',
            description: 'Generate a single-use Calendly scheduling link for the chatbot owner and return it for embedding.',
            parameters: {
                type: 'object',
                properties: {
                    event_type_uri: {
                        type: 'string',
                        description: 'Optional Calendly event type URI to use. If omitted, the first active event type will be used.',
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_jira_issue',
            description: 'Create a Jira issue (support ticket) in the project connected to this chatbot.',
            parameters: {
                type: 'object',
                properties: {
                    project_key: {
                        type: 'string',
                        description: 'The Jira project key where the issue should be created, e.g. "SUP".',
                    },
                    summary: {
                        type: 'string',
                        description: 'A short summary / title of the issue.'
                    },
                    description: {
                        type: 'string',
                        description: 'Detailed description of the issue.',
                    },
                },
                required: ['summary'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_hubspot_contact',
            description: 'Create or update a contact in the chatbot owner\'s connected HubSpot account. You MUST first collect a valid email address (and preferably the user\'s first and last name) directly from the user before calling this function. Do NOT invent or use placeholder values. If the user has not yet provided these details, ask for them.',
            parameters: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        description: 'Email address of the contact (must be unique).',
                    },
                    firstname: {
                        type: 'string',
                        description: 'First name of the contact.',
                    },
                    lastname: {
                        type: 'string',
                        description: 'Last name of the contact.',
                    },
                },
                required: ['email'],
            },
        },
    },
] ;

// Utility: extract candidate tokens (numeric codes and words >3 chars)
function extractSearchTokens(text: string): string[] {
  const tokens: Set<string> = new Set();
  const numericMatches = text.match(/\b\d{4,}\b/g); // 4+ digit numbers (postal codes, IDs)
  if (numericMatches) numericMatches.forEach(t => tokens.add(t));
  // Fallback: significant words (>3 chars, ignore common stopwords)
  const stop = new Set(['welcher','ist','für','und','oder','eine','einen','die','der','das']);
  text.toLowerCase().split(/[^a-z0-9äöüß]+/).forEach(w => {
    if (w.length > 3 && !stop.has(w)) tokens.add(w);
  });
  return Array.from(tokens);
}

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
    // Re-check environment variables per request in case they failed init
    if (!openaiApiKey) {
        return NextResponse.json({ error: "Server configuration error: OpenAI key missing." }, { status: 500, headers: getCorsHeaders() });
    }
     if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: "Server configuration error: Supabase keys missing." }, { status: 500, headers: getCorsHeaders() });
    }

    // 1. Extract query, chatbotId, history, and sessionId from request body
    let query: string;
    let chatbotId: string;
    let history: ChatMessage[] | undefined = undefined;
    let sessionIdFromRequest: string | undefined;

    try {
        const body = await request.json();
        query = body.query;
        chatbotId = body.chatbotId;
        sessionIdFromRequest = body.sessionId; // Expect sessionId from client

        if (body.history && Array.isArray(body.history)) {
            history = body.history.filter(
                (msg: any) => 
                    msg && typeof msg.role === 'string' && typeof msg.content === 'string' && 
                    (msg.role === 'user' || msg.role === 'assistant')
            );
        }
        if (!query || typeof query !== 'string' || !chatbotId || typeof chatbotId !== 'string') {
            throw new Error('Missing or invalid "query" or "chatbotId" in request body.');
        }
    } catch (e: any) {
        return NextResponse.json({ error: `Invalid request body: ${e.message}` }, { status: 400, headers: getCorsHeaders() });
    }

    const sessionId = sessionIdFromRequest || uuidv4(); // Use provided or generate new

    console.log(`Received PUBLIC chat request for chatbot ${chatbotId}, session ${sessionId}: \"${query}\"`);

    // --- Step 1: Fetch Chatbot Owner ID ---
    let ownerId: string;
    try {
        const { data: chatbotOwnerData, error: ownerError } = await supabaseAdmin
            .from('chatbots')
            .select('user_id')
            .eq('id', chatbotId)
            .single();
        if (ownerError || !chatbotOwnerData?.user_id) {
            console.error(`Error fetching owner for chatbot ${chatbotId}:`, ownerError?.message);
            return NextResponse.json({ error: 'Chatbot not found or configuration error.' }, { status: 404, headers: getCorsHeaders() });
        }
        ownerId = chatbotOwnerData.user_id;
    } catch (e: any) {
        console.error(`Unexpected error fetching chatbot owner for ${chatbotId}:`, e.message);
        return NextResponse.json({ error: 'Server error fetching chatbot details.' }, { status: 500, headers: getCorsHeaders() });
    }

    // --- Step 2: PERMISSION CHECK: canSendMessage --- 
    const userCanSend = await canSendMessage(ownerId, supabaseAdmin);
    if (!userCanSend) {
        console.warn(`User ${ownerId} (creator of chatbot ${chatbotId}) has reached their message limit.`);
        return NextResponse.json({ error: 'This chatbot is temporarily unavailable due to high message volume. Please try again later.', sessionId }, { status: 503, headers: getCorsHeaders() });
    }

    // --- Step 3: Store User's Message ---
    try {
        const { error: userMessageError } = await supabaseAdmin.from('chat_messages').insert({
            chatbot_id: chatbotId,
            session_id: sessionId,
            is_user_message: true,
            content: query,
        });
        if (userMessageError) {
            console.error("Error saving user's message:", userMessageError);
        }
    } catch (e) {
        console.error("Exception saving user's message:", e);
    }

    // --- Step 4: Main processing logic (Actions, RAG, LLM call) ---
    try {
        // --- ACTION CHECK LOGIC (existing code) ---
        const { data: actions, error: actionsError } = await supabaseAdmin
            .from('chatbot_actions')
            .select('*')
            .eq('chatbot_id', chatbotId);
        
        if (actionsError) {
            console.error("Error fetching actions:", actionsError);
        } else if (actions && actions.length > 0) {
            const lowerCaseQuery = query.toLowerCase();
            let triggeredAction: Action | null = null;

            for (const action of actions as Action[]) {
                if (action.trigger_keywords.some(keyword => lowerCaseQuery.includes(keyword.toLowerCase()))) {
                    triggeredAction = action;
                    break; 
                }
            }

            if (triggeredAction) {
                console.log(`Executing action: ${triggeredAction.http_method} ${triggeredAction.url}`);
                let secretsMap: Record<string, string> = {};
                try {
                    // --- Identify Needed Vault Secrets ---
                    const headerSecretNames = extractVaultSecretNames(triggeredAction.headers);
                    const bodySecretNames = extractVaultSecretNames(triggeredAction.request_body_template);
                    const uniqueSecretNames = Array.from(new Set([...headerSecretNames, ...bodySecretNames]));

                    // --- Fetch Secrets using RPC Function ---
                    if (uniqueSecretNames.length > 0) {
                        console.log(`Fetching Vault secrets via RPC: ${uniqueSecretNames.join(', ')}`);
                        // Call the SQL function using supabaseAdmin client
                        const { data: fetchedSecrets, error: rpcError } = await supabaseAdmin.rpc(
                            'get_decrypted_secrets', 
                            { secret_names: uniqueSecretNames } // Pass names as the argument
                        );

                        if (rpcError) {
                            console.error("RPC Error fetching secrets from Vault:", rpcError);
                            throw new Error(`Failed to fetch secrets using RPC: ${rpcError.message}`);
                        }
                        
                        // Check if the function returned a valid object and assign it
                        if (typeof fetchedSecrets === 'object' && fetchedSecrets !== null) {
                            secretsMap = fetchedSecrets; 
                            // Optionally, verify all requested secrets were returned (the function handles this with warnings/nulls now)
                             console.log(`Successfully fetched ${Object.keys(secretsMap).length} secrets via RPC.`);
                             // Check for null values which indicate missing secrets in the DB function
                             for(const name of uniqueSecretNames) {
                                 if (secretsMap[name] === null) {
                                     console.error(`Vault secret '${name}' was not found by the database function.`);
                                     throw new Error(`Required Vault secret '${name}' not found.`);
                                 }
                             }
                        } else {
                            console.error("RPC function get_decrypted_secrets did not return a valid object:", fetchedSecrets);
                            throw new Error("Failed to retrieve secrets map from database function.");
                        }
                        
                    } else {
                         console.log("No Vault secrets referenced in this action.");
                    }
                    
                    // --- Prepare Context for Templating ---
                    const templateContext = {
                        user_query: query,
                        chatbot_id: chatbotId,
                        timestamp: new Date().toISOString(),
                    };

                    // --- Process Templates (using secretsMap from RPC) ---
                    const processedHeaders = processTemplate(
                        triggeredAction.headers,
                        templateContext,
                        secretsMap
                    ) as Record<string, string> | null;

                    const processedBodyTemplate = (triggeredAction.http_method !== 'GET' && triggeredAction.request_body_template)
                        ? processTemplate(triggeredAction.request_body_template, templateContext, secretsMap)
                        : null;

                    const requestBody = processedBodyTemplate ? JSON.stringify(processedBodyTemplate) : undefined;
                        
                    // --- Template Processing Error Check ---
                    let templateError = false;
                    if (triggeredAction.headers && !processedHeaders) {
                        console.error(`Header template processing failed for action ${triggeredAction.name}.`);
                        templateError = true;
                    }
                    if (triggeredAction.request_body_template && !processedBodyTemplate && triggeredAction.http_method !== 'GET') {
                        console.error(`Body template processing failed for action ${triggeredAction.name}.`);
                        templateError = true;
                    }
                    if (templateError) {
                         throw new Error("Internal error processing action templates (check logs for details).")
                    }

                    // --- Execute Fetch with Processed Data ---
                    const response = await fetch(triggeredAction.url, {
                        method: triggeredAction.http_method,
                        headers: processedHeaders ?? undefined,
                        body: requestBody,
                    });

                    console.log(`Action API response status: ${response.status}`);

                    if (!response.ok) {
                        // Log error details if possible
                        let errorBody = 'Unknown error';
                        try { errorBody = await response.text(); } catch { /* ignore */ }
                        console.error(`Action API request failed: ${response.status} ${response.statusText}`, errorBody);
                        // Return a generic failure message to the user
                        return NextResponse.json({ answer: `I tried to perform the action '${triggeredAction.name}', but encountered an error.` }, { status: 200, headers: getCorsHeaders() }); // Return 200 OK but with error message
                    }

                    // --- Parse response body ---
                    let responseData: any = null;
                    try {
                        const text = await response.text();
                        try { responseData = JSON.parse(text); } catch { responseData = text; }
                    } catch {}

                    const substitute = (tpl: string) => tpl.replace(/{{\s*response\.([\w]+)\s*}}/g, (_, key) => {
                        if (responseData && typeof responseData === 'object' && key in responseData) {
                            return String(responseData[key]);
                        }
                        return '';
                    });

                    // Action succeeded
                    if (triggeredAction.success_message) {
                        await incrementMessageCount(ownerId, supabaseAdmin);
                        return NextResponse.json({ answer: substitute(triggeredAction.success_message) }, { status: 200, headers: getCorsHeaders() });
                    } else {
                        await incrementMessageCount(ownerId, supabaseAdmin);
                        return NextResponse.json({ answer: `Okay, I have performed the action: ${triggeredAction.name}.` }, { status: 200, headers: getCorsHeaders() });
                    }

                } catch (execError: any) {
                    console.error(`Error preparing or executing action fetch for ${triggeredAction.name}:`, execError);
                    // Do NOT increment count here as the action failed to deliver a response to user
                    return NextResponse.json({ answer: `I encountered an unexpected error when trying to perform the action '${triggeredAction.name}'. Details: ${execError.message}` }, { status: 200, headers: getCorsHeaders() });
                }
            } 
        }
        // --- End Action Check (If action returned, code execution stops above) ---
        
        console.log("No direct action response, proceeding with RAG/LLM for session:", sessionId);

        // --- Fetch Chatbot details (system_prompt, integrations etc.) ---
        const { data: chatbotDetails, error: chatbotFetchError } = await supabaseAdmin
            .from('chatbots')
            .select('id, name, system_prompt, integration_hubspot, integration_jira, integration_calendly') // user_id already fetched as ownerId
            .eq('id', chatbotId)
            .single(); 

        if (chatbotFetchError) {
            console.error('Error fetching chatbot details (public): ', chatbotFetchError);
            return NextResponse.json({ error: 'Invalid chatbot specified or server error.' }, { status: 404, headers: getCorsHeaders() });
        }
        // ... (rest of your logic for system_prompt, integration flags, Pinecone, LLM call remains)
        // Ensure `chatbotData` used below is now `chatbotDetails`
        const {
            system_prompt: baseSystemPrompt,
            integration_hubspot,
            integration_jira,
            integration_calendly,
        } = chatbotDetails as any;

        // Determine which integrations are BOTH toggled on for this chatbot AND actually connected at the account level
        let hubspotConnected = false;
        let jiraConnected = false;
        let calendlyConnected = false;

        if (ownerId) {
            const { data: tokenRows, error: tokenErr } = await supabaseAdmin
                .from('user_oauth_tokens')
                .select('service_name')
                .eq('user_id', ownerId);

            if (tokenErr) {
                console.error('Error fetching owner OAuth tokens:', tokenErr);
            } else if (tokenRows) {
                const services = tokenRows.map((row: any) => row.service_name);
                hubspotConnected = services.includes('hubspot');
                jiraConnected = services.includes('jira');
                calendlyConnected = services.includes('calendly');
            }
        }

        // Final booleans indicating availability for the chatbot
        const hasHubspot = Boolean(integration_hubspot && hubspotConnected);
        const hasJira     = Boolean(integration_jira && jiraConnected);
        const hasCalendly = Boolean(integration_calendly && calendlyConnected);

        const enabledIntegrations: string[] = [];
        if (hasHubspot) enabledIntegrations.push('HubSpot');
        if (hasJira) enabledIntegrations.push('Jira');
        if (hasCalendly) enabledIntegrations.push('Calendly');

        const integrationNote = enabledIntegrations.length
            ? `\n\nThis chatbot is able to perform the following external actions: ${enabledIntegrations.join(', ')}.`
            : '';

        // Additional usage guidelines for each enabled integration so the LLM knows when to ask follow-up questions
        let integrationGuidelines = '';
        if (hasHubspot) {
            integrationGuidelines += `\n\nHubSpot usage guideline: before calling \"create_hubspot_contact\" you must have a valid user email address (and, if possible, their first and last name). If this information has not yet been provided in the conversation, politely ask the user for it instead of guessing or using placeholder values.`;
        }
        if (hasJira) {
            integrationGuidelines += `\n\nJira usage guideline: only call \"create_jira_issue\" after you have collected a clear issue summary (and optional description) from the user.`;
        }
        if (hasCalendly) {
            integrationGuidelines += `\n\nCalendly usage guideline: you may call \"create_calendly_meeting_link\" when the user explicitly requests to book a meeting. The \"event_type_uri\" parameter is optional.`;
        }

        const userDefinedPrompt = baseSystemPrompt || "You are a helpful AI assistant. Answer based only on the provided context.";

        // Combine prompts so the global base prompt is ALWAYS first, followed by the user's custom prompt (if any),
        // and finally any integration notes/guidelines.
        const systemPrompt = `${SITEAGENT_GLOBAL_BASE_PROMPT}

---\n\nUser-defined instructions:\n${userDefinedPrompt}
---` + integrationNote + integrationGuidelines;

        console.log(`Using system prompt (first 100 chars): \"${systemPrompt.substring(0,100)}...\"`);
        // -------------------------------------------------------------

        // 2. Generate embedding for the user's query
        console.log("Generating query embedding...");
        const embeddingResponse = await openai.embeddings.create({
            model: OPENAI_EMBEDDING_MODEL,
            input: query,
        });
        const queryEmbedding = embeddingResponse.data[0].embedding;
        console.log("Query embedding generated.");

        // 3. Find relevant document chunks using Pinecone (replaces RPC)
        console.log("Matching document chunks via Pinecone...");
        let chunks: Array<{ chunk_text: string; [key: string]: any } | undefined> | undefined = [];

        if (!pineconeClient) {
          console.error("Pinecone client not initialized. Skipping Pinecone query.");
          // Potentially fall back to Postgres RPC here if desired, or just return no context.
          // For now, we'll proceed with no context if Pinecone isn't available.
        } else if (!pineconeIndexName) {
          console.error("Pinecone index name not configured. Skipping Pinecone query.");
        } else {
          try {
            const index = pineconeClient.Index(pineconeIndexName);
            console.log(`[Chatbot: ${chatbotId}] Querying Pinecone index '${pineconeIndexName}' with embedding.`);
            const pineconeResponse = await index.query({
              vector: queryEmbedding,
              topK: MATCH_COUNT,
              includeMetadata: true,
              filter: {
                chatbot_id: { '$eq': chatbotId } 
              }
            });
            
            console.log(`[Chatbot: ${chatbotId}] Pinecone response: ${pineconeResponse.matches?.length ?? 0} matches.`);

            chunks = pineconeResponse?.matches
              ?.map((match: PineconeMatch) => { // Added PineconeMatch type
                if (match.metadata && typeof match.metadata.chunk_text === 'string') {
                  return {
                    chunk_text: match.metadata.chunk_text,
                    similarity: match.score, // Pinecone score
                    id: match.id,
                    // Include other metadata if needed, e.g., document_id
                    document_id: match.metadata.document_id,
                  };
                }
                return undefined; // In case metadata or chunk_text is missing
              })
              .filter(Boolean); // Remove undefined entries

          } catch (pineconeError: any) {
            console.error('Pinecone query error:', pineconeError.message);
            // Don't throw and stop the entire process; instead, log and proceed with potentially no chunks.
            // The LLM can then respond based on no context.
            // Or, you could throw new Error('Failed to retrieve context from Pinecone.'); if it's critical.
            console.log("Proceeding without Pinecone context due to query error.");
          }
        }
        
        if (!chunks || chunks.length === 0) {
            console.log("[DEBUG] No relevant chunks from Pinecone. Falling back to Postgres text search...");
            try {
                const tokens = extractSearchTokens(query);
                let pgMatches: any[] = [];
                for (const tok of tokens) {
                    const { data, error } = await supabaseAdmin
                        .from('document_chunks')
                        .select('chunk_text')
                        .eq('chatbot_id', chatbotId)
                        .ilike('chunk_text', `%${tok}%`)
                        .limit(Math.ceil(MATCH_COUNT / tokens.length));
                    if (error) {
                        console.error('Postgres fallback search error:', error);
                        continue;
                    }
                    if (data) pgMatches.push(...data);
                }

                if (pgMatches.length > 0) {
                    // Deduplicate by chunk_text
                    const seen = new Set<string>();
                    const dedup = pgMatches.filter((m: any) => {
                        if (seen.has(m.chunk_text)) return false;
                        seen.add(m.chunk_text);
                        return true;
                    });
                    chunks = dedup.slice(0, MATCH_COUNT).map((m: any) => ({ chunk_text: m.chunk_text }));
                    console.log(`[DEBUG] Postgres fallback returned ${chunks.length} chunks after dedup.`);
                }
            } catch (pgEx) {
                console.error('Exception during Postgres fallback search:', pgEx);
            }
        }

        const contextText = (chunks && chunks.length > 0)
            ? chunks.map((chunk) => (chunk as any).chunk_text).join("\n\n---\n\n")
            : "No relevant context found in documents.";

        if (!chunks || chunks.length === 0) {
            console.log("[DEBUG] No relevant chunks found for query after fallback. ContextText:", contextText);
        } else {
             console.log(`[DEBUG] Found ${chunks.length} relevant chunks (after fallback if applied). Constructed contextText (first 500 chars):`, contextText.substring(0, 500));
        }

        // 4. Construct the messages for the LLM, incorporating history and new system prompt structure
        const messagesForOpenAI: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

        // System Prompt: Instructs on using history and provided context
        messagesForOpenAI.push({
            role: 'system',
            content: `${systemPrompt}\n\nYou are an AI assistant answering the LATEST user question. Your primary goal is to use the "Conversation History" (if provided below) and the "Context from documents" (also provided below) to understand the full dialogue and provide a comprehensive and contextually relevant answer to the LATEST user question. Always refer to the "Conversation History" to understand references to previous topics (e.g., if the user says 'it' or 'that', determine what 'it' or 'that' refers to from the history). \n\nFirst, review the "User-defined instructions", "integration notes", and "integration guidelines" provided earlier in this system prompt. These sections contain specific data, rules, tool usage guidelines, and examples for this particular chatbot. If the answer to the user's LATEST question is found within these primary instructions, prioritize it. This includes deciding if a tool/integration should be used based on its guidelines.\n\nIf these primary instructions do not provide a direct answer, then use both the "Context from documents" and the full "Conversation History" to formulate your response to the LATEST user question. If no source (primary instructions, documents, or history) provides a sufficient answer, clearly state that you cannot answer based on the provided information. Do not make up information or answer based on prior knowledge outside of these provided sources.\n\nContext from documents (for the LATEST user question, use in conjunction with Conversation History):
---
${contextText}
---
Conversation History is provided in the subsequent messages.`
        });

        // --- SERVER-SIDE HISTORY FETCH ---
        let historyFromDB: ChatMessage[] = [];
        if (sessionId) { // Only fetch if sessionId is available
            console.log(`Fetching history from DB for session: ${sessionId}, chatbot: ${chatbotId}`);
            const { data: dbMessages, error: dbHistoryError } = await supabaseAdmin
                .from('chat_messages')
                .select('is_user_message, content')
                .eq('chatbot_id', chatbotId)
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true })
                .limit(30); // Fetch last 30 messages

            if (dbHistoryError) {
                console.error("Error fetching chat history from DB:", dbHistoryError);
                // Proceed without DB history if an error occurs
            } else if (dbMessages) {
                historyFromDB = dbMessages.map(r => ({
                    role: r.is_user_message ? 'user' : 'assistant',
                    content: r.content as string, // Ensure content is string
                }));
                console.log(`Fetched ${historyFromDB.length} messages from DB.`);
            }
        }

        // Add Conversation History (from DB, taking the last 15)
        // This replaces the previous logic that used client-sent `history`
        if (historyFromDB.length > 0) {
            messagesForOpenAI.push(...historyFromDB.slice(-15).map(msg => ({ role: msg.role, content: msg.content })));
        }
        // --- END SERVER-SIDE HISTORY FETCH ---

        // Add current user query as the latest message
        messagesForOpenAI.push({ role: 'user', content: query });

        console.log("[DEBUG] Messages being sent to OpenAI (first 2 elements):", JSON.stringify(messagesForOpenAI.slice(0,2), null, 2));
        if (messagesForOpenAI.length > 2) {
            console.log(`[DEBUG] ... and ${messagesForOpenAI.length - 2} more history/user messages.`);
        }

        // 5. Call OpenAI Chat Completions API *with* tool definitions so the model can decide to call Shopify helper
        const toolsToPass = openAiTools.filter((tool) => {
            if (tool.function?.name === 'create_hubspot_contact')      return hasHubspot;
            if (tool.function?.name === 'create_jira_issue')           return hasJira;
            if (tool.function?.name === 'create_calendly_meeting_link') return hasCalendly;
            return true; // keep generic tools
        });

        console.log("Generating answer with OpenAI (tool-enabled)...");

        const initialCompletion = await openai.chat.completions.create({
            model: OPENAI_CHAT_MODEL,
            messages: messagesForOpenAI,
            tools: toolsToPass,
            tool_choice: 'auto',
            temperature: 0.3,
            max_tokens: 500,
        });

        const firstChoice = initialCompletion.choices[0];
        const toolCalls = (firstChoice.message as any).tool_calls as any[] | undefined;

        if (toolCalls?.length) {
            messagesForOpenAI.push(firstChoice.message as any);
            for (const toolCall of toolCalls) {
                try {
                    const fnName = toolCall.function?.name;
                    let toolContent: any = { error: 'Tool not implemented.' };

                    switch (fnName) {
                        case 'get_shopify_order_details': {
                            let parsedArgs: { order_name?: string } = {};
                            try {
                                parsedArgs = JSON.parse(toolCall.function.arguments);
                            } catch (e) {
                                console.error('Failed to parse tool arguments', e);
                            }

                            const { data, error } = await getShopifyOrderDetailsForChatbot({
                                order_name: parsedArgs.order_name || '',
                                chatbot_id: chatbotId,
                            });

                            toolContent = { data, error };
                            break;
                        }
                        case 'create_calendly_meeting_link': {
                            let parsedArgs: { event_type_uri?: string } = {};
                            try { parsedArgs = JSON.parse(toolCall.function.arguments); } catch {}

                            const { url, error } = await createCalendlySchedulingLink({
                                chatbot_id: chatbotId,
                                event_type_uri: parsedArgs.event_type_uri,
                            });

                            toolContent = { url, error };
                            break;
                        }
                        case 'create_hubspot_contact': {
                            let parsedArgs: { email?: string; firstname?: string; lastname?: string } = {};
                            try { parsedArgs = JSON.parse(toolCall.function.arguments); } catch {}

                            const { error: hsError, data: hsData } = await createHubspotContactForChatbot({
                                chatbot_id: chatbotId,
                                email: parsedArgs.email || '',
                                firstname: parsedArgs.firstname,
                                lastname: parsedArgs.lastname,
                            });

                            toolContent = {
                                status: hsError ? 'error' : 'success',
                                data: hsData,
                                error_message: hsError,
                            };
                            break;
                        }
                        case 'create_jira_issue': {
                            let parsedArgs: { project_key?: string; summary?: string; description?: string } = {};
                            try { parsedArgs = JSON.parse(toolCall.function.arguments); } catch {}

                            const { error: jiraError, data: jiraData } = await createJiraIssueForChatbot({
                                chatbot_id: chatbotId,
                                project_key: parsedArgs.project_key || '',
                                summary: parsedArgs.summary || '',
                                description: parsedArgs.description,
                            });

                            toolContent = jiraError ? { status: 'error', error_message: jiraError } : { status: 'success', data: jiraData };
                            break;
                        }
                        default: {
                            // Keep default stub defined earlier
                            break;
                        }
                    }

                    messagesForOpenAI.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolContent),
                    } as any);
                } catch (innerErr) {
                    console.error('Error handling tool call', innerErr);
                    messagesForOpenAI.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ error: 'Internal server error executing tool.' }),
                    } as any);
                }
            }

            // After responding to every tool call, ask the model to produce the final answer
            const finalCompletion = await openai.chat.completions.create({
                model: OPENAI_CHAT_MODEL,
                messages: messagesForOpenAI,
                temperature: 0.3,
                max_tokens: 500,
            });

            const finalAnswer = finalCompletion.choices[0].message?.content?.trim();
            await supabaseAdmin.from('chat_messages').insert({
              chatbot_id: chatbotId,
              session_id: sessionId,
              is_user_message: false,
              content: finalAnswer ?? '',
            });
            await incrementMessageCount(ownerId, supabaseAdmin);
            return NextResponse.json({ answer: finalAnswer ?? 'I am unable to complete the requested action.', sessionId }, { status: 200, headers: getCorsHeaders() });
        }

        const answer = firstChoice.message?.content?.trim();
        if (!answer) {
            // No increment if no answer generated
            throw new Error('OpenAI returned no answer.');
        }
        await supabaseAdmin.from('chat_messages').insert({
          chatbot_id: chatbotId,
          session_id: sessionId,
          is_user_message: false,
          content: answer,
        });
        await incrementMessageCount(ownerId, supabaseAdmin);
        return NextResponse.json({ answer, sessionId }, { status: 200, headers: getCorsHeaders() });

    } catch (error: any) {
        console.error(`Error processing public chat request for session ${sessionId}:`, error);
        // Do NOT increment count here as an error occurred before successful response generation
        return NextResponse.json({ error: 'An internal error occurred. Please try again later.', sessionId }, { status: 500, headers: getCorsHeaders() });
    }
}

// Helper function to get CORS headers for public API
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

// Add OPTIONS method handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight request
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins for public API
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(null, { status: 204, headers });
}

// ---------------------------------------------------------------------------
// Jira helper – create ticket for chatbot owner (no user session required)
// ---------------------------------------------------------------------------
// NOTE: deprecated copy kept for reference – will not be used.
async function createJiraIssueForChatbot({
    chatbot_id,
    project_key,
    summary,
    description,
}: {
    chatbot_id: string;
    project_key: string;
    summary: string;
    description?: string;
}): Promise<{ error?: string; data?: any }> {
    if (!project_key) {
        project_key = '';
    }
    if (!summary) return { error: 'summary required.' };

    // 1. Get owner of chatbot
    const { data: chatbotRow, error: cbErr } = await supabaseAdmin
        .from('chatbots')
        .select('user_id')
        .eq('id', chatbot_id)
        .single();
    if (cbErr || !chatbotRow) return { error: 'Chatbot not found.' };

    const ownerId = chatbotRow.user_id;

    // 2. Fetch Jira tokens for owner
    const { data: tokenRow, error: tokErr } = await supabaseAdmin
        .from('user_oauth_tokens')
        .select('access_token, metadata')
        .eq('user_id', ownerId)
        .eq('service_name', 'jira')
        .single();
    if (tokErr || !tokenRow) return { error: 'Jira not connected for chatbot owner.' };

    const accessToken = decrypt(tokenRow.access_token);
    if (!accessToken) return { error: 'Failed to decrypt Jira access token.' };
    const cloudId = tokenRow.metadata?.cloud_id;
    if (!cloudId) return { error: 'Jira cloud ID missing.' };

    const apiUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`;

    // Convert plain-text description to Atlassian Document Format (ADF)
    const adfDescription = {
        type: 'doc',
        version: 1,
        content: [
            {
                type: 'paragraph',
                content: description
                    ? [
                          {
                              type: 'text',
                              text: description,
                          },
                      ]
                    : [],
            },
        ],
    };

    const body = {
        fields: {
            project: project_key ? { key: project_key, id: project_key } : undefined,
            summary: summary,
            issuetype: { name: 'Task' },
            description: adfDescription,
        },
    };

    // If project key missing, attempt to fetch first accessible project.
    if (!project_key) {
        try {
            const projResp = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search`, {
                headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
            });
            if (projResp.ok) {
                const projJson = await projResp.json();
                const first = projJson.values?.[0];
                if (first?.key) {
                    body.fields.project = { key: first.key, id: first.id } as any;
                    project_key = first.key;
                }
            } else {
                const altResp = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`, {
                    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
                });
                if (altResp.ok) {
                    const list = await altResp.json();
                    const first = Array.isArray(list) ? list[0] : undefined;
                    if (first?.key) {
                        body.fields.project = { key: first.key, id: first.id } as any;
                        project_key = first.key;
                    }
                }
            }
        } catch (e) {
            console.warn('Jira project lookup failed', e);
        }
    }
    if (!body.fields.project) return { error: 'No Jira project available.' };

    // ------------------------------------------------------------------
    // Determine a valid issue-type for the chosen project (first available)
    // ------------------------------------------------------------------
    try {
        // We need the projectId; Jira returns it in the earlier project list
        // If we stored it in body.fields.project.id use that, else fetch by key
        let projectId: string | undefined = (body.fields.project as any).id;
        if (!projectId && project_key) {
            const pr = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${project_key}`, {
                headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
            });
            if (pr.ok) {
                const pj = await pr.json();
                projectId = pj.id;
            }
        }

        if (projectId) {
            const itResp = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issuetype/project?projectId=${projectId}`, {
                headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
            });
            if (itResp.ok) {
                const itJson = await itResp.json();
                const firstType = (itJson.issueTypes ?? itJson)[0];
                if (firstType?.id) {
                    (body.fields as any).issuetype = { id: firstType.id, name: firstType.name };
                }
            }
        }
    } catch (typeErr) {
        console.warn('Issue-type lookup failed', typeErr);
    }
    // fallback: keep whatever issuetype currently holds

    try {
        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!resp.ok) {
            const errText = await resp.text();
            console.error('Jira API error', resp.status, errText);
            // Extra debug: list accessible projects
            try {
                const projectsResp = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search`, {
                    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
                });
                if (projectsResp.ok) {
                    const pj = await projectsResp.json();
                    const keys = pj.values?.map((p: any) => p.key).join(', ');
                    console.error('Accessible project keys for this user:', keys);
                }
            } catch (listErr) { console.error('Project list fetch failed', listErr); }
            return { error: `Jira API error: ${resp.status}. Raw: ${errText}` };
        }
        const data = await resp.json();

        // Add a human-readable ticket link if site_url is available in metadata
        const siteUrl: string | undefined = tokenRow.metadata?.site_url;
        if (siteUrl && data?.key) {
            data.browseUrl = `${siteUrl}/browse/${data.key}`;
        }

        return { data };
    } catch (e: any) {
        console.error('Unexpected Jira helper error', e);
        return { error: e.message };
    }
}

// ---------------------------------------------------------------------------
// HubSpot helper – create or update contact for chatbot owner
// ---------------------------------------------------------------------------
async function createHubspotContactForChatbot({
    chatbot_id,
    email,
    firstname,
    lastname,
}: {
    chatbot_id: string;
    email: string;
    firstname?: string;
    lastname?: string;
}): Promise<{ error?: string; data?: any }> {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email) || email.toLowerCase().endsWith('@example.com')) {
        return { error: 'A valid user email address is required.' };
    }

    // 1. Get owner of chatbot
    const { data: chatbotRow, error: cbErr } = await supabaseAdmin
        .from('chatbots')
        .select('user_id')
        .eq('id', chatbot_id)
        .single();
    if (cbErr || !chatbotRow) return { error: 'Chatbot not found.' };

    const ownerId = chatbotRow.user_id;

    // 2. Fetch HubSpot tokens for owner
    const { data: tokenRow, error: tokErr } = await supabaseAdmin
        .from('user_oauth_tokens')
        .select('access_token')
        .eq('user_id', ownerId)
        .eq('service_name', 'hubspot')
        .single();
    if (tokErr || !tokenRow) return { error: 'HubSpot not connected for chatbot owner.' };

    const accessToken = decrypt(tokenRow.access_token);
    if (!accessToken) return { error: 'Failed to decrypt HubSpot access token.' };

    try {
        const resp = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                properties: {
                    email,
                    firstname,
                    lastname,
                },
            }),
        });

        if (!resp.ok) {
            const errBody = await resp.text();
            console.error('HubSpot create contact failed', resp.status, errBody);
            return { error: `HubSpot API error: ${resp.status}` };
        }

        const data = await resp.json();
        return { data };
    } catch (e: any) {
        console.error('createHubspotContactForChatbot unexpected', e);
        return { error: e.message };
    }
}

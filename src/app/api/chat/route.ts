import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import OpenAI from 'openai'; // Standard Node.js import
import { createClient } from '@supabase/supabase-js'

// Define Action type (can be shared)
type Action = {
  id: string;
  chatbot_id: string;
  name: string;
  description: string | null;
  trigger_keywords: string[];
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; 
  url: string;
  headers: object | null;
  request_body_template: object | null; 
  success_message: string | null;
  created_at: string;
};

// --- Constants ---
const OPENAI_CHAT_MODEL = 'gpt-3.5-turbo'; // Or 'gpt-4' if preferred
const OPENAI_EMBEDDING_MODEL = 'text-embedding-ada-002';
const SIMILARITY_THRESHOLD = 0.75; // Adjust this threshold
const MATCH_COUNT = 5; // Max number of context chunks to retrieve

// NEW: Global base prompt that is always prepended to every chatbot prompt
const SITEAGENT_GLOBAL_BASE_PROMPT = `Always provide helpful, polite, and accurate responses based only on the information and tools provided.
Approach each question or task with logical reasoning, breaking down complex problems into steps if needed. Use any provided data to perform simple calculations or comparisons when appropriate, but only if the context clearly supports it.
Anticipate what logically follows from the user's query or scenario, and when appropriate, offer additional relevant guidance or information even if it wasn't explicitly requested.
If a question cannot be answered using the provided information, clearly admit that you do not know or cannot answer. Do not guess or provide information that isn't supported by the context.
Maintain a polite and respectful tone at all times. Do not adopt any specific persona or style beyond what the user's instructions specify.
Use only the knowledge and resources provided (via the conversation context or authorized tools). Do not use outside information, and do not attempt any web searches or external data retrieval.`;

// --- Initialize OpenAI client ---
// Ensure OPENAI_API_KEY is set as a Supabase secret
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use process.env for Edge Routes
});

// --- Helper Function for Extracting Vault Secret Names (Keep as is) ---
function extractVaultSecretNames(template: object | null): Set<string> {
    const names = new Set<string>();
    if (template) {
        const templateString = JSON.stringify(template);
        const secretPattern = /{{\s*secret\s*}}/g;
        let match;
        while ((match = secretPattern.exec(templateString)) !== null) {
            names.add(match[0].replace(/[{}]/g, '').trim());
        }
    }
    return names;
}

// --- Helper Function for Templating (Keep as is) ---
// It now correctly receives the secretsMap from the RPC call result
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
         // ... (rest of the function remains the same) ...

        return JSON.parse(templateString);
    } catch (error: any) {
        console.error("Error processing template:", error, "Original template:", template);
        return null; 
    }
}

// --- Supabase Client Setup ---
// Reusable function to create Supabase client for Route Handlers
async function initializeSupabaseClient() {
    const cookieStore = cookies()
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase environment variables are not set.");
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            async get(name: string) {
                const cookie = await cookieStore.get(name);
                return cookie?.value;
            },
            async set(name: string, value: string, options: CookieOptions) {
                try { await cookieStore.set({ name, value, ...options }); } catch (e) { console.error('Route Handler set cookie failed', e); }
            },
            async remove(name: string, options: CookieOptions) {
                try { await cookieStore.set({ name, value: '', ...options }); } catch (e) { console.error('Route Handler remove cookie failed', e); }
            },
        },
    });
}

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
    let supabase;
    try {
        supabase = await initializeSupabaseClient();
    } catch (e: any) {
        console.error("Supabase client init error:", e);
        return NextResponse.json({ error: `Server configuration error: ${e.message}` }, { status: 500 });
    }

    // 1. Extract query and chatbotId from request body
    let query: string;
    let chatbotId: string;
    try {
        const body = await request.json();
        query = body.query;
        chatbotId = body.chatbotId;
        if (!query || typeof query !== 'string' || !chatbotId || typeof chatbotId !== 'string') {
            throw new Error('Missing or invalid "query" or "chatbotId" in request body.');
        }
    } catch (e: any) {
        return NextResponse.json({ error: `Invalid request body: ${e.message}` }, { status: 400 });
    }

    console.log(`Received AUTH chat request for chatbot ${chatbotId}: "${query}"`);

    // 2. Check user authentication (optional but recommended for authorization)
     const { data: { user }, error: userError } = await supabase.auth.getUser();
     if (userError || !user) {
       console.warn("Chat request denied: Unauthorized user");
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
    // TODO: Optionally verify if this user actually owns/has access to this chatbotId

    try {
        // --- NEW: Check for and Execute Actions FIRST ---
        console.log("Checking for triggered actions (authenticated)...");
        // Use the authenticated client (RLS applies)
        const { data: actions, error: actionsError } = await supabase
            .from('chatbot_actions')
            .select('*')
            .eq('chatbot_id', chatbotId);
        
        if (actionsError) {
            console.error("Error fetching actions (authenticated):", actionsError);
            // Log and proceed to RAG
        } else if (actions && actions.length > 0) {
            const lowerCaseQuery = query.toLowerCase();
            let triggeredAction: Action | null = null;

            for (const action of actions as Action[]) {
                if (action.trigger_keywords.some(keyword => lowerCaseQuery.includes(keyword.toLowerCase()))) {
                    triggeredAction = action;
                    console.log(`Action triggered (auth): "${action.name}" by query: "${query}"`);
                    break; 
                }
            }

            if (triggeredAction) {
                console.log(`Executing action (auth): ${triggeredAction.http_method} ${triggeredAction.url}`);
                let secretsMap: Record<string, string> = {};
                try {
                    // --- Identify Needed Vault Secrets ---
                    const headerSecretNames = extractVaultSecretNames(triggeredAction.headers);
                    const bodySecretNames = extractVaultSecretNames(triggeredAction.request_body_template);
                    const uniqueSecretNames = Array.from(new Set([...headerSecretNames, ...bodySecretNames]));

                    // --- Fetch Secrets using RPC Function ---
                    // NOTE: We need the *Admin* client here to call the SECURITY DEFINER function
                    // We should initialize it securely if not already done globally.
                     // Create Admin Client instance INSIDE the handler for security?
                     // Or assume it's available globally like in the public route.
                     // Assuming global admin client is available (like in public route)
                     const supabaseAdmin = createClient(
                         process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
                         process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
                     );
                     // TODO: Add checks for admin client env vars if not done globally
                     
                    if (uniqueSecretNames.length > 0) {
                        console.log(`Fetching Vault secrets via RPC (auth): ${uniqueSecretNames.join(', ')}`);
                        const { data: fetchedSecrets, error: rpcError } = await supabaseAdmin.rpc(
                            'get_decrypted_secrets', 
                            { secret_names: uniqueSecretNames } 
                        );

                        if (rpcError) {
                            console.error("RPC Error fetching secrets from Vault (auth):", rpcError);
                            throw new Error(`Failed to fetch secrets using RPC: ${rpcError.message}`);
                        }
                        
                        if (typeof fetchedSecrets === 'object' && fetchedSecrets !== null) {
                            secretsMap = fetchedSecrets;
                            console.log(`Successfully fetched ${Object.keys(secretsMap).length} secrets via RPC (auth).`);
                             // Check for null values indicating missing secrets
                             for(const name of uniqueSecretNames) {
                                 if (secretsMap[name] === null) {
                                     console.error(`Vault secret '${name}' was not found by the database function (auth).`);
                                     throw new Error(`Required Vault secret '${name}' not found.`);
                                 }
                             }
                        } else {
                             console.error("RPC function get_decrypted_secrets did not return a valid object (auth):", fetchedSecrets);
                             throw new Error("Failed to retrieve secrets map from database function.");
                        }
                        
                    } else {
                         console.log("No Vault secrets referenced in this action (auth).");
                    }
                    
                    // --- Prepare Context for Templating ---
                    const templateContext = {
                        user_query: query,
                        chatbot_id: chatbotId,
                        timestamp: new Date().toISOString(), // Add current timestamp
                        user_id: user.id, // Add authenticated user ID
                    };

                    // --- Process Headers and Body Templates ---
                    const processedHeaders = processTemplate(
                        triggeredAction.headers,
                        templateContext,
                        secretsMap
                    ) as Record<string, string> | null; 

                    const processedBodyTemplate = (triggeredAction.http_method !== 'GET' && triggeredAction.request_body_template)
                        ? processTemplate(triggeredAction.request_body_template, templateContext, secretsMap)
                        : null;

                    const requestBody = processedBodyTemplate
                        ? JSON.stringify(processedBodyTemplate)
                        : undefined;

                     // Basic check if template processing failed
                    if (triggeredAction.headers && !processedHeaders) {
                        console.warn(`Skipping action ${triggeredAction.name} (auth) due to header template processing error.`);
                        throw new Error("Internal error processing action headers.")
                    }
                     if (triggeredAction.request_body_template && !processedBodyTemplate) {
                        console.warn(`Skipping action ${triggeredAction.name} (auth) due to body template processing error.`);
                        throw new Error("Internal error processing action body template.")
                    }

                    // --- Execute Fetch with Processed Data ---
                    const response = await fetch(triggeredAction.url, {
                        method: triggeredAction.http_method,
                        headers: processedHeaders ?? undefined, // Use processed headers
                        body: requestBody, // Use processed body
                    });

                    console.log(`Action API response status (auth): ${response.status}`);

                    if (!response.ok) {
                        let errorBody = 'Unknown error';
                        try { errorBody = await response.text(); } catch { /* ignore */ }
                        console.error(`Action API request failed (auth): ${response.status} ${response.statusText}`, errorBody);
                        return NextResponse.json({ answer: `I tried to perform the action '${triggeredAction.name}', but encountered an error.` }, { status: 200 }); 
                    }

                    // --- Parse response body (attempt JSON first) ---
                    let responseData: any = null;
                    try {
                        const text = await response.text();
                        try { responseData = JSON.parse(text); } catch { responseData = text; }
                    } catch { /* ignore body parse errors */ }

                    // Helper to replace {{response.key}} placeholders
                    const substituteResponsePlaceholders = (template: string): string => {
                        return template.replace(/{{\s*response\.([\w]+)\s*}}/g, (_, key) => {
                            if (responseData && typeof responseData === 'object' && key in responseData) {
                                return String(responseData[key]);
                            }
                            return '';
                        });
                    };

                    if (triggeredAction.success_message) {
                        const finalMsg = substituteResponsePlaceholders(triggeredAction.success_message);
                        return NextResponse.json({ answer: finalMsg }, { status: 200 });
                    } else {
                        return NextResponse.json({ answer: `Okay, I have performed the action: ${triggeredAction.name}.` }, { status: 200 });
                    }

                } catch (execError: any) {
                    console.error(`Error executing action fetch for ${triggeredAction.name} (auth):`, execError);
                     return NextResponse.json({ answer: `I encountered an unexpected error when trying to perform the action '${triggeredAction.name}'. Details: ${execError.message}` }, { status: 200 }); 
                }
            }
        }
        // --- End Action Check ---

        // --- If no action triggered, proceed with RAG ---
        console.log("No action triggered (auth), proceeding with RAG...");
        
        // --- NEW: Fetch Chatbot details including system_prompt --- (RLS implicitly applied by client)
        console.log("Fetching chatbot details...");
        const { data: chatbotData, error: chatbotFetchError } = await supabase
            .from('chatbots')
            .select('id, name, system_prompt') // Select system_prompt
            .eq('id', chatbotId)
            .maybeSingle(); // Use maybeSingle in case RLS prevents access (returns null)

        if (chatbotFetchError) {
            console.error('Error fetching chatbot data:', chatbotFetchError);
            throw new Error(`Database error fetching chatbot details: ${chatbotFetchError.message}`);
        }
        if (!chatbotData) {
             console.warn(`Chatbot not found or access denied for user ${user.id} and chatbot ${chatbotId}`);
             return NextResponse.json({ error: 'Chatbot not found or access denied' }, { status: 404 });
        }
        const userDefinedPrompt = chatbotData.system_prompt || "You are a helpful AI assistant. Answer based only on the provided context."; // Default prompt

        // Combine prompts so the global base prompt is ALWAYS first, followed by the user's custom prompt (if any).
        const combinedSystemPrompt = `${SITEAGENT_GLOBAL_BASE_PROMPT}

---\n\nUser-defined instructions:\n${userDefinedPrompt}
---`;
        console.log(`Using system prompt: "${combinedSystemPrompt.substring(0,100)}..."`);
        // -------------------------------------------------------------

        // 3. Generate embedding for the user's query
        console.log("Generating query embedding...");
        const embeddingResponse = await openai.embeddings.create({
            model: OPENAI_EMBEDDING_MODEL,
            input: query,
        });
        const queryEmbedding = embeddingResponse.data[0].embedding;
        console.log("Query embedding generated.");

        // 4. Find relevant document chunks using the RPC function
        console.log("Matching document chunks...");
        const { data: chunks, error: rpcError } = await supabase.rpc('match_document_chunks', {
            p_query_embedding: queryEmbedding,
            p_chatbot_id: chatbotId,
            p_match_threshold: SIMILARITY_THRESHOLD,
            p_match_count: MATCH_COUNT,
        });

        if (rpcError) {
            console.error('RPC Error fetching chunks:', rpcError);
            throw new Error(`Database error retrieving relevant context: ${rpcError.message}`);
        }

        const contextText = (chunks && chunks.length > 0)
            ? chunks.map((chunk: any) => chunk.content).join("\n\n---\n\n")
            : "No relevant context found in documents.";

        if (!chunks || chunks.length === 0) { console.log("No relevant chunks found."); }
        else { console.log(`Found ${chunks.length} relevant chunks.`); }

        // 5. Construct the prompt for the LLM (using fetched system_prompt)
        const finalSystemPrompt = `
${combinedSystemPrompt}

Answer the user's question based *only* on the provided context below.
If the context does not contain the answer, state clearly that you cannot answer based on the provided documents.
Do not make up information or answer based on prior knowledge outside the context.

Context from documents:
---
${contextText}
---
`;

        // 6. Call OpenAI Chat Completions API
        console.log("Generating final answer with OpenAI...");
        const chatCompletion = await openai.chat.completions.create({
            model: OPENAI_CHAT_MODEL,
            messages: [
                // Use the constructed prompt combining system instructions and context
                { role: 'system', content: finalSystemPrompt },
                // The user query is effectively included in the system prompt now
                // but you could also add it explicitly if preferred:
                { role: 'user', content: query }
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const answer = chatCompletion.choices[0].message?.content?.trim();

        if (!answer) { throw new Error("OpenAI failed to generate an answer."); }
        console.log("Answer generated successfully.");

        // 6.b. Log assistant message for analytics / billing
        try {
          const supabaseAdminLog = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
            process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
          );

          await supabaseAdminLog.from('chat_messages').insert({
            chatbot_id: chatbotId,
            session_id: (globalThis.crypto?.randomUUID?.() ?? (Date.now().toString() + Math.random().toString(16).slice(2))),
            is_user_message: false,
            content: answer,
          });
        } catch (logErr) {
          console.error('Failed to log chatbot message', logErr);
        }

        // 7. Return the answer
        return NextResponse.json({ answer: answer });

    } catch (error: any) {
        console.error('Authenticated chat processing error:', error);
        // Distinguish OpenAI errors from other errors if needed
        const errorMessage = error.message || 'An internal server error occurred.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 

const openAiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    // ... existing tools in auth route? Actually not defined earlier, but we can add new array near top where constants defined (OPENAI_CHAT_MODEL etc.).
] 
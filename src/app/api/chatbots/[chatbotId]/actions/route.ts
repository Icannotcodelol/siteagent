import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the expected shape for creating/updating actions (matches form data + parsed JSON)
// We might refine this based on actual form submission data later
interface ActionPayload {
  name: string;
  description?: string | null;
  trigger_keywords: string[]; 
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: object | null; // Expecting parsed JSON
  request_body_template?: object | null; // Expecting parsed JSON
  success_message?: string | null;
  is_active: boolean;
}

// GET /api/chatbots/[chatbotId]/actions - List all actions for a chatbot
export async function GET(request: NextRequest, { params }: { params: { chatbotId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { chatbotId } = params;

    try {
    // 1. Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
      console.error('GET /actions - Auth Error:', userError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    // 2. Verify user owns the chatbot (important for authorization)
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single();

    if (chatbotError || !chatbot) {
      console.error('GET /actions - Chatbot ownership verification failed:', chatbotError);
      return NextResponse.json({ error: 'Chatbot not found or not authorized' }, { status: 404 });
        }

    // 3. Fetch the actions for this chatbot
    const { data: actions, error: actionsError } = await supabase
            .from('chatbot_actions')
      .select('*') // Select all columns for now
            .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: true }); // Optional: order them

    if (actionsError) {
      console.error(`GET /actions - Error fetching actions for chatbot ${chatbotId}:`, actionsError);
      throw actionsError; // Throw to be caught by the outer try-catch
        }

    return NextResponse.json(actions || []);

    } catch (error: any) {
    console.error('GET /actions - Generic Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch actions' }, { status: 500 });
    }
}

// POST /api/chatbots/[chatbotId]/actions - Create a new action for a chatbot
export async function POST(request: NextRequest, { params }: { params: { chatbotId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { chatbotId } = params;

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
      console.error('POST /actions - Auth Error:', userError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    // Verify user owns the chatbot (as in GET)
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single();

    if (chatbotError || !chatbot) {
      console.error('POST /actions - Chatbot ownership verification failed:', chatbotError);
      return NextResponse.json({ error: 'Chatbot not found or not authorized' }, { status: 404 });
        }

    // Parse the request body
    const actionData: ActionPayload = await request.json();
        
    // Basic validation (more can be added)
    if (!actionData.name || !actionData.url || !actionData.http_method || !actionData.trigger_keywords || actionData.trigger_keywords.length === 0) {
        return NextResponse.json({ error: 'Missing required fields (name, url, http_method, trigger_keywords)' }, { status: 400 });
    }

    // Insert the new action
        const { data: newAction, error: insertError } = await supabase
            .from('chatbot_actions')
      .insert({
        chatbot_id: chatbotId,
        name: actionData.name,
        description: actionData.description,
        trigger_keywords: actionData.trigger_keywords,
        http_method: actionData.http_method,
        url: actionData.url,
        headers: actionData.headers,
        request_body_template: actionData.request_body_template,
        success_message: actionData.success_message,
        is_active: actionData.is_active ?? true, // Default to true if not provided
      })
      .select()
      .single(); // Return the created action

        if (insertError) {
      console.error(`POST /actions - Error creating action for chatbot ${chatbotId}:`, insertError);
      throw insertError; // Throw to be caught by the outer try-catch
        }

        return NextResponse.json(newAction, { status: 201 }); // 201 Created

    } catch (error: any) {
    console.error('POST /actions - Generic Error:', error);
    // Handle specific DB errors if needed (e.g., unique constraint violation)
    return NextResponse.json({ error: error.message || 'Failed to create action' }, { status: 500 });
    }
} 
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js' // Using the generic supabase-js client for public routes

// Initialize Supabase client
// Ensure these environment variables are set in your Vercel/deployment environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not defined in environment variables.')
  // We won't throw here as it would break the build, but log it.
  // The route will fail gracefully if Supabase isn't configured.
}

// Create a single Supabase client instance to be reused.
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Helper function to set CORS headers
function getCorsHeaders() {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  // Allow all origins in development, or be more specific for production
  // For file:// origin, 'null' is sometimes needed, or '*' can be used less securely.
  // In a real production scenario, you would list your allowed domains.
  headers['Access-Control-Allow-Origin'] = process.env.NODE_ENV === 'development' ? '*' : 'YOUR_PRODUCTION_DOMAIN_HERE';
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  // Handle preflight requests for CORS
  return NextResponse.json({}, { headers: getCorsHeaders() });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  const responseHeaders = getCorsHeaders();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client not initialized. Check server logs.' }, { status: 500, headers: responseHeaders });
  }

  const chatbotId = params.chatbotId

  if (!chatbotId) {
    return NextResponse.json({ error: 'Chatbot ID is required' }, { status: 400, headers: responseHeaders })
  }

  try {
    const { data, error } = await supabase
      .from('proactive_messages')
      .select('message_content, delay_seconds, color')
      .eq('chatbot_id', chatbotId)
      .eq('is_enabled', true)
      .maybeSingle() // Fetches at most one record

    if (error) {
      console.error(`Error fetching proactive message for chatbot ${chatbotId}:`, error)
      return NextResponse.json({ error: 'Failed to fetch proactive message', details: error.message }, { status: 500, headers: responseHeaders })
    }

    if (!data) {
      // It's not an error if no message is found, just means none is configured or enabled.
      return NextResponse.json(null, { status: 200, headers: responseHeaders }) 
    }
    
    // Add specific cache-control for successful data response
    responseHeaders['Cache-Control'] = 'public, s-maxage=300, stale-while-revalidate=3600';

    return NextResponse.json({ content: data.message_content, delay: data.delay_seconds, color: data.color }, { status: 200, headers: responseHeaders })
  } catch (e: any) {
    console.error('Unexpected error in proactive message route:', e)
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500, headers: responseHeaders })
  }
} 
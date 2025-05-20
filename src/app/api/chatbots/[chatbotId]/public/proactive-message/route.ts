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
function getCorsHeaders(requestingOrigin?: string | null) { // Accept requesting origin
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin', // Important to tell caches that the response varies by Origin
  };

  // Define your allowed origins.
  // It's best to manage this list via environment variables in a real production app.
  const allowedOrigins = [
    'https://rembrereere.myshopify.com',
    // Add other domains like 'https://your-primary-app-domain.com' if the widget is also used there
  ];

  if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (requestingOrigin && allowedOrigins.includes(requestingOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestingOrigin; // Allow specific origin
  } else {
    // If the origin is not in the allowed list for production, do not set the ACAH header.
    // Browsers will block the request if the header is missing or doesn't match.
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const requestingOrigin = request.headers.get('Origin');
  // Handle preflight requests for CORS
  return NextResponse.json({}, { headers: getCorsHeaders(requestingOrigin) });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  const requestingOrigin = request.headers.get('Origin');
  const responseHeaders = getCorsHeaders(requestingOrigin);

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
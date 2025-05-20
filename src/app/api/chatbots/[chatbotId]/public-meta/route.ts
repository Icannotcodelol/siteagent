import { NextRequest, NextResponse } from 'next/server';

// Helper function to set CORS headers (can be shared or defined locally)
function getCorsHeaders(requestingOrigin?: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };

  const allowedOrigins = [
    'https://rembrereere.myshopify.com',
  ];

  if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (requestingOrigin && allowedOrigins.includes(requestingOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestingOrigin;
  } else {
    // If the origin is not in the allowed list for production,
    // do not set the ACAH header, or set it to a default safe value if necessary.
    // Browsers will block the request if the header is missing or doesn't match.
    // For now, we simply don't add it if not allowed, leading to default browser denial.
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
  const chatbotId = params.chatbotId;

  if (!chatbotId) {
    return NextResponse.json({ error: 'Chatbot ID missing' }, {
      status: 400,
      headers: responseHeaders,
    });
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('bot_avatar_url, primary_color, font_family')
      .eq('id', chatbotId)
      .maybeSingle();

    if (error || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, {
        status: 404,
        headers: responseHeaders,
      });
    }
    
    responseHeaders['Cache-Control'] = 'public, max-age=300';

    return NextResponse.json(chatbot, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('[public-meta] error', err);
    return NextResponse.json({ error: 'Internal error' }, {
      status: 500,
      headers: responseHeaders,
    });
  }
} 
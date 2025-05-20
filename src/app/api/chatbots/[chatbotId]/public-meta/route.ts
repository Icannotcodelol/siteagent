import { NextRequest, NextResponse } from 'next/server';

// Helper function to set CORS headers (can be shared or defined locally)
function getCorsHeaders() {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
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
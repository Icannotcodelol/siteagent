export async function GET(
  request: Request,
  { params }: { params: { chatbotId: string } }
) {
  const chatbotId = params.chatbotId;
  if (!chatbotId) {
    return new Response(JSON.stringify({ error: 'Chatbot ID missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('bot_avatar_url, primary_color')
      .eq('id', chatbotId)
      .maybeSingle();

    if (error || !chatbot) {
      return new Response(JSON.stringify({ error: 'Chatbot not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(chatbot), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err: any) {
    console.error('[public-meta] error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
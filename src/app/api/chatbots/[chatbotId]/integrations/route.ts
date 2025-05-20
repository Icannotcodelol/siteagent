import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET  /api/chatbots/[chatbotId]/integrations   -> returns enabled integrations
export async function GET(_request: NextRequest, { params }: { params: { chatbotId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } },
  );

  const { chatbotId } = params;

  // Auth
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ownership check & fetch columns
  const { data, error } = await supabase
    .from('chatbots')
    .select('integration_hubspot, integration_jira, integration_calendly, integration_shopify, user_id')
    .eq('id', chatbotId)
    .single();

  if (error || !data || data.user_id !== user.id) {
    return NextResponse.json({ error: 'Chatbot not found or not authorized' }, { status: 404 });
  }

  const { integration_hubspot, integration_jira, integration_calendly, integration_shopify } = data as any;
  return NextResponse.json({ integration_hubspot, integration_jira, integration_calendly, integration_shopify });
}

interface UpdateBody {
  service: 'hubspot' | 'jira' | 'calendly' | 'shopify';
  enabled: boolean;
}

// POST  /api/chatbots/[chatbotId]/integrations  { service, enabled }
export async function POST(request: NextRequest, { params }: { params: { chatbotId: string } }) {
  const body: UpdateBody = await request.json();
  const { service, enabled } = body || {} as any;
  if (!service || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const columnMap: Record<string, string> = {
    hubspot: 'integration_hubspot',
    jira: 'integration_jira',
    calendly: 'integration_calendly',
    shopify: 'integration_shopify',
  };

  const column = columnMap[service];
  if (!column) return NextResponse.json({ error: 'Unsupported service.' }, { status: 400 });

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } },
  );

  // Auth
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // update row if owner
  const { error: updErr } = await supabase
    .from('chatbots')
    .update({ [column]: enabled })
    .eq('id', params.chatbotId)
    .eq('user_id', user.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 
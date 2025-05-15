import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getValidCalendlyAccessToken } from '@/lib/calendly';

/**
 * Request body interface for schedule creation.
 * Currently supports optional `event_type_uri` – if omitted, the API will pick the
 * first active event type from the user's Calendly account.
 */
interface ScheduleRequest {
  chatbot_id?: string; // For future use / logging
  event_type_uri?: string;
}

const CALENDLY_API_BASE = 'https://api.calendly.com';

export async function POST(req: NextRequest) {
  // Use admin client (service role) so we can look up owner even when the
  // request is unauthenticated (public chat action).
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  // For authenticated dashboard usage we still want to detect the user when possible.
  const { data: { user: authedUser } } = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  ).auth.getUser();

  let payload: ScheduleRequest = {};
  try {
    const raw = await req.text();
    if (raw.trim().length > 0) {
      payload = JSON.parse(raw) as ScheduleRequest;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let ownerId: string | null = null;

  if (authedUser) {
    ownerId = authedUser.id;
  }

  // If unauthenticated determine owner from chatbot_id
  if (!ownerId) {
    if (!payload.chatbot_id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const { data: bot, error: botErr } = await supabaseAdmin
      .from('chatbots')
      .select('user_id')
      .eq('id', payload.chatbot_id)
      .maybeSingle();
    if (botErr || !bot) {
      return NextResponse.json({ error: 'Invalid chatbot' }, { status: 400 });
    }
    ownerId = bot.user_id;
  }

  try {
    // 1. Ensure we have a valid Calendly access token
    const accessToken = await getValidCalendlyAccessToken(ownerId!);

    // 2. Determine the event type to use
    let eventTypeUri = payload.event_type_uri;
    if (!eventTypeUri) {
      // Fetch user details to obtain user URI
      const userResp = await fetch(`${CALENDLY_API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userResp.ok) {
        throw new Error(`Failed to fetch Calendly user: ${userResp.status}`);
      }
      const userJson = await userResp.json();
      const userUri = userJson.resource?.uri;
      if (!userUri) {
        throw new Error('Calendly user URI missing');
      }

      // Fetch event types for the user
      const evResp = await fetch(`${CALENDLY_API_BASE}/event_types?user=${encodeURIComponent(userUri)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!evResp.ok) {
        throw new Error(`Failed to fetch Calendly event types: ${evResp.status}`);
      }
      const evJson = await evResp.json();
      const firstEvent = evJson.collection?.[0];
      if (!firstEvent) {
        throw new Error('No Calendly event types found.');
      }
      eventTypeUri = firstEvent.uri;
    }

    // 3. Create a single-use scheduling link
    const scheduleResp = await fetch(`${CALENDLY_API_BASE}/scheduling_links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner: eventTypeUri,
        owner_type: 'EventType',
        max_event_start_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        max_event_count: 1,
      }),
    });

    if (!scheduleResp.ok) {
      const err = await scheduleResp.text();
      throw new Error(`Calendly scheduling link creation failed: ${scheduleResp.status} - ${err}`);
    }

    const schedJson = await scheduleResp.json();
    const schedulingLink = schedJson.resource?.booking_url ?? schedJson.resource?.url;

    if (!schedulingLink) {
      throw new Error('Calendly did not return a booking URL.');
    }

    return NextResponse.json({ url: schedulingLink });
  } catch (err: any) {
    console.error('Calendly scheduling error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption';

const TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  const cookieStore = cookies();
  const storedState = cookieStore.get('hubspot_oauth_state')?.value;

  // Clean up state cookie either way
  if (cookieStore.has('hubspot_oauth_state')) cookieStore.delete('hubspot_oauth_state');

  if (!code) {
    console.error('HubSpot OAuth: missing code param');
    return NextResponse.redirect(new URL('/dashboard?error=hubspot_oauth_failed&reason=no_code', request.url));
  }
  if (!stateParam || stateParam !== storedState) {
    console.error('HubSpot OAuth: state mismatch');
    return NextResponse.redirect(new URL('/dashboard?error=hubspot_oauth_failed&reason=state_mismatch', request.url));
  }

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('HubSpot OAuth: missing env vars');
    return NextResponse.redirect(new URL('/dashboard?error=hubspot_config_error', request.url));
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    });

    const tokenResp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!tokenResp.ok) {
      const errBody = await tokenResp.text();
      console.error('HubSpot OAuth: token exchange failed', tokenResp.status, errBody);
      return NextResponse.redirect(new URL('/dashboard?error=hubspot_oauth_failed&reason=token_exchange', request.url));
    }

    const tokenJson: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      hub_domain?: string;
      portal_id?: number;
    } = await tokenResp.json();

    const accessToken = tokenJson.access_token;
    const refreshToken = tokenJson.refresh_token;
    const expiresIn = tokenJson.expires_in;
    const scopes = tokenJson.scope ? tokenJson.scope.split(' ') : [];

    if (!accessToken) {
      console.error('HubSpot OAuth: no access token');
      return NextResponse.redirect(new URL('/dashboard?error=hubspot_oauth_failed&reason=no_access_token', request.url));
    }

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('HubSpot OAuth: unauthenticated user');
      return NextResponse.redirect(new URL('/login?error=auth_required_for_oauth', request.url));
    }

    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    if (!encryptedAccessToken || (refreshToken && !encryptedRefreshToken)) {
      console.error('HubSpot OAuth: encryption failed');
      return NextResponse.redirect(new URL('/dashboard?error=internal_encryption_error', request.url));
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const metadata: Record<string, any> = {};
    if (tokenJson.portal_id) metadata.portal_id = tokenJson.portal_id;
    if (tokenJson.hub_domain) metadata.hub_domain = tokenJson.hub_domain;

    const { error: dbError } = await supabase.from('user_oauth_tokens').upsert(
      {
        user_id: user.id,
        service_name: 'hubspot',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
        scopes,
        metadata,
      },
      { onConflict: 'user_id, service_name, chatbot_id' },
    );

    if (dbError) {
      console.error('HubSpot OAuth: db upsert failed', dbError);
      return NextResponse.redirect(new URL('/dashboard?error=database_storage_error', request.url));
    }

    console.log(`HubSpot OAuth: tokens stored for user ${user.id}`);
    return NextResponse.redirect(new URL('/dashboard?hubspot_connected=true', request.url));
  } catch (err: any) {
    console.error('HubSpot OAuth: unhandled', err);
    return NextResponse.redirect(new URL('/dashboard?error=hubspot_oauth_unhandled', request.url));
  }
} 
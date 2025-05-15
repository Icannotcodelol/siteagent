import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption';

const TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
const RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  const cookieStore = cookies();
  const storedState = cookieStore.get('jira_oauth_state')?.value;
  const codeVerifier = cookieStore.get('jira_pkce_code_verifier')?.value;

  // Clean up cookies regardless
  if (cookieStore.has('jira_oauth_state')) cookieStore.delete('jira_oauth_state');
  if (cookieStore.has('jira_pkce_code_verifier')) cookieStore.delete('jira_pkce_code_verifier');

  if (!code) {
    console.error('Jira OAuth: missing code param');
    return NextResponse.redirect(new URL('/dashboard?error=jira_oauth_failed&reason=no_code', request.url));
  }
  if (!stateParam || stateParam !== storedState) {
    console.error('Jira OAuth: state mismatch');
    return NextResponse.redirect(new URL('/dashboard?error=jira_oauth_failed&reason=state_mismatch', request.url));
  }
  if (!codeVerifier) {
    console.error('Jira OAuth: missing PKCE verifier cookie');
    return NextResponse.redirect(new URL('/dashboard?error=jira_oauth_failed&reason=missing_verifier', request.url));
  }

  const clientId = process.env.JIRA_CLIENT_ID;
  const clientSecret = process.env.JIRA_CLIENT_SECRET;
  const redirectUri = process.env.JIRA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Jira OAuth: missing env vars');
    return NextResponse.redirect(new URL('/dashboard?error=jira_config_error', request.url));
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const tokenResp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!tokenResp.ok) {
      const errBody = await tokenResp.text();
      console.error('Jira OAuth: token exchange failed', tokenResp.status, errBody);
      return NextResponse.redirect(new URL('/dashboard?error=jira_oauth_failed&reason=token_exchange', request.url));
    }

    const tokenJson: {
      access_token: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
      token_type: string;
    } = await tokenResp.json();

    const accessToken = tokenJson.access_token;
    const refreshToken = tokenJson.refresh_token;
    const expiresIn = tokenJson.expires_in; // seconds
    const scopes = tokenJson.scope ? tokenJson.scope.split(' ') : [];

    if (!accessToken) {
      console.error('Jira OAuth: no access token');
      return NextResponse.redirect(new URL('/dashboard?error=jira_oauth_failed&reason=no_access_token', request.url));
    }

    // Fetch accessible resources to store cloudId/site info
    let cloudId: string | null = null;
    let siteUrl: string | null = null;
    try {
      const resResp = await fetch(RESOURCES_URL, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      });
      if (resResp.ok) {
        const resources: Array<{ id: string; url: string; name: string; scopes: string[] }> = await resResp.json();
        if (resources && resources.length > 0) {
          cloudId = resources[0].id;
          siteUrl = resources[0].url;
        }
      } else {
        console.warn('Jira OAuth: failed to fetch resources', resResp.status);
      }
    } catch (e) {
      console.error('Jira OAuth: resource fetch error', e);
    }

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Jira OAuth: unauthenticated user');
      return NextResponse.redirect(new URL('/login?error=auth_required_for_oauth', request.url));
    }

    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    if (!encryptedAccessToken || (refreshToken && !encryptedRefreshToken)) {
      console.error('Jira OAuth: encryption failed');
      return NextResponse.redirect(new URL('/dashboard?error=internal_encryption_error', request.url));
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { error: dbError } = await supabase.from('user_oauth_tokens').upsert(
      {
        user_id: user.id,
        service_name: 'jira',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
        scopes,
        metadata: { cloud_id: cloudId, site_url: siteUrl },
      },
      { onConflict: 'user_id, service_name, chatbot_id' },
    );

    if (dbError) {
      console.error('Jira OAuth: db upsert failed', dbError);
      return NextResponse.redirect(new URL('/dashboard?error=database_storage_error', request.url));
    }

    console.log(`Jira OAuth: tokens stored for user ${user.id}`);
    return NextResponse.redirect(new URL('/dashboard?jira_connected=true', request.url));
  } catch (err: any) {
    console.error('Jira OAuth: unhandled', err);
    return NextResponse.redirect(new URL('/dashboard?error=jira_oauth_unhandled', request.url));
  }
} 
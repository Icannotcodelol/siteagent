'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { decrypt, encrypt } from '@/lib/encryption';

// ---------------------------------------------------------------------------
// OAuth URL generator
// ---------------------------------------------------------------------------

function generateStateParam() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates the HubSpot OAuth authorization URL so that the user can grant
 * access to their HubSpot account. Stores the CSRF `state` parameter in an
 * HttpOnly cookie that will be verified by the callback route.
 */
export async function getHubspotOAuthUrl(): Promise<{ error?: string; url?: string }> {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;
  const rawScopes = process.env.HUBSPOT_SCOPES; // comma-separated list

  if (!clientId || !redirectUri) {
    console.error(
      'HubSpot OAuth Start Error: Missing HUBSPOT_CLIENT_ID or HUBSPOT_REDIRECT_URI env vars.',
    );
    return { error: 'Server configuration error: HubSpot not configured.' };
  }

  const scopes = rawScopes?.split(',').map((s) => s.trim()).filter(Boolean).join(' ') ??
    [
      'conversations.read',
      'conversations.write',
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
    ].join(' ');

  const state = generateStateParam();

  // Persist state param in a secure cookie for 15 minutes.
  cookies().set('hubspot_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  const authUrl = new URL('https://app.hubspot.com/oauth/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);

  return { url: authUrl.toString() };
}

// ---------------------------------------------------------------------------
// HubSpot helper functions that utilise stored OAuth tokens
// ---------------------------------------------------------------------------

type HubspotTokenRow = {
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
  metadata: any;
};

async function getStoredHubspotToken() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'User not authenticated.' };
  }

  let { data, error } = await supabase
    .from('user_oauth_tokens')
    .select('access_token, refresh_token, expires_at, metadata')
    .eq('user_id', user.id)
    .eq('service_name', 'hubspot')
    .single();

  if (error || !data) {
    console.error('getStoredHubspotToken: lookup failed', error);
    return { error: 'HubSpot account not connected.' };
  }

  let accessToken = decrypt(data.access_token);
  if (!accessToken) return { error: 'Failed to decrypt HubSpot access token.' };

  // Refresh token if expired (allow 2 minute leeway)
  const expiresAt = new Date(data.expires_at).getTime();
  const now = Date.now();
  if (expiresAt - now < 120_000 /* 2 minutes */) {
    const refreshResult = await refreshHubspotToken(data.refresh_token ?? null);
    if (refreshResult.error) return { error: refreshResult.error };
    if (!refreshResult.accessToken || !refreshResult.tokenRow) {
      return { error: 'Failed to refresh HubSpot access token.' };
    }
    accessToken = refreshResult.accessToken;
    data = refreshResult.tokenRow;
  }

  return { tokenRow: data as HubspotTokenRow, accessToken };
}

async function refreshHubspotToken(refreshTokenEncrypted: string | null) {
  if (!refreshTokenEncrypted) {
    return { error: 'No HubSpot refresh token stored.' };
  }
  const refreshToken = decrypt(refreshTokenEncrypted);
  if (!refreshToken) return { error: 'Failed to decrypt HubSpot refresh token.' };

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { error: 'HubSpot env vars missing for token refresh.' };
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    const resp = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!resp.ok) {
      console.error('HubSpot token refresh failed', resp.status);
      return { error: 'HubSpot refresh token failed.' };
    }

    const tokenJson: {
      access_token: string;
      expires_in: number;
      scope: string;
    } = await resp.json();

    const accessToken = tokenJson.access_token;
    const expiresAt = new Date(Date.now() + tokenJson.expires_in * 1000).toISOString();
    const encryptedAccessToken = encrypt(accessToken);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'User not authenticated.' };

    // Update row
    const { data: updated, error: dbError } = await supabase
      .from('user_oauth_tokens')
      .update({ access_token: encryptedAccessToken, expires_at: expiresAt })
      .eq('user_id', user.id)
      .eq('service_name', 'hubspot')
      .select()
      .single();

    if (dbError || !updated) {
      return { error: 'Failed to store refreshed HubSpot token.' };
    }

    return { accessToken, tokenRow: updated };
  } catch (e: any) {
    console.error('HubSpot token refresh unexpected', e);
    return { error: e.message };
  }
}

/**
 * Creates or updates a HubSpot contact. Accepts the raw HubSpot contacts API
 * record JSON inside `properties`. At minimum, you should provide an `email`.
 *
 * https://developers.hubspot.com/docs/api/crm/contacts
 */
export async function upsertHubspotContact(
  properties: Record<string, string | number | boolean>,
): Promise<{ data?: any; error?: string }> {
  const { error, accessToken } = await getStoredHubspotToken();
  if (error) return { error };

  if (!properties.email) {
    return { error: 'Contact email is required.' };
  }

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('HubSpot create contact failed', response.status, errBody);
      return { error: `HubSpot API error: ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (e: any) {
    console.error('upsertHubspotContact: unexpected', e);
    return { error: e.message };
  }
} 
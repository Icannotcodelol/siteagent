import { decrypt, encrypt } from './encryption';
import { createClient } from '@supabase/supabase-js';

const CALENDLY_TOKEN_URL = 'https://auth.calendly.com/oauth/token';

// Always use service-role client so we can read/update user_oauth_tokens even
// when the requester is unauthenticated (e.g. public chat actions).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

/**
 * Retrieve a valid Calendly access token for a given user. If the stored token is expired
 * and a refresh token is available, this function will automatically refresh it and
 * persist the new credentials in the database.
 */
export async function getValidCalendlyAccessToken(userId: string) {
  const supabase = supabaseAdmin;

  // Fetch stored tokens for the user
  const { data, error } = await supabase
    .from('user_oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('service_name', 'calendly')
    .is('chatbot_id', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to query user OAuth tokens: ${error.message}`);
  if (!data) throw new Error('No Calendly connection found for this user.');

  const decryptedAccessToken = decrypt(data.access_token);
  if (!decryptedAccessToken) throw new Error('Failed to decrypt Calendly access token.');

  const now = new Date();
  const expiresAt = new Date(data.expires_at);

  // If token still valid, return it
  if (expiresAt > now) {
    return decryptedAccessToken;
  }

  // No refresh token stored – cannot refresh
  if (!data.refresh_token) {
    throw new Error('Calendly token expired and no refresh token present.');
  }

  const decryptedRefreshToken = decrypt(data.refresh_token);
  if (!decryptedRefreshToken) {
    throw new Error('Failed to decrypt Calendly refresh token.');
  }

  const clientId = process.env.CALENDLY_CLIENT_ID;
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Server mis-configuration: missing Calendly client credentials.');
  }

  // Refresh the token
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: decryptedRefreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(CALENDLY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Calendly token refresh failed: ${response.status}`);
  }

  const tokens = await response.json();
  const newAccess = tokens.access_token as string | undefined;
  const newRefresh = tokens.refresh_token as string | undefined;
  const expiresIn = tokens.expires_in as number | undefined;

  if (!newAccess || !expiresIn) {
    throw new Error('Calendly token refresh response missing fields.');
  }

  const encryptedNewAccess = encrypt(newAccess);
  const encryptedNewRefresh = newRefresh ? encrypt(newRefresh) : null;
  const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error: upsertError } = await supabase
    .from('user_oauth_tokens')
    .update({
      access_token: encryptedNewAccess,
      refresh_token: encryptedNewRefresh ?? data.refresh_token,
      expires_at: newExpiresAt,
    })
    .eq('user_id', userId)
    .eq('service_name', 'calendly');

  if (upsertError) {
    console.error('Failed to update refreshed Calendly token:', upsertError);
  }

  return newAccess;
} 
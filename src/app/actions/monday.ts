'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';

// Helper to generate a random state string
function generateStateParam(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates the Monday.com OAuth authorization URL.
 * Stores a CSRF `state` parameter in an HttpOnly cookie.
 */
export async function getMondayOAuthUrl(): Promise<{ error?: string; url?: string }> {
  const clientId = process.env.MONDAY_CLIENT_ID;
  // The redirect URI will be the callback route we're about to create
  const redirectUri = process.env.MONDAY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/monday/callback`;
  // Define the scopes your application needs.
  // Example scopes, adjust based on Monday.com API documentation for desired functionality:
  // 'boards:read boards:write items:read items:write updates:read updates:write users:read workspaces:read'
  // For now, let's request broad permissions, but these should be refined.
  const scopes = process.env.MONDAY_SCOPES || 'boards:read boards:write items:read items:write';

  if (!clientId) {
    console.error(
      'Monday.com OAuth Start Error: Missing MONDAY_CLIENT_ID env var.',
    );
    return { error: 'Server configuration error: Monday.com not configured.' };
  }

  if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.MONDAY_REDIRECT_URI) {
    console.error(
      'Monday.com OAuth Start Error: Missing NEXT_PUBLIC_APP_URL (for default redirect URI) or MONDAY_REDIRECT_URI env var.',
    );
    return { error: 'Server configuration error: Redirect URI for Monday.com not configured.' };
  }

  const state = generateStateParam();

  // Persist state param in a secure cookie for 15 minutes.
  cookies().set('monday_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/', // Accessible for the callback path
    maxAge: 60 * 15, // 15 minutes
  });

  const authUrl = new URL('https://auth.monday.com/oauth2/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('state', state);
  // Monday.com might have an 'app_version_id' if you're using specific app versions.
  // const appVersionId = process.env.MONDAY_APP_VERSION_ID;
  // if (appVersionId) {
  //   authUrl.searchParams.append('app_version_id', appVersionId);
  // }

  console.log('Generated Monday.com Auth URL.');
  return { url: authUrl.toString() };
} 
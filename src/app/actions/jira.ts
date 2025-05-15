'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';

function base64URLEncode(str: Buffer) {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest();
}

/**
 * Generates the Atlassian / Jira OAuth 2.0 (3LO + PKCE) authorization URL.
 * Returns either an error or the URL to redirect the browser to.
 */
export async function getJiraOAuthUrl(): Promise<{ error?: string; url?: string }> {
  const clientId = process.env.JIRA_CLIENT_ID;
  const redirectUri = process.env.JIRA_REDIRECT_URI;
  const scopeEnv = process.env.JIRA_SCOPES; // Optional – space-delimited scopes

  if (!clientId || !redirectUri) {
    console.error(
      'OAuth Start Error: Missing JIRA_CLIENT_ID or JIRA_REDIRECT_URI environment variables.',
    );
    return { error: 'Server configuration error: Jira not configured.' };
  }

  const scopes =
    scopeEnv?.trim() ||
    [
      'offline_access',
      'read:jira-user',
      'read:jira-work',
      'write:jira-work',
    ].join(' ');

  // Generate PKCE parameters
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(sha256(codeVerifier));
  const codeChallengeMethod = 'S256';

  // CSRF state parameter
  const state = crypto.randomBytes(16).toString('hex');

  // Persist verifier + state in secure HttpOnly cookies
  cookies().set('jira_pkce_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15, // 15 min
  });
  cookies().set('jira_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  const authUrl = new URL('https://auth.atlassian.com/authorize');
  authUrl.searchParams.append('audience', 'api.atlassian.com');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('prompt', 'consent');
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', codeChallengeMethod);

  return { url: authUrl.toString() };
}

// ---------------------------------------------------------------------------
// Ticket creation helper – can be used by other server actions or API routes
// ---------------------------------------------------------------------------

import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';

/**
 * Creates a Jira issue using the stored OAuth credentials for the current user.
 *
 * @param projectKey  The Jira project key (e.g. "ABC") where the issue will be created.
 * @param summary     The issue summary / title.
 * @param description The issue description.
 * @returns The created issue data or an error.
 */
export async function createJiraIssue(
  projectKey: string,
  summary: string,
  description?: string,
): Promise<{ data?: any; error?: string }> {
  if (!projectKey || !summary) {
    return { error: 'projectKey and summary are required.' };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'User not authenticated.' };
  }

  // Fetch stored token
  const { data: tokenRow, error: tokenError } = await supabase
    .from('user_oauth_tokens')
    .select('access_token, refresh_token, expires_at, metadata')
    .eq('user_id', user.id)
    .eq('service_name', 'jira')
    .single();

  if (tokenError || !tokenRow) {
    console.error('createJiraIssue: Token lookup failed', tokenError);
    return { error: 'Jira account not connected.' };
  }

  const accessToken = decrypt(tokenRow.access_token);
  if (!accessToken) {
    return { error: 'Failed to decrypt Jira access token.' };
  }

  const cloudId: string | undefined = tokenRow.metadata?.cloud_id;
  if (!cloudId) {
    return { error: 'Jira cloud ID missing from stored connection.' };
  }

  const apiUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`;

  // Jira Cloud (REST API v3) expects the `description` field in Atlassian
  // Document Format (ADF). Convert the provided plain-text description into a
  // minimal ADF document. If no description is supplied, we still send an
  // empty ADF document to satisfy the schema.

  const adfDescription = {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: description
          ? [
              {
                type: 'text',
                text: description,
              },
            ]
          : [],
      },
    ],
  };

  const body = {
    fields: {
      project: { key: projectKey },
      summary: summary,
      issuetype: { name: 'Task' },
      description: adfDescription,
    },
  };

  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error('Jira API create issue failed', resp.status, errorBody);
      return { error: `Jira API error: ${resp.status}` };
    }

    const data = await resp.json();

    // Attach a human-friendly link users can open in the browser. The metadata we stored during OAuth contains the Jira site base URL.
    const siteUrl: string | undefined = tokenRow.metadata?.site_url;
    if (siteUrl && data?.key) {
      data.browseUrl = `${siteUrl}/browse/${data.key}`;
    }

    return { data };
  } catch (e: any) {
    console.error('createJiraIssue: Unexpected error', e);
    return { error: e.message };
  }
} 
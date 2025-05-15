'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function base64URLEncode(str: Buffer) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export async function getCalendlyOAuthUrl(): Promise<{ error?: string; url?: string }> {
  const clientId = process.env.CALENDLY_CLIENT_ID;
  const redirectUri = process.env.CALENDLY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('OAuth Start Error: Missing Calendly environment variables (CLIENT_ID or REDIRECT_URI) for generating auth URL.');
    return { error: 'Server configuration error: Could not generate Calendly auth URL.' };
  }

  // Generate PKCE parameters
  const codeVerifier = base64URLEncode(crypto.randomBytes(32)); // Create a random verifier
  const codeChallenge = base64URLEncode(sha256(codeVerifier)); // Create the challenge
  const codeChallengeMethod = 'S256';

  // Store the code_verifier in an HttpOnly cookie
  // This cookie will be sent back by the browser when Calendly redirects to our callback
  cookies().set('calendly_pkce_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    path: '/', // Accessible for the callback path
    sameSite: 'lax', // Good default for OAuth callbacks
    maxAge: 60 * 15, // 15 minutes validity, adjust as needed
  });

  const calendlyAuthUrl = new URL('https://auth.calendly.com/oauth/authorize');
  calendlyAuthUrl.searchParams.append('client_id', clientId);
  calendlyAuthUrl.searchParams.append('response_type', 'code');
  calendlyAuthUrl.searchParams.append('redirect_uri', redirectUri);
  calendlyAuthUrl.searchParams.append('code_challenge', codeChallenge);
  calendlyAuthUrl.searchParams.append('code_challenge_method', codeChallengeMethod);
  // Optional: add a state parameter for CSRF protection if desired
  // const state = crypto.randomBytes(16).toString('hex');
  // cookies().set('calendly_oauth_state', state, { httpOnly: true, maxAge: 60 * 15, path: '/', sameSite: 'lax' });
  // calendlyAuthUrl.searchParams.append('state', state);

  console.log('Generated Calendly Auth URL with PKCE.');
  return { url: calendlyAuthUrl.toString() };
}

export async function disconnectOAuthServiceAction(serviceName: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Disconnect OAuth: Auth Error:', userError);
    return { error: 'You must be logged in to disconnect a service.' };
  }

  if (!serviceName) {
    return { error: 'Service name is required.' };
  }

  const validServices = ['hubspot', 'jira', 'calendly', 'shopify'];
  if (!validServices.includes(serviceName)) {
      return { error: 'Invalid service name.' };
  }

  console.log(`Attempting to disconnect service: ${serviceName} for user: ${user.id}`);

  try {
    const { error: deleteError } = await supabase
      .from('user_oauth_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('service_name', serviceName);

    if (deleteError) {
      console.error(`Disconnect OAuth: DB delete error for ${serviceName}:`, deleteError);
      return { error: `Failed to disconnect ${serviceName}: ${deleteError.message}` };
    }

    console.log(`Successfully disconnected ${serviceName} for user: ${user.id}`);
    revalidatePath('/dashboard');
    return { success: true };

  } catch (e: any) {
    console.error(`Disconnect OAuth: Unexpected error for ${serviceName}:`, e);
    return { error: 'An unexpected error occurred.' };
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies
import { createClient } from '@/lib/supabase/server'; // Standard server client
import { encrypt } from '@/lib/encryption';

const CALENDLY_TOKEN_URL = 'https://auth.calendly.com/oauth/token';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // const state = searchParams.get('state'); // If you implement state for CSRF, validate it here

  const cookieStore = cookies(); // Get cookie store
  const codeVerifier = cookieStore.get('calendly_pkce_code_verifier')?.value;

  // Clear the PKCE code verifier cookie once retrieved, regardless of outcome
  if (cookieStore.has('calendly_pkce_code_verifier')) {
    cookieStore.delete('calendly_pkce_code_verifier');
  }
  // if (cookieStore.has('calendly_oauth_state')) { // Also clear state cookie if used
  //   cookieStore.delete('calendly_oauth_state');
  // }

  const supabase = createClient();

  // 0. Check for user session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('OAuth Callback Error: User not authenticated', userError);
    // Redirect to login or an error page
    return NextResponse.redirect(new URL('/login?error=auth_required_for_oauth', request.url));
  }

  if (!code) {
    console.error('OAuth Callback Error: No authorization code provided by Calendly.');
    return NextResponse.redirect(new URL('/dashboard?error=calendly_oauth_failed&reason=no_code', request.url));
  }

  if (!codeVerifier) {
    console.error('OAuth Callback Error: Missing PKCE code_verifier cookie. Could indicate a CSRF attempt or cookie issue.');
    return NextResponse.redirect(new URL('/dashboard?error=calendly_oauth_failed&reason=pkce_missing_verifier', request.url));
  }

  const clientId = process.env.CALENDLY_CLIENT_ID;
  // Client secret is NOT used for token exchange in PKCE flow with a public client type if Calendly adheres strictly.
  // However, some providers still require it for confidential clients or have different interpretations.
  // Calendly's typical flow for confidential clients (which server-side apps are) still uses client_secret.
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET; 
  const redirectUri = process.env.CALENDLY_REDIRECT_URI;

  if (!clientId || !redirectUri || !clientSecret) { // clientSecret still checked as Calendly likely requires it for confidential server clients
    console.error('OAuth Callback Error: Missing Calendly environment variables (CLIENT_ID, REDIRECT_URI, or CLIENT_SECRET).');
    return NextResponse.redirect(new URL('/dashboard?error=calendly_config_error', request.url));
  }

  try {
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      // client_secret: clientSecret, // See note above, Calendly server-to-server likely still needs it
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier, // Add the retrieved code_verifier
    });

    // Calendly requires client_secret for confidential clients (server-side apps) even with PKCE.
    tokenRequestBody.append('client_secret', clientSecret);

    const tokenResponse = await fetch(CALENDLY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json().catch(() => ({ error: 'Unknown error during token exchange' }));
      console.error('Calendly Token Exchange Failed:', tokenResponse.status, errorBody);
      return NextResponse.redirect(new URL(`/dashboard?error=calendly_oauth_failed&reason=token_exchange_error&status=${tokenResponse.status}&desc=${encodeURIComponent(errorBody.error_description || errorBody.error)}`, request.url));
    }

    const tokens = await tokenResponse.json();
    /* Expected token structure from Calendly (adjust if different based on their docs):
       {
         "access_token": "...",
         "token_type": "Bearer",
         "expires_in": 7200,
         "refresh_token": "...",
         "scope": "default", // or specific scopes user granted
         "created_at": 1606243490,
         "organization": "https://api.calendly.com/organizations/USER_ORGANIZATION_UUID",
         "owner": "https://api.calendly.com/users/USER_UUID"
       }
    */

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token; // May not always be present, handle if null
    const expiresIn = tokens.expires_in; // in seconds
    // Calendly scope might be a string, DB expects TEXT[]. Split if necessary, or store as TEXT if always single.
    // For now, let's assume it's a string and we store it as a single element array or just TEXT.
    // The database schema `user_oauth_tokens.scopes` is TEXT[].
    const scopes = tokens.scope ? tokens.scope.split(' ') : [];

    if (!accessToken) {
        console.error('OAuth Callback Error: No access_token received from Calendly.');
        return NextResponse.redirect(new URL('/dashboard?error=calendly_oauth_failed&reason=no_access_token', request.url));
    }

    // 2. Encrypt tokens
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    if (!encryptedAccessToken || (refreshToken && !encryptedRefreshToken)) {
      console.error('OAuth Callback Error: Failed to encrypt tokens.');
      return NextResponse.redirect(new URL('/dashboard?error=internal_encryption_error', request.url));
    }

    // 3. Calculate expiry timestamp
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 4. Store tokens in Supabase
    // For a general Calendly connection not tied to a specific chatbot yet, chatbot_id can be null.
    const { error: dbError } = await supabase
      .from('user_oauth_tokens')
      .upsert({
        user_id: user.id,
        service_name: 'calendly',
        access_token: encryptedAccessToken, // Stored as BYTEA, so this should be fine as hex string becomes Buffer-like via psql driver
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
        scopes: scopes, // Ensure this matches your DB column type (TEXT[] or TEXT)
        // chatbot_id: null, // Explicitly setting if not tied to a specific chatbot yet
      }, {
        onConflict: 'user_id, service_name, chatbot_id', // Assumes chatbot_id is part of unique constraint or will be null consistently
      });

    if (dbError) {
      console.error('OAuth Callback Error: Failed to store tokens in database', dbError);
      // Consider if the error is due to constraint violation or other issues
      return NextResponse.redirect(new URL('/dashboard?error=database_storage_error&reason=' + encodeURIComponent(dbError.message), request.url));
    }

    console.log(`Successfully stored Calendly OAuth tokens for user ${user.id} using PKCE.`);

    // 5. Redirect user to a success page (e.g., dashboard or settings)
    return NextResponse.redirect(new URL('/dashboard?calendly_connected=true', request.url));

  } catch (error: any) {
    console.error('OAuth Callback Unhandled Error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=calendly_oauth_unhandled&reason=' + encodeURIComponent(error.message || 'unknown'), request.url));
  }
} 
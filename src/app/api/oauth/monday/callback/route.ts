import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption';

const MONDAY_TOKEN_URL = 'https://auth.monday.com/oauth2/token';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  const cookieStore = cookies();
  const storedState = cookieStore.get('monday_oauth_state')?.value;

  // Clean up state cookie
  if (cookieStore.has('monday_oauth_state')) {
    cookieStore.delete('monday_oauth_state');
  }

  // 0. Check for user session (essential for associating tokens)
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Monday.com OAuth Callback: User not authenticated', userError);
    return NextResponse.redirect(new URL('/login?error=auth_required_for_oauth&service=monday', request.url));
  }

  // 1. Validate parameters
  if (!code) {
    console.error('Monday.com OAuth Callback: Missing authorization code.');
    return NextResponse.redirect(new URL('/dashboard?error=monday_oauth_failed&reason=no_code', request.url));
  }
  if (!stateParam || stateParam !== storedState) {
    console.error('Monday.com OAuth Callback: State mismatch. Potential CSRF attack.');
    return NextResponse.redirect(new URL('/dashboard?error=monday_oauth_failed&reason=state_mismatch', request.url));
  }

  // 2. Prepare for token exchange
  const clientId = process.env.MONDAY_CLIENT_ID;
  const clientSecret = process.env.MONDAY_CLIENT_SECRET;
  const redirectUri = process.env.MONDAY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/monday/callback`;

  if (!clientId || !clientSecret) {
    console.error('Monday.com OAuth Callback: Missing MONDAY_CLIENT_ID or MONDAY_CLIENT_SECRET in environment variables.');
    return NextResponse.redirect(new URL('/dashboard?error=monday_config_error', request.url));
  }
  if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.MONDAY_REDIRECT_URI) {
    console.error(
      'Monday.com OAuth Callback: Missing NEXT_PUBLIC_APP_URL (for default redirect URI) or MONDAY_REDIRECT_URI env var.',
    );
    return { error: 'Server configuration error: Redirect URI for Monday.com not configured.' };
  }

  try {
    // 3. Exchange authorization code for access token
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code', // Standard OAuth, but Monday.com uses direct params
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri, // Often required in token exchange too
    });

    const tokenResponse = await fetch(MONDAY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody.toString(),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json().catch(() => ({ error_description: 'Unknown error during token exchange' }));
      console.error('Monday.com Token Exchange Failed:', tokenResponse.status, errorBody);
      return NextResponse.redirect(new URL(`/dashboard?error=monday_oauth_failed&reason=token_exchange&status=${tokenResponse.status}&desc=${encodeURIComponent(errorBody.error_description || errorBody.error || 'Failed to get token')}`, request.url));
    }

    const tokens = await tokenResponse.json();
    /* Expected token structure from Monday.com (verify with their docs):
       {
         "access_token": "some_access_token",
         "token_type": "Bearer", // Or other type
         "expires_in": 3600, // Or other duration in seconds
         "refresh_token": "some_refresh_token", // If provided
         "scope": "boards:read items:write ..." // Scopes granted
       }
    */

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token; // Monday.com might not issue refresh tokens for all grant types or app types.
    const expiresIn = tokens.expires_in; // in seconds
    const scopes = tokens.scope ? tokens.scope.split(' ') : []; // Adjust if scope format is different

    if (!accessToken) {
      console.error('Monday.com OAuth Callback: No access_token received.');
      return NextResponse.redirect(new URL('/dashboard?error=monday_oauth_failed&reason=no_access_token', request.url));
    }

    // 4. Encrypt tokens
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    if (!encryptedAccessToken || (refreshToken && !encryptedRefreshToken)) {
      console.error('Monday.com OAuth Callback: Failed to encrypt tokens.');
      return NextResponse.redirect(new URL('/dashboard?error=internal_encryption_error&service=monday', request.url));
    }

    // 5. Calculate expiry timestamp
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    // 6. Store tokens in Supabase
    const { error: dbError } = await supabase
      .from('user_oauth_tokens')
      .upsert({
        user_id: user.id,
        service_name: 'monday', // Use a consistent service name
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
        scopes: scopes,
        // metadata: { some_monday_specific_id: tokens.some_id }, // Store any other relevant info if needed
      }, {
        onConflict: 'user_id, service_name, chatbot_id', // Ensure this matches your table's unique constraints
      });

    if (dbError) {
      console.error('Monday.com OAuth Callback: Failed to store tokens in database', dbError);
      return NextResponse.redirect(new URL('/dashboard?error=database_storage_error&service=monday&reason=' + encodeURIComponent(dbError.message), request.url));
    }

    console.log(`Successfully stored Monday.com OAuth tokens for user ${user.id}.`);

    // 7. Redirect user to a success page
    return NextResponse.redirect(new URL('/dashboard?monday_connected=true', request.url));

  } catch (error: any) {
    console.error('Monday.com OAuth Callback Unhandled Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(new URL('/dashboard?error=monday_oauth_unhandled&reason=' + encodeURIComponent(errorMessage), request.url));
  }
} 
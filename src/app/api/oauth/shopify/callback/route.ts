import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption';
import { verifyShopifyHmac } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Basic required params
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const stateParam = searchParams.get('state');

  const cookieStore = cookies();
  const storedState = cookieStore.get('shopify_oauth_state')?.value;
  if (cookieStore.has('shopify_oauth_state')) {
    cookieStore.delete('shopify_oauth_state');
  }

  // Basic validation
  if (!code || !shop) {
    console.error('Shopify OAuth: Missing code or shop in callback');
    return NextResponse.redirect(new URL('/dashboard?error=shopify_oauth_failed&reason=missing_params', request.url));
  }

  // Validate state (CSRF protection)
  if (!storedState || storedState !== stateParam) {
    console.error('Shopify OAuth: State mismatch');
    return NextResponse.redirect(new URL('/dashboard?error=shopify_oauth_failed&reason=state_mismatch', request.url));
  }

  // Verify HMAC signature
  const clientSecret = process.env.SHOPIFY_API_SECRET;
  if (!clientSecret) {
    console.error('Shopify OAuth: Missing SHOPIFY_API_SECRET env variable');
    return NextResponse.redirect(new URL('/dashboard?error=shopify_config_error', request.url));
  }

  if (!verifyShopifyHmac(searchParams, clientSecret)) {
    console.error('Shopify OAuth: HMAC verification failed');
    return NextResponse.redirect(new URL('/dashboard?error=shopify_oauth_failed&reason=hmac_verification', request.url));
  }

  // User session
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Shopify OAuth: No authenticated user', userError);
    return NextResponse.redirect(new URL('/login?error=auth_required_for_oauth', request.url));
  }

  // Exchange code for access token
  try {
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const body = await tokenResponse.json().catch(() => ({}));
      console.error('Shopify OAuth: Token exchange failed', body);
      return NextResponse.redirect(new URL('/dashboard?error=shopify_oauth_failed&reason=token_exchange', request.url));
    }

    const tokenJson: {
      access_token: string;
      scope: string;
      expires_in?: number;
    } = await tokenResponse.json();

    const accessToken = tokenJson.access_token;
    const scopes = tokenJson.scope ? tokenJson.scope.split(',') : [];
    const expiresAt = tokenJson.expires_in ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString() : null;

    if (!accessToken || !shop) {
      console.error('Shopify OAuth: No access token or shop domain returned/found');
      return NextResponse.redirect(new URL('/dashboard?error=shopify_oauth_failed&reason=no_access_token_or_shop', request.url));
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(accessToken);
    if (!encryptedAccessToken) {
        console.error('Shopify OAuth: Failed to encrypt access token');
        return NextResponse.redirect(new URL('/dashboard?error=internal_encryption_error', request.url));
    }

    // Persist in Supabase
    const { error: dbError } = await supabase
      .from('user_oauth_tokens')
      .upsert(
        {
          user_id: user.id,
          service_name: 'shopify',
          access_token: encryptedAccessToken,
          refresh_token: null,
          expires_at: expiresAt,
          scopes,
          metadata: { shop: shop },
          // chatbot_id: null, // Assuming this connection is not tied to a specific chatbot initially
        },
        { onConflict: 'user_id, service_name, chatbot_id' },
      );

    if (dbError) {
      console.error('Shopify OAuth: DB insert failed', dbError);
      return NextResponse.redirect(new URL('/dashboard?error=database_storage_error', request.url));
    }

    console.log(`Shopify OAuth: Successfully stored token for user ${user.id}`);
    return NextResponse.redirect(new URL('/dashboard?shopify_connected=true', request.url));
  } catch (err: any) {
    console.error('Shopify OAuth: Unhandled error', err);
    return NextResponse.redirect(new URL('/dashboard?error=shopify_oauth_unhandled', request.url));
  }
} 
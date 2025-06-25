import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get authorization code and state
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  // Check for errors
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  if (error) {
    console.error('Instagram OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/dashboard?error=instagram_oauth_failed&reason=${error}`, request.url));
  }

  // Validate state for CSRF protection
  const cookieStore = cookies();
  const storedState = cookieStore.get('instagram_oauth_state')?.value;
  if (cookieStore.has('instagram_oauth_state')) {
    cookieStore.delete('instagram_oauth_state');
  }

  if (!storedState || storedState !== stateParam) {
    console.error('Instagram OAuth: State mismatch');
    return NextResponse.redirect(new URL('/dashboard?error=instagram_oauth_failed&reason=state_mismatch', request.url));
  }

  if (!code) {
    console.error('Instagram OAuth: Missing code');
    return NextResponse.redirect(new URL('/dashboard?error=instagram_oauth_failed&reason=missing_code', request.url));
  }

  // Get authenticated user
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Instagram OAuth: No authenticated user', userError);
    return NextResponse.redirect(new URL('/login?error=auth_required_for_oauth', request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/instagram/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Instagram OAuth: Token exchange failed', errorData);
      return NextResponse.redirect(new URL('/dashboard?error=instagram_oauth_failed&reason=token_exchange', request.url));
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;

    // Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: shortLivedToken,
    })}`);

    if (!longLivedTokenResponse.ok) {
      const errorData = await longLivedTokenResponse.json();
      console.error('Instagram OAuth: Long-lived token exchange failed', errorData);
      return NextResponse.redirect(new URL('/dashboard?error=instagram_oauth_failed&reason=long_lived_token', request.url));
    }

    const longLivedTokenData = await longLivedTokenResponse.json();
    const userAccessToken = longLivedTokenData.access_token;

    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account{id,username}&access_token=${userAccessToken}`
    );

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json();
      console.error('Instagram OAuth: Failed to fetch pages', errorData);
      return NextResponse.redirect(new URL('/dashboard?error=instagram_oauth_failed&reason=pages_fetch', request.url));
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];

    // Filter pages with Instagram business accounts
    const pagesWithInstagram = pages.filter((page: any) => page.instagram_business_account);

    if (pagesWithInstagram.length === 0) {
      return NextResponse.redirect(new URL('/dashboard?error=no_instagram_business_account', request.url));
    }

    // Store each page with Instagram account
    for (const page of pagesWithInstagram) {
      // Get page access token
      const pageTokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=access_token&access_token=${userAccessToken}`
      );

      if (!pageTokenResponse.ok) {
        console.error(`Failed to get page token for ${page.id}`);
        continue;
      }

      const pageTokenData = await pageTokenResponse.json();
      const pageAccessToken = pageTokenData.access_token;

      // Encrypt the page access token
      const encryptedPageToken = encrypt(pageAccessToken);
      if (!encryptedPageToken) {
        console.error('Failed to encrypt page access token');
        continue;
      }

      // Store the connection
      const { error: dbError } = await supabase
        .from('instagram_page_connections')
        .upsert({
          user_id: user.id,
          page_id: page.id,
          page_name: page.name,
          instagram_business_account_id: page.instagram_business_account.id,
          instagram_business_account_username: page.instagram_business_account.username,
          page_access_token: encryptedPageToken,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,page_id'
        });

      if (dbError) {
        console.error('Failed to store Instagram connection:', dbError);
      }
    }

    // Store the user access token for future use
    const encryptedUserToken = encrypt(userAccessToken);
    if (encryptedUserToken) {
      await supabase
        .from('user_oauth_tokens')
        .upsert({
          user_id: user.id,
          service_name: 'instagram',
          access_token: encryptedUserToken,
          refresh_token: null,
          expires_at: null, // Long-lived tokens don't have expiry
          scopes: ['pages_show_list', 'instagram_basic', 'instagram_manage_messages'],
          metadata: { pages_count: pagesWithInstagram.length },
        }, {
          onConflict: 'user_id,service_name,chatbot_id'
        });
    }

    return NextResponse.redirect(new URL('/dashboard?instagram_connected=true', request.url));
  } catch (err: any) {
    console.error('Instagram OAuth: Unhandled error', err);
    return NextResponse.redirect(new URL('/dashboard?error=instagram_oauth_unhandled', request.url));
  }
} 
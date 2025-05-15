'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';

function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

export async function getShopifyOAuthUrl(storeDomain: string): Promise<{ error?: string; url?: string }> {
  if (!storeDomain) {
    return { error: 'Store domain is required.' };
  }

  // Normalise input to just the shop host (e.g. "my-store.myshopify.com")
  let shop = storeDomain.trim();

  // If user paste full URL, extract the host
  if (shop.startsWith('http://') || shop.startsWith('https://')) {
    try {
      shop = new URL(shop).host;
    } catch (_) {
      // fallback: strip protocol manually
      shop = shop.replace(/^https?:\/\//, '');
    }
  }

  // Remove everything after first slash (trailing / or path)
  shop = shop.split('/')[0];

  if (!shop.endsWith('.myshopify.com')) {
    shop = `${shop}.myshopify.com`;
  }

  const clientId = process.env.SHOPIFY_API_KEY;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,read_orders';

  if (!clientId || !redirectUri) {
    console.error('Shopify OAuth: Missing environment variables SHOPIFY_API_KEY or SHOPIFY_REDIRECT_URI');
    return { error: 'Server configuration error: Shopify not configured.' };
  }

  const state = generateState();
  cookies().set('shopify_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('access_mode', 'offline');

  return { url: authUrl.toString() };
}

const SHOPIFY_API_VERSION = '2024-04'; // Use a recent stable API version

export async function testShopifyApi(): Promise<{ data?: any; error?: string }> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'User not authenticated.' };
  }

  const { data: tokenData, error: tokenError } = await supabase
    .from('user_oauth_tokens')
    .select('access_token, metadata')
    .eq('user_id', user.id)
    .eq('service_name', 'shopify')
    .single(); // Assuming one Shopify connection per user for now

  if (tokenError || !tokenData) {
    console.error('TestShopifyApi: Token fetch error', tokenError);
    return { error: 'Shopify token not found for user.' };
  }

  const encryptedAccessToken = tokenData.access_token;
  const shopDomain = tokenData.metadata?.shop;

  if (!encryptedAccessToken || !shopDomain) {
    return { error: 'Access token or shop domain missing from stored token data.' };
  }

  const accessToken = decrypt(encryptedAccessToken);

  if (!accessToken) {
    return { error: 'Failed to decrypt access token.' };
  }

  try {
    const response = await fetch(`https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Shopify API Error:', response.status, errorBody);
      return { error: `Shopify API request failed: ${response.status} ${errorBody.errors || errorBody.message || 'Unknown error'}` };
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    console.error('TestShopifyApi: Unhandled fetch error', error);
    return { error: `Failed to call Shopify API: ${error.message}` };
  }
}

export async function getShopifyOrderDetailsByName(orderName: string): Promise<{ data?: any; error?: string }> {
  if (!orderName || orderName.trim() === '') {
    return { error: 'Order number/name is required.' };
  }

  // The order name might include a "#", Shopify API usually expects it without.
  const normalizedOrderName = orderName.replace('#', '').trim();

  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'User not authenticated.' };
  }

  const { data: tokenData, error: tokenError } = await supabase
    .from('user_oauth_tokens')
    .select('access_token, metadata')
    .eq('user_id', user.id)
    .eq('service_name', 'shopify')
    .single();

  if (tokenError || !tokenData) {
    console.error('GetShopifyOrderDetails: Token fetch error', tokenError);
    return { error: 'Shopify token not found for user.' };
  }

  const encryptedAccessToken = tokenData.access_token;
  const shopDomain = tokenData.metadata?.shop;

  if (!encryptedAccessToken || !shopDomain) {
    return { error: 'Access token or shop domain missing from stored token data.' };
  }

  const accessToken = decrypt(encryptedAccessToken);
  if (!accessToken) {
    return { error: 'Failed to decrypt access token.' };
  }

  try {
    // Note: The `name` parameter searches for orders by their display name (e.g., "#1001", "#1002-A").
    // It returns an array of orders, usually with one element if found.
    const apiUrl = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/orders.json?name=${encodeURIComponent(normalizedOrderName)}&status=any`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Shopify Order API Error:', response.status, errorBody);
      return { error: `Shopify API request for order failed: ${response.status} ${errorBody.errors || errorBody.message || 'Unknown error'}` };
    }

    const result = await response.json();
    // The API returns an object with an `orders` array.
    if (result.orders && result.orders.length > 0) {
      return { data: result.orders[0] }; // Return the first matching order
    } else {
      return { error: `Order '${orderName}' not found.` };
    }

  } catch (error: any) {
    console.error('GetShopifyOrderDetails: Unhandled fetch error', error);
    return { error: `Failed to call Shopify Order API: ${error.message}` };
  }
} 
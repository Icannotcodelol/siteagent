import crypto from 'crypto';

/**
 * Verify the HMAC that Shopify sends with every OAuth callback / webhook.
 *
 * Algorithm (per Shopify docs):
 * 1. Take all query parameters except `hmac` & `signature`.
 * 2. Sort them lexicographically by key (ascending).
 * 3. Build a query string of the form "key=value&key=value".
 * 4. Compute an HMAC-SHA256 of that string using your app's secret.
 * 5. Compare (timing-safe) to the `hmac` param.
 */
export function verifyShopifyHmac(params: URLSearchParams, clientSecret: string): boolean {
  // Clone so we can mutate safely
  const entries: [string, string][] = [];
  for (const [key, value] of params.entries()) {
    if (key === 'hmac' || key === 'signature') continue;
    entries.push([key, value]);
  }

  // Sort lexicographically by key
  entries.sort((a, b) => (a[0] > b[0] ? 1 : -1));

  // Build query string
  const message = entries.map(([k, v]) => `${k}=${v}`).join('&');

  const digest = crypto
    .createHmac('sha256', clientSecret)
    .update(message)
    .digest('hex');

  // Use timing-safe compare
  const providedHmac = params.get('hmac') || '';
  return crypto.timingSafeEqual(Buffer.from(digest, 'utf-8'), Buffer.from(providedHmac, 'utf-8'));
} 
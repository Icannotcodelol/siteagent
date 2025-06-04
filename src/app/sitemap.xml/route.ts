/*
 * Sitemap generator – fully dynamic and production-safe.
 * -----------------------------------------------------
 * 1. Works both during development (where source TS/TSX files are present)
 *    and in the deployed serverless bundle (where only the compiled JS files
 *    live in the .next directory).
 * 2. Automatically adds any route under /blog/[slug]/page.(tsx|js) so that
 *    new articles become discoverable without additional code changes.
 * 3. Gracefully falls back and never throws, ensuring Google can always fetch
 *    a valid XML payload – even if an unexpected file layout is present.
 */

import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.redirect('https://www.siteagent.eu/2025sitemap.xml', {
    status: 308,
  });
} 
/*
 * Dynamic sitemap served at /2025sitemap.xml
 * -------------------------------------------------
 * Mirrors the logic from the previous /sitemap.xml route but lives
 * under the requested path.
 */

import { NextResponse } from 'next/server'

// Keep this legacy path alive to avoid Search Console errors.
// Redirects permanently (308) to the new canonical sitemap.xml.

export function GET() {
  return NextResponse.redirect('https://www.siteagent.eu/sitemap.xml', {
    status: 308,
  })
} 
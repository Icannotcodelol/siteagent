/*
 * Dynamic sitemap served at /sitemap.xml (primary entrypoint)
 * ------------------------------------------------------------------
 * Consolidates all important URLs – including localized landing pages –
 * into a single XML payload so that Google Search Console can reliably
 * fetch and process it without any redirects. The implementation mirrors
 * the logic that formerly lived in /2025sitemap.xml while removing the
 * unnecessary indirection that caused intermittent fetch failures.
 */

import { NextResponse } from 'next/server'

const SITE_URL = 'https://www.siteagent.eu'

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>2025-06-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <lastmod>2025-06-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>2025-06-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/de</loc>
    <lastmod>2025-06-08</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/it</loc>
    <lastmod>2025-06-08</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/pl</loc>
    <lastmod>2025-06-08</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/es</loc>
    <lastmod>2025-06-08</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/nl</loc>
    <lastmod>2025-06-08</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
} 
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
import fs from 'node:fs'
import path from 'node:path'

const SITE_URL = 'https://www.siteagent.eu'
const LOCALES = ['de', 'it', 'pl', 'es', 'nl'] as const

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

function generateUrlXml(
  loc: string,
  lastmod?: string,
  changefreq: Frequency = 'monthly',
  priority: string = '0.7',
) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

function collectBlogPostsFromDir(dir: string): { slug: string; lastmod: string }[] {
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const pageTsx = path.join(dir, d.name, 'page.tsx')
      const pageJs = path.join(dir, d.name, 'page.js')
      const pagePath = fs.existsSync(pageTsx) ? pageTsx : fs.existsSync(pageJs) ? pageJs : null
      if (!pagePath) return null

      const stats = fs.statSync(pagePath)
      return {
        slug: d.name,
        lastmod: stats.mtime.toISOString().split('T')[0],
      }
    })
    .filter(Boolean) as { slug: string; lastmod: string }[]
}

export async function GET() {
  try {
    // Minimal test sitemap with just one URL
    const today = new Date().toISOString().split('T')[0]
    const urls = [
      generateUrlXml(`${SITE_URL}/about`, today, 'monthly', '0.8')
    ]

    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n')

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // 1 h edge-cache, always fresh for user-agent but revalidated server-side
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('[sitemap] generation failed', error)

    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`

    return new NextResponse(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    })
  }
} 
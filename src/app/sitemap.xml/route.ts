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
    const staticRoutes = [
      { path: '/', freq: 'daily', prio: '1.0' },
      { path: '/about', freq: 'monthly', prio: '0.8' },
      { path: '/contact', freq: 'monthly', prio: '0.8' },
      { path: '/blog', freq: 'weekly', prio: '0.7' },
    ] as const

    const urls: string[] = []
    const today = new Date().toISOString().split('T')[0]

    // Primary pages
    staticRoutes.forEach(({ path: p, freq, prio }) => {
      urls.push(generateUrlXml(`${SITE_URL}${p}`, today, freq as Frequency, prio))
    })

    // Localised landing pages (e.g. /de, /es ...)
    LOCALES.forEach((locale) => {
      urls.push(generateUrlXml(`${SITE_URL}/${locale}`, today, 'daily', '0.9'))
    })

    // Blog posts – look in both source and compiled output so it works in all envs
    const candidateDirs = [
      path.join(process.cwd(), 'src', 'app', 'blog'),
      path.join(process.cwd(), '.next', 'server', 'app', 'blog'),
    ]

    const blogPosts = candidateDirs.flatMap(collectBlogPostsFromDir)
    const seen = new Set<string>()
    blogPosts.forEach(({ slug, lastmod }) => {
      if (seen.has(slug)) return
      seen.add(slug)
      urls.push(generateUrlXml(`${SITE_URL}/blog/${slug}`, lastmod, 'monthly', '0.8'))
    })

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
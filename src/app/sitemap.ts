import { MetadataRoute } from 'next'
import fs from 'node:fs'
import path from 'node:path'

const SITE_URL = 'https://www.siteagent.eu'

function collectBlogPosts(): { slug: string; lastModified: Date }[] {
  const candidateDirs = [
    path.join(process.cwd(), 'src', 'app', 'blog'),
    path.join(process.cwd(), '.next', 'server', 'app', 'blog'),
  ]

  const blogPosts: { slug: string; lastModified: Date }[] = []
  const seen = new Set<string>()

  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())

      for (const entry of entries) {
        if (seen.has(entry.name)) continue
        
        const pageTsx = path.join(dir, entry.name, 'page.tsx')
        const pageJs = path.join(dir, entry.name, 'page.js')
        const pagePath = fs.existsSync(pageTsx) ? pageTsx : fs.existsSync(pageJs) ? pageJs : null
        
        if (pagePath) {
          const stats = fs.statSync(pagePath)
          blogPosts.push({
            slug: entry.name,
            lastModified: stats.mtime,
          })
          seen.add(entry.name)
        }
      }
    } catch (error) {
      console.warn(`Could not read blog directory ${dir}:`, error)
    }
  }

  return blogPosts
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/careers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/security`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/overview`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/tools/color-palette-generator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/mysugrdemo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/pauseandplaydemo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Localized pages
    {
      url: `${SITE_URL}/de`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/it`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pl`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/es`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/nl`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Add blog posts dynamically
  const blogPosts = collectBlogPosts()
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map(({ slug, lastModified }) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...blogRoutes]
} 
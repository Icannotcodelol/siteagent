import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://www.siteagent.eu';

function generateUrlXml(loc: string, lastmod?: string, changefreq = 'monthly', priority = '0.7') {
  return `  <url>\n    <loc>${loc}</loc>\n    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export async function GET() {
  // Static routes we always want in the sitemap
  const staticRoutes = [
    '/',
    '/about',
    '/contact',
    '/pricing',
    '/features',
    '/blog',
  ];

  const urls: string[] = [];

  // Add static routes
  staticRoutes.forEach((route) => {
    urls.push(generateUrlXml(`${SITE_URL}${route}`, new Date().toISOString().split('T')[0], route === '/' ? 'daily' : 'monthly', route === '/' ? '1.0' : '0.8'));
  });

  // Discover blog posts in src/app/blog/*
  const blogDir = path.join(process.cwd(), 'src', 'app', 'blog');
  if (fs.existsSync(blogDir)) {
    const entries = fs.readdirSync(blogDir, { withFileTypes: true });
    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const pagePath = path.join(blogDir, entry.name, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          const stats = fs.statSync(pagePath);
          const lastmod = stats.mtime.toISOString().split('T')[0];
          urls.push(generateUrlXml(`${SITE_URL}/blog/${entry.name}`, lastmod, 'monthly', '0.8'));
        }
      }
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 
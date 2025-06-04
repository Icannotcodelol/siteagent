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
import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.siteagent.eu';

function generateUrlXml(
  loc: string,
  lastmod?: string,
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
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
    .join('\n');
}

/*
 * Search a directory for blog post sub-folders that contain a page file.
 * Returns an array of { slug, lastmod }.
 */
function collectBlogPostsFromDir(dir: string): { slug: string; lastmod: string }[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d: fs.Dirent) => d.isDirectory())
    .map((d: fs.Dirent) => {
      // Accept both TSX (dev) and JS (production) page files.
      const pageTsx = path.join(dir, d.name, 'page.tsx');
      const pageJs = path.join(dir, d.name, 'page.js');

      const pagePath = fs.existsSync(pageTsx) ? pageTsx : fs.existsSync(pageJs) ? pageJs : null;
      if (!pagePath) return null;

      const stats = fs.statSync(pagePath);
      return {
        slug: d.name,
        lastmod: stats.mtime.toISOString().split('T')[0],
      };
    })
    .filter(Boolean) as { slug: string; lastmod: string }[];
}

export async function GET() {
  try {
    // 1. Core (always-present) routes.
    const staticRoutes = [
      { path: '/', freq: 'daily', prio: '1.0' },
      { path: '/about', freq: 'monthly', prio: '0.8' },
      { path: '/contact', freq: 'monthly', prio: '0.8' },
      { path: '/pricing', freq: 'monthly', prio: '0.8' },
      { path: '/features', freq: 'monthly', prio: '0.8' },
      { path: '/blog', freq: 'weekly', prio: '0.7' },
    ];

    const urls: string[] = [];

    // Static routes
    const today = new Date().toISOString().split('T')[0];
    staticRoutes.forEach(({ path: p, freq, prio }) => {
      urls.push(generateUrlXml(`${SITE_URL}${p}`, today, freq as any, prio));
    });

    // 2. Blog posts – attempt to find both source and compiled directories.
    const candidateDirs = [
      path.join(process.cwd(), 'src', 'app', 'blog'),
      path.join(process.cwd(), '.next', 'server', 'app', 'blog'),
    ];

    const blogPosts: { slug: string; lastmod: string }[] = candidateDirs.flatMap(collectBlogPostsFromDir);

    // Deduplicate (the same slug could appear in both dirs in development).
    const seen = new Set<string>();
    blogPosts.forEach(({ slug, lastmod }) => {
      if (seen.has(slug)) return;
      seen.add(slug);
      urls.push(generateUrlXml(`${SITE_URL}/blog/${slug}`, lastmod, 'monthly', '0.8'));
    });

    // 3. XML assembly.
    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n');

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // 1 day cache in browser, 1 hour in edge/pop caches
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    });
  } catch (error) {
    // Fail-safe: Return minimal yet valid sitemap so Google doesn't choke.
    console.error('[sitemap] generation failed', error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;

    return new NextResponse(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
} 
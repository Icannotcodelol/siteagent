// @ts-ignore
import probe from 'probe-image-size'
// @ts-ignore
import { parseHTML } from 'linkedom'
// @ts-ignore
import { z } from 'zod'

export interface OgCheckResult {
  url: string
  finalUrl: string
  status: number
  redirects: string[]
  meta: Record<string, string | null>
  image: {
    url: string
    type: string
    bytes: number
    width: number
    height: number
    valid: boolean
  } | null
  issues: { code: string; message: string; severity: 'info' | 'warn' | 'error' }[]
  generatedTags?: string
  checkedAt: string
}

const UrlSchema = z.string().url()

/**
 * Sanitize text by stripping control characters (including NUL) that Postgres rejects.
 */
function sanitize(text: string): string {
  return text.replace(/[\x00-\x1F\x7F]/g, '')
}

/**
 * Fetch a remote HTML document and analyse its Open Graph image metadata.
 */
export async function checkOgImage(rawUrl: string): Promise<OgCheckResult> {
  const url = UrlSchema.parse(rawUrl.trim())
  const issues: OgCheckResult['issues'] = []

  const redirects: string[] = []

  // Fetch the HTML – we follow redirects but keep track of the final URL.
  const response = await fetch(url, {
    redirect: 'follow',
    // Some sites block non-browser UAs; present ourselves politely.
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; SiteAgent-OG-Checker/1.0; +https://www.siteagent.eu)'
    }
  })

  if (!response.ok) {
    issues.push({
      code: 'http_error',
      message: `Remote server responded with status ${response.status}.`,
      severity: 'error'
    })
  }

  const finalUrl = response.url
  if (finalUrl !== url) {
    redirects.push(finalUrl)
  }

  const html = await response.text()
  const { document } = parseHTML(html)

  const wanted = [
    'og:image',
    'og:image:width',
    'og:image:height',
    'twitter:image',
    'twitter:card'
  ] as const

  const meta: Record<string, string | null> = {}
  for (const name of wanted) {
    const el = document.querySelector(`meta[property="${name}"]`) ||
      document.querySelector(`meta[name="${name}"]`)
    meta[name] = el ? sanitize(el.getAttribute('content') ?? '') : null
  }

  // Determine candidate image URL.
  const imageUrl = meta['og:image'] ?? meta['twitter:image'] ?? null

  let imageInfo: OgCheckResult['image'] = null
  if (imageUrl) {
    try {
      const imgProbe = await probe(imageUrl)
      imageInfo = {
        url: imageUrl,
        type: imgProbe.mime,
        bytes: imgProbe.length ?? 0,
        width: imgProbe.width,
        height: imgProbe.height,
        valid: true
      }

      // Heuristic checks
      if (imgProbe.length && imgProbe.length > 5 * 1024 * 1024) {
        issues.push({
          code: 'image_large',
          message: 'Image is larger than 5 MB – consider optimising.',
          severity: 'warn'
        })
      }
      if (imgProbe.width < 600 || imgProbe.height < 315) {
        issues.push({
          code: 'image_small',
          message: 'Image dimensions are smaller than recommended 600×315px.',
          severity: 'warn'
        })
      }
    } catch (err) {
      issues.push({
        code: 'image_fetch_failed',
        message: 'Failed to fetch or parse image metadata.',
        severity: 'error'
      })
      imageInfo = {
        url: imageUrl,
        type: '',
        bytes: 0,
        width: 0,
        height: 0,
        valid: false
      }
    }
  } else {
    issues.push({
      code: 'missing_image',
      message: 'No og:image or twitter:image tag found.',
      severity: 'error'
    })
  }

  // Generate missing tag suggestions
  let generatedTags: string | undefined
  if (issues.some((i) => i.code === 'missing_image')) {
    const placeholder = imageInfo?.url || 'https://example.com/your-image.jpg'
    generatedTags = [
      `<meta property="og:image" content="${placeholder}" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:image" content="${placeholder}" />`
    ].join('\n')
  }

  return {
    url,
    finalUrl,
    status: response.status,
    redirects,
    meta,
    image: imageInfo,
    issues,
    generatedTags,
    checkedAt: new Date().toISOString()
  }
} 
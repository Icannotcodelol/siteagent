import { Metadata } from 'next'
// @ts-ignore
import * as cheerio from 'cheerio'

interface CheckResult {
  ogImage?: string | null
  twitterImage?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  url: string
  imageValidation?: {
    ok: boolean
    status: number
    contentType?: string | null
    contentLength?: string | null
  }
}

export const metadata: Metadata = {
  title: 'OG Image Checker | SiteAgent Tools',
  description: 'Validate and preview your page\'s Open Graph and Twitter card images to ensure perfect social sharing.',
  openGraph: {
    title: 'OG Image Checker | SiteAgent Tools',
    description: 'Validate and preview your page\'s Open Graph and Twitter card images to ensure perfect social sharing.',
    type: 'website',
    url: 'https://www.siteagent.eu/tools/og-image-checker'
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/tools/og-image-checker'
  }
}

async function validateImage(imageUrl: string): Promise<CheckResult['imageValidation']> {
  try {
    const res = await fetch(imageUrl, {
      method: 'HEAD',
      // always get fresh status
      cache: 'no-store'
    })

    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type'),
      contentLength: res.headers.get('content-length')
    }
  } catch (err) {
    return {
      ok: false,
      status: 0
    }
  }
}

async function checkOg(url: string): Promise<CheckResult> {
  // Ensure protocol present
  const normalizedUrl = /^https?:\/\//.test(url) ? url : `https://${url}`
  const res = await fetch(normalizedUrl, {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error(`Could not fetch URL. Status ${res.status}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  const ogImage = $('meta[property="og:image"], meta[name="og:image"]').attr('content') || null
  const twitterImage = $('meta[name="twitter:image"]').attr('content') || null
  const ogTitle = $('meta[property="og:title"], meta[name="og:title"]').attr('content') || null
  const ogDescription = $('meta[property="og:description"], meta[name="og:description"]').attr('content') || null

  // Prefer OG image, fallback to Twitter image
  const imageUrl = ogImage || twitterImage
  let imageValidation: CheckResult['imageValidation'] | undefined
  if (imageUrl) {
    imageValidation = await validateImage(imageUrl)
  }

  return {
    url: normalizedUrl,
    ogImage,
    twitterImage,
    ogTitle,
    ogDescription,
    imageValidation
  }
}

function ResultCard({ result }: { result: CheckResult }) {
  const {
    ogImage,
    twitterImage,
    ogTitle,
    ogDescription,
    url,
    imageValidation
  } = result

  const previewImage = ogImage || twitterImage || ''

  return (
    <section className="mt-10 space-y-8">
      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">OG Image:</p>
            <p className={`break-words ${ogImage ? 'text-gray-900' : 'text-red-600'}`}>{ogImage ?? 'Not found'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Twitter Image:</p>
            <p className={`break-words ${twitterImage ? 'text-gray-900' : 'text-red-600'}`}>{twitterImage ?? 'Not found'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">OG Title:</p>
            <p className={`break-words ${ogTitle ? 'text-gray-900' : 'text-red-600'}`}>{ogTitle ?? 'Not found'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">OG Description:</p>
            <p className={`break-words ${ogDescription ? 'text-gray-900' : 'text-red-600'}`}>{ogDescription ?? 'Not found'}</p>
          </div>
          {imageValidation && (
            <div className="md:col-span-2">
              <p className="font-medium text-gray-700">Image Validation:</p>
              {imageValidation.ok ? (
                <p className="text-green-600">Image is accessible (HTTP {imageValidation.status})</p>
              ) : (
                <p className="text-red-600">Image not accessible {imageValidation.status ? `(HTTP ${imageValidation.status})` : ''}</p>
              )}
              {imageValidation.contentType && (
                <p className="text-gray-600">Content-Type: {imageValidation.contentType}</p>
              )}
              {imageValidation.contentLength && (
                <p className="text-gray-600">Size: {(Number(imageValidation.contentLength) / 1024).toFixed(2)} KB</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Card */}
      {previewImage && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Twitter Large Card Preview</h3>
          <div className="max-w-md border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white">
            <img src={previewImage} alt="Preview" className="w-full h-48 object-cover bg-gray-100" />
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-1">{url.replace(/^https?:\/\//, '')}</p>
              <p className="font-semibold text-gray-900 mb-1">{ogTitle ?? 'Untitled'}</p>
              <p className="text-sm text-gray-700 line-clamp-3">{ogDescription ?? 'No description provided.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* External tools */}
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <a
          href="https://cards-dev.twitter.com/validator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Open Twitter Card Validator ↗
        </a>
        <a
          href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Open Facebook Sharing Debugger ↗
        </a>
      </div>
    </section>
  )
}

export default async function OgImageCheckerPage({ searchParams }: { searchParams: { url?: string } }) {
  const url = searchParams.url as string | undefined
  let result: CheckResult | null = null
  let error: string | null = null

  if (url) {
    try {
      result = await checkOg(url)
    } catch (err) {
      error = (err as Error).message
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OG Image Checker</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter a public page URL to validate and preview its Open Graph & Twitter card metadata.
          </p>
        </header>

        {/* Form */}
        <form
          method="GET"
          className="flex flex-col sm:flex-row gap-4 items-stretch"
        >
          <input
            type="url"
            name="url"
            required
            placeholder="https://example.com"
            defaultValue={url ?? ''}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 shadow-sm text-sm flex items-center justify-center"
          >
            Check
          </button>
        </form>

        {/* Loading / Error / Result States */}
        {error && (
          <p className="mt-6 text-red-600 text-sm">{error}</p>
        )}

        {result && !error && <ResultCard result={result} />}
      </div>
    </div>
  )
} 
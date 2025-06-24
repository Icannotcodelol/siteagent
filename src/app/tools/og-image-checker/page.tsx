import { Metadata } from 'next'
import OgImageCheckerTool from './_components/og-image-checker-tool'

export const metadata: Metadata = {
  title: 'OG Image Checker - Free Tool by SiteAgent',
  description: 'Instantly check and preview Open Graph and Twitter image meta tags for any URL.',
  openGraph: {
    title: 'OG Image Checker - Free Tool by SiteAgent',
    description: 'Validate your OG image tags and see social previews.',
    type: 'website',
    url: 'https://www.siteagent.eu/tools/og-image-checker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OG Image Checker by SiteAgent'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OG Image Checker - Free Tool by SiteAgent',
    description: 'Validate your OG image tags and see social previews.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/tools/og-image-checker'
  }
}

interface PageProps {
  searchParams?: { url?: string }
}

export default function OgCheckerPage({ searchParams }: PageProps) {
  const url = searchParams?.url
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600">SiteAgent</a>
            <span>›</span>
            <a href="/tools" className="hover:text-blue-600">Tools</a>
            <span>›</span>
            <span className="text-gray-900">OG Image Checker</span>
          </nav>
        </div>
      </div>

      {/* Main */}
      <main className="py-8">
        <OgImageCheckerTool initialUrl={url} />
      </main>
    </div>
  )
} 
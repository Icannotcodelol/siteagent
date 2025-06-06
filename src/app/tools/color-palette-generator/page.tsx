import type { Metadata } from 'next';
import { ColorPaletteGenerator } from './_components/color-palette-generator';

export const metadata: Metadata = {
  title: 'Free Color Palette Generator - Extract Colors from Images | SiteAgent Tools',
  description: 'Generate beautiful color palettes from images or create random harmonious color schemes. Extract dominant colors, copy HEX/RGB codes, and preview your palette instantly. Perfect for designers, developers, and creatives.',
  keywords: [
    'color palette generator',
    'color extractor',
    'image color picker',
    'hex color codes',
    'rgb colors',
    'design tools',
    'color scheme generator',
    'color harmony',
    'web design colors',
    'brand colors',
    'ui design',
    'graphic design tools',
    'color analysis',
    'palette inspiration',
    'color combinations',
    'free design tools'
  ].join(', '),
  authors: [{ name: 'SiteAgent' }],
  creator: 'SiteAgent',
  publisher: 'SiteAgent',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Free Color Palette Generator - Extract Colors from Images',
    description: 'Generate beautiful color palettes from images or create random harmonious color schemes. Perfect for designers and developers.',
    type: 'website',
    url: 'https://siteagent.eu/tools/color-palette-generator',
    siteName: 'SiteAgent',
    locale: 'en_US',
    images: [
      {
        url: '/tools/color-palette-generator-og.png',
        width: 1200,
        height: 630,
        alt: 'Color Palette Generator Tool - Extract colors from images and create harmonious color schemes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SiteAgent',
    creator: '@SiteAgent',
    title: 'Free Color Palette Generator - Extract Colors from Images',
    description: 'Generate beautiful color palettes from images or create random harmonious color schemes. Perfect for designers and developers.',
    images: ['/tools/color-palette-generator-og.png'],
  },
  alternates: {
    canonical: 'https://siteagent.eu/tools/color-palette-generator',
  },
  other: {
    'google-site-verification': 'your-google-verification-code',
  },
};

// Structured data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Color Palette Generator',
  alternateName: 'Image Color Extractor',
  description: 'Free online tool to generate beautiful color palettes from images or create random harmonious color schemes. Perfect for designers, developers, and creative professionals.',
  url: 'https://siteagent.eu/tools/color-palette-generator',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires modern web browser with JavaScript enabled',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'Extract dominant colors from uploaded JPG and PNG images',
    'Generate random harmonious color palettes (analogous, complementary, triadic, monochromatic)',
    'Copy HEX, RGB, and HSL color codes to clipboard',
    'Live palette preview with UI components',
    'Export color palettes as PNG images',
    'No registration required - completely free',
    'Works offline once loaded',
    'Mobile and desktop responsive design'
  ],
  creator: {
    '@type': 'Organization',
    name: 'SiteAgent',
    url: 'https://siteagent.eu'
  },
  provider: {
    '@type': 'Organization',
    name: 'SiteAgent',
    url: 'https://siteagent.eu'
  },
  isAccessibleForFree: true,
  inLanguage: 'en-US',
  keywords: 'color palette, color extractor, image colors, hex codes, design tools, color harmony, web design',
  audience: {
    '@type': 'Audience',
    audienceType: ['Designers', 'Web Developers', 'Graphic Designers', 'UI/UX Designers', 'Creative Professionals']
  },
  screenshot: 'https://siteagent.eu/tools/color-palette-generator-og.png',
  softwareVersion: '1.0',
  dateCreated: '2024-01-01',
  dateModified: new Date().toISOString(),
};

export default function ColorPaletteGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gray-950">
        <ColorPaletteGenerator />
      </div>
    </>
  );
} 
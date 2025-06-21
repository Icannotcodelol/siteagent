import { Metadata } from 'next'
import JsonFormatter from './_components/json-formatter'
import JsonLdSchema from './_components/json-ld-schema'

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator - Beautify, Minify, Fix JSON | SiteAgent Tools',
  description: 'Free online JSON formatter, validator, and beautifier. Format messy JSON, validate syntax, fix errors, minify for production, and convert between JSON/YAML. Essential developer tool with smart error detection.',
  keywords: 'JSON formatter, JSON beautifier, JSON validator, JSON minifier, JSON pretty print, JSON syntax checker, JSON error fixer, JSON tools, developer tools, JSON parser, JSON lint, format JSON online',
  openGraph: {
    title: 'JSON Formatter & Validator - Free Developer Tool by SiteAgent',
    description: 'Format, validate, and beautify JSON with smart error detection and one-click fixes. The most comprehensive JSON tool for developers.',
    type: 'website',
    url: 'https://www.siteagent.eu/tools/json-formatter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SiteAgent JSON Formatter & Validator Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Formatter & Validator - Free Tool by SiteAgent',
    description: 'Format, validate, and beautify JSON instantly. Smart error detection with one-click fixes.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/tools/json-formatter'
  }
}

export default function JsonFormatterPage() {
  return (
    <>
      <JsonLdSchema />
      <div className="min-h-screen bg-gray-50">
      {/* Navigation breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600">SiteAgent</a>
            <span>›</span>
            <a href="/tools" className="hover:text-blue-600">Tools</a>
            <span>›</span>
            <span className="text-gray-900">JSON Formatter</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="py-8">
        <JsonFormatter />
      </main>

      {/* SEO Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Professional JSON Formatter & Validator
            </h2>
            <p className="text-gray-600 mb-4">
              Our free JSON formatter is the most comprehensive tool for developers working with JSON data. 
              Whether you need to beautify messy JSON from an API response, validate JSON syntax before deployment, 
              or minify JSON for production use, this tool handles it all with intelligent error detection and fixes.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features:</h3>
            <ul className="text-gray-600 space-y-1 mb-4">
              <li>• <strong>Smart Beautifier:</strong> Format JSON with customizable indentation (2, 4 spaces, or tabs)</li>
              <li>• <strong>Real-time Validator:</strong> Instant syntax checking with line-by-line error highlighting</li>
              <li>• <strong>One-Click Fixes:</strong> Automatically fix common errors like trailing commas and missing quotes</li>
              <li>• <strong>JSON Minifier:</strong> Compress JSON for production, reducing file size by up to 30%</li>
              <li>• <strong>Format Converter:</strong> Convert between JSON, YAML, and CSV formats</li>
              <li>• <strong>JSON Path Explorer:</strong> Click any value to get its exact path</li>
              <li>• <strong>Schema Generator:</strong> Auto-generate JSON Schema from your data</li>
              <li>• <strong>Syntax Themes:</strong> Choose from VS Code, GitHub, Dracula themes</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Common Use Cases:</h3>
            <ul className="text-gray-600 space-y-1 mb-4">
              <li>• <strong>API Development:</strong> Format and validate API responses and requests</li>
              <li>• <strong>Configuration Files:</strong> Ensure your JSON config files are error-free</li>
              <li>• <strong>Data Processing:</strong> Clean up exported JSON data from databases</li>
              <li>• <strong>Debugging:</strong> Quickly identify syntax errors in JSON payloads</li>
              <li>• <strong>Documentation:</strong> Create beautiful JSON examples for API docs</li>
            </ul>

            <p className="text-gray-600">
              Working with JSON data in your chatbot or AI application? 
              <a href="/" className="text-blue-600 hover:text-blue-700 ml-1">
                Try SiteAgent to automatically process and understand JSON data →
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
} 
import { Metadata } from 'next'
import StartupNameGenerator from './_components/startup-name-generator'

export const metadata: Metadata = {
  title: 'Startup Name Generator - Create Unique Business Names | SiteAgent Tools',
  description: 'Generate creative startup names with domain availability check. Free AI-powered business name generator that creates unique, memorable names for your company. Check .com, .io, and .ai domains instantly.',
  keywords: 'startup name generator, business name generator, company name generator, brand name generator, domain name generator, startup names, business naming, brand naming tool, domain availability checker, AI name generator',
  openGraph: {
    title: 'Startup Name Generator - Free AI-Powered Business Naming Tool',
    description: 'Create the perfect name for your startup with our AI-powered generator. Check domain availability instantly.',
    type: 'website',
    url: 'https://www.siteagent.eu/tools/startup-name-generator',
    images: [
      {
        url: '/og-startup-name-generator.png',
        width: 1200,
        height: 630,
        alt: 'SiteAgent Startup Name Generator Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Startup Name Generator - Create & Check Domain Names',
    description: 'AI-powered startup name generator with instant domain availability checking.',
    images: ['/og-startup-name-generator.png']
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/tools/startup-name-generator'
  }
}

export default function StartupNameGeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600">SiteAgent</a>
            <span>›</span>
            <a href="/tools" className="hover:text-blue-600">Tools</a>
            <span>›</span>
            <span className="text-gray-900">Startup Name Generator</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="py-8">
        <StartupNameGenerator />
      </main>

      {/* SEO Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              AI-Powered Startup Name Generator
            </h2>
            <p className="text-gray-600 mb-4">
              Our free startup name generator uses advanced AI to create unique, memorable business names 
              tailored to your industry and preferences. Whether you're launching a tech startup, e-commerce 
              business, or creative agency, find the perfect name with instant domain availability checking.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works:</h3>
            <ul className="text-gray-600 space-y-1 mb-4">
              <li>• <strong>Industry-Specific:</strong> Choose your niche for targeted name suggestions</li>
              <li>• <strong>Keyword Integration:</strong> Include important keywords in your business name</li>
              <li>• <strong>Style Selection:</strong> Pick from modern, classic, playful, or professional styles</li>
              <li>• <strong>Domain Checking:</strong> Instant availability for .com, .io, and .ai domains</li>
              <li>• <strong>Smart Suggestions:</strong> AI analyzes successful startups to create winning names</li>
              <li>• <strong>Unlimited Generation:</strong> Generate as many names as you need, completely free</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Naming Best Practices:</h3>
            <ul className="text-gray-600 space-y-1 mb-4">
              <li>• <strong>Keep it Short:</strong> Aim for 2-3 syllables for easy pronunciation</li>
              <li>• <strong>Make it Memorable:</strong> Choose names that stick in people's minds</li>
              <li>• <strong>Check Trademarks:</strong> Ensure your chosen name isn't already trademarked</li>
              <li>• <strong>Consider SEO:</strong> Including keywords can help with search visibility</li>
              <li>• <strong>Think Global:</strong> Avoid names that might have negative meanings in other languages</li>
              <li>• <strong>Test It Out:</strong> Say it out loud and get feedback from potential customers</li>
            </ul>

            <p className="text-gray-600">
              Ready to build your startup? Once you have the perfect name, 
              <a href="/" className="text-blue-600 hover:text-blue-700 ml-1">
                create an AI chatbot with SiteAgent to engage your first customers →
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
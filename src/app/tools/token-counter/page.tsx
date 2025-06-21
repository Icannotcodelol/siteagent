import { Metadata } from 'next'
import TokenCounterTool from './_components/token-counter-tool'

export const metadata: Metadata = {
  title: 'AI Token Counter - Count Tokens & Estimate Costs | SiteAgent Tools',
  description: 'Free AI token counter tool. Count tokens, estimate costs for GPT-3.5, GPT-4, and GPT-4o. Perfect for managing AI costs and optimizing prompts for chatbots and AI applications.',
  keywords: 'AI token counter, GPT token count, token calculator, AI cost estimator, prompt optimization, chatbot tools, tiktoken, OpenAI pricing',
  openGraph: {
    title: 'AI Token Counter - Free Tool by SiteAgent',
    description: 'Count tokens and estimate costs for GPT models. Essential tool for developers working with AI and chatbots.',
    type: 'website',
    url: 'https://www.siteagent.eu/tools/token-counter',
    images: [
      {
        url: '/og-token-counter.png',
        width: 1200,
        height: 630,
        alt: 'SiteAgent AI Token Counter Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Token Counter - Free Tool by SiteAgent',
    description: 'Count tokens and estimate costs for GPT models. Essential for AI developers.',
    images: ['/og-token-counter.png']
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/tools/token-counter'
  }
}

export default function TokenCounterPage() {
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
            <span className="text-gray-900">Token Counter</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="py-8">
        <TokenCounterTool />
      </main>

      {/* Footer with additional SEO content */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Token Counter Tool</h2>
            <p className="text-gray-600 mb-4">
              This free AI token counter helps developers, prompt engineers, and AI enthusiasts accurately count tokens 
              and estimate costs for various OpenAI models including GPT-3.5 Turbo, GPT-4, and GPT-4o. Built with 
              the same tokenization library (gpt-tokenizer) used by OpenAI, ensuring accurate token counts.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features:</h3>
            <ul className="text-gray-600 space-y-1 mb-4">
              <li>• Real-time token counting as you type</li>
              <li>• Accurate cost estimation for all major GPT models</li>
              <li>• Smart text chunking for large documents</li>
              <li>• Copy results in various formats (JSON, plain text)</li>
              <li>• Context limit warnings for each model</li>
            </ul>

            <p className="text-gray-600">
              Whether you're building chatbots, optimizing prompts, or managing AI costs, this tool provides the 
              insights you need to work efficiently with large language models. 
              <a href="/" className="text-blue-600 hover:text-blue-700 ml-1">
                Try SiteAgent for automated chatbot creation →
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
import { Metadata } from 'next'
import MetaPromptGeneratorTool from './_components/meta-prompt-generator-tool'

export const metadata: Metadata = {
  title: 'Meta Prompt Generator - AI Prompt Optimizer | SiteAgent Tools',
  description: 'Transform basic AI prompts into powerful meta prompts that deliver better results. Free tool to optimize ChatGPT, GPT-4, and other AI prompts for greater control, consistency, and quality.',
  keywords: 'meta prompt generator, AI prompt optimizer, ChatGPT prompt improver, prompt engineering tool, AI prompt enhancer, better AI prompts, prompt optimization, structured prompts',
  openGraph: {
    title: 'Meta Prompt Generator - Free AI Prompt Optimizer',
    description: 'Transform your basic AI prompts into powerful meta prompts. Get better results from ChatGPT, GPT-4, and other AI tools.',
    type: 'website',
    url: 'https://www.siteagent.eu/tools/meta-prompt-generator',
    images: [
      {
        url: '/og-meta-prompt-generator.png',
        width: 1200,
        height: 630,
        alt: 'SiteAgent Meta Prompt Generator Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meta Prompt Generator - Free AI Prompt Optimizer',
    description: 'Transform basic AI prompts into powerful meta prompts for better results.',
    images: ['/og-meta-prompt-generator.png']
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/tools/meta-prompt-generator'
  }
}

export default function MetaPromptGeneratorPage() {
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
            <span className="text-gray-900">Meta Prompt Generator</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="py-8">
        <MetaPromptGeneratorTool />
      </main>

      {/* Footer with additional SEO content */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About Meta Prompting</h2>
              <p className="text-gray-600 mb-4">
                Meta prompting is an advanced AI technique that structures your prompts with specific roles, 
                context, and formatting instructions. This approach dramatically improves AI output quality 
                by removing ambiguity and providing clear guidance.
              </p>
              <p className="text-gray-600">
                Our Meta Prompt Generator transforms basic prompts into comprehensive instructions that work 
                with ChatGPT, GPT-4, Claude, and other AI models.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Perfect For</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Content creators and marketers</li>
                <li>• Prompt engineers and AI practitioners</li>
                <li>• Business analysts and consultants</li>
                <li>• Developers building AI applications</li>
                <li>• Anyone using AI for work or projects</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Helps</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Get consistent, high-quality AI outputs</li>
                <li>• Reduce time spent refining prompts</li>
                <li>• Learn prompt engineering best practices</li>
                <li>• Improve AI tool effectiveness</li>
                <li>• Scale AI-driven content creation</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Powered by SiteAgent AI</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                This Meta Prompt Generator is built using SiteAgent's AI chatbot platform. Experience the same 
                intelligent conversation technology that powers thousands of business chatbots worldwide.
              </p>
              <a 
                href="/" 
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your Own AI Chatbot →
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free AI Developer Tools | SiteAgent Tools Collection',
  description: 'Free collection of AI and developer tools including token counters, prompt optimizers, and more. Built for developers working with AI, chatbots, and language models.',
  keywords: 'AI tools, developer tools, free tools, token counter, prompt optimizer, chatbot tools, AI utilities',
  openGraph: {
    title: 'Free AI Developer Tools - SiteAgent Tools',
    description: 'Discover our collection of free AI and developer tools. Token counters, prompt optimizers, and more.',
    type: 'website',
    url: 'https://www.siteagent.eu/tools'
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/tools'
  }
}

interface Tool {
  title: string
  description: string
  href: string
  icon: string
  category: 'AI' | 'Developer' | 'SEO' | 'Analytics'
  isNew?: boolean
  comingSoon?: boolean
}

const tools: Tool[] = [
  {
    title: 'AI Token Counter',
    description: 'Count tokens and estimate costs for GPT models. Perfect for managing AI costs and optimizing prompts.',
    href: '/tools/token-counter',
    icon: '🔢',
    category: 'AI'
  },
  {
    title: 'Meta Prompt Generator',
    description: 'Transform basic AI prompts into powerful meta prompts that deliver better results and consistency.',
    href: '/tools/meta-prompt-generator',
    icon: '✨',
    category: 'AI',
    isNew: true
  },
  // Future tools will be added here
  {
    title: 'Prompt Optimizer',
    description: 'Optimize your AI prompts for better results and lower token usage.',
    href: '/tools/prompt-optimizer',
    icon: '🔧',
    category: 'AI',
    comingSoon: true
  },
  {
    title: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting.',
    href: '/tools/json-formatter',
    icon: '📋',
    category: 'Developer',
    comingSoon: true
  },
  {
    title: 'URL Shortener',
    description: 'Create short, trackable links with analytics and custom domains.',
    href: '/tools/url-shortener',
    icon: '🔗',
    category: 'SEO',
    comingSoon: true
  },
  {
    title: 'QR Code Generator',
    description: 'Generate custom QR codes for URLs, text, WiFi passwords, and more.',
    href: '/tools/qr-generator',
    icon: '📱',
    category: 'Developer',
    comingSoon: true
  },
  {
    title: 'Color Palette Generator',
    description: 'Generate beautiful color palettes for your designs and websites.',
    href: '/tools/color-palette',
    icon: '🎨',
    category: 'Developer',
    comingSoon: true
  }
]

const categories = ['All', 'AI', 'Developer', 'SEO', 'Analytics'] as const

export default function ToolsPage() {
  const availableTools = tools.filter(tool => !tool.comingSoon)
  const comingSoonTools = tools.filter(tool => tool.comingSoon)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600">SiteAgent</a>
            <span>›</span>
            <span className="text-gray-900">Tools</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free Developer Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A growing collection of free tools built for developers, AI engineers, and digital creators. 
            All tools are free to use and designed to boost your productivity.
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {availableTools.length} Available Now
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {comingSoonTools.length} Coming Soon
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Available Tools */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Available Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{tool.icon}</div>
                  {tool.isNew && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tool.category}
                  </span>
                  <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700">
                    Try it →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonTools.map((tool) => (
              <div
                key={tool.href}
                className="bg-white rounded-lg border border-gray-200 p-6 opacity-75"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{tool.icon}</div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tool.category}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">
                    In Development
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Than Tools?</h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            While these tools help with development, SiteAgent can build complete AI chatbots for your business. 
            Upload documents, train on your data, and deploy in minutes.
          </p>
          <a 
            href="/"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
          >
            Create Your AI Chatbot →
          </a>
        </section>
      </main>

      {/* Footer with SEO content */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Our Tools</h3>
              <p className="text-gray-600">
                Our free developer tools are built by the SiteAgent team to help developers, AI engineers, 
                and digital creators work more efficiently. All tools are completely free and require no registration.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Categories</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• AI & Machine Learning Tools</li>
                <li>• Developer Utilities</li>
                <li>• SEO & Marketing Tools</li>
                <li>• Analytics & Monitoring</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-4">
                We're constantly adding new tools. Follow our progress and get notified about new releases.
              </p>
              <a 
                href="/blog" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Read Our Blog →
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
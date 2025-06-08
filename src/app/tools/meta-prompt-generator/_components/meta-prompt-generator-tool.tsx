'use client'

import { useState } from 'react'

export default function MetaPromptGeneratorTool() {
  const [chatbotLoaded, setChatbotLoaded] = useState(false)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Meta Prompt Generator</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transform your basic AI prompts into powerful meta prompts that deliver better results. 
          Get more control, consistency, and quality from your AI interactions.
        </p>
      </div>

      {/* What is Meta Prompting Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Meta Prompting?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 mb-4">
              Meta prompting means writing a prompt about how to prompt. Instead of just asking a question, 
              you provide structured instructions that guide the AI's approach, tone, and format.
            </p>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">❌ Basic Prompt:</h4>
              <p className="text-gray-600 italic">"Write a blog post about remote work"</p>
            </div>
          </div>
          <div>
            <p className="text-gray-700 mb-4">
              With meta prompting, you remove guesswork by explicitly defining the AI's role, 
              output structure, and success criteria for dramatically better results.
            </p>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">✅ Meta Prompt:</h4>
              <p className="text-gray-600 italic">
                "You are a content strategist writing for startup founders. Create a 1000-word blog post 
                about remote work productivity with an engaging intro, 5 actionable tips with subheadings, 
                and a call-to-action. Use a professional yet approachable tone..."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Greater Control</h3>
          <p className="text-gray-600">
            Set clear roles, objectives, and formatting rules. Guide AI behavior instead of leaving it to assumptions.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Consistency</h3>
          <p className="text-gray-600">
            Ensure every output follows the same structure and quality standards across multiple runs.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Higher Quality</h3>
          <p className="text-gray-600">
            Get more relevant, detailed, and nuanced responses by providing context and success criteria.
          </p>
        </div>
      </div>

      {/* Main Tool Interface */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transform Your Prompts</h2>
          <p className="text-gray-600">
            Enter your basic prompt below and our AI assistant will enhance it into a powerful meta prompt
          </p>
        </div>

        {/* Chatbot Iframe Container */}
        <div className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[500px] flex items-center justify-center">
          {/* Placeholder for SiteAgent chatbot iframe */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.435l-3.447 1.725a1 1 0 01-1.423-1.423l1.725-3.447A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-700">Meta Prompt Assistant Ready</h3>
              <p className="text-gray-500">SiteAgent chatbot iframe will be embedded here</p>
              <div className="text-sm text-gray-400">
                Placeholder for iframe embed code
              </div>
            </div>
          </div>
          
          {/* This div will be replaced with the actual iframe */}
          <div className="hidden">
            {/* 
            Example of where the iframe will go:
            <iframe 
              src="YOUR_SITEAGENT_CHATBOT_URL" 
              width="100%" 
              height="500" 
              frameBorder="0"
            ></iframe> 
            */}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Perfect For</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "📝", title: "Content Creation", desc: "Blog posts, social media, marketing copy" },
            { icon: "🔍", title: "SEO Audits", desc: "Structured website analysis and recommendations" },
            { icon: "🤖", title: "Chatbot Design", desc: "Better conversational AI flows and responses" },
            { icon: "📊", title: "Business Analysis", desc: "Reports, strategies, and decision-making" }
          ].map((useCase, index) => (
            <div key={index} className="text-center p-4">
              <div className="text-3xl mb-3">{useCase.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{useCase.title}</h3>
              <p className="text-sm text-gray-600">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
            <h3 className="font-semibold text-gray-900 mb-2">Enter Your Basic Prompt</h3>
            <p className="text-gray-600">Type your simple request or question into the chat interface</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Enhancement</h3>
            <p className="text-gray-600">Our assistant analyzes and enhances your prompt with structure and context</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
            <h3 className="font-semibold text-gray-900 mb-2">Get Your Meta Prompt</h3>
            <p className="text-gray-600">Receive a detailed, optimized prompt ready to use with any AI tool</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Build Your Own AI Assistant?</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          This Meta Prompt Generator is powered by SiteAgent's AI platform. Create your own intelligent 
          chatbots and assistants that understand context and deliver precise results.
        </p>
        <a 
          href="/"
          className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
        >
          Start Building with SiteAgent →
        </a>
      </div>
    </div>
  )
} 
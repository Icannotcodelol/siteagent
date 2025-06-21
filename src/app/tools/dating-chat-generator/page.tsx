import { Metadata } from 'next'
import DatingChatGenerator from './_components/dating-chat-generator'

export const metadata: Metadata = {
  title: 'Dating App Chat Generator - Create Viral Social Media Content | SiteAgent',
  description: 'Generate realistic-looking dating app conversations for social media marketing. Create viral content with our free Hinge, Tinder, and Bumble chat mockup generator.',
  keywords: 'dating app chat generator, fake dating conversation, viral marketing tool, social media content, Hinge chat mockup, Tinder conversation generator',
  openGraph: {
    title: 'Dating App Chat Generator - Create Viral Social Media Content',
    description: 'Generate realistic-looking dating app conversations for social media marketing. Create viral content with our free chat mockup generator.',
    type: 'website',
  },
}

export default function DatingChatGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dating App Chat Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create viral social media content with realistic dating app conversation mockups. 
            Perfect for marketing campaigns, memes, and social proof.
          </p>
        </div>
        
        <DatingChatGenerator />
        
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Build Real Customer Conversations?
            </h2>
            <p className="text-gray-600 mb-6">
              While fake conversations get attention, real AI-powered customer conversations drive business results. 
              Create an intelligent chatbot that actually converts visitors into customers.
            </p>
            <a
              href="/dashboard/chatbot/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Build Real AI Chatbot →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 
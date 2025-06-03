import { AuthButton } from "@/app/_components/auth-button";
import LandingPageClient from "@/app/landing-page-client";
import ModernNavbar from "@/app/_components/modern-navbar";
import { Suspense } from 'react';
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// Metadata for this page
export const metadata: Metadata = {
  title: "SiteAgent - Smarter Chatbots. Faster | Turn Documents Into Custom Chatbots in Under 5 Minutes",
  description: "Easily turn your existing documents into custom chatbots and embed them. All in under 5 minutes. Create intelligent AI assistants that schedule meetings, update CRM, and handle customer inquiries automatically.",
  keywords: "AI automation, chatbot, customer service automation, AI assistant, business automation, CRM integration, meeting scheduling, AI customer support",
  authors: [{ name: "SiteAgent" }],
  creator: "SiteAgent",
  publisher: "SiteAgent",
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
    type: 'website',
    locale: 'en_US',
    url: 'https://www.siteagent.eu/',
    title: 'SiteAgent - Smarter Chatbots. Faster',
    description: 'Easily turn your existing documents into custom chatbots and embed them. All in under 5 minutes. Create AI assistants that automate real business tasks.',
    siteName: 'SiteAgent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteAgent - Smarter Chatbots. Faster',
    description: 'Easily turn your existing documents into custom chatbots and embed them. All in under 5 minutes.',
    creator: '@SiteAgent',
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/'
  },
  verification: {
    google: 'your-google-verification-code', // You should replace this with actual verification code
  },
};

// Revolutionary hero with split-screen asymmetric design
function RevolutionaryHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
        {/* Animated geometric shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="container relative mx-auto px-4 md:px-6 pt-20 md:pt-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center min-h-[80vh]">
          {/* Left side - Content (60% width) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Live demo badge with modern design */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-bold tracking-wide">LIVE DEMO</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <span className="text-gray-300 text-sm">Try it now - No signup required!</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight">
                <div className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Smarter Chatbots.
                </div>
                <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent relative">
                  Faster
                  <div className="absolute -right-4 top-0">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-2xl">
                Easily turn your existing documents into custom chatbots and embed them. All in under 5 minutes.
                <Link href="#live-demo" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors cursor-pointer"> See it work in real-time.</Link>
              </p>
            </div>
            
            {/* Modern CTA with side-by-side layout */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="#live-demo" 
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3"
              >
                <span>🚀 Launch Demo</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
              </Link>
              
              <Link 
                href="/signup" 
                className="border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-gray-400 hover:text-white hover:bg-gray-800/30 flex items-center gap-3"
              >
                <span>Start Free Trial</span>
                <span className="text-green-400">✓</span>
              </Link>
            </div>

            {/* Trust indicators in a horizontal layout */}
            <div className="flex flex-wrap items-center gap-8 pt-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/20 rounded border border-green-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded"></div>
                </div>
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500/20 rounded border border-blue-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded"></div>
                </div>
                <span>5-Minute Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500/20 rounded border border-purple-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-400 rounded"></div>
                </div>
                <span>14-Day Free Trial</span>
              </div>
            </div>
          </div>

          {/* Right side - Visual element (40% width) */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Mobile-optimized feature showcase - visible only on mobile */}
            <div className="lg:hidden">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Key Features</h2>
              <div className="space-y-4">
                {/* Hero feature card */}
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🚀</span>
                    </div>
                    <h3 className="text-white font-bold text-lg">See It In Action</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Upload any document or paste your website URL. Watch as AI instantly creates an intelligent assistant that can automate real tasks.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">Live Demo Available</span>
                  </div>
                </div>

                {/* Key features grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                    <div className="text-2xl mb-2">🔌</div>
                    <h4 className="text-white font-semibold text-sm mb-1">Integrations</h4>
                    <p className="text-gray-400 text-xs">HubSpot, Calendly, Jira & more</p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="text-white font-semibold text-sm mb-1">Multi-Language</h4>
                    <p className="text-gray-400 text-xs">Support customers globally</p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                    <div className="text-2xl mb-2">⏰</div>
                    <h4 className="text-white font-semibold text-sm mb-1">24/7 Active</h4>
                    <p className="text-gray-400 text-xs">Never miss a lead</p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="text-white font-semibold text-sm mb-1">Secure</h4>
                    <p className="text-gray-400 text-xs">Enterprise-grade security</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop floating cards - hidden on mobile */}
            <div className="hidden lg:block relative">
              {/* Floating cards design - Only visible on desktop */}
              <div className="relative w-full h-[800px]">

                {/* Instant Automation */}
                <div className="absolute top-[5%] right-[5%] w-60 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-4 shadow-2xl backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🚀</span>
                    </div>
                    <span className="text-white font-semibold text-sm">Instant Automation</span>
                  </div>
                  <div className="text-blue-300 text-xs font-medium mb-2">AI That Acts, Not Just Chats</div>
                  <p className="text-gray-400 text-xs mb-3">Automatically create CRM contacts, schedule meetings, and handle customer inquiries.</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">Live Processing</span>
                  </div>
                </div>

                {/* Real-Time Demo */}
                <div className="absolute top-[15%] left-[8%] w-56 bg-gradient-to-br from-blue-900/80 to-purple-900/80 border border-blue-500/30 rounded-xl p-4 shadow-xl backdrop-blur-sm transform -rotate-4 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-300 text-xs">⚡</span>
                    <div className="text-blue-300 text-sm font-semibold">Real-Time Demo</div>
                  </div>
                  <div className="text-blue-200 text-xs font-medium mb-2">Interactive & Instant Setup</div>
                  <p className="text-blue-100 text-xs">Upload your content and experience real-time AI automation immediately—no sign-up required.</p>
                </div>

                {/* Integrations */}
                <div className="absolute top-[35%] left-[2%] w-48 bg-gradient-to-br from-orange-900/80 to-red-900/80 border border-orange-500/30 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-5 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🔌</span>
                    </div>
                    <div className="text-orange-300 text-xs font-semibold">Integrations</div>
                  </div>
                  <div className="text-orange-200 text-xs font-medium mb-1">Seamless Integration</div>
                  <p className="text-orange-100 text-xs">Instantly connect with HubSpot, Calendly, Jira, Shopify, and more.</p>
                </div>
                
                {/* Always On */}
                <div className="absolute top-[40%] right-[10%] w-44 bg-gradient-to-br from-purple-900/80 to-pink-900/80 border border-purple-500/30 rounded-lg p-3 shadow-lg backdrop-blur-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">⏰</span>
                    </div>
                    <div className="text-purple-300 text-xs font-semibold">Always On</div>
                  </div>
                  <div className="text-purple-200 text-xs font-medium mb-1">24/7 Availability</div>
                  <p className="text-purple-100 text-xs">Engage visitors, generate leads, and handle tasks around the clock.</p>
                </div>

                {/* Multi-Language */}
                <div className="absolute top-[60%] left-[10%] w-52 bg-gradient-to-br from-teal-900/80 to-cyan-900/80 border border-teal-500/30 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🌍</span>
                    </div>
                    <div className="text-teal-300 text-xs font-semibold">Multi-Language</div>
                  </div>
                  <div className="text-teal-200 text-xs font-medium mb-1">Global Reach, Local Engagement</div>
                  <p className="text-teal-100 text-xs">Provide seamless customer interactions in multiple languages.</p>
                </div>

                {/* Quick Setup */}
                <div className="absolute top-[55%] right-[25%] w-40 bg-gradient-to-br from-green-900/80 to-blue-900/80 border border-green-500/30 rounded-lg p-3 shadow-lg backdrop-blur-sm transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-green-300 text-xs">⚙️</span>
                    <div className="text-green-300 text-xs font-semibold">Quick Setup</div>
                  </div>
                  <div className="text-green-200 text-xs font-medium mb-1">Deploy in Minutes</div>
                  <p className="text-green-100 text-xs">Simple embed snippet—start automating immediately without coding.</p>
                </div>

                {/* Secure & Private */}
                <div className="absolute bottom-[5%] right-[8%] w-52 bg-gradient-to-br from-indigo-900/80 to-blue-900/80 border border-indigo-500/30 rounded-lg p-3 shadow-lg backdrop-blur-sm transform rotate-4 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                    <div className="text-indigo-300 text-xs font-semibold">Secure & Private</div>
                  </div>
                  <div className="text-indigo-200 text-xs font-medium mb-1">Enterprise-Grade Security</div>
                  <p className="text-indigo-100 text-xs">Fully GDPR compliant with advanced encryption and data protection.</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      {/* Modern redesigned landing page */}
      <div className="relative overflow-hidden bg-gray-900 text-gray-100">
        <ModernNavbar authButtonSlot={<AuthButton />} locale="en" />
        <RevolutionaryHero />
      </div>
      
      {/* Non-critical content loaded after main hero */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh] bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }>
        <LandingPageClient authButtonSlot={<AuthButton />} />
      </Suspense>
      
      {/* External widget for production */}
      {process.env.NODE_ENV === 'production' && (
        <Script
          src="https://www.siteagent.eu/chatbot-widget.js"
          data-chatbot-id="36735ac9-70ed-4d6b-bc11-394b5d2ef930"
          data-launcher-icon="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740"
          strategy="lazyOnload"
        />
      )}
    </>
  );
} 
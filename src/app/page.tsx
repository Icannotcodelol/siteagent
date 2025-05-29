import { AuthButton } from "@/app/_components/auth-button";
import LandingPageClient from "@/app/landing-page-client";
import { Suspense } from 'react';
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// Metadata for this page
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.siteagent.ai/'
  }
};

// Critical navbar component for immediate rendering
function CriticalNavbar({ authButtonSlot }: { authButtonSlot: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/0 backdrop-blur transition-all duration-300 bg-transparent">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="group flex items-center gap-2">
            <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={40} height={40} priority />
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="relative text-sm font-medium text-gray-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          {authButtonSlot}
        </div>

        {/* Mobile menu button - simplified for critical path */}
        <div className="flex items-center md:hidden">
          <button className="text-gray-300 hover:text-white p-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

// Critical hero content for immediate rendering (LCP optimization)
function CriticalHeroContent() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      </div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Live demo badge */}
          <div className="group mb-8 inline-flex items-center rounded-full border border-gray-700/50 bg-gray-800/60 backdrop-blur-xl px-4 py-2">
            <span className="mr-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-0.5 text-xs font-semibold text-white">LIVE</span>
            <span className="text-sm text-gray-300">Interactive AI demo - No signup required!</span>
          </div>
          
          <h1 className="mb-8 max-w-5xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              See Your New AI Chatbot{" "}
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              in Action—Instantly
            </span>
          </h1>
          
          {/* Critical LCP element - optimized for immediate render */}
          <p className="mb-12 max-w-3xl text-xl leading-relaxed text-gray-400 md:text-2xl">
            Upload your content and experience SiteAgent's powerful automation in real-time—no signup required.
          </p>
          
          {/* Simplified CTA buttons for critical path */}
          <div className="flex flex-col items-center space-y-6 sm:flex-row sm:space-x-6 sm:space-y-0">
            <Link href="#live-demo" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md font-medium flex items-center transition-transform hover:scale-105">
              🚀 Launch Instant Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      {/* Critical above-the-fold content rendered immediately */}
      <div className="relative min-h-screen overflow-hidden bg-gray-900 text-gray-100">
        <CriticalNavbar authButtonSlot={<AuthButton />} />
        <CriticalHeroContent />
      </div>
      
      {/* Non-critical content loaded after LCP */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh] bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }>
        <LandingPageClient authButtonSlot={<AuthButton />} />
      </Suspense>
      
      {/* External widget is only required in production to avoid CORS/403 errors
          during local development. */}
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
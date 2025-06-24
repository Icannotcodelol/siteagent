import { AuthButton } from "@/app/_components/auth-button";
import GermanLandingPageClient from "@/app/de/german-landing-page-client";
import ModernNavbar from "@/app/_components/modern-navbar";
import { Suspense } from 'react';
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// Metadata for this page
export const metadata: Metadata = {
  title: "SiteAgent - Intelligente Chatbots. Blitzschnell | Dokumente in 5 Minuten zu Chatbots",
  description: "Verwandeln Sie Ihre Dokumente in intelligente Chatbots und integrieren Sie sie in Ihre Website. Alles in unter 5 Minuten. Erstellen Sie KI-Assistenten, die Termine planen, CRM aktualisieren und Kundenanfragen automatisch bearbeiten.",
  keywords: "KI-Automatisierung, Chatbot, Kundenservice-Automatisierung, KI-Assistent, Unternehmensautomatisierung, CRM-Integration, Terminplanung, KI-Kundensupport",
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
    locale: 'de_DE',
    url: 'https://www.siteagent.eu/de/',
    title: 'SiteAgent - Intelligente Chatbots. Blitzschnell',
    description: 'Verwandeln Sie Ihre Dokumente in intelligente Chatbots und integrieren Sie sie in Ihre Website. Alles in unter 5 Minuten.',
    siteName: 'SiteAgent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteAgent - Intelligente Chatbots. Blitzschnell',
    description: 'Verwandeln Sie Ihre Dokumente in intelligente Chatbots und integrieren Sie sie in Ihre Website. Alles in unter 5 Minuten.',
    creator: '@SiteAgent',
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/de/'
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

// Revolutionary hero with modern orange/blue design
function RevolutionaryHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Dynamic animated background */}
      <div className="absolute inset-0">
        {/* Animated geometric shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-200/30 to-orange-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-r from-orange-300/20 to-blue-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400/40 rounded-full animate-pulse"
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
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-orange-200 backdrop-blur-sm border border-orange-300 rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-bold tracking-wide">LIVE DEMO</span>
              </div>
              <div className="w-px h-4 bg-orange-300"></div>
              <span className="text-orange-700 text-sm">Jetzt ausprobieren - Keine Anmeldung erforderlich!</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight">
                <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                  Intelligente Chatbots.
                </div>
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent relative">
                  Blitzschnell
                  <div className="absolute -right-4 top-0">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Verwandeln Sie Ihre Dokumente in intelligente Chatbots und integrieren Sie sie in Ihre Website. Alles in unter 5 Minuten.
                <Link href="#live-demo" className="text-blue-500 font-semibold hover:text-blue-600 transition-colors cursor-pointer"> Sehen Sie es in Echtzeit funktionieren.</Link>
              </p>
            </div>
            
            {/* Modern CTA with side-by-side layout */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="#live-demo" 
                className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 flex items-center gap-3"
              >
                <span>🚀 Demo starten</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
              </Link>
              
              <Link 
                href="/signup" 
                className="border-2 border-blue-300 text-blue-600 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-3"
              >
                <span>Kostenlose Testversion starten</span>
                <span className="text-green-500">✓</span>
              </Link>
            </div>

            {/* Trust indicators in a horizontal layout */}
            <div className="flex flex-wrap items-center gap-8 pt-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border border-green-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                <span>Enterprise-Sicherheit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                </div>
                <span>Setup in 5 Minuten</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 rounded border border-orange-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded"></div>
                </div>
                <span>14 Tage kostenlose Testversion</span>
              </div>
            </div>
          </div>

          {/* Right side - Visual element (40% width) */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Mobile-optimized feature showcase - visible only on mobile */}
            <div className="lg:hidden">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Hauptfunktionen</h2>
              <div className="space-y-4">
                {/* Hero feature card */}
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🚀</span>
                    </div>
                    <h3 className="text-gray-800 font-bold text-base md:text-lg leading-tight">In Aktion sehen</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Laden Sie beliebige Dokumente hoch oder fügen Sie die URL Ihrer Website ein. Sehen Sie zu, wie die KI sofort einen intelligenten Assistenten erstellt, der echte Aufgaben automatisieren kann.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="text-green-600 text-xs font-medium">Live Demo verfügbar</span>
                  </div>
                </div>

                {/* Key features grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/50 border border-blue-200 rounded-xl p-3 md:p-4 shadow-sm">
                    <div className="text-xl md:text-2xl mb-2">🔌</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1 leading-tight">Integrationen</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">HubSpot, Calendly, Jira und mehr</p>
                  </div>
                  <div className="bg-white/50 border border-blue-200 rounded-xl p-3 md:p-4 shadow-sm">
                    <div className="text-xl md:text-2xl mb-2">🌍</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1 leading-tight">Mehrsprachig</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Unterstützt Kunden weltweit</p>
                  </div>
                  <div className="bg-white/50 border border-blue-200 rounded-xl p-3 md:p-4 shadow-sm">
                    <div className="text-xl md:text-2xl mb-2">⏰</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1 leading-tight">24/7 Aktiv</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Verpassen Sie nie einen Lead</p>
                  </div>
                  <div className="bg-white/50 border border-blue-200 rounded-xl p-3 md:p-4 shadow-sm">
                    <div className="text-xl md:text-2xl mb-2">🔒</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1 leading-tight">Sicher</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">Enterprise-Sicherheit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop hero image and floating cards - hidden on mobile */}
            <div className="hidden lg:block relative w-full h-[800px] overflow-hidden">
              {/* Main robot image - fixed center position */}
              <div className="absolute top-[300px] left-1/2 transform -translate-x-1/2">
                <div className="relative group z-20">
                  {/* Main robot image with modern styling */}
                  <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                    <Image
                      src="/HAPPYBOT1.png"
                      alt="KI Chatbot Assistent"
                      width={300}
                      height={300}
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-blue-400/20 rounded-full blur-3xl scale-150 -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Floating status indicator */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    LIVE KI
                  </div>
                </div>
              </div>

              {/* Floating feature cards - hardcoded positions with guaranteed spacing */}
              <div className="absolute inset-0">
                {/* Real-Time Demo - Top Left Corner */}
                <div className="absolute top-[40px] left-[40px] w-[200px] bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform -rotate-6 hover:rotate-0 transition-transform duration-500 z-10 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 text-lg">⚡</span>
                    <div className="text-blue-700 text-sm font-semibold">Echtzeit-Demo</div>
                  </div>
                  <p className="text-blue-700 text-xs leading-relaxed">Erleben Sie KI-Automatisierung sofort—keine Anmeldung erforderlich.</p>
                </div>

                {/* Instant Automation - Top Right Corner */}
                <div className="absolute top-[60px] right-[40px] w-[220px] bg-gradient-to-br from-white to-orange-50 border border-orange-200 rounded-2xl p-3 shadow-xl backdrop-blur-sm transform rotate-4 hover:rotate-0 transition-transform duration-500 z-10 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">🚀</span>
                    </div>
                    <span className="text-gray-800 font-semibold text-sm leading-tight">Sofortige Automatisierung</span>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">KI erstellt automatisch CRM-Kontakte und plant Termine.</p>
                  <div className="mt-2 inline-flex items-center bg-green-100 border border-green-300 rounded-full px-2 py-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    <span className="text-green-700 text-xs font-medium">Live Verarbeitung</span>
                  </div>
                </div>

                {/* Integrations - Far Left */}
                <div className="absolute top-[260px] left-[15px] w-[170px] bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-2 hover:rotate-0 transition-transform duration-500 z-10 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">🔌</span>
                    </div>
                    <div className="text-red-700 text-sm font-semibold">Integrationen</div>
                  </div>
                  <p className="text-red-700 text-xs leading-relaxed">Nahtlose Integration</p>
                  <p className="text-red-600 text-xs">Sofortige Verbindung mit HubSpot, Calendly, Jira, Shopify und mehr.</p>
                </div>

                {/* Always On - Far Right */}
                <div className="absolute top-[340px] right-[15px] w-[160px] bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 shadow-lg backdrop-blur-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-10 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">⏰</span>
                    </div>
                    <div className="text-purple-700 text-sm font-semibold">Immer aktiv</div>
                  </div>
                  <p className="text-purple-700 text-xs leading-relaxed">24/7 Verfügbarkeit</p>
                  <p className="text-purple-600 text-xs">Besucher ansprechen, Leads generieren und Aufgaben rund um die Uhr erledigen.</p>
                </div>

                {/* Multi-Language - Bottom Left with massive spacing */}
                <div className="absolute bottom-[180px] left-[30px] w-[160px] bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-500 z-10 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">🌍</span>
                    </div>
                    <div className="text-teal-700 text-sm font-semibold">Mehrsprachig</div>
                  </div>
                  <p className="text-teal-700 text-xs leading-relaxed">Globale Reichweite, lokale Interaktion</p>
                  <p className="text-teal-600 text-xs">Nahtlose Kundeninteraktionen in mehreren Sprachen bieten.</p>
                </div>

                {/* Quick Setup - Bottom Center with better positioning */}
                <div className="absolute bottom-[20px] left-[300px] w-[160px] bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-10 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">⚡</span>
                    </div>
                    <div className="text-green-700 text-sm font-semibold">Schneller Setup</div>
                  </div>
                  <p className="text-green-700 text-xs leading-relaxed">In Minuten bereit</p>
                  <p className="text-green-600 text-xs">Einfacher Embed-Code—sofort automatisieren ohne Programmierung.</p>
                </div>

                {/* Secure & Private - Bottom Right with massive spacing */}
                <div className="absolute bottom-[160px] right-[30px] w-[170px] bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-2 hover:rotate-0 transition-transform duration-500 z-10 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                    <div className="text-indigo-700 text-sm font-semibold">Sicher & Privat</div>
                  </div>
                  <p className="text-indigo-700 text-xs leading-relaxed">Enterprise-Sicherheit</p>
                  <p className="text-indigo-600 text-xs">Vollständig DSGVO-konform mit erweiterte Verschlüsselung und Datenschutz.</p>
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
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50 text-gray-800">
        <ModernNavbar authButtonSlot={<AuthButton />} locale="de" />
        <RevolutionaryHero />
      </div>
      
      {/* Non-critical content loaded after main hero */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh] bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      }>
        <GermanLandingPageClient authButtonSlot={<AuthButton />} />
      </Suspense>
      
      {/* External widget for production */}
      {process.env.NODE_ENV === 'production' && (
        <Script
          src="https://www.siteagent.eu/chatbot-widget.js"
          data-chatbot-id="b96354d2-b3d8-47c8-a44d-94a11f0e0903"
          data-launcher-icon="https://www.siteagent.eu/icon.png?cb20a2f029ff27f7"
          strategy="lazyOnload"
        />
      )}
    </>
  );
}

function MouseFollower() {
  return null; // Placeholder for mouse follower if needed
}

function Navbar({ authButtonSlot }: { authButtonSlot: React.ReactNode }) {
  return <ModernNavbar authButtonSlot={authButtonSlot} locale="de" />;
} 
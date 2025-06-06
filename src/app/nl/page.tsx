import { AuthButton } from "@/app/_components/auth-button";
import DutchLandingPageClient from "./dutch-landing-page-client";
import ModernNavbar from "@/app/_components/modern-navbar";
import { Suspense } from 'react';
import Script from "next/script";
import Link from "next/link";
import type { Metadata } from "next";

// Metadata for this page
export const metadata: Metadata = {
  title: "SiteAgent - AI Chatbots voor Slimme Automatisering | Transformeer Documenten naar Gepersonaliseerde Chatbots in Minder dan 5 Minuten",
  description: "Transformeer eenvoudig je bestaande documenten naar gepersonaliseerde chatbots en integreer ze in je website. Alles in minder dan 5 minuten. Creëer intelligente AI-assistenten die afspraken plannen, CRM's updaten en klantenvragen automatisch afhandelen.",
  keywords: "AI automatisering, chatbot, klantenservice automatisering, AI assistent, bedrijfsautomatisering, CRM integratie, afspraken plannen, AI klantenondersteuning",
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
    locale: 'nl_NL',
    url: 'https://www.siteagent.eu/nl/',
    title: 'SiteAgent - AI Chatbots voor Slimme Automatisering',
    description: 'Transformeer eenvoudig je bestaande documenten naar gepersonaliseerde chatbots en integreer ze in je website. Alles in minder dan 5 minuten.',
    siteName: 'SiteAgent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteAgent - AI Chatbots voor Slimme Automatisering',
    description: 'Transformeer eenvoudig je bestaande documenten naar gepersonaliseerde chatbots en integreer ze in je website. Alles in minder dan 5 minuten.',
    creator: '@SiteAgent',
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/nl/',
    languages: {
      'en': 'https://www.siteagent.eu/',
      'de': 'https://www.siteagent.eu/de/',
      'it': 'https://www.siteagent.eu/it/',
      'pl': 'https://www.siteagent.eu/pl/',
      'es': 'https://www.siteagent.eu/es/',
      'nl': 'https://www.siteagent.eu/nl/',
    }
  },
};

// Revolutionary hero with bright, light design
function RevolutionaryHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Bright animated background */}
      <div className="absolute inset-0">
        {/* Light animated geometric shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles - lighter colors */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/60 rounded-full animate-pulse"
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
            {/* Live demo badge with bright design */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-bold tracking-wide">LIVE DEMO</span>
              </div>
              <div className="w-px h-4 bg-gray-400"></div>
              <span className="text-gray-700 text-sm">Probeer het nu - Geen registratie vereist!</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                  Slimmere Chatbots.
                </div>
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative">
                  Sneller
                  <div className="absolute -right-4 top-0">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Transformeer eenvoudig je bestaande documenten naar gepersonaliseerde chatbots en integreer ze in je website. Alles in minder dan 5 minuten.
                <Link href="#live-demo" className="text-blue-600 font-semibold hover:text-blue-500 transition-colors cursor-pointer"> Bekijk hoe het realtime werkt.</Link>
              </p>
            </div>
            
            {/* Modern CTA with side-by-side layout */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="#live-demo" 
                className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-300/50 flex items-center gap-3"
              >
                <span>🚀 Demo Starten</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
              </Link>
              
              <Link 
                href="/signup" 
                className="border-2 border-gray-300 text-gray-700 bg-white/80 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-gray-400 hover:text-gray-800 hover:bg-white flex items-center gap-3 shadow-lg"
              >
                <span>Gratis Proefperiode Starten</span>
                <span className="text-green-500">✓</span>
              </Link>
            </div>

            {/* Trust indicators in a horizontal layout */}
            <div className="flex flex-wrap items-center gap-8 pt-8 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border border-green-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                <span>Enterprise Beveiliging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                </div>
                <span>5 Minuten Installatie</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 rounded border border-purple-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded"></div>
                </div>
                <span>14 Dagen Gratis Proefperiode</span>
              </div>
            </div>
          </div>

          {/* Right side - Visual element (40% width) */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Mobile-optimized feature showcase - visible only on mobile */}
            <div className="lg:hidden">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Belangrijkste Functies</h2>
              <div className="space-y-4">
                {/* Hero feature card */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🚀</span>
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">Zie het in Actie</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload elk document of plak de URL van je website. Kijk hoe AI direct een intelligente assistent creëert die echte taken kan automatiseren.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-xs font-medium">Live Demo Beschikbaar</span>
                  </div>
                </div>

                {/* Key features grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🔌</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Integraties</h4>
                    <p className="text-gray-600 text-xs">HubSpot, Calendly, Jira en meer</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Meertalig</h4>
                    <p className="text-gray-600 text-xs">Ondersteun klanten wereldwijd</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">⏰</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">24/7 Actief</h4>
                    <p className="text-gray-600 text-xs">Mis nooit een prospect</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Veilig</h4>
                    <p className="text-gray-600 text-xs">Enterprise-niveau beveiliging</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop floating cards - hidden on mobile */}
            <div className="hidden lg:block relative">
              {/* Floating cards design - Only visible on desktop */}
              <div className="relative w-full h-[800px]">

                {/* Directe Automatisering */}
                <div className="absolute top-[5%] right-[5%] w-60 bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-300 rounded-2xl p-4 shadow-2xl backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🚀</span>
                    </div>
                    <span className="text-gray-800 font-semibold text-sm">Directe Automatisering</span>
                  </div>
                  <div className="text-blue-600 text-xs font-medium mb-2">AI die Handelt, Niet Alleen Chat</div>
                  <p className="text-gray-600 text-xs mb-3">Maak automatisch CRM contacten, plan afspraken en behandel klantenvragen.</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-xs font-medium">Live Verwerking</span>
                  </div>
                </div>

                {/* Realtime Demo */}
                <div className="absolute top-[15%] left-[8%] w-56 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 shadow-xl backdrop-blur-sm transform -rotate-4 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-500 text-xs">⚡</span>
                    <div className="text-blue-600 text-sm font-semibold">Realtime Demo</div>
                  </div>
                  <div className="text-blue-700 text-xs font-medium mb-2">Interactief & Directe Installatie</div>
                  <p className="text-gray-600 text-xs">Upload je content en ervaar realtime AI automatisering direct—geen registratie vereist.</p>
                </div>

                {/* Integraties */}
                <div className="absolute top-[35%] left-[2%] w-48 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-5 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🔌</span>
                    </div>
                    <div className="text-orange-600 text-xs font-semibold">Integraties</div>
                  </div>
                  <div className="text-orange-700 text-xs font-medium mb-1">Naadloze Integratie</div>
                  <p className="text-gray-600 text-xs">Verbind direct met HubSpot, Calendly, Jira, Shopify en meer.</p>
                </div>
                
                {/* Altijd Aan */}
                <div className="absolute top-[40%] right-[10%] w-44 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 shadow-lg backdrop-blur-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">⏰</span>
                    </div>
                    <div className="text-purple-600 text-xs font-semibold">Altijd Aan</div>
                  </div>
                  <div className="text-purple-700 text-xs font-medium mb-1">24/7 Beschikbaarheid</div>
                  <p className="text-gray-600 text-xs">Betrek bezoekers, genereer leads en behandel taken dag en nacht.</p>
                </div>

                {/* Meertalig */}
                <div className="absolute top-[60%] left-[10%] w-52 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🌍</span>
                    </div>
                    <div className="text-teal-600 text-xs font-semibold">Meertalig</div>
                  </div>
                  <div className="text-teal-700 text-xs font-medium mb-1">Globaal Bereik, Lokale Betrokkenheid</div>
                  <p className="text-gray-600 text-xs">Bied naadloze klantinteracties in meerdere talen.</p>
                </div>

                {/* Snelle Installatie */}
                <div className="absolute top-[55%] right-[25%] w-40 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 shadow-lg backdrop-blur-sm transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-green-500 text-xs">⚙️</span>
                    <div className="text-green-600 text-xs font-semibold">Snelle Installatie</div>
                  </div>
                  <div className="text-green-700 text-xs font-medium mb-1">Implementeer in Minuten</div>
                  <p className="text-gray-600 text-xs">Eenvoudige embed code—start direct automatiseren zonder programmeren.</p>
                </div>

                {/* Veilig & Privé */}
                <div className="absolute bottom-[5%] right-[8%] w-52 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-3 shadow-lg backdrop-blur-sm transform rotate-4 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                    <div className="text-indigo-600 text-xs font-semibold">Veilig & Privé</div>
                  </div>
                  <div className="text-indigo-700 text-xs font-medium mb-1">Enterprise-niveau Beveiliging</div>
                  <p className="text-gray-600 text-xs">Volledig GDPR-compliant met geavanceerde encryptie en databescherming.</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mouse follower component for visual enhancement
function MouseFollower() {
  return null; // Simplified for performance
}

// Navbar component
function Navbar({ authButtonSlot }: { authButtonSlot: React.ReactNode }) {
  return (
    <ModernNavbar locale="nl" authButtonSlot={authButtonSlot} />
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-white relative">
      <MouseFollower />
      
      <Navbar 
        authButtonSlot={
          <Suspense fallback={<div className="h-9 w-16 bg-gray-200 rounded animate-pulse" />}>
            <AuthButton />
          </Suspense>
        } 
      />

      <main>
        <RevolutionaryHero />
        <DutchLandingPageClient />
      </main>

      {/* Google Analytics */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script>
    </div>
  );
} 
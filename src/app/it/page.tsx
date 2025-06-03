import { AuthButton } from "@/app/_components/auth-button";
import ItalianLandingPageClient from "@/app/it/italian-landing-page-client";
import ModernNavbar from "@/app/_components/modern-navbar";
import { Suspense } from 'react';
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// Metadata for this page
export const metadata: Metadata = {
  title: "SiteAgent - Chatbot Intelligenti. Velocissimi | Trasforma Documenti in Chatbot in 5 Minuti",
  description: "Trasforma i tuoi documenti in chatbot intelligenti e integrarli nel tuo sito. Tutto in meno di 5 minuti. Crea assistenti AI che programmano riunioni, aggiornano CRM e gestiscono automaticamente le richieste dei clienti.",
  keywords: "automazione AI, chatbot, automazione servizio clienti, assistente AI, automazione aziendale, integrazione CRM, programmazione riunioni, supporto clienti AI",
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
    locale: 'it_IT',
    url: 'https://siteagent.eu/it/',
    title: 'SiteAgent - Chatbot Intelligenti. Velocissimi',
    description: 'Trasforma i tuoi documenti in chatbot intelligenti e integrarli nel tuo sito. Tutto in meno di 5 minuti.',
    siteName: 'SiteAgent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteAgent - Chatbot Intelligenti. Velocissimi',
    description: 'Trasforma i tuoi documenti in chatbot intelligenti e integrarli nel tuo sito. Tutto in meno di 5 minuti.',
    creator: '@SiteAgent',
  },
  alternates: {
    canonical: 'https://siteagent.eu/it/'
  },
  verification: {
    google: 'your-google-verification-code',
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
                <span className="text-green-600 text-sm font-bold tracking-wide">DEMO LIVE</span>
              </div>
              <div className="w-px h-4 bg-gray-400"></div>
              <span className="text-gray-700 text-sm">Provalo ora - Nessuna registrazione richiesta!</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                  Chatbot Intelligenti.
                </div>
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative">
                  Velocissimi
                  <div className="absolute -right-4 top-0">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Trasforma i tuoi documenti in chatbot intelligenti e integrarli nel tuo sito. Tutto in meno di 5 minuti.
                <Link href="#live-demo" className="text-blue-600 font-semibold hover:text-blue-500 transition-colors cursor-pointer"> Vedi come funziona in tempo reale.</Link>
              </p>
            </div>
            
            {/* Modern CTA with side-by-side layout */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="#live-demo" 
                className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-300/50 flex items-center gap-3"
              >
                <span>🚀 Lancia Demo</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
              </Link>
              
              <Link 
                href="/signup" 
                className="border-2 border-gray-300 text-gray-700 bg-white/80 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-gray-400 hover:text-gray-800 hover:bg-white flex items-center gap-3 shadow-lg"
              >
                <span>Inizia Prova Gratuita</span>
                <span className="text-green-500">✓</span>
              </Link>
            </div>

            {/* Trust indicators in a horizontal layout */}
            <div className="flex flex-wrap items-center gap-8 pt-8 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border border-green-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                <span>Sicurezza Enterprise</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                </div>
                <span>Setup in 5 Minuti</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 rounded border border-purple-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded"></div>
                </div>
                <span>14 Giorni di Prova Gratuita</span>
              </div>
            </div>
          </div>

          {/* Right side - Visual element (40% width) */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Mobile-optimized feature showcase - visible only on mobile */}
            <div className="lg:hidden">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Caratteristiche Principali</h2>
              <div className="space-y-4">
                {/* Hero feature card */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🚀</span>
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">Vedi in Azione</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Carica qualsiasi documento o incolla l'URL del tuo sito web. Guarda come l'AI crea istantaneamente un assistente intelligente che può automatizzare attività reali.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-xs font-medium">Demo Live Disponibile</span>
                  </div>
                </div>

                {/* Key features grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🔌</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Integrazioni</h4>
                    <p className="text-gray-600 text-xs">HubSpot, Calendly, Jira e altro</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Multi-Lingua</h4>
                    <p className="text-gray-600 text-xs">Supporta clienti globalmente</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">⏰</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">24/7 Attivo</h4>
                    <p className="text-gray-600 text-xs">Non perdere mai un lead</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Sicuro</h4>
                    <p className="text-gray-600 text-xs">Sicurezza di livello enterprise</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop floating cards - hidden on mobile */}
            <div className="hidden lg:block relative">
              {/* Floating cards design - Only visible on desktop */}
              <div className="relative w-full h-[800px]">

                {/* Instant Automation */}
                <div className="absolute top-[5%] right-[5%] w-60 bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xl backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🚀</span>
                    </div>
                    <span className="text-gray-800 font-semibold text-sm">Automazione Istantanea</span>
                  </div>
                  <div className="text-blue-600 text-xs font-medium mb-2">AI che Agisce, Non Solo Chatta</div>
                  <p className="text-gray-600 text-xs mb-3">Crea automaticamente contatti CRM, programma riunioni e gestisce le richieste dei clienti.</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-xs font-medium">Elaborazione Live</span>
                  </div>
                </div>

                {/* Real-Time Demo */}
                <div className="absolute top-[15%] left-[8%] w-56 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 shadow-xl backdrop-blur-sm transform -rotate-4 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 text-xs">⚡</span>
                    <div className="text-blue-700 text-sm font-semibold">Demo in Tempo Reale</div>
                  </div>
                  <div className="text-blue-600 text-xs font-medium mb-2">Interattivo e Setup Istantaneo</div>
                  <p className="text-gray-700 text-xs">Carica i tuoi contenuti e sperimenta l'automazione AI in tempo reale immediatamente—nessuna registrazione richiesta.</p>
                </div>

                {/* Integrations */}
                <div className="absolute top-[35%] left-[2%] w-48 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-5 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🔌</span>
                    </div>
                    <div className="text-orange-700 text-xs font-semibold">Integrazioni</div>
                  </div>
                  <div className="text-orange-600 text-xs font-medium mb-1">Integrazione Perfetta</div>
                  <p className="text-gray-700 text-xs">Connetti istantaneamente con HubSpot, Calendly, Jira, Shopify e altro.</p>
                </div>
                
                {/* Always On */}
                <div className="absolute top-[55%] right-[12%] w-52 bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">⏰</span>
                    </div>
                    <div className="text-green-700 text-xs font-semibold">Sempre Attivo</div>
                  </div>
                  <div className="text-green-600 text-xs font-medium mb-1">24/7 Automazione</div>
                  <p className="text-gray-700 text-xs">Non perdere mai un'opportunità - il tuo assistente AI lavora 24 ore al giorno.</p>
                </div>

                {/* Multi-Language */}
                <div className="absolute bottom-[15%] left-[15%] w-48 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🌍</span>
                    </div>
                    <div className="text-purple-700 text-xs font-semibold">Multi-Lingua</div>
                  </div>
                  <div className="text-purple-600 text-xs font-medium mb-1">Supporto Globale</div>
                  <p className="text-gray-700 text-xs">Comunica in 100+ lingue per servire clienti in tutto il mondo.</p>
                </div>

                {/* Security */}
                <div className="absolute bottom-[5%] right-[8%] w-44 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-3 shadow-xl backdrop-blur-sm transform -rotate-5 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-slate-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                    <div className="text-gray-700 text-xs font-semibold">Sicurezza</div>
                  </div>
                  <div className="text-gray-600 text-xs font-medium mb-1">Enterprise-Grade</div>
                  <p className="text-gray-700 text-xs">Crittografia end-to-end e conformità SOC2.</p>
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
      {/* Versione italiana della landing page con UI più luminosa */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-800">
        <ModernNavbar authButtonSlot={<AuthButton />} locale="it" />
        <RevolutionaryHero />
      </div>
      
      {/* Contenuto non critico caricato dopo l'hero principale */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh] bg-gradient-to-br from-blue-50 to-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }>
        <ItalianLandingPageClient authButtonSlot={<AuthButton />} />
      </Suspense>
      
      {/* Widget esterno per produzione */}
      {process.env.NODE_ENV === 'production' && (
        <Script
          src="https://siteagent.eu/chatbot-widget.js"
          data-chatbot-id="36735ac9-70ed-4d6b-bc11-394b5d2ef930"
          data-launcher-icon="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740"
          strategy="lazyOnload"
        />
      )}
    </>
  );
}

// Mouse Follower Component
function MouseFollower() {
  return null; // Disabled for cleaner Italian version
}

// Navbar Component
function Navbar({ authButtonSlot }: { authButtonSlot: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur transition-all duration-300 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/it" className="group flex items-center gap-2">
            <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={40} height={40} priority />
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {[
            { name: "Caratteristiche", href: "#caratteristiche" },
            { name: "Come Funziona", href: "#come-funziona" },
            { name: "Prezzi", href: "#prezzi" },
            { name: "FAQ", href: "#faq" }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          {authButtonSlot}
        </div>
      </div>
    </header>
  );
} 
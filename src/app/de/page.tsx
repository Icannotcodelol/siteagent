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

// Revolutionary hero with bright, light design
function RevolutionaryHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-visible bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <span className="text-gray-700 text-sm">Jetzt ausprobieren - Keine Anmeldung erforderlich!</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                  Intelligente Chatbots.
                </div>
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative">
                  Blitzschnell
                  <div className="absolute -right-4 top-0">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Verwandeln Sie Ihre Dokumente in intelligente Chatbots und integrieren Sie sie in Ihre Website. Alles in unter 5 Minuten.
                <Link href="#live-demo" className="text-blue-600 font-semibold hover:text-blue-500 transition-colors cursor-pointer"> Sehen Sie es in Echtzeit funktionieren.</Link>
              </p>
            </div>
            
            {/* Modern CTA with side-by-side layout */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="#live-demo" 
                className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-300/50 flex items-center gap-3"
              >
                <span>🚀 Demo starten</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
              </Link>
              
              <Link 
                href="/signup" 
                className="border-2 border-gray-300 text-gray-700 bg-white/80 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-gray-400 hover:text-gray-800 hover:bg-white flex items-center gap-3 shadow-lg"
              >
                <span>Kostenlose Testversion starten</span>
                <span className="text-green-500">✓</span>
              </Link>
            </div>

            {/* Trust indicators in a horizontal layout */}
            <div className="flex flex-wrap items-center gap-8 pt-8 text-gray-600 text-sm">
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
                <div className="w-4 h-4 bg-purple-100 rounded border border-purple-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded"></div>
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
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🚀</span>
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">In Aktion sehen</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Laden Sie beliebige Dokumente hoch oder fügen Sie die URL Ihrer Website ein. Sehen Sie zu, wie die KI sofort einen intelligenten Assistenten erstellt, der echte Aufgaben automatisieren kann.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-xs font-medium">Live Demo verfügbar</span>
                  </div>
                </div>

                {/* Key features grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🔌</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Integrationen</h4>
                    <p className="text-gray-600 text-xs">HubSpot, Calendly, Jira und mehr</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Mehrsprachig</h4>
                    <p className="text-gray-600 text-xs">Unterstützt Kunden weltweit</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">⏰</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">24/7 Aktiv</h4>
                    <p className="text-gray-600 text-xs">Verpassen Sie nie einen Lead</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Sicher</h4>
                    <p className="text-gray-600 text-xs">Enterprise-Sicherheit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop hero visual - hidden on mobile */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main card with bright, modern design */}
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-2xl shadow-blue-100/50 relative overflow-hidden">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-3xl"></div>
                  
                  <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-200/50">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">🤖</span>
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-bold text-lg">Ihr KI-Assistent</h3>
                        <p className="text-gray-600 text-sm">Bereit in wenigen Sekunden</p>
                      </div>
                    </div>

                    {/* Feature highlights */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 text-sm">📄</span>
                        </div>
                        <span className="text-gray-700 text-sm">Dokumente hochladen & sofort trainieren</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 text-sm">🌐</span>
                        </div>
                        <span className="text-gray-700 text-sm">Websites scannen & verstehen</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-purple-600 text-sm">⚡</span>
                        </div>
                        <span className="text-gray-700 text-sm">Automatische Aufgabenbearbeitung</span>
                      </div>
                    </div>

                    {/* Action preview */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
                      <p className="text-gray-700 text-sm font-medium mb-2">Beispiel-Automatisierung:</p>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        "Kunde fragt nach Preisen → KI prüft Katalog → Sendet personalisiertes Angebot → Plant Beratungstermin → Aktualisiert CRM"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <Suspense fallback={<div className="h-16 bg-gray-900/95 backdrop-blur-xl" />}>
        <Navbar authButtonSlot={<AuthButton />} />
      </Suspense>

      {/* Hero Section */}
      <RevolutionaryHero />

      {/* German Landing Page Content */}
      <GermanLandingPageClient authButtonSlot={<AuthButton />} />

      {/* Analytics Scripts */}
      <Script id="analytics-script" strategy="afterInteractive">
        {`
          // Your analytics code here
          console.log('German page analytics loaded');
        `}
      </Script>
    </main>
  );
}

function MouseFollower() {
  return null; // Placeholder for mouse follower if needed
}

function Navbar({ authButtonSlot }: { authButtonSlot: React.ReactNode }) {
  return <ModernNavbar authButtonSlot={authButtonSlot} locale="de" />;
} 
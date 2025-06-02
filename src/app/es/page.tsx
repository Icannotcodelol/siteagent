import { AuthButton } from "@/app/_components/auth-button";
import SpanishLandingPageClient from "@/app/es/spanish-landing-page-client";
import ModernNavbar from "@/app/_components/modern-navbar";
import { Suspense } from 'react';
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// Metadata for this page
export const metadata: Metadata = {
  title: "SiteAgent - Chatbots Inteligentes. Más Rápidos | Convierte Documentos en Chatbots Personalizados en Menos de 5 Minutos",
  description: "Convierte fácilmente tus documentos existentes en chatbots personalizados e intégralos en tu sitio web. Todo en menos de 5 minutos. Crea asistentes de IA inteligentes que programan reuniones, actualizan CRM y gestionan consultas de clientes automáticamente.",
  keywords: "automatización IA, chatbot, automatización servicio al cliente, asistente IA, automatización empresarial, integración CRM, programación reuniones, soporte cliente IA",
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
    locale: 'es_ES',
    url: 'https://www.siteagent.eu/es/',
    title: 'SiteAgent - Chatbots Inteligentes. Más Rápidos',
    description: 'Convierte fácilmente tus documentos existentes en chatbots personalizados e intégralos en tu sitio web. Todo en menos de 5 minutos.',
    siteName: 'SiteAgent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteAgent - Chatbots Inteligentes. Más Rápidos',
    description: 'Convierte fácilmente tus documentos existentes en chatbots personalizados e intégralos en tu sitio web. Todo en menos de 5 minutos.',
    creator: '@SiteAgent',
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/es/'
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
                <span className="text-green-600 text-sm font-bold tracking-wide">DEMO EN VIVO</span>
              </div>
              <div className="w-px h-4 bg-gray-400"></div>
              <span className="text-gray-700 text-sm">¡Pruébalo ahora - No requiere registro!</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                  Chatbots Inteligentes.
                </div>
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative">
                  Más Rápidos
                  <div className="absolute -right-4 top-0">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Convierte fácilmente tus documentos existentes en chatbots personalizados e intégralos en tu sitio web. Todo en menos de 5 minutos.
                <Link href="#live-demo" className="text-blue-600 font-semibold hover:text-blue-500 transition-colors cursor-pointer"> Mira cómo funciona en tiempo real.</Link>
              </p>
            </div>
            
            {/* Modern CTA with side-by-side layout */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="#live-demo" 
                className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-300/50 flex items-center gap-3"
              >
                <span>🚀 Lanzar Demo</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
              </Link>
              
              <Link 
                href="/signup" 
                className="border-2 border-gray-300 text-gray-700 bg-white/80 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-gray-400 hover:text-gray-800 hover:bg-white flex items-center gap-3 shadow-lg"
              >
                <span>Iniciar Prueba Gratuita</span>
                <span className="text-green-500">✓</span>
              </Link>
            </div>

            {/* Trust indicators in a horizontal layout */}
            <div className="flex flex-wrap items-center gap-8 pt-8 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border border-green-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                <span>Seguridad Empresarial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                </div>
                <span>Configuración en 5 Minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 rounded border border-purple-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded"></div>
                </div>
                <span>14 Días de Prueba Gratuita</span>
              </div>
            </div>
          </div>

          {/* Right side - Visual element (40% width) */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Mobile-optimized feature showcase - visible only on mobile */}
            <div className="lg:hidden">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Características Principales</h2>
              <div className="space-y-4">
                {/* Hero feature card */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🚀</span>
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">Míralo en Acción</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Sube cualquier documento o pega la URL de tu sitio web. Observa cómo la IA crea instantáneamente un asistente inteligente que puede automatizar tareas reales.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-xs font-medium">Demo en Vivo Disponible</span>
                  </div>
                </div>

                {/* Key features grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🔌</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Integraciones</h4>
                    <p className="text-gray-600 text-xs">HubSpot, Calendly, Jira y más</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Multi-Idioma</h4>
                    <p className="text-gray-600 text-xs">Apoya clientes globalmente</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">⏰</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Activo 24/7</h4>
                    <p className="text-gray-600 text-xs">Nunca pierdas un prospecto</p>
                  </div>
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-md">
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="text-gray-800 font-semibold text-sm mb-1">Seguro</h4>
                    <p className="text-gray-600 text-xs">Seguridad de nivel empresarial</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop-optimized visual showcase - visible only on desktop */}
            <div className="hidden lg:block space-y-6">
              {/* Primary feature showcase */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-300 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-yellow-200/50 to-orange-200/50 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-green-200/50 to-blue-200/50 rounded-full blur-lg"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-gray-800 font-bold text-xl">Configuración Instantánea</h3>
                      <p className="text-gray-600 text-sm">Sin código requerido</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-base leading-relaxed mb-6">
                    Simplemente pega la URL de tu sitio web o sube tus documentos. Nuestro sistema de IA analizará automáticamente tu contenido y creará un chatbot personalizado listo para implementar.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 text-sm">Análisis automático de contenido</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 text-sm">Código de integración generado al instante</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 text-sm">Listo para producción en minutos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick features grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/90 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl mb-3">⚡</div>
                  <h4 className="text-gray-800 font-bold text-base mb-2">Respuestas Instantáneas</h4>
                  <p className="text-gray-600 text-sm">Resuelve consultas de clientes al instante con respuestas precisas basadas en tu contenido.</p>
                </div>
                <div className="bg-white/90 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl mb-3">🤖</div>
                  <h4 className="text-gray-800 font-bold text-base mb-2">IA Avanzada</h4>
                  <p className="text-gray-600 text-sm">Tecnología de vanguardia que entiende el contexto y proporciona respuestas inteligentes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mouse follower component remains the same
function MouseFollower() {
  return null; // This will be handled by client component
}

// Bright-themed Navbar component
function Navbar({ authButtonSlot }: { authButtonSlot: React.ReactNode }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <ModernNavbar locale="es" authButtonSlot={authButtonSlot} />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <Suspense fallback={<div className="h-16 bg-white/95 border-b border-gray-200" />}>
          <Navbar 
            authButtonSlot={
              <Suspense fallback={<div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />}>
                <AuthButton />
              </Suspense>
            } 
          />
        </Suspense>
        
        <main>
          <RevolutionaryHero />
          <SpanishLandingPageClient />
        </main>

        <MouseFollower />
      </div>

      {/* Analytics and tracking scripts */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script>
    </>
  );
} 
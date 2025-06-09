import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/app/_components/auth-button';
import { Clock, Users, MessageSquare, Calendar, CheckCircle, ArrowRight, Phone, Mail, Star, Shield, Zap, Globe } from 'lucide-react';
import { Metadata } from 'next';
import Script from 'next/script';
import HowItWorksSection from './_components/how-it-works-section';

export const metadata: Metadata = {
  title: "KI-Chatbot für Fahrschulen | SiteAgent - Automatisierte Schülerbetreuung 24/7",
  description: "Revolutionieren Sie Ihre Fahrschule mit einem intelligenten KI-Chatbot. Automatische Antworten auf häufige Fragen, Terminbuchung und Schülerbetreuung rund um die Uhr. Kostenlose Demo verfügbar.",
  keywords: "Fahrschule Chatbot, KI für Fahrschulen, automatische Schülerbetreuung, Fahrschule Software, Terminbuchung Fahrschule, Fahrschule Digitalisierung",
  openGraph: {
    title: "KI-Chatbot für Fahrschulen - Automatisierte Schülerbetreuung 24/7",
    description: "Revolutionieren Sie Ihre Fahrschule mit einem intelligenten KI-Chatbot. Automatische Antworten auf häufige Fragen und Terminbuchung rund um die Uhr.",
    type: 'website',
    url: 'https://www.siteagent.eu/fahrschulen'
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.siteagent.eu/fahrschulen'
  }
};

// Navbar Component
function PageNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-gray-900/95 supports-[backdrop-filter]:bg-gray-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={40} height={40} priority />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#features" className="relative text-sm font-medium text-gray-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">Features</Link>
          <Link href="/#pricing" className="relative text-sm font-medium text-gray-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">Preise</Link>
          <Link href="/contact" className="relative text-sm font-medium text-gray-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">Kontakt</Link>
        </nav>
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container relative mx-auto px-4 md:px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-bold tracking-wide">LIVE DEMO</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <span className="text-gray-300 text-sm">Testen Sie jetzt - Rechts unten im Chat!</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tight mb-6">
            <div className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              KI-Chatbot für
            </div>
            <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent relative">
              Fahrschulen
              <div className="absolute -right-4 top-0">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-8">
            Revolutionieren Sie Ihre Fahrschule mit einem intelligenten KI-Assistenten. 
            <span className="text-blue-400 font-semibold"> Automatische Schülerbetreuung 24/7</span>, 
            sofortige Antworten auf häufige Fragen und professionelle Terminbuchung.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/signup" 
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-3"
            >
              <span>🚀 Jetzt kostenlos testen</span>
              <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
            </Link>
            
            <Link 
              href="#demo" 
              className="border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-gray-400 hover:text-white hover:bg-gray-800/30 flex items-center justify-center gap-3"
            >
              <span>Demo ausprobieren</span>
              <span className="text-green-400">↓</span>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>5-Minuten Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Deutschsprachig</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Problems Section
function ProblemsSection() {
  const problems = [
    {
      icon: Clock,
      title: "Ständige Anrufe außerhalb der Bürozeiten",
      description: "Fahrschüler rufen abends und am Wochenende an mit Fragen zu Preisen, Terminen und Fahrstunden."
    },
    {
      icon: Phone,
      title: "Gleiche Fragen, immer wieder",
      description: "Wie viel kostet der Führerschein? Wann ist die nächste Theoriestunde? Welche Unterlagen brauche ich?"
    },
    {
      icon: Users,
      title: "Überlastete Mitarbeiter",
      description: "Ihr Team verbringt Stunden damit, einfache Fragen zu beantworten statt sich auf das Wesentliche zu konzentrieren."
    },
    {
      icon: Calendar,
      title: "Verpasste Terminanfragen",
      description: "Potentielle Schüler rufen an, niemand geht ran, sie melden sich bei der Konkurrenz."
    }
  ];

  return (
    <section className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Kennen Sie diese Probleme?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Als Fahrschulinhaber kennen Sie diese alltäglichen Herausforderungen nur zu gut...
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, index) => (
            <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-800/70 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <problem.icon className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{problem.title}</h3>
              <p className="text-gray-400 text-sm">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Solution Section
function SolutionSection() {
  const benefits = [
    {
      icon: MessageSquare,
      title: "24/7 Automatische Antworten",
      description: "Ihr KI-Assistent beantwortet alle häufigen Fragen sofort - auch um Mitternacht.",
      detail: "Preise, Öffnungszeiten, Anfahrt, Unterlagen, Ablauf - alles wird automatisch beantwortet."
    },
    {
      icon: Calendar,
      title: "Intelligente Terminbuchung",
      description: "Schüler können direkt über den Chat Probefahrten und Theoriestunden buchen.",
      detail: "Integration mit Ihrem Kalendersystem für nahtlose Terminplanung."
    },
    {
      icon: Users,
      title: "Entlastung Ihrer Mitarbeiter",
      description: "Ihr Team kann sich auf wichtige Aufgaben konzentrieren statt auf Routinefragen.",
      detail: "Bis zu 80% weniger Anrufe mit Standardfragen."
    },
    {
      icon: Star,
      title: "Bessere Kundenerfahrung",
      description: "Sofortige Antworten führen zu zufriedeneren Schülern und mehr Anmeldungen.",
      detail: "Kein Warten mehr in der Telefonschleife oder auf E-Mail-Antworten."
    }
  ];

  return (
    <section className="py-20 bg-gray-800/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Die Lösung: Ihr intelligenter Fahrschul-Assistent
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ein KI-Chatbot, der speziell für Fahrschulen entwickelt wurde und all Ihre Herausforderungen löst.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">{benefit.title}</h3>
                  <p className="text-gray-300 mb-3">{benefit.description}</p>
                  <p className="text-gray-400 text-sm">{benefit.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



// Features Section
function FeaturesSection() {
  const features = [
    "Sofortige Antworten auf alle Standardfragen",
    "Automatische Preisauskunft für verschiedene Führerscheinklassen",
    "Terminbuchung für Probefahrten und Theoriestunden", 
    "Informationen zu benötigten Unterlagen",
    "Öffnungszeiten und Kontaktdaten",
    "Wegbeschreibung zur Fahrschule",
    "Integration mit Ihrem bestehenden Buchungssystem",
    "Mehrsprachiger Support (Deutsch, Englisch, Türkisch, etc.)",
    "DSGVO-konforme Datenverarbeitung",
    "Einfache Integration in Ihre Website",
    "Detaillierte Analysen und Statistiken",
    "Individuelle Anpassung an Ihre Fahrschule"
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Was Ihr KI-Assistent alles kann
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ein vollständiger digitaler Mitarbeiter, der nie müde wird und immer freundlich ist.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Demo Section
function DemoSection() {
  return (
    <section id="demo" className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Testen Sie es jetzt live!
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Unser Demo-Chatbot für Fahrschulen ist bereits aktiv auf dieser Seite. 
            Schauen Sie rechts unten und stellen Sie ihm eine Frage!
          </p>
          
          {/* Demo suggestions */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-white font-semibold text-lg mb-6">Probieren Sie diese Fragen aus:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Was kostet ein Führerschein Klasse B?",
                "Wann sind die Theoriestunden?",
                "Welche Unterlagen brauche ich?",
                "Kann ich eine Probefahrt buchen?",
                "Wo ist die Fahrschule?",
                "Wie lange dauert die Ausbildung?"
              ].map((question, index) => (
                <div key={index} className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-blue-300 text-sm">
                  "{question}"
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Live Demo aktiv</span>
              </div>
              <p className="text-green-300 text-sm">
                Der Chatbot unten rechts ist mit echten Fahrschul-Informationen trainiert. 
                Testen Sie ihn jetzt und erleben Sie die Zukunft der Kundenbetreuung!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Bereit, Ihre Fahrschule zu revolutionieren?
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Schließen Sie sich bereits hunderten von Unternehmen an, die mit SiteAgent 
          ihre Kundenbetreuung automatisiert haben. Setup in unter 5 Minuten!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link 
            href="/signup" 
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-3"
          >
            <span>14 Tage kostenlos testen</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/contact" 
            className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-white hover:bg-white/10 flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5" />
            <span>Persönliche Beratung</span>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto text-sm text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Keine Einrichtungsgebühr</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Jederzeit kündbar</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Deutscher Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function PageFooter() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="group flex items-center gap-2">
              <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={32} height={32} />
              <span className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
                SiteAgent
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              KI-Chatbots für moderne Fahrschulen. Automatisieren Sie Ihre Kundenbetreuung und konzentrieren Sie sich auf das, was wirklich wichtig ist.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Produkt
            </h3>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors">Preise</Link></li>
              <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Kostenlos testen</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Unternehmen
            </h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Über uns</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Kontakt</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Rechtliches
            </h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Datenschutz</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">AGB</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">Sicherheit</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SiteAgent. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function FahrschulenPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <PageNavbar />
      <main className="flex-grow">
        <HeroSection />
        <ProblemsSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DemoSection />
        <CTASection />
      </main>
      <PageFooter />
      
      {/* Chatbot Widget Script */}
      <Script
        src="https://www.siteagent.eu/chatbot-widget.js"
        data-chatbot-id="d6a18851-6ff6-4c44-823d-cda55f026acc"
        strategy="afterInteractive"
      />
    </div>
  );
}
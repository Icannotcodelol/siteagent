"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Database,
  Facebook,
  FileText,
  Github,
  Globe,
  Linkedin,
  Lock,
  Menu,
  Star,
  Twitter,
  Webhook,
  X,
  Zap,
  Sparkles,
  Layers,
  MessageSquare,
  ExternalLink,
  Users
} from "lucide-react";
import { Button, cn } from "@/app/_components/ui/button";
import IntegrationsBar from "@/app/_components/ui/integrations-bar";
import LivePreview from "@/app/_components/live-preview";
import CookieBanner from "@/app/_components/ui/cookie-banner";
import { createClient } from '@/lib/supabase/client';

interface GermanLandingPageClientProps {
  authButtonSlot: React.ReactNode;
}

// ============= UI COMPONENTS =============

// Accordion Components
const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b border-gray-200", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-gray-800 [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0 text-gray-600", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// How Demo Works Section Component with diagonal layout - BRIGHT VERSION
function HowDemoWorksSection() {
  return (
    <section className="relative py-16 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Bright diagonal background elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl transform rotate-45"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl transform -rotate-45"></div>
        
        {/* Diagonal lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent transform rotate-12"></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300 rounded-full px-4 py-2">
                <span className="text-orange-600 text-sm font-bold">⚡ SOFORT</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Vom Upload zur
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  KI-Automatisierung
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Sehen Sie zu, wie sich Ihre statischen Inhalte in Echtzeit in ein intelligentes Automatisierungssystem verwandeln. Kein komplexes Setup, keine technischen Kenntnisse erforderlich.
              </p>
            </div>

            {/* Process steps in a modern card layout */}
            <div className="space-y-4">
              {[
                { step: "01", title: "Inhalte hochladen", desc: "Laden Sie beliebige Dokumente hoch, fügen Sie Text ein oder geben Sie eine Website-URL ein" },
                { step: "02", title: "KI-Verarbeitung", desc: "Unsere KI analysiert und strukturiert automatisch Ihre Inhalte" },
                { step: "03", title: "Automatisierung starten", desc: "Ihr intelligenter Assistent ist bereit, echte Aufgaben zu bewältigen" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white/80 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-gray-800 font-semibold">{item.title}</div>
                    <div className="text-gray-600 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Visual demo preview */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-white to-blue-50 border border-gray-200 rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm ml-4">Live Demo Interface</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <div className="text-blue-700 text-sm font-semibold mb-2">🌐 URL einfügen oder Dokumente hochladen</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                    <div className="text-purple-700 text-sm font-semibold mb-2">🧠 KI-Verarbeitung</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-purple-700 text-xs ml-2">Analysiere Inhalte...</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <div className="text-green-700 text-sm font-semibold mb-2">✅ Bereit zur Automatisierung</div>
                    <div className="text-green-700 text-xs">Ihr KI-Assistent ist live und einsatzbereit!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Live Demo Section Component - BRIGHT VERSION
function LiveDemoSection() {
  return (
    <section id="live-demo" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-blue-50">
      {/* Visual separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-full px-6 py-3 mb-8 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 text-sm font-bold tracking-wide">LIVE DEMO</span>
            </div>
            <div className="w-px h-4 bg-gray-400"></div>
            <span className="text-gray-700 text-sm">Kostenlos ausprobieren - Keine Registrierung erforderlich</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Sehen Sie 
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              KI-Magie
            </span>
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {" "}in Aktion
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
            Laden Sie Ihre eigenen Inhalte hoch und erleben Sie, wie sie sich in Sekunden in einen intelligenten Automatisierungsassistenten verwandeln. Sehen Sie die Zukunft des Kundenservice in Echtzeit.
          </p>
        </div>

        {/* Live Preview Component */}
        <div className="relative">
          <LivePreview locale="de" />
        </div>
      </div>
    </section>
  );
}

// Features Section - BRIGHT VERSION (1:1 translation of English)
function FeaturesSection() {
  const primaryFeatures = [
    { 
      img: "/icons/AI CHATBOT ICON.svg", 
      title: "Sparen Sie 70% der Support-Kosten", 
      description: "Bearbeiten Sie Routine-Anfragen automatisch und lassen Sie Ihr Team sich auf komplexe Probleme konzentrieren, die menschliche Expertise erfordern.",
      stat: "70% Kostensenkung"
    },
    { 
      img: "/icons/Website Embedding.svg", 
      title: "Einfach Website-URL einfügen", 
      description: "Keine organisierten Dokumente? Kein Problem! Fügen Sie einfach Ihre Website-URL ein und wir erstellen sofort einen Experten-Chatbot aus all Ihren vorhandenen Inhalten - perfekt für vielbeschäftigte Teams.",
      stat: "0 Setup-Zeit"
    },
    { 
      img: "/icons/External API Actions.svg", 
      title: "Verwandeln Sie Besucher in Kunden", 
      description: "Termine planen, CRM-Datensätze aktualisieren und Support-Tickets automatisch erstellen - verwandeln Sie jede Unterhaltung in eine Aktion.",
      stat: "3x Conversion-Rate"
    }
  ];

  const secondaryFeatures = [
    { 
      img: "/icons/Document Knowledge Base.svg", 
      title: "Sofortiges Expertenwissen", 
      description: "Laden Sie Ihre Dokumente einmal hoch und erhalten Sie sofort präzise, kontextuelle Antworten - wie Ihren besten Experten 24/7 verfügbar zu haben."
    },
    { 
      img: "/icons/Powerful Analytics.svg", 
      title: "Messen Sie echte Geschäftsauswirkungen", 
      description: "Verfolgen Sie Lead-Generierung, Kundenzufriedenheit und Kosteneinsparungen mit detaillierten Analysen, die ROI beweisen."
    },
    { 
      img: "/icons/Enterprise Security.svg", 
      title: "Enterprise-taugliche Sicherheit", 
      description: "Implementieren Sie vertrauensvoll mit Verschlüsselung auf Bankniveau, Compliance-Features und rollenbasierter Zugriffskontrolle."
    }
  ];

  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="features" ref={sectionRef} className="relative py-24 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Modern background with asymmetric shapes - bright version */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl transform -rotate-45"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl transform rotate-45"></div>
        
        {/* Geometric accents */}
        <div className="absolute top-1/3 right-1/4 w-2 h-32 bg-gradient-to-b from-blue-300/30 to-transparent transform rotate-12"></div>
        <div className="absolute bottom-1/3 left-1/4 w-2 h-32 bg-gradient-to-b from-purple-300/30 to-transparent transform -rotate-12"></div>
      </div>

      <div className="container relative mx-auto px-6">
        {/* Header section with modern positioning */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 backdrop-blur-sm border border-green-300 rounded-full px-4 py-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm font-bold tracking-wide">ECHTE ERGEBNISSE</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black leading-none">
                <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                  Hören Sie auf zu reden.
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Fangen Sie an zu liefern.
                </span>
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl text-gray-600 leading-relaxed">
                Verwandeln Sie Ihre Website von einer Broschüre in eine umsatzgenerierende Maschine, die rund um die Uhr arbeitet.
              </p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 text-sm font-semibold">70% Kostensenkung</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-600 text-sm font-semibold">5-Min Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-600 text-sm font-semibold">24/7 Automatisierung</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Asymmetric feature layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Primary features - larger cards */}
          <div className="lg:col-span-8 space-y-8">
            {primaryFeatures.map((feature, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-xl hover:border-gray-300 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-1 shadow-xl">
                      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                        <Image
                          src={feature.img}
                          alt={feature.title}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {feature.title}
                      </h3>
                      <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-full px-4 py-2">
                        <span className="text-green-600 text-sm font-bold">{feature.stat}</span>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 group-hover:w-full rounded-b-3xl"></div>
              </div>
            ))}
          </div>

          {/* Secondary features - compact sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {secondaryFeatures.map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-500 hover:bg-blue-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-1 flex-shrink-0">
                    <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                      <Image
                        src={feature.img}
                        alt={feature.title}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Bereit, diese Funktionen in Aktion zu sehen?
            </h3>
            <p className="text-gray-600 mb-6">
              Probieren Sie unsere Live-Demo aus - keine Anmeldung erforderlich, Ergebnisse in 60 Sekunden.
            </p>
            <Link href="#live-demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg">
              <span>🚀 Live-Demo ausprobieren</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section with interactive step-by-step experience - BRIGHT VERSION
function HowItWorksSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { 
      number: "01", 
      title: "Erstellen Sie Ihren Chatbot", 
      description: "Richten Sie Ihren Chatbot in Minuten mit unserem intuitiven Dashboard ein. Definieren Sie seinen Zweck und seine Persönlichkeit.", 
      features: ["Keine Programmierung erforderlich", "Anpassbares Erscheinungsbild", "Mehrere Chatbot-Vorlagen"],
      visual: "🤖"
    },
    { 
      number: "02", 
      title: "Verbinden Sie Ihre Daten", 
      description: "Fügen Sie einfach Ihre Website-URL für sofortiges Setup ein oder laden Sie Dokumente hoch, um Ihrem Chatbot die benötigten Informationen zu geben. Keine Organisation erforderlich!", 
      features: ["Beliebige Website-URL einfügen (am einfachsten!)", "Dokumente hochladen (PDF, DOCX, etc.)", "Datenbanken & APIs verbinden"],
      visual: "📚"
    },
    { 
      number: "03", 
      title: "Aktionen konfigurieren", 
      description: "Richten Sie Integrationen mit Drittanbieter-Services ein, damit Ihr Chatbot echte Aktionen durchführen kann.", 
      features: ["OAuth-Verbindungen", "Webhook-Trigger", "Benutzerdefinierte API-Integrationen"],
      visual: "⚡"
    },
    { 
      number: "04", 
      title: "Bereitstellen & Analysieren", 
      description: "Betten Sie Ihren Chatbot in Ihre Website ein und verfolgen Sie seine Leistung mit detaillierten Analysen.", 
      features: ["Einfacher Embed-Code", "Unterhaltungsanalysen", "Kontinuierliche Verbesserung"],
      visual: "📊"
    }
  ];

  const sectionRef = useRef<HTMLElement>(null);

  const nextStep = () => {
    if (currentStep < steps.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex !== currentStep && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsAnimating(false);
      }, 150);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-24 bg-gradient-to-br from-white to-blue-50 overflow-hidden">
      {/* Modern background with flowing lines - bright version */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
        
        {/* Flowing connection lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.1))' }}>
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path 
            d="M 100 200 Q 300 100 500 300 T 900 200 Q 1100 300 1300 100" 
            stroke="url(#flowGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-pulse"
          />
        </svg>
      </div>

      <div className="container relative mx-auto px-6">
        {/* Header with modern styling */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 backdrop-blur-sm border border-blue-300 rounded-full px-4 py-2 mb-6">
            <span className="text-blue-600 text-sm font-bold">🛠️ EINFACHER PROZESS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Von der Idee zur
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              KI-Automatisierung
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Folgen Sie diesen einfachen Schritten, um Ihr KI-gestütztes Automatisierungssystem zu erstellen und bereitzustellen.
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl scale-110'
                      : index < currentStep
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:scale-105'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-600'
                  }`}
                  disabled={isAnimating}
                >
                  {index < currentStep ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                  
                  {/* Active indicator */}
                  {index === currentStep && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-30 animate-pulse"></div>
                  )}
                </button>
                
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-500 ${
                    index < currentStep 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current step content */}
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="flex items-center lg:flex-row flex-col gap-16 max-w-6xl mx-auto">
            {/* Content side */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-lg">{currentStepData.number}</span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {currentStepData.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {currentStepData.description}
              </p>
              
              {/* Features in a modern card grid */}
              <div className="grid gap-3">
                {currentStepData.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg hover:border-gray-300 transition-all shadow-sm">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-4 pt-6">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0 || isAnimating}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    currentStep === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Zurück
                </button>
                
                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1 || isAnimating}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    currentStep === steps.length - 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 shadow-lg'
                  }`}
                >
                  Weiter
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Visual side */}
            <div className="flex-1 relative">
              <div className="bg-gradient-to-br from-white to-blue-50 border border-gray-200 rounded-3xl p-8 shadow-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-6 animate-bounce">
                    {currentStepData.visual}
                  </div>
                  <div className="space-y-4">
                    <div className="h-3 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-60"></div>
                    <div className="h-3 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-40"></div>
                    <div className="h-3 bg-gradient-to-r from-green-300 to-blue-300 rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Integration Ecosystem Section
function IntegrationEcosystemSection() {
  return (
    <section className="relative py-16 bg-gradient-to-br from-white to-blue-50">
      <div className="container mx-auto px-6">
        <IntegrationsBar locale="de" />
      </div>
    </section>
  );
}

// Testimonials Section - BRIGHT VERSION
function TestimonialsSection() {
  const testimonials = [
    {
      content: "SiteAgent hat unsere Kundenbetreuung revolutioniert. Wir haben unsere Antwortzeiten um 90% reduziert und die Kundenzufriedenheit ist durch die Decke gegangen.",
      author: "Sarah Mueller",
      role: "Leiterin Kundenservice",
      company: "TechFlow GmbH",
      rating: 5,
      avatar: "/avatars/sarah.jpg"
    },
    {
      content: "Was mich am meisten beeindruckt, ist, wie schnell es funktioniert. Innerhalb von 5 Minuten hatte ich einen voll funktionsfähigen KI-Assistenten auf meiner Website laufen.",
      author: "Michael Schmidt",
      role: "Gründer",
      company: "Digital Solutions AG",
      rating: 5,
      avatar: "/avatars/michael.jpg"
    },
    {
      content: "Unser Sales-Team liebt es. Der KI-Assistent qualifiziert Leads automatisch und plant Termine - das hat unsere Conversion-Rate um 150% gesteigert.",
      author: "Anna Weber",
      role: "Vertriebsleiterin",
      company: "InnovateTech",
      rating: 5,
      avatar: "/avatars/anna.jpg"
    }
  ];

  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-full px-4 py-2 mb-8">
            <Star className="h-4 w-4 text-yellow-600 fill-current" />
            <span className="text-yellow-700 text-sm font-bold">KUNDENMEINUNGEN</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Geliebt von 
            </span>
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Tausenden von Unternehmen
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sehen Sie, was unsere Kunden über ihre Erfahrungen mit SiteAgent sagen
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Rating stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>

              {/* Testimonial content */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                "{testimonial.content}"
              </blockquote>

              {/* Author info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.author.split(' ').map(name => name[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.author}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  <div className="text-blue-600 text-sm font-medium">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section - Updated to match English version layout and styling
function PricingSection() {
  const plans = [
    {
      name: "Kostenlos",
      price: "€0",
      period: "für immer",
      description: "Perfekt um SiteAgent zu erkunden",
      features: [
        "1 Chatbot",
        "100 Nachrichten / Monat",
        "1 MB Datenspeicher",
        "Nur manueller Datenupload",
        "Community-Support",
      ],
      highlight: false,
      cta: "Kostenlos starten",
      href: "/signup",
      trial: false,
    },
    {
      name: "SiteAgent Starter",
      price: "€29.99",
      period: "Monat",
      description: "Perfekt für kleine Startups",
      features: [
        "1 Chatbot",
        "500 Nachrichten / Monat",
        "5 MB Datenspeicher",
        "1 Website crawlen",
        "Grundlegende Integrationen",
        "E-Mail-Support",
      ],
      highlight: false,
      cta: "Testversion starten",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Growth",
      price: "€149",
      period: "Monat",
      description: "Beliebteste Option für wachsende Unternehmen",
      features: [
        "3 Chatbots",
        "3.000 Nachrichten / Monat",
        "25 MB Datenspeicher",
        "5 Websites crawlen",
        "Alle Integrationen",
        "Prioritäts-Support",
      ],
      highlight: true,
      cta: "Testversion starten",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Pro",
      price: "€399",
      period: "Monat",
      description: "Für skalierende Unternehmen",
      features: [
        "10 Chatbots",
        "10.000 Nachrichten / Monat",
        "100 MB Datenspeicher",
        "20 Websites crawlen",
        "Alle Integrationen + Custom API",
        "Dedicated & Onboarding-Support",
      ],
      highlight: false,
      cta: "Testversion starten",
      href: "/signup",
      trial: true,
    },
    {
      name: "Enterprise",
      price: "Sprechen wir",
      period: "",
      description: "Enterprise-Lösungen für Ihre Bedürfnisse",
      features: [
        "Unbegrenzte Chatbots",
        "Benutzerdefinierte Nachrichtenlimits",
        "Unbegrenztes Website-Crawling",
        "Dedicated Storage",
        "White-Label-Lösungen",
        "Prioritäts-Support & SLA",
        "Benutzerdefinierte Integrationen",
      ],
      highlight: false,
      cta: "Kontakt",
      href: "/contact",
      trial: false,
    },
  ];

  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="pricing" ref={sectionRef} className="relative bg-gray-900 py-24 md:py-32 overflow-hidden">
      {/* Enhanced background with subtle pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-l from-purple-500/10 to-pink-500/10 rounded-full filter blur-3xl"></div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        {/* Enhanced header */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-green-500/30 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-xl px-6 py-3 mb-8">
            <span className="text-green-400 text-sm font-semibold tracking-wide">Transparente Preise</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Einfache, transparente
            </span>
            <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mt-2">
              Preise
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Kostenlos starten – upgraden Sie, wenn Sie mehr Power brauchen. Keine versteckten Gebühren.
          </p>
        </div>
        
        {/* Enhanced pricing grid - Fixed layout to accommodate all 5 plans */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 pt-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`group relative flex flex-col rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 shadow-2xl backdrop-blur-sm border transition-all duration-500 hover:scale-105 hover:shadow-3xl ${
                plan.highlight 
                  ? "border-blue-500/50 ring-2 ring-blue-500/20 hover:ring-blue-400/30" 
                  : "border-gray-700/50 hover:border-gray-600/50"
              }`}
            >
              {/* Popular badge */}
              {plan.highlight && (
                <span className="absolute -top-3 left-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg uppercase tracking-wider whitespace-nowrap">
                  Beliebtester
                </span>
              )}
              
              {/* Trial badge */}
              {plan.trial && (
                <span className="absolute -top-3 right-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-2 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                  14 Tage frei
                </span>
              )}
              
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                plan.highlight 
                  ? "bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"
                  : "bg-gradient-to-br from-gray-600/5 via-transparent to-gray-700/5"
              }`}></div>
              
              <div className="relative flex flex-col h-full">
                {/* Plan header */}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                    plan.highlight 
                      ? "text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text"
                      : "text-white group-hover:text-gray-200"
                  }`}>{plan.name}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{plan.description}</p>
                </div>
                
                {/* Pricing */}
                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 text-base mb-1">/{plan.period}</span>
                    )}
                  </div>
                  {plan.trial && (
                    <p className="text-green-400 text-xs mt-2 font-medium">
                      14 Tage kostenlos, dann jederzeit kündbar
                    </p>
                  )}
                </div>
                
                {/* Features */}
                <ul className="mb-8 space-y-3 flex-grow">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start">
                      <div className={`mr-2 mt-0.5 rounded-full p-1 ${
                        plan.highlight 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-300 leading-relaxed text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Link href={plan.href} className="mt-auto inline-flex">
                  <Button
                    size="lg"
                    className={`group w-full h-11 text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40"
                        : "border-2 border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
              </div>
              
              {/* Bottom accent */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full ${
                plan.highlight 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600"
                  : "bg-gradient-to-r from-gray-600 to-gray-500"
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section - BRIGHT VERSION
function FaqSection() {
  const faqs = [
    {
      question: "Wie schnell kann ich meinen KI-Assistenten einrichten?",
      answer: "Normalerweise dauert es nur 5 Minuten. Laden Sie einfach Ihre Inhalte hoch oder fügen Sie Ihre Website-URL ein, und Ihr KI-Assistent ist bereit, Kunden zu bedienen."
    },
    {
      question: "Welche Arten von Inhalten kann SiteAgent verarbeiten?",
      answer: "SiteAgent kann PDFs, Textdateien, CSV-Dateien, Website-Inhalte und direkten Text verarbeiten. Es versteht Produktkataloge, FAQs, Dokumentationen und mehr."
    },
    {
      question: "Ist meine Daten sicher?",
      answer: "Absolut. Wir verwenden Enterprise-Grade-Verschlüsselung und erfüllen SOC2-Standards. Ihre Daten werden niemals mit anderen geteilt oder für das Training anderer Modelle verwendet."
    },
    {
      question: "Kann ich SiteAgent mit meinen bestehenden Tools integrieren?",
      answer: "Ja! SiteAgent integriert sich nativ mit HubSpot, Calendly, Jira, Shopify, Monday.com und über 500+ anderen Tools über Zapier."
    },
    {
      question: "Was passiert nach der kostenlosen Testversion?",
      answer: "Nach 14 Tagen können Sie einen Plan wählen, der zu Ihren Bedürfnissen passt. Keine versteckten Kosten, keine Überraschungen - nur transparente Preise."
    }
  ];

  return (
    <section id="faq" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-full px-4 py-2 mb-8">
            <MessageSquare className="h-4 w-4 text-purple-600" />
            <span className="text-purple-700 text-sm font-bold">HÄUFIGE FRAGEN</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Haben Sie 
            </span>
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Fragen?
            </span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-6 hover:border-gray-300 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-semibold py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// CTA Section - BRIGHT VERSION
function CtaSection() {
  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Bright animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container relative mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-bold">BEREIT ZUM START</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Verwandeln Sie Ihre Inhalte in 
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              {" "}KI-Superkräfte
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            Schließen Sie sich Tausenden von Unternehmen an, die bereits 70% ihrer Support-Kosten sparen und gleichzeitig die Kundenzufriedenheit steigern.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              href="/signup"
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
            >
              <span>🚀 Kostenlos starten</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="#live-demo"
              className="border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
            >
              <span>Live Demo ansehen</span>
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>14 Tage kostenlose Testversion</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Keine Kreditkarte erforderlich</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Setup in 5 Minuten</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component - BRIGHT VERSION
function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">SiteAgent</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
              Die führende KI-Automatisierungsplattform, die Ihren Kundenservice revolutioniert und echte Geschäftsergebnisse liefert.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Schnellzugriffe</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Funktionen</a></li>
              <li><a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Preise</a></li>
              <li><a href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">Über uns</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Kontakt</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Rechtliches</h4>
            <ul className="space-y-3">
              <li><a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Datenschutz</a></li>
              <li><a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">AGB</a></li>
              <li><a href="/security" className="text-gray-600 hover:text-blue-600 transition-colors">Sicherheit</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-600">© 2024 SiteAgent. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Component
export default function GermanLandingPageClient({ authButtonSlot }: GermanLandingPageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* How Demo Works Section */}
      <HowDemoWorksSection />

      {/* Live Demo Section */}
      <LiveDemoSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Integration Ecosystem */}
      <IntegrationEcosystemSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* CTA Section */}
      <CtaSection />

      {/* Footer */}
      <Footer />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
} 
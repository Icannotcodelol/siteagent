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

interface ItalianLandingPageClientProps {
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
                <span className="text-orange-600 text-sm font-bold">⚡ ISTANTANEO</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Dal Caricamento all'
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Automazione AI
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Guarda i tuoi contenuti statici trasformarsi in un sistema di automazione intelligente in tempo reale. Nessun setup complesso, nessuna conoscenza tecnica richiesta.
              </p>
            </div>

            {/* Process steps in a modern card layout */}
            <div className="space-y-4">
              {[
                { step: "01", title: "Carica Contenuti", desc: "Carica qualsiasi documento, incolla testo o inserisci un URL di un sito web" },
                { step: "02", title: "Elaborazione AI", desc: "La nostra AI analizza e struttura automaticamente i tuoi contenuti" },
                { step: "03", title: "Inizia ad Automatizzare", desc: "Il tuo assistente intelligente è pronto a gestire attività reali" }
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
                  <span className="text-gray-600 text-sm ml-4">Interfaccia Demo Live</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <div className="text-blue-700 text-sm font-semibold mb-2">🌐 Incolla URL o Carica Documenti</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                    <div className="text-purple-700 text-sm font-semibold mb-2">🧠 Elaborazione AI</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-purple-700 text-xs ml-2">Analizzando contenuti...</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <div className="text-green-700 text-sm font-semibold mb-2">✅ Pronto ad Automatizzare</div>
                    <div className="text-green-700 text-xs">Il tuo assistente AI è live e pronto all'azione!</div>
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
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full border border-purple-300 bg-purple-100 px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-purple-600 text-sm font-medium">🥇 Esperienza Interattiva Unica</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Niente Solita Demo di Chatbot—
            <span className="block text-purple-600">L'Unica Che Funziona Davvero</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            I competitor mostrano esempi finti; noi mostriamo i tuoi veri contenuti. Scopri subito come SiteAgent automatizza task reali come prenotare appuntamenti, aggiornare il CRM e molto altro.
          </p>
          
          {/* Social proof about demo */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto mb-8 shadow-lg">
            <div className="flex items-center justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current text-yellow-500 mx-0.5" />
              ))}
            </div>
            <blockquote className="text-gray-700 text-lg italic mb-3">
              "La demo ci ha conquistati all'istante. Vedere SiteAgent automatizzare realmente le nostre interazioni con i clienti in tempo reale è stato straordinario."
            </blockquote>
            <p className="text-gray-500 text-sm">— Beta tester verificato</p>
          </div>
        </div>

        {/* Demo container with enhanced styling */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-blue-200/40 rounded-3xl blur-xl opacity-50"></div>
          
          {/* Demo content */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl">
            <LivePreview locale="it" />
          </div>
        </div>

        {/* Visual demo preview teaser */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm mb-4">
            💡 Guarda come SiteAgent trasforma istantaneamente i tuoi contenuti in un'esperienza AI interattiva
          </p>
          <div className="inline-flex items-center text-blue-600 text-sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>AI Reale • Azioni Reali • Risultati Reali</span>
          </div>
        </div>

        {/* Bottom separator with integration preview */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm">
              Si integra perfettamente con il tuo flusso di lavoro esistente
            </p>
          </div>
          <IntegrationsBar locale="it" />
        </div>
      </div>

      {/* Bottom visual separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
    </section>
  );
}

// Features Section with modern asymmetric layout - BRIGHT VERSION
function FeaturesSection() {
  const primaryFeatures = [
    { 
      img: "/icons/AI CHATBOT ICON.svg", 
      title: "70% in meno di costi assistenza", 
      description: "Le richieste di routine vengono gestite automaticamente, permettendo al tuo team di concentrarsi su problemi complessi che richiedono competenza umana.",
      stat: "70% riduzione costi"
    },
    { 
      img: "/icons/Website Embedding.svg", 
      title: "Basta l'URL del tuo sito", 
      description: "Niente documenti da preparare! Inserisci semplicemente l'URL del tuo sito e creiamo subito un chatbot esperto da tutti i tuoi contenuti esistenti - perfetto per team sempre di corsa.",
      stat: "0 tempo setup"
    },
    { 
      img: "/icons/External API Actions.svg", 
      title: "Da visitatori a clienti", 
      description: "Prenota appuntamenti, aggiorna CRM, crea ticket di supporto - ogni conversazione diventa un'opportunità di business.",
      stat: "3x più conversioni"
    }
  ];

  const secondaryFeatures = [
    { 
      img: "/icons/Document Knowledge Base.svg", 
      title: "Competenza esperta sempre disponibile", 
      description: "Carica i documenti una volta e ottieni subito risposte precise e pertinenti - come avere il tuo miglior esperto a disposizione 24/7."
    },
    { 
      img: "/icons/Powerful Analytics.svg", 
      title: "Successo aziendale misurabile", 
      description: "Monitora generazione lead, soddisfazione clienti e risparmio sui costi con analisi dettagliate che dimostrano il ROI nero su bianco."
    },
    { 
      img: "/icons/Enterprise Security.svg", 
      title: "Sicurezza da settore bancario", 
      description: "Implementa con fiducia grazie a crittografia di livello bancario, funzionalità di compliance e controllo accessi basato sui ruoli."
    }
  ];

  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="features" ref={sectionRef} className="relative py-24 bg-gradient-to-br from-white to-blue-50 overflow-hidden">
      {/* Modern background with asymmetric shapes - BRIGHT VERSION */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl transform -rotate-45"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl transform rotate-45"></div>
        
        {/* Geometric accents */}
        <div className="absolute top-1/3 right-1/4 w-2 h-32 bg-gradient-to-b from-blue-300/50 to-transparent transform rotate-12"></div>
        <div className="absolute bottom-1/3 left-1/4 w-2 h-32 bg-gradient-to-b from-purple-300/50 to-transparent transform -rotate-12"></div>
      </div>

      <div className="container relative mx-auto px-6">
        {/* Header section with modern positioning */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-full px-4 py-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm font-bold tracking-wide">RISULTATI REALI</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black leading-none">
                <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                  Basta chiacchiere.
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Iniziamo a fare sul serio.
                </span>
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl text-gray-600 leading-relaxed">
                Trasforma il tuo sito web da brochure a macchina generatrice di entrate che funziona 24 ore su 24.
              </p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 text-sm font-semibold">70% Riduzione Costi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-600 text-sm font-semibold">Setup in 5 Min</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-600 text-sm font-semibold">Automazione 24/7</span>
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
              <div key={index} className="group relative bg-gradient-to-br from-white to-blue-50 border border-gray-200 rounded-3xl p-8 shadow-xl hover:border-gray-300 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
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
              <div key={index} className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-1 flex-shrink-0">
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
          <div className="bg-gradient-to-r from-white to-blue-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Pronto a vedere queste funzionalità in azione?
            </h3>
            <p className="text-gray-600 mb-6">
              Prova la nostra demo live - nessuna registrazione richiesta, vedi i risultati in 60 secondi.
            </p>
            <Link href="#live-demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg">
              <span>🚀 Prova Demo Live</span>
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
      title: "Configura il chatbot", 
      description: "Imposta il tuo chatbot in pochi minuti con la nostra dashboard intuitiva. Definisci scopo e personalità.", 
      features: ["Nessuna programmazione necessaria", "Design personalizzabile", "Template chatbot multipli"],
      visual: "🤖"
    },
    { 
      number: "02", 
      title: "Collega i tuoi dati", 
      description: "Inserisci semplicemente l'URL del tuo sito per un setup immediato o carica documenti - il chatbot ottiene automaticamente tutte le informazioni necessarie. Nessuna organizzazione richiesta!", 
      features: ["Qualsiasi URL del sito (più facile!)", "Carica documenti (PDF, DOCX, ecc.)", "Collega database e API"],
      visual: "📚"
    },
    { 
      number: "03", 
      title: "Configura le azioni", 
      description: "Configura integrazioni con servizi di terze parti perché il tuo chatbot possa eseguire azioni concrete.", 
      features: ["Connessioni OAuth", "Trigger webhook", "Integrazioni API personalizzate"],
      visual: "⚡"
    },
    { 
      number: "04", 
      title: "Pubblica e analizza", 
      description: "Integra il chatbot nel tuo sito e monitora le performance con analisi dettagliate.", 
      features: ["Codice embed semplice", "Analisi conversazioni", "Miglioramento continuo"],
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
    <section id="how-it-works" ref={sectionRef} className="relative py-24 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Modern background with flowing lines - BRIGHT VERSION */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent transform -rotate-3"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent transform rotate-3"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-6">
        {/* Header section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-full px-4 py-2 mb-6">
            <Layers className="h-4 w-4 text-blue-600" />
            <span className="text-blue-600 text-sm font-bold tracking-wide">PROCESSO SEMPLICE</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black leading-none mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Come
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Funziona
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Dal concetto al deployment in quattro semplici passaggi. Nessuna esperienza tecnica richiesta.
          </p>
        </div>

        {/* Interactive step navigation */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-6">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => goToStep(index)}
                  className={`group relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    index === currentStep
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-110"
                      : "bg-white border-2 border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 shadow-lg"
                  }`}
                >
                  <span className="relative z-10">{step.number}</span>
                  {index === currentStep && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
                    index < currentStep ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gray-200"
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current step content */}
        <div className="max-w-6xl mx-auto">
          <div className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-500 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-full px-4 py-2">
                  <span className="text-2xl">{currentStepData.visual}</span>
                  <span className="text-blue-600 font-semibold">Passaggio {currentStepData.number}</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
                  {currentStepData.title}
                </h3>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Features list */}
              <div className="space-y-3">
                {currentStepData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-blue-50 border border-gray-200 rounded-3xl p-12 shadow-xl">
                <div className="text-center">
                  <div className="text-8xl mb-8 animate-bounce">
                    {currentStepData.visual}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-800">
                      {currentStepData.title}
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Passaggio {currentStep + 1} di {steps.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center gap-4 mt-16">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Precedente
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Successivo →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Integration Ecosystem Section - BRIGHT VERSION
function IntegrationEcosystemSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ecosistema di Integrazioni
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connetti con gli strumenti che già usi per automatizzare flussi di lavoro reali
          </p>
        </div>
        <IntegrationsBar locale="it" />
      </div>
    </section>
  );
}

// Testimonials Section - BRIGHT VERSION
function TestimonialsSection() {
  const testimonials = [
    { quote: "SiteAgent ha trasformato il nostro supporto clienti. Il nostro chatbot gestisce il 70% delle richieste automaticamente, facendoci risparmiare ore preziose." },
    { quote: "La possibilità di connettere il nostro chatbot al nostro CRM e agli strumenti di programmazione è stata rivoluzionaria. È come avere un membro del team in più." },
    { quote: "Abbiamo caricato la documentazione del nostro prodotto e in pochi minuti avevamo un chatbot che poteva rispondere a domande tecniche accuratamente. Impressionante!" },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cardsRef.current.forEach((card, index) => {
              if (card) {
                setTimeout(() => {
                  card.classList.add("opacity-100", "translate-y-0");
                }, index * 150);
              }
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-white to-blue-50 py-24 md:py-32 overflow-hidden">
      {/* Enhanced background - BRIGHT VERSION */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-l from-purple-200/20 to-blue-200/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        {/* Enhanced header */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 mb-8">
            <span className="text-yellow-600 text-sm font-semibold tracking-wide">Storie dei Clienti</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Apprezzato da Aziende
            </span>
            <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
              Innovative
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">Scopri cosa dicono i nostri clienti di SiteAgent.</p>
        </div>
        
        {/* Enhanced testimonials grid */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="group relative rounded-3xl bg-gradient-to-br from-white to-blue-50 p-8 shadow-xl border border-gray-200 opacity-0 translate-y-8 transition-all duration-500 ease-out hover:border-gray-300 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/30 via-transparent to-orange-100/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl"></div>
              
              <div className="relative">
                {/* Star rating with enhanced animation */}
                <div className="mb-8 flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-6 w-6 fill-current text-yellow-500 transition-all duration-300 group-hover:scale-125 group-hover:text-yellow-400 mx-0.5" 
                      style={{ 
                        animationDelay: `${i * 0.1}s`,
                        transform: 'rotate(0deg)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
                
                {/* Quote icon */}
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 p-3">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8v8c0 2.2-1.8 4-4 4v4c4.4 0 8-3.6 8-8V8h-4zm12 0v8c0 2.2-1.8 4-4 4v4c4.4 0 8-3.6 8-8V8h-4z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Enhanced quote with better typography */}
                <blockquote className="mb-8 text-gray-700 text-lg leading-relaxed text-center transition-colors duration-300 group-hover:text-gray-800 font-medium">
                  "{testimonial.quote}"
                </blockquote>
              </div>
              
              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500 group-hover:w-full rounded-b-3xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// PRICING SECTION COMPONENT (visual-only) - BRIGHT VERSION
function PricingSection() {
  const plans = [
    {
      name: "Gratuito",
      price: "€0",
      period: "per sempre",
      description: "Perfetto per esplorare SiteAgent",
      features: [
        "1 Chatbot",
        "100 messaggi / mese",
        "1 MB di archiviazione dati",
        "Scraping di 3 siti web",
        "Supporto della community",
      ],
      highlight: false,
      cta: "Inizia Gratis",
      href: "/signup",
      trial: false,
    },
    {
      name: "SiteAgent Starter",
      price: "€29.99",
      period: "mese",
      description: "Perfetto per piccole startup",
      features: [
        "1 Chatbot",
        "500 messaggi / mese",
        "5 MB di archiviazione dati",
        "Scraping di 10 siti web",
        "Integrazioni essenziali",
        "Supporto email",
      ],
      highlight: false,
      cta: "Inizia Prova Gratuita",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Growth",
      price: "€149",
      period: "mese",
      description: "Più popolare per aziende in crescita",
      features: [
        "3 Chatbot",
        "3.000 messaggi / mese",
        "25 MB di archiviazione dati",
        "Scraping di 25 siti web",
        "Tutte le integrazioni",
        "Supporto prioritario",
      ],
      highlight: true,
      cta: "Inizia Prova Gratuita",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Pro",
      price: "€399",
      period: "mese",
      description: "Per aziende in crescita",
      features: [
        "10 Chatbot",
        "10.000 messaggi / mese",
        "100 MB di archiviazione dati",
        "Scraping di 50 siti web",
        "Tutte le integrazioni + API personalizzata",
        "Supporto dedicato e onboarding",
      ],
      highlight: false,
      cta: "Inizia Prova Gratuita",
      href: "/signup",
      trial: true,
    },
    {
      name: "Enterprise",
      price: "Parliamone",
      period: "",
      description: "Soluzioni enterprise su misura per le tue esigenze",
      features: [
        "Chatbot illimitati",
        "Limiti di messaggi personalizzati",
        "Scraping illimitato di siti web",
        "Archiviazione dedicata",
        "Deployment on-premise",
        "Soluzioni white-label",
        "Supporto prioritario e SLA",
        "Integrazioni personalizzate",
      ],
      highlight: false,
      cta: "Contatta Vendite",
      href: "/contact",
      trial: false,
    },
  ];

  return (
    <section id="pricing" className="relative bg-gradient-to-br from-white to-blue-50 py-24 md:py-32 overflow-hidden">
      {/* Enhanced background with subtle pattern - BRIGHT VERSION */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59,130,246,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-l from-purple-200/20 to-pink-200/20 rounded-full filter blur-3xl"></div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-blue-300 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 mb-8">
            <span className="text-blue-600 text-sm font-semibold tracking-wide">PREZZI TRASPARENTI</span>
          </div>
          
          <h2 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-800">
            Scegli il Tuo Piano
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Prezzi semplici e trasparenti per ogni fase del tuo percorso
          </p>
        </div>

        {/* Pricing grid */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-5">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`group relative rounded-3xl bg-white border p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.highlight
                  ? "border-blue-400 bg-gradient-to-br from-white to-blue-50 scale-105 shadow-2xl"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 text-sm font-bold text-white shadow-lg">
                    Più Popolare
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 ml-2">/{plan.period}</span>}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    className={`w-full py-3 text-base font-semibold transition-all duration-300 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105"
                        : "border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                {plan.trial && (
                  <p className="text-center text-xs text-gray-500">
                    Prova gratuita di 14 giorni
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Tutti i piani includono una prova gratuita di 14 giorni. Nessuna carta di credito richiesta.
          </p>
        </div>
      </div>
    </section>
  );
}

// FAQ Section - BRIGHT VERSION
function FaqSection() {
  const faqs = [
    { question: "Ho bisogno di conoscenze tecniche per usare SiteAgent?", answer: "No, SiteAgent è progettato per essere user-friendly anche per utenti non tecnici. La nostra interfaccia intuitiva ti permette di creare e deployare chatbot senza alcuna conoscenza di programmazione. Per personalizzazioni più avanzate, un background tecnico può essere utile ma non è richiesto." },
    { question: "Come funziona la knowledge base dei documenti?", answer: "SiteAgent utilizza la tecnologia Retrieval Augmented Generation (RAG). Carichi documenti (PDF, DOCX, ecc.) sulla nostra piattaforma, e noi li processiamo per creare embeddings. Quando un utente fa una domanda, il nostro sistema recupera le informazioni più rilevanti dai tuoi documenti e le usa per generare risposte accurate." },
    { question: "Posso connettere il mio chatbot ai miei strumenti esistenti?", answer: "Sì! SiteAgent supporta integrazioni con molti servizi di terze parti popolari attraverso la nostra funzionalità Actions. Puoi connetterti a strumenti come Calendly, HubSpot, Jira, Shopify e altri. Questo permette al tuo chatbot di eseguire compiti come programmare appuntamenti, aggiornare dati CRM o creare ticket." },
    { question: "Come incorporo il chatbot sul mio sito web?", answer: "Una volta creato il tuo chatbot, riceverai un semplice snippet JavaScript da aggiungere al tuo sito web. Basta incollare questo codice nell'HTML del tuo sito e il chatbot apparirà. Puoi personalizzare l'aspetto e la posizione del widget del chatbot per adattarlo al design del tuo sito web." },
    { question: "C'è un limite a quanti messaggi può gestire il mio chatbot?", answer: "Ogni piano tariffario viene con un limite mensile specifico di messaggi. Il piano Starter include 5.000 messaggi al mese, il piano Professional include 25.000 messaggi, e il piano Enterprise offre messaggi illimitati. Se superi il tuo limite, i messaggi aggiuntivi vengono fatturati a una tariffa per messaggio." },
    { question: "Quanto sono sicuri i miei dati con SiteAgent?", answer: "Prendiamo la sicurezza sul serio. Tutti i dati sono crittografati sia in transito che a riposo. Utilizziamo pratiche di sicurezza standard del settore e ci sottoponiamo regolarmente ad audit di sicurezza. Per i clienti Enterprise, offriamo funzionalità di sicurezza aggiuntive come SSO, controllo degli accessi basato sui ruoli e politiche di conservazione dati personalizzate." },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && faqRef.current) {
            faqRef.current.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section id="faq" ref={sectionRef} className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Domande Frequenti
          </h2>
          <p className="mt-4 text-lg text-gray-600">Trova risposte alle domande comuni su SiteAgent.</p>
        </div>
        <div ref={faqRef} className="mx-auto max-w-3xl opacity-0 translate-y-8 transition-all duration-700 ease-out">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-gray-200 transition-all duration-300 hover:border-gray-300 bg-white rounded-lg mb-4 shadow-sm"
              >
                <AccordionTrigger className="group text-left text-gray-800 transition-all duration-300 hover:text-blue-600 px-6">
                  <span className="transition-transform duration-300 group-hover:translate-x-1">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 transition-colors duration-300 hover:text-gray-700 px-6">
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

// CTA Section Component - BRIGHT VERSION
function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && ctaRef.current) {
            ctaRef.current.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-blue-50 to-white py-24 md:py-32 overflow-hidden">
      {/* Enhanced background - BRIGHT VERSION */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-l from-purple-200/30 to-pink-200/30 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        <div
          ref={ctaRef}
          className="group mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 p-12 text-center shadow-2xl opacity-0 translate-y-8 transition-all duration-700 ease-out md:p-16 hover:shadow-3xl relative overflow-hidden"
        >
          {/* Background pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-8 left-8 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-16 right-12 w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-12 left-16 w-4 h-4 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          
          <div className="relative z-10">
            {/* Enhanced heading with better typography */}
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Trasforma i tuoi contenuti in
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                {" "}vera potenza AI
              </span>
            </h2>
            
            {/* Enhanced description */}
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Unisciti a migliaia di aziende che stanno già risparmiando il 70% sui costi di assistenza e aumentando la soddisfazione dei clienti.
            </p>
            
            {/* Enhanced button group */}
            <div className="flex flex-col items-center justify-center space-y-6 sm:flex-row sm:space-x-8 sm:space-y-0">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="group relative h-16 overflow-hidden bg-white text-blue-700 px-10 text-xl font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95"
                >
                  <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1">
                    Inizia Gratis
                    <ArrowRight className="ml-3 h-6 w-6 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="group h-16 border-2 border-white/80 bg-white/10 text-white px-10 text-xl font-semibold backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/20 hover:shadow-lg"
                >
                  <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
                    Contatta Vendite
                    <ArrowRight className="ml-3 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </span>
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-blue-100/80">
              <div className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">Sicurezza Enterprise</span>
              </div>
              <div className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">Setup in Minuti</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">Prova Gratuita 14 Giorni</span>
              </div>
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
    <footer className="border-t border-gray-200 bg-gradient-to-br from-white to-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/it" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 transition-all duration-300 group-hover:bg-blue-500">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                SiteAgent
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 transition-colors duration-300 hover:text-gray-700">
              Costruisci, deploya e gestisci chatbot alimentati da AI che si integrano con i tuoi strumenti e dati.
            </p>
            <div className="mt-6 flex space-x-4">
              {[
                { icon: Facebook, label: "Facebook" }, { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" }, { icon: Github, label: "GitHub" },
              ].map((social, index) => (
                <a key={index} href="#" className="text-gray-500 transition-all duration-300 hover:text-gray-800 hover:scale-110">
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Prodotto", links: [{ label: "Caratteristiche", href: "#features" }, { label: "Prezzi", href: "#pricing" }, { label: "Contatore Token AI", href: "/tools/token-counter" }, { label: "Generatore Meta Prompt", href: "/tools/meta-prompt-generator" }, { label: "Documentazione", href: "/docs" }] },
            { title: "Azienda", links: [{ label: "Chi Siamo", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Carriere", href: "/careers" }, { label: "Contatti", href: "/contact" }] },
            { title: "Legale", links: [{ label: "Informativa Privacy", href: "/privacy" }, { label: "Termini di Servizio", href: "/terms" }, { label: "Sicurezza", href: "/security" }] },
          ].map((section, index) => (
            <div key={index}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-gray-600 transition-all duration-300 hover:text-gray-800 hover:translate-x-1 inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} SiteAgent. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function ItalianLandingPageClient({ authButtonSlot }: ItalianLandingPageClientProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-800">
      {/* Navbar and HeroSection moved to critical path - skip here to avoid duplication */}
      <main className="overflow-x-hidden">
        <HowDemoWorksSection />
        <LiveDemoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <IntegrationEcosystemSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
        <Footer />
        <CookieBanner />
      </main>
    </div>
  );
} 
"use client";

import * as React from "react";
import Link from "next/link";
import Image from 'next/image';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe,
  Github,
  Linkedin,
  Star,
  Twitter,
  Webhook,
  Zap,
  MessageSquare,
  Shield,
  BarChart3
} from "lucide-react";
import { Button, cn } from "@/app/_components/ui/button";
import IntegrationsBar from "@/app/_components/ui/integrations-bar";
import LivePreview from "@/app/_components/live-preview";
import CookieBanner from "@/app/_components/ui/cookie-banner";
import { useState, useRef } from "react";

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

// How Demo Works Section Component
function HowDemoWorksSection() {
  return (
    <section className="relative py-16 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl transform rotate-45"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl transform -rotate-45"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent transform rotate-12"></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300 rounded-full px-4 py-2">
                <span className="text-orange-600 text-sm font-bold">⚡ DIRECT</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Van Upload naar
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  AI Automatisering
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Kijk hoe je statische content wordt omgezet naar een intelligent automatiseringssysteem in realtime. Geen complexe instellingen, geen technische kennis vereist.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { step: "01", title: "Content Uploaden", desc: "Upload elk document, plak tekst of voer een website URL in" },
                { step: "02", title: "AI Verwerking", desc: "Onze AI analyseert en structureert automatisch je content" },
                { step: "03", title: "Begin Automatiseren", desc: "Je intelligente assistent is klaar om echte taken uit te voeren" }
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
                    <div className="text-blue-700 text-sm font-semibold mb-2">🌐 URL Plakken of Documenten Uploaden</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                    <div className="text-purple-700 text-sm font-semibold mb-2">🧠 AI Verwerking</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-purple-700 text-xs ml-2">Content analyseren...</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <div className="text-green-700 text-sm font-semibold mb-2">✅ Klaar voor Automatisering</div>
                    <div className="text-green-700 text-xs">Je AI-assistent is live en klaar voor actie!</div>
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

// Live Demo Section Component
function LiveDemoSection() {
  return (
    <section id="live-demo" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl px-6 py-3 mb-8">
            <span className="text-blue-600 text-sm font-semibold tracking-wide">⚡ Live Demo</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Bekijk het
            </span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
              in Actie
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Voer content in, kijk hoe AI het direct omzet naar een intelligent systeem. Volledig gratis te testen.
          </p>
        </div>
        
        <div className="mx-auto max-w-6xl">
          <LivePreview locale="nl" />
        </div>
      </div>
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Intelligente Gesprekken",
      description: "Geavanceerde AI die complexe vragen begrijpt en zinvolle antwoorden geeft op basis van je content.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <Webhook className="h-8 w-8" />,
      title: "Krachtige Integraties",
      description: "Verbind naadloos met je bestaande tools zoals CRM-systemen, kalenders en meer voor echte automatisering.",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Bliksemsnelle Implementatie",
      description: "Van nul naar volledig functionele AI-assistent in minder dan 5 minuten. Geen technische kennis vereist.",
      gradient: "from-pink-600 to-red-600"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Meertalige Ondersteuning",
      description: "Ondersteun klanten in hun eigen taal met automatische detectie en vertaling mogelijkheden.",
      gradient: "from-red-600 to-orange-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Beveiliging",
      description: "Bank-niveau beveiliging en privacy bescherming voor al je gevoelige bedrijfsgegevens.",
      gradient: "from-orange-600 to-yellow-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Geavanceerde Analytics",
      description: "Gedetailleerde inzichten in klantinteracties, conversiestatistieken en prestatiegegevens.",
      gradient: "from-yellow-600 to-green-600"
    }
  ];

  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-l from-purple-400/10 to-pink-400/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-green-500/30 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-xl px-6 py-3 mb-8">
            <span className="text-green-600 text-sm font-semibold tracking-wide">Kernfuncties</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Alles wat je nodig hebt voor
            </span>
            <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Slimme Automatisering
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Van eenvoudige chatbots tot geavanceerde AI-assistenten die echte bedrijfstaken automatiseren.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-3xl bg-white/80 p-8 shadow-lg backdrop-blur-sm border border-gray-200/50 transition-all duration-500 hover:border-gray-300/50 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl"></div>
              
              <div className="relative">
                <div className={`mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r ${feature.gradient} p-3 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                
                <h3 className="mb-4 text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-gray-900">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
                  {feature.description}
                </p>
              </div>
              
              <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.gradient} transition-all duration-500 group-hover:w-full rounded-b-3xl`}></div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <IntegrationsBar locale="nl" />
        </div>
      </div>
    </section>
  );
}

// How It Works Section Component with Tabs (translated from English)
function HowItWorksSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { 
      number: "01", 
      title: "Maak je Chatbot", 
      description: "Stel je chatbot in binnen enkele minuten met ons intuïtieve dashboard. Bepaal het doel en de persoonlijkheid.", 
      features: ["Geen programmering vereist", "Aanpasbaar uiterlijk", "Meerdere chatbot templates"],
      visual: "🤖"
    },
    { 
      number: "02", 
      title: "Verbind je Data", 
      description: "Plak gewoon je website URL voor directe installatie, of upload documenten om je chatbot de informatie te geven die het nodig heeft. Geen organisatie vereist!", 
      features: ["Plak elke website URL (eenvoudigst!)", "Upload documenten (PDF, DOCX, etc.)", "Verbind databases & API's"],
      visual: "📚"
    },
    { 
      number: "03", 
      title: "Configureer Acties", 
      description: "Stel integraties in met externe services om je chatbot echte acties te laten uitvoeren.", 
      features: ["OAuth verbindingen", "Webhook triggers", "Custom API integraties"],
      visual: "⚡"
    },
    { 
      number: "04", 
      title: "Implementeer & Analyseer", 
      description: "Plaats je chatbot op je website en volg de prestaties met gedetailleerde analytics.", 
      features: ["Eenvoudige embed code", "Gesprek analytics", "Continue verbetering"],
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
    <section id="how-it-works" ref={sectionRef} className="relative py-24 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
      {/* Modern background with flowing lines */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-purple-600/5 to-pink-600/5 rounded-full blur-3xl"></div>
        
        {/* Flowing connection lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))' }}>
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <span className="text-blue-400 text-sm font-bold">🛠️ EENVOUDIG PROCES</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Van Idee tot
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Automatisering
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Volg deze eenvoudige stappen om je AI-aangedreven automatiseringssysteem te creëren en implementeren.
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
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl scale-110'
                      : index < currentStep
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:scale-105'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-30 animate-pulse"></div>
                  )}
                </button>
                
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-500 ${
                    index < currentStep 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : 'bg-gray-700/50'
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-lg">{currentStepData.number}</span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {currentStepData.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-lg text-gray-400 leading-relaxed">
                {currentStepData.description}
              </p>
              
              {/* Features in a modern card grid */}
              <div className="grid gap-3">
                {currentStepData.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3 p-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-lg hover:border-gray-600/50 transition-all">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-300 font-medium">
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
                      ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white hover:scale-105'
                  }`}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  <span>Vorige</span>
                </button>

                {currentStep === steps.length - 1 ? (
                  <Link href="/signup">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-green-600 to-green-700 text-white hover:scale-105 shadow-lg hover:shadow-xl hover:from-green-500 hover:to-green-600">
                      <span>Dat is het! Start nu →</span>
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={isAnimating}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span>Volgende</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Visual side */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                {/* Main visual card */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 shadow-2xl max-w-md">
                  <div className="text-center space-y-6">
                    <div className="text-6xl">{currentStepData.visual}</div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-300 text-sm font-semibold">Stap {currentStepData.number}</span>
                        </div>
                        <div className="text-white text-sm">{currentStepData.title}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {currentStepData.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="bg-gray-700/30 rounded p-2">
                            <div className="text-gray-300 text-xs">{feature}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements for visual enhancement */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-bounce shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sophie van der Berg",
      role: "Oprichter, TechStart Amsterdam",
      image: "https://i.pravatar.cc/150?img=1",
      content: "Met SiteAgent kunnen we onze klanten 24/7 ondersteunen zonder extra personeel. De automatisering werkt feilloos en onze klanttevredenheid is met 40% gestegen.",
      rating: 5
    },
    {
      name: "Marco Jansen",
      role: "Head of Customer Success, ScaleUp Rotterdam",
      image: "https://i.pravatar.cc/150?img=2", 
      content: "Binnen een week hadden we drie chatbots draaiend die onze meest voorkomende vragen beantwoorden. Het heeft ons team enorm ontlast en we kunnen ons nu focussen op complexere problemen.",
      rating: 5
    },
    {
      name: "Lisa de Vries",
      role: "E-commerce Manager, Fashion Forward",
      image: "https://i.pravatar.cc/150?img=3",
      content: "Onze conversiepercentages zijn met 25% gestegen sinds we SiteAgent gebruiken. Klanten krijgen direct antwoord op hun vragen, ook buiten kantooruren.",
      rating: 5
    }
  ];

  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-l from-purple-200/20 to-pink-200/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-full px-4 py-2 mb-6">
            <span className="text-green-600 text-sm font-bold">💬 KLANTVERHALEN</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Nederlandse bedrijven
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              vertrouwen op ons
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ontdek hoe Nederlandse ondernemers hun klantenservice transformeren met SiteAgent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section Component
function PricingSection() {
  const plans = [
    {
      name: "Gratis",
      price: "€0",
      period: "voor altijd",
      description: "Perfect om SiteAgent te verkennen",
      features: [
        "1 Chatbot",
        "100 berichten / maand",
        "1 MB data opslag",
        "3 websites scrapen",
        "Community support",
      ],
      highlight: false,
      cta: "Gratis Beginnen",
      href: "/signup",
      trial: false,
    },
    {
      name: "SiteAgent Starter",
      price: "€29.99",
      period: "maand",
      description: "Perfect voor kleine startups",
      features: [
        "1 Chatbot",
        "500 berichten / maand",
        "5 MB data opslag",
        "10 websites scrapen",
        "Essentiële integraties",
        "E-mail support",
      ],
      highlight: false,
      cta: "Proefperiode Starten",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Growth",
      price: "€149",
      period: "maand",
      description: "Populairste voor groeiende bedrijven",
      features: [
        "3 Chatbots",
        "3.000 berichten / maand",
        "25 MB data opslag",
        "25 websites scrapen",
        "Alle integraties",
        "Prioriteits support",
      ],
      highlight: true,
      cta: "Proefperiode Starten",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Pro",
      price: "€399",
      period: "maand",
      description: "Voor schaalbare bedrijven",
      features: [
        "10 Chatbots",
        "10.000 berichten / maand",
        "100 MB data opslag",
        "50 websites scrapen",
        "Alle integraties + Custom API",
        "Toegewezen & onboarding support",
      ],
      highlight: false,
      cta: "Proefperiode Starten",
      href: "/signup",
      trial: true,
    },
    {
      name: "Enterprise",
      price: "Laten we praten",
      period: "",
      description: "Enterprise oplossingen op maat",
      features: [
        "Onbeperkte Chatbots",
        "Aangepaste berichtlimieten",
        "Onbeperkt website scrapen",
        "Toegewezen opslag",
        "On-premise implementatie",
        "White-label oplossingen",
        "Prioriteits support & SLA",
        "Aangepaste integraties",
      ],
      highlight: false,
      cta: "Contact Verkoop",
      href: "/contact",
      trial: false,
    },
  ];

  return (
    <section id="pricing" className="relative bg-gray-900 py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-l from-purple-500/10 to-pink-500/10 rounded-full filter blur-3xl"></div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-green-500/30 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-xl px-6 py-3 mb-8">
            <span className="text-green-400 text-sm font-semibold tracking-wide">Transparante Prijzen</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Eenvoudige, transparante
            </span>
            <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mt-2">
              prijsstelling
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Begin gratis – upgrade wanneer je meer kracht nodig hebt. Geen verborgen kosten.
          </p>
        </div>
        
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
              {plan.highlight && (
                <span className="absolute -top-3 left-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg uppercase tracking-wider whitespace-nowrap">
                  Populairste
                </span>
              )}
              
              {plan.trial && (
                <span className="absolute -top-3 right-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-2 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                  14 dagen gratis
                </span>
              )}
              
              <div className={`absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                plan.highlight 
                  ? "bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"
                  : "bg-gradient-to-br from-gray-600/5 via-transparent to-gray-700/5"
              }`}></div>
              
              <div className="relative flex flex-col h-full">
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                    plan.highlight 
                      ? "text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text"
                      : "text-white group-hover:text-gray-200"
                  }`}>{plan.name}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{plan.description}</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 text-base mb-1">/{plan.period}</span>
                    )}
                  </div>
                  {plan.trial && (
                    <p className="text-green-400 text-xs mt-2 font-medium">
                      14 dagen gratis, dan altijd opzegbaar
                    </p>
                  )}
                </div>
                
                <div className="flex-grow mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link href={plan.href}>
                  <Button
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

// FAQ Section Component
function FaqSection() {
  const faqs = [
    {
      question: "Hoe snel kan ik mijn chatbot werkend hebben?",
      answer: "De meeste van onze klanten hebben hun chatbot binnen 5 minuten werkend. Upload gewoon je content, pas het uiterlijk aan en kopieer de integratiecode."
    },
    {
      question: "Heb ik technische kennis nodig om SiteAgent te gebruiken?", 
      answer: "Helemaal niet. SiteAgent is ontworpen om door iedereen gebruikt te kunnen worden, ongeacht hun technische niveau. De interface is intuïtief en het installatieproces is volledig visueel."
    },
    {
      question: "Welke soorten documenten kan ik uploaden?",
      answer: "We accepteren PDF's, Word-bestanden, platte tekst, website URL's, CSV-bestanden en meer. Ons systeem verwerkt automatisch elk type tekstinhoud."
    },
    {
      question: "Kan de chatbot meerdere talen aan?",
      answer: "Ja, onze chatbot heeft native ondersteuning voor meer dan 100 talen. Het kan automatisch de taal van de gebruiker detecteren en dienovereenkomstig reageren."
    },
    {
      question: "Hoe integreert het met mijn bestaande tools?",
      answer: "We bieden native integraties met HubSpot, Calendly, Shopify, Jira en meer dan 50 bedrijfstools. We hebben ook een open API voor aangepaste integraties."
    },
    {
      question: "Wat gebeurt er als ik mijn abonnement moet opzeggen?",
      answer: "Je kunt op elk moment opzeggen vanuit je dashboard. Er zijn geen boetes of opzegkosten. We bieden een volledige terugbetaling binnen de eerste 30 dagen."
    }
  ];

  return (
    <section id="faq" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-full px-4 py-2 mb-6">
            <span className="text-purple-600 text-sm font-bold">❓ VEELGESTELDE VRAGEN</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Veelgestelde Vragen
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Vind antwoorden op de meest voorkomende vragen over SiteAgent.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-gray-200 rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-800 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
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

// CTA Section Component
function CtaSection() {
  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300 rounded-full px-6 py-3">
            <span className="text-orange-600 text-sm font-bold">🚀 BEGIN VANDAAG</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Klaar om te
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Automatiseren?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Sluit je aan bij meer dan 10.000 bedrijven die hun klantenservice al automatiseren met AI. 
            <span className="font-semibold text-blue-600"> Geen complexe configuratie, geen technische kennis vereist.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link href="/signup" className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-300/50 flex items-center gap-3">
              <span>Nu Gratis Beginnen</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="#live-demo" className="border-2 border-gray-400 text-gray-700 bg-white/80 px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:border-gray-500 hover:text-gray-800 hover:bg-white flex items-center gap-3 shadow-lg">
              <span>Bekijk Eerst Demo</span>
              <span>👀</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 bg-white/80 border border-gray-200 rounded-xl px-6 py-4 shadow-md">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">14 dagen gratis</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/80 border border-gray-200 rounded-xl px-6 py-4 shadow-md">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Geen creditcard vereist</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/80 border border-gray-200 rounded-xl px-6 py-4 shadow-md">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Altijd opzegbaar</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gradient-to-b from-purple-50 to-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={32} height={32} />
              <span className="text-xl font-bold text-gray-800">SiteAgent</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Automatiseer je klantenservice met slimme chatbots aangedreven door AI. Eenvoudig, snel en effectief.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Functionaliteiten</Link></li>
              <li><Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Prijzen</Link></li>
              <li><Link href="/tools/token-counter" className="text-gray-600 hover:text-blue-600 transition-colors">AI Token Teller</Link></li>
              <li><Link href="/tools/meta-prompt-generator" className="text-gray-600 hover:text-blue-600 transition-colors">AI Meta Prompt Generator</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Integraties</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Bedrijf</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">Over ons</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-blue-600 transition-colors">Carrières</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Helpcentrum</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentatie</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Systeemstatus</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Community</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            © 2024 SiteAgent. Alle rechten voorbehouden.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Voorwaarden</Link>
            <Link href="/security" className="text-gray-600 hover:text-blue-600 transition-colors">Beveiliging</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function DutchLandingPageClient() {
  return (
    <>
      <HowDemoWorksSection />
      <LiveDemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
      <CookieBanner />
    </>
  );
} 
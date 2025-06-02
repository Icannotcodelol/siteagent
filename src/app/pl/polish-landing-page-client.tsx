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

interface PolishLandingPageClientProps {
  authButtonSlot: React.ReactNode;
}

// ============= UTILITY FUNCTIONS =============

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

// ============= LANDING PAGE COMPONENTS =============

// Mouse Follower Component (using bright blue colors)
function MouseFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      const computedStyle = window.getComputedStyle(target);
      setIsPointer(computedStyle.cursor === "pointer");
      setIsHidden(false);
    };

    const handleMouseLeave = () => {
      setIsHidden(true);
    };

    const handleMouseEnter = () => {
      setIsHidden(false);
    };

    window.addEventListener("mousemove", updatePosition);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <div
        className={`pointer-events-none fixed z-50 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 transition-all duration-100 ${
          isHidden ? "opacity-0" : "opacity-100"
        } ${isPointer ? "scale-150" : "scale-100"}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transitionProperty: "opacity, transform, width, height",
        }}
      ></div>
      <div
        className={`pointer-events-none fixed z-50 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-75 ${
          isHidden ? "opacity-0" : "opacity-100"
        } ${isPointer ? "scale-0" : "scale-100"}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transitionProperty: "opacity, transform",
        }}
      ></div>
    </>
  );
}

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
                <span className="text-orange-600 text-sm font-bold">⚡ NATYCHMIASTOWE</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Od Przesyłania do
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Automatyzacji AI
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Zobacz jak Twoje statyczne treści przekształcają się w inteligentny system automatyzacji w czasie rzeczywistym. Bez skomplikowanej konfiguracji, bez wiedzy technicznej.
              </p>
            </div>

            {/* Process steps in a modern card layout */}
            <div className="space-y-4">
              {[
                { step: "01", title: "Prześlij Zawartość", desc: "Prześlij dokument, wklej tekst lub wprowadź URL strony" },
                { step: "02", title: "Przetwarzanie AI", desc: "Nasze AI automatycznie analizuje i strukturyzuje Twoje treści" },
                { step: "03", title: "Zacznij Automatyzować", desc: "Twój inteligentny asystent jest gotowy do obsługi rzeczywistych zadań" }
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
                  <span className="text-gray-600 text-sm ml-4">Interfejs Demo Na Żywo</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <div className="text-blue-700 text-sm font-semibold mb-2">🌐 Wklej URL lub Prześlij Dokumenty</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                    <div className="text-purple-700 text-sm font-semibold mb-2">🧠 Przetwarzanie AI</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-purple-700 text-xs ml-2">Analizowanie treści...</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <div className="text-green-700 text-sm font-semibold mb-2">✅ Gotowy do Automatyzacji</div>
                    <div className="text-green-700 text-xs">Twój asystent AI jest aktywny i gotowy do działania!</div>
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
            <span className="text-purple-600 text-sm font-medium">🥇 Unikalne Doświadczenie Interaktywne</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Żadne Zwykłe Demo Chatbota—
            <span className="block text-purple-600">Jedyne Które Naprawdę Działa</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Konkurenci pokazują fałszywe przykłady; my pokazujemy Twoje prawdziwe treści. Odkryj natychmiast, jak SiteAgent automatyzuje prawdziwe zadania, takie jak umówienie spotkań, aktualizacja CRM i wiele więcej.
          </p>
          
          {/* Social proof about demo */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto mb-8 shadow-lg">
            <div className="flex items-center justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current text-yellow-500 mx-0.5" />
              ))}
            </div>
            <blockquote className="text-gray-700 text-lg italic mb-3">
              "Demo natychmiast nas przekonało. Zobaczyć SiteAgent automatyzujący nasze interakcje z klientami w czasie rzeczywistym było niezwykłe."
            </blockquote>
            <p className="text-gray-500 text-sm">— Zweryfikowany beta tester</p>
          </div>
        </div>

        {/* Demo container with enhanced styling */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-blue-200/40 rounded-3xl blur-xl opacity-50"></div>
          
          {/* Demo content */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl">
            <LivePreview locale="pl" />
          </div>
        </div>

        {/* Visual demo preview teaser */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm mb-4">
            💡 Zobacz jak SiteAgent natychmiast przekształca Twoje treści w interaktywne doświadczenie AI
          </p>
          <div className="inline-flex items-center text-blue-600 text-sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Prawdziwe automatyzacje w 60 sekund</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section - Polish translation with bright theme
function FeaturesSection() {
  const primaryFeatures = [
    { 
      img: "/icons/AI CHATBOT ICON.svg", 
      title: "70% mniej kosztów obsługi klienta", 
      description: "Rutynowe zapytania są obsługiwane automatycznie, pozwalając Twojemu zespołowi skupić się na złożonych problemach wymagających ludzkiej ekspertyzy.",
      stat: "70% redukcja kosztów"
    },
    { 
      img: "/icons/Website Embedding.svg", 
      title: "Wystarczy URL Twojej strony", 
      description: "Żadnych dokumentów do przygotowania! Po prostu wklej URL swojej strony, a natychmiast stworzymy eksperta chatbota ze wszystkich istniejących treści - idealnie dla zapracowanych zespołów.",
      stat: "0 czasu konfiguracji"
    },
    { 
      img: "/icons/External API Actions.svg", 
      title: "Z odwiedzających w klientów", 
      description: "Umów spotkania, aktualizuj CRM, twórz zgłoszenia wsparcia - każda rozmowa staje się okazją biznesową.",
      stat: "3x więcej konwersji"
    }
  ];

  const secondaryFeatures = [
    { 
      img: "/icons/Document Knowledge Base.svg", 
      title: "Wiedza ekspercka zawsze dostępna", 
      description: "Prześlij dokumenty raz i od razu otrzymuj precyzyjne, trafne odpowiedzi - jak posiadanie najlepszego eksperta dostępnego 24/7."
    },
    { 
      img: "/icons/Powerful Analytics.svg", 
      title: "Mierzalny sukces biznesowy", 
      description: "Monitoruj generowanie leadów, zadowolenie klientów i oszczędności kosztów dzięki szczegółowym analizom pokazującym ROI czarno na białym."
    },
    { 
      img: "/icons/Enterprise Security.svg", 
      title: "Bezpieczeństwo klasy bankowej", 
      description: "Wdrażaj z ufnością dzięki szyfrowaniu na poziomie bankowym, funkcjom zgodności i kontroli dostępu opartej na rolach."
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
                <span className="text-green-600 text-sm font-bold tracking-wide">PRAWDZIWE REZULTATY</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black leading-none">
                <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                  Koniec gadania.
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Czas na poważne działanie.
                </span>
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl text-gray-600 leading-relaxed">
                Przekształć swoją stronę internetową z broszury w maszynę generującą przychody działającą 24 godziny na dobę.
              </p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 text-sm font-semibold">70% Redukcja Kosztów</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-600 text-sm font-semibold">Konfiguracja w 5 Min</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-600 text-sm font-semibold">Automatyzacja 24/7</span>
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
              Gotowy zobaczyć te funkcje w działaniu?
            </h3>
            <p className="text-gray-600 mb-6">
              Wypróbuj nasze demo na żywo - nie trzeba rejestracji, zobacz rezultaty w 60 sekund.
            </p>
            <Link href="#live-demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg">
              <span>🚀 Wypróbuj Demo Na Żywo</span>
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
      title: "Skonfiguruj chatbota", 
      description: "Prześlij dokumenty, wklej URL strony lub po prostu wprowadź tekst. AI automatycznie przeanalizuje i strukturyzuje Twoją zawartość.",
      action: "Przeciągnij i upuść dokumenty lub wklej URL",
      visual: "📄"
    },
    { 
      number: "02", 
      title: "AI trenuje asystenta", 
      description: "Nasze zaawansowane systemy AI przetwarzają Twoją zawartość i tworzą inteligentnego asystenta dostosowanego do Twojej marki.",
      action: "AI analizuje i uczy się z Twojej zawartości",
      visual: "🧠"
    },
    { 
      number: "03", 
      title: "Osadź i automatyzuj", 
      description: "Skopiuj prosty kod i wklej go na swoją stronę. Twój asystent AI zaczyna natychmiast automatyzować zadania i angażować odwiedzających.",
      action: "Jedna linia kodu - natychmiastowa automatyzacja",
      visual: "🚀"
    }
  ];

  const nextStep = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentStep((prev) => (prev + 1) % steps.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevStep = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToStep = (stepIndex: number) => {
    if (isAnimating || stepIndex === currentStep) return;
    setIsAnimating(true);
    setCurrentStep(stepIndex);
    setTimeout(() => setIsAnimating(false), 300);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextStep();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <section className="relative py-24 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-full px-4 py-2 mb-6">
            <Layers className="h-4 w-4 text-blue-600" />
            <span className="text-blue-600 text-sm font-bold tracking-wide">JAK TO DZIAŁA</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Trzy kroki do automatyzacji AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Od przesłania zawartości do w pełni funkcjonalnego asystenta AI w mniej niż 5 minut
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left side - Step controls */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`group cursor-pointer transition-all duration-300 ${
                  index === currentStep 
                    ? 'scale-105' 
                    : 'hover:scale-102'
                }`}
                onClick={() => goToStep(index)}
              >
                <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-300 shadow-xl'
                    : 'bg-white/80 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                      index === currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110'
                        : 'bg-gray-400'
                    }`}>
                      {step.number}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                        index === currentStep ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        index === currentStep ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                      <div className={`mt-3 text-xs font-semibold transition-all duration-300 ${
                        index === currentStep 
                          ? 'text-blue-600 opacity-100' 
                          : 'text-gray-400 opacity-70'
                      }`}>
                        {step.action}
                      </div>
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {index === currentStep && (
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right side - Visual demonstration */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-white to-blue-50 border border-gray-200 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-pulse">
                  {steps[currentStep].visual}
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">
                  {steps[currentStep].title}
                </h4>
                <p className="text-gray-600">
                  {steps[currentStep].action}
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mt-8">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'bg-blue-500 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => goToStep(index)}
                  />
                ))}
              </div>
              
              {/* Navigation arrows */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isAnimating}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span className="text-sm">Poprzedni</span>
                </button>
                
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isAnimating}
                >
                  <span className="text-sm">Następny</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PolishLandingPageClient({ authButtonSlot }: PolishLandingPageClientProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-800">
      <MouseFollower />
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

function IntegrationEcosystemSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ekosystem Integracji
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Połącz się z narzędziami, których już używasz, aby automatyzować prawdziwe przepływy pracy
          </p>
        </div>
        <div className="mt-12">
          <IntegrationsBar locale="pl" />
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { quote: "SiteAgent przekształcił naszą obsługę klienta. Nasz chatbot obsługuje 70% zapytań automatycznie, oszczędzając nam cenne godziny." },
    { quote: "Możliwość połączenia naszego chatbota z naszym CRM i narzędziami do planowania była przełomowa. To jak dodatkowy członek zespołu." },
    { quote: "Przesłaliśmy dokumentację naszego produktu i w ciągu kilku minut mieliśmy chatbota, który mógł dokładnie odpowiadać na pytania techniczne. Imponujące!" },
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
            <span className="text-yellow-600 text-sm font-semibold tracking-wide">Historie Klientów</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Cenione przez Innowacyjne
            </span>
            <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
              Firmy
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">Sprawdź, co nasi klienci mówią o SiteAgent.</p>
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

function PricingSection() {
  const plans = [
    {
      name: "Darmowy",
      price: "€0",
      period: "na zawsze",
      description: "Idealny do eksploracji SiteAgent",
      features: [
        "1 Chatbot",
        "100 wiadomości /miesiąc",
        "1 MB przechowywania danych",
        "Tylko ręczne przesyłanie",
        "Wsparcie społeczności",
      ],
      highlight: false,
      cta: "Zacznij Za Darmo",
      href: "/signup",
      trial: false,
    },
    {
      name: "SiteAgent Starter",
      price: "€29.99",
      period: "/miesiąc",
      description: "Idealny dla małych startupów",
      features: [
        "1 Chatbot",
        "500 wiadomości /miesiąc",
        "5 MB przechowywania danych",
        "Skrapowanie 1 strony",
        "Podstawowe integracje",
        "Wsparcie email",
      ],
      highlight: false,
      cta: "Rozpocznij Darmowy Trial",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Growth",
      price: "€149",
      period: "/miesiąc",
      description: "Najpopularniejszy dla rozwijających się firm",
      features: [
        "3 Chatboty",
        "3.000 wiadomości /miesiąc",
        "25 MB przechowywania danych",
        "Skrapowanie 5 stron",
        "Wszystkie integracje",
        "Wsparcie priorytetowe",
      ],
      highlight: true,
      cta: "Rozpocznij Darmowy Trial",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Pro",
      price: "€399",
      period: "/miesiąc",
      description: "Dla rozwijających się firm",
      features: [
        "10 Chatbotów",
        "10.000 wiadomości /miesiąc",
        "100 MB przechowywania danych",
        "Skrapowanie 20 stron",
        "Wszystkie integracje + API",
        "Dedykowane wsparcie",
      ],
      highlight: false,
      cta: "Rozpocznij Darmowy Trial",
      href: "/signup",
      trial: true,
    },
    {
      name: "Enterprise",
      price: "Porozmawiajmy",
      period: "",
      description: "Rozwiązania enterprise dostosowane do Twoich potrzeb",
      features: [
        "Nieograniczone chatboty",
        "Niestandardowe limity wiadomości",
        "Nieograniczone skrapowanie",
        "Dedykowane przechowywanie",
        "Wdrożenie on-premise",
        "Rozwiązania white-label",
        "Wsparcie priorytetowe + SLA",
        "Niestandardowe integracje",
      ],
      highlight: false,
      cta: "Skontaktuj się ze Sprzedażą",
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
            <span className="text-blue-600 text-sm font-semibold tracking-wide">PRZEJRZYSTE CENY</span>
          </div>
          
          <h2 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-800">
            Wybierz Swój Plan
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Proste i przejrzyste ceny dla każdego etapu Twojej podróży
          </p>
        </div>

        {/* Pricing grid */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-5">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`group relative rounded-3xl bg-white border p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 min-h-[550px] flex flex-col justify-between ${
                plan.highlight
                  ? "border-blue-400 bg-gradient-to-br from-white to-blue-50 scale-105 shadow-2xl"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 text-sm font-bold text-white shadow-lg">
                    Najpopularniejszy
                  </div>
                </div>
              )}

              <div className="flex flex-col flex-1">
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-gray-800">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-gray-800">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 text-xs">{plan.period}</span>}
                  </div>
                  <p className="mt-1 text-xs text-gray-600 leading-tight">{plan.description}</p>
                </div>

                <ul className="space-y-1.5 flex-1 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-600 leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <Link href={plan.href}>
                  <Button
                    className={`w-full py-2 text-xs font-semibold transition-all duration-300 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105"
                        : "border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                {plan.trial && (
                  <p className="text-center text-xs text-gray-500 mt-1.5">
                    14 dni darmowego triala
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Wszystkie plany obejmują 14 dni darmowego triala. Nie jest wymagana karta kredytowa.
          </p>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    { question: "Czy potrzebuję wiedzy technicznej, żeby korzystać z SiteAgent?", answer: "Nie, SiteAgent jest zaprojektowany tak, aby był przyjazny dla użytkownika nawet dla osób nietechnicznych. Nasz intuicyjny interfejs umożliwia tworzenie i wdrażanie chatbotów bez wiedzy programistycznej. Dla bardziej zaawansowanych dostosowań wiedza techniczna może być pomocna, ale nie jest wymagana." },
    { question: "Jak działa baza wiedzy dokumentów?", answer: "SiteAgent wykorzystuje technologię Retrieval Augmented Generation (RAG). Przesyłasz dokumenty (PDF, DOCX, itp.) na naszą platformę, a my je przetwarzamy, aby stworzyć embeddings. Gdy użytkownik zadaje pytanie, nasz system pobiera najbardziej istotne informacje z Twoich dokumentów i używa ich do generowania dokładnych odpowiedzi." },
    { question: "Czy mogę połączyć mojego chatbota z istniejącymi narzędziami?", answer: "Tak! SiteAgent obsługuje integracje z wieloma popularnymi usługami trzecich stron poprzez naszą funkcję Actions. Możesz połączyć się z narzędziami takimi jak Calendly, HubSpot, Jira, Shopify i innymi. To pozwala Twojemu chatbotowi wykonywać zadania takie jak planowanie spotkań, aktualizowanie danych CRM lub tworzenie zgłoszeń." },
    { question: "Jak osadzić chatbota na mojej stronie internetowej?", answer: "Po utworzeniu chatbota otrzymasz prosty fragment kodu JavaScript do dodania na Twojej stronie internetowej. Wystarczy wkleić ten kod do HTML-a Twojej strony, a chatbot się pojawi. Możesz dostosować wygląd i pozycję widgetu chatbota, aby pasował do projektu Twojej strony." },
    { question: "Czy istnieje limit liczby wiadomości, które może obsłużyć mój chatbot?", answer: "Każdy plan cenowy ma określony miesięczny limit wiadomości. Plan Starter obejmuje 5.000 wiadomości miesięcznie, plan Professional obejmuje 25.000 wiadomości, a plan Enterprise oferuje nieograniczone wiadomości. Jeśli przekroczysz swój limit, dodatkowe wiadomości są rozliczane według stawki za wiadomość." },
    { question: "Jak bezpieczne są moje dane w SiteAgent?", answer: "Poważnie traktujemy bezpieczeństwo. Wszystkie dane są szyfrowane zarówno w tranzycie, jak i w spoczynku. Używamy standardowych praktyk bezpieczeństwa branżowego i regularnie przechodzimy audyty bezpieczeństwa. Dla klientów Enterprise oferujemy dodatkowe funkcje bezpieczeństwa, takie jak SSO, kontrola dostępu oparta na rolach i niestandardowe zasady przechowywania danych." },
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
            Często Zadawane Pytania
          </h2>
          <p className="mt-4 text-lg text-gray-600">Znajdź odpowiedzi na popularne pytania o SiteAgent.</p>
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
              Przekształć swoje treści w
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                {" "}prawdziwą moc AI
              </span>
            </h2>
            
            {/* Enhanced description */}
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Dołącz do tysięcy firm, które już oszczędzają 70% kosztów wsparcia i zwiększają zadowolenie klientów.
            </p>
            
            {/* Enhanced button group */}
            <div className="flex flex-col items-center justify-center space-y-6 sm:flex-row sm:space-x-8 sm:space-y-0">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="group relative h-16 overflow-hidden bg-white text-blue-700 px-10 text-xl font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95"
                >
                  <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1">
                    Zacznij Za Darmo
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
                    Skontaktuj się ze Sprzedażą
                    <ArrowRight className="ml-3 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </span>
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-blue-100/80">
              <div className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">Bezpieczeństwo Enterprise</span>
              </div>
              <div className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">Konfiguracja w Minutach</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">14 Dni Darmowego Triala</span>
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
            <Link href="/pl" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 transition-all duration-300 group-hover:bg-blue-500">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                SiteAgent
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 transition-colors duration-300 hover:text-gray-700">
              Buduj, wdrażaj i zarządzaj chatbotami napędzanymi przez AI, które integrują się z Twoimi narzędziami i danymi.
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
            { title: "Produkt", links: [{ label: "Funkcje", href: "#features" }, { label: "Cennik", href: "#pricing" }, { label: "Dokumentacja", href: "/docs" }, { label: "Historia Zmian", href: "/changelog" }] },
            { title: "Firma", links: [{ label: "O Nas", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Kariera", href: "/careers" }, { label: "Kontakt", href: "/contact" }] },
            { title: "Prawne", links: [{ label: "Polityka Prywatności", href: "/privacy" }, { label: "Warunki Usługi", href: "/terms" }, { label: "Bezpieczeństwo", href: "/security" }] },
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
            &copy; {new Date().getFullYear()} SiteAgent. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
} 
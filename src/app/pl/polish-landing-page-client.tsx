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
  CheckCircle,
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

// Mouse Follower Component
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
        className={`pointer-events-none fixed z-50 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 transition-all duration-100 ${
          isHidden ? "opacity-0" : "opacity-100"
        } ${isPointer ? "scale-150" : "scale-100"}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transitionProperty: "opacity, transform, width, height",
        }}
      ></div>
      <div
        className={`pointer-events-none fixed z-50 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 transition-all duration-75 ${
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

// Navbar Component - Bright Polish Design
function Navbar({ authButtonSlot }: { authButtonSlot: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300 ${
        scrolled ? "border-blue-200/50 bg-white/95 supports-[backdrop-filter]:bg-white/80 shadow-sm" : "border-transparent bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/pl" className="group flex items-center gap-2">
            <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={40} height={40} priority />
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {["Funkcje", "Jak to działa", "Cennik", "FAQ"].map((item, index) => {
            const hrefs = ["#features", "#how-it-works", "#pricing", "#faq"];
            return (
              <Link
                key={item}
                href={hrefs[index]}
                className="relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          {authButtonSlot}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col p-4 space-y-2">
            {["Funkcje", "Jak to działa", "Cennik", "FAQ"].map((item, index) => {
              const hrefs = ["#features", "#how-it-works", "#pricing", "#faq"];
              return (
                <Link
                  key={item}
                  href={hrefs[index]}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {item}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-200">
              {authButtonSlot}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// Hero Section Component - Bright Polish Design
function HeroSection() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGetStarted = async () => {
    const element = document.getElementById('live-demo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Bright animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles */}
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
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
          {/* Live demo badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 text-sm font-bold tracking-wide">DEMO NA ŻYWO</span>
            </div>
            <div className="w-px h-4 bg-gray-400"></div>
            <span className="text-gray-700 text-sm">Wypróbuj teraz - Bez rejestracji!</span>
          </div>

          <div className="space-y-6 max-w-6xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
              <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                Inteligentne Chatboty.
              </div>
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative">
                Błyskawiczne
                <div className="absolute -right-4 top-0">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Przekształć swoje dokumenty w inteligentne chatboty i zintegruj je ze swoją stroną w mniej niż 5 minut.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={handleGetStarted}
              className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-6 text-lg font-bold hover:scale-105 transition-all hover:shadow-xl hover:shadow-blue-300/50 rounded-xl"
            >
              <span className="flex items-center gap-3">
                🚀 Uruchom Demo
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
              </span>
            </Button>
            
            <Button 
              asChild
              variant="outline" 
              className="border-2 border-gray-300 text-gray-700 bg-white/80 px-8 py-6 text-lg font-bold hover:border-gray-400 hover:text-gray-800 hover:bg-white rounded-xl shadow-lg"
            >
              <Link href="/signup" className="flex items-center gap-3">
                <span>Zacznij za Darmo</span>
                <span className="text-green-500">✓</span>
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded border border-green-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded"></div>
              </div>
              <span>Bezpieczeństwo Enterprise</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded"></div>
              </div>
              <span>Konfiguracja w 5 Minut</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 rounded border border-purple-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-500 rounded"></div>
              </div>
              <span>14 Dni Bezpłatnego Testu</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// How Demo Works Section Component - Bright Polish Design
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
                <span className="text-orange-600 text-sm font-bold">⚡ BŁYSKAWICZNE</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Od Dokumentu do
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

            {/* Process steps */}
            <div className="space-y-4">
              {[
                { step: "01", title: "Wklej swój URL", desc: "Prześlij dowolny dokument, wklej tekst lub wprowadź URL strony internetowej" },
                { step: "02", title: "Porozmawiaj z AI", desc: "Nasza AI automatycznie analizuje i strukturyzuje Twoje treści" },
                { step: "03", title: "Zobacz automatyzację", desc: "Twój inteligentny asystent jest gotowy do obsługi rzeczywistych zadań" }
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
                  <span className="text-gray-600 text-sm ml-4">Interfejs Demo Live</span>
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

// Live Demo Section Component - Bright Polish Design
function LiveDemoSection() {
  return (
    <section id="live-demo" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
      
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-full px-4 py-2">
            <span className="text-green-600 text-sm font-bold">🎯 DEMO NA ŻYWO</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Wypróbuj
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Natychmiast
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Prześlij dowolny dokument lub wklej URL swojej strony. Zobacz, jak AI natychmiast tworzy inteligentnego asystenta, który może automatyzować prawdziwe zadania.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <LivePreview locale="pl" />
        </div>
      </div>
    </section>
  );
}

// Features Section Component - Bright Polish Design
function FeaturesSection() {
  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "Inteligentne Chatboty",
      description: "Automatycznie tworzone z Twoich dokumentów i treści strony internetowej w kilka sekund.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Przetwarzanie Dokumentów",
      description: "Obsługuje PDF, CSV, TXT i bezpośrednio pobiera treści ze stron internetowych.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Natychmiastowa Integracja",
      description: "Osadzaj chatboty na swojej stronie jedną linią kodu. Brak programowania wymagane.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Wsparcie Wielojęzyczne",
      description: "Automatycznie obsługuj klientów w ich preferowanym języku z globalnym wsparciem AI.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Bezpieczeństwo Enterprise",
      description: "Szyfrowanie klasy przedsiębiorstwa z prywatnymi wdrożeniami dla środowisk korporacyjnych.",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Automatyzacja AI",
      description: "Idź poza chatboty - umawiaj spotkania, aktualizuj CRM i automatyzuj przepływy pracy.",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section id="features" className="relative py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-gradient-to-l from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-full px-4 py-2">
            <span className="text-blue-600 text-sm font-bold">✨ FUNKCJE</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Wszystko Czego
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Potrzebujesz
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kompleksowa platforma do tworzenia, wdrażania i zarządzania inteligentnymi asystentami AI dla Twojej firmy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-8 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-xl transition-all duration-300">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section Component - Bright Polish Design  
function HowItWorksSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextStep = () => {
    if (currentStep < 2) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex !== currentStep) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const steps = [
    {
      step: 1,
      title: "Prześlij Swoje Treści",
      description: "Zacznij od przesłania dokumentów, wprowadzenia URL strony lub wklejenia tekstu. Obsługujemy PDF, TXT, CSV i bezpośrednie pobieranie ze stron.",
      visual: (
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 border border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-300 shadow-sm">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-gray-700 font-medium">Dokument.pdf</span>
              <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-purple-300 shadow-sm">
              <Globe className="h-6 w-6 text-purple-600" />
              <span className="text-gray-700 font-medium">https://twojastrona.pl</span>
              <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
            </div>
          </div>
        </div>
      )
    },
    {
      step: 2,
      title: "AI Analizuje i Uczy Się",
      description: "Nasza zaawansowana AI przetwarza Twoje treści, rozumie kontekst i automatycznie tworzy bazę wiedzy gotową do inteligentnych interakcji.",
      visual: (
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 border border-purple-200">
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-purple-300">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-purple-700 text-sm font-medium">AI Analizuje...</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 bg-white rounded border border-purple-300"
                    style={{
                      background: i < 6 ? 'linear-gradient(90deg, #8b5cf6, #a855f7)' : '#e5e7eb',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      step: 3,
      title: "Wdrażaj i Automatyzuj",
      description: "Osadź swojego inteligentnego asystenta na stronie jedną linią kodu. Zacznij automatyzować obsługę klienta, umawianie spotkań i więcej.",
      visual: (
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 border border-green-200">
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
              <div>{'<script src="siteagent.js"></script>'}</div>
              <div className="text-blue-400">{'// Gotowe! Twój AI jest aktywny'}</div>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white rounded-lg p-4 border border-green-300">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">Asystent AI Aktywny</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-purple-50 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent"></div>
        <div className="absolute bottom-1/4 right-0 w-full h-px bg-gradient-to-l from-transparent via-blue-300/40 to-transparent"></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-full px-4 py-2">
            <span className="text-purple-600 text-sm font-bold">🚀 JAK TO DZIAŁA</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Trzy Proste
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Kroki
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Od przesłania treści do w pełni funkcjonalnego asystenta AI w mniej niż 5 minut. Żadne kodowanie nie jest wymagane.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Step indicators */}
          <div className="flex justify-center items-center space-x-8 mb-12">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                    index === currentStep
                      ? 'border-purple-500 bg-purple-500 text-white shadow-lg'
                      : index < currentStep
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400 hover:border-purple-300'
                  }`}
                >
                  {index < currentStep ? <Check className="h-6 w-6" /> : step.step}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 rounded-full transition-all ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Current step content */}
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-full px-4 py-2">
                    <span className="text-purple-600 text-sm font-bold">KROK {steps[currentStep].step}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="border-gray-300 disabled:opacity-50"
                  >
                    Poprzedni
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={currentStep === 2}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50"
                  >
                    {currentStep === 2 ? 'Gotowe!' : 'Następny'}
                  </Button>
                </div>
              </div>

              <div className="relative">
                {steps[currentStep].visual}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Integration Ecosystem Section Component - Bright Polish Design
function IntegrationEcosystemSection() {
  const integrations = [
    { name: "HubSpot", logo: "/integrations/hubspot.png", category: "CRM" },
    { name: "Calendly", logo: "/integrations/calendly.png", category: "Planowanie" },
    { name: "Jira", logo: "/integrations/jira.png", category: "Zarządzanie projektami" },
    { name: "Monday.com", logo: "/integrations/monday.png", category: "Workflow" },
    { name: "Shopify", logo: "/integrations/shopify.png", category: "E-commerce" },
    { name: "Slack", logo: "/integrations/slack.png", category: "Komunikacja" },
  ];

  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-full px-4 py-2">
            <span className="text-green-600 text-sm font-bold">🔌 INTEGRACJE</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Połącz z
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Twoimi Narzędziami
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Zintegruj swoje asystenty AI z ulubionymi narzędziami i automatyzuj całe przepływy pracy.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {integrations.map((integration, index) => (
            <div key={index} className="group text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-white border border-gray-200 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:border-gray-300 transition-all">
                <Image src={integration.logo} alt={integration.name} width={40} height={40} />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{integration.name}</div>
                <div className="text-sm text-gray-500">{integration.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section Component - Bright Polish Design
function TestimonialsSection() {
  const testimonials = [
    {
      content: "SiteAgent zrewolucjonizował naszą obsługę klienta. Nasz asystent AI obsługuje 80% zapytań automatycznie, a zespół może skupić się na złożonych problemach.",
      author: "Anna Kowalska",
      role: "Dyrektor ds. Obsługi Klienta",
      company: "TechSolutions Polska",
      avatar: "/avatars/avatar-1.jpg"
    },
    {
      content: "Implementacja była niesamowicie prosta. W 10 minut miałem działającego chatbota na mojej stronie e-commerce, który już generuje leady i odpowiada na pytania produktowe.",
      author: "Marek Nowak",
      role: "Założyciel",
      company: "DigitalStore.pl",
      avatar: "/avatars/avatar-2.jpg"
    },
    {
      content: "Integracja z HubSpot jest bezszwowa. Nasz asystent AI automatycznie aktualizuje kontakty i umawia spotkania. To oszczędza nam godziny codziennie.",
      author: "Katarzyna Wiśniewska",
      role: "Head of Sales",
      company: "GrowthCorp",
      avatar: "/avatars/avatar-3.jpg"
    }
  ];

  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-full px-4 py-2">
            <span className="text-yellow-600 text-sm font-bold">💬 OPINIE</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Zaufało Nam
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Tysiące Firm
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all">
              <div className="space-y-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section Component - Bright Polish Design
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "99",
      currency: "zł",
      period: "/miesiąc",
      description: "Idealny dla małych firm i startupów",
      features: [
        "1 chatbot",
        "10,000 wiadomości/miesiąc",
        "Obsługa dokumentów PDF, TXT",
        "Podstawowe integracje",
        "Email support",
        "Osadzanie na stronie"
      ],
      cta: "Rozpocznij darmowy trial",
      popular: false,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Professional",
      price: "299",
      currency: "zł",
      period: "/miesiąc",
      description: "Dla rozwijających się firm",
      features: [
        "5 chatbotów",
        "50,000 wiadomości/miesiąc",
        "Wszystkie formaty dokumentów",
        "Zaawansowane integracje (HubSpot, Calendly)",
        "Priorytetowe wsparcie",
        "Niestandardowy branding",
        "Analityka i raporty",
        "API access"
      ],
      cta: "Rozpocznij darmowy trial",
      popular: true,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Enterprise",
      price: "Na zapytanie",
      currency: "",
      period: "",
      description: "Dla dużych organizacji",
      features: [
        "Nieograniczone chatboty",
        "Nieograniczone wiadomości",
        "Dedykowane wdrożenie",
        "Niestandardowe integracje",
        "24/7 premium support",
        "SLA gwarancje",
        "Single Sign-On (SSO)",
        "Compliance (GDPR, SOC2)"
      ],
      cta: "Skontaktuj się z nami",
      popular: false,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section id="pricing" className="relative py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-full px-4 py-2">
            <span className="text-blue-600 text-sm font-bold">💰 CENNIK</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Proste
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Ceny
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Wybierz plan idealny dla Twojej firmy. Wszystkie plany obejmują 14-dniowy darmowy okres próbny.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative p-8 bg-white rounded-2xl border-2 transition-all hover:shadow-xl ${
              plan.popular ? 'border-purple-300 shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Najpopularniejszy
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <div className="text-center">
                  {plan.price === "Na zapytanie" ? (
                    <div className="text-3xl font-bold text-gray-800">Na zapytanie</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-gray-800">
                        {plan.currency}{plan.price}
                        <span className="text-lg text-gray-600">{plan.period}</span>
                      </div>
                      <div className="text-sm text-gray-500">+ VAT</div>
                    </div>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild
                  className={`w-full py-3 font-semibold transition-all ${
                    plan.popular 
                      ? `bg-gradient-to-r ${plan.gradient} text-white hover:scale-105` 
                      : 'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Link href={plan.price === "Na zapytanie" ? "/contact" : "/signup"}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-600">
            Wszystkie plany obejmują 14-dniowy darmowy okres próbny. Brak opłat za konfigurację.
          </p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <span>✓ Anuluj w każdej chwili</span>
            <span>✓ Bez zobowiązań</span>
            <span>✓ 24/7 wsparcie</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// FAQ Section Component - Bright Polish Design
function FaqSection() {
  const faqs = [
    {
      question: "Jak szybko mogę skonfigurować chatbota?",
      answer: "Większość chatbotów jest gotowa w mniej niż 5 minut. Po prostu prześlij swoje dokumenty lub podaj URL strony, a nasza AI automatycznie stworzy inteligentnego asystenta gotowego do odpowiadania na pytania."
    },
    {
      question: "Jakie formaty dokumentów są obsługiwane?",
      answer: "Obsługujemy wszystkie popularne formaty: PDF, TXT, CSV, DOC, DOCX. Możesz także bezpośrednio podać URL strony internetowej, a my automatycznie wyodrębnimy treść."
    },
    {
      question: "Czy mogę zintegrować chatbota z moimi istniejącymi narzędziami?",
      answer: "Tak! Oferujemy integracje z popularnymi narzędziami jak HubSpot, Calendly, Jira, Monday.com i wieloma innymi. Chatbot może automatycznie aktualizować CRM, umawiać spotkania i wykonywać inne zadania."
    },
    {
      question: "Czy moje dane są bezpieczne?",
      answer: "Absolutnie. Używamy szyfrowania klasy enterprise, wszystkie dane są przechowywane bezpiecznie, a dla firm oferujemy prywatne wdrożenia z pełną kontrolą nad danymi."
    },
    {
      question: "Czy mogę dostosować wygląd chatbota?",
      answer: "Tak, możesz w pełni dostosować wygląd chatbota do marki Twojej firmy - kolory, logo, komunikaty powitalny i więcej. W planach Professional i Enterprise masz pełną kontrolę nad brandingiem."
    },
    {
      question: "Co się stanie po przekroczeniu limitu wiadomości?",
      answer: "Chatbot nadal będzie działać, ale otrzymasz powiadomienie o przekroczeniu limitu. Możesz w każdej chwili zmienić plan na wyższy lub zakupić dodatkowe wiadomości."
    }
  ];

  return (
    <section id="faq" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-full px-4 py-2">
            <span className="text-purple-600 text-sm font-bold">❓ FAQ</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Często Zadawane
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Pytania
            </span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-gray-200 rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// CTA Section Component - Bright Polish Design
function CtaSection() {
  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50"></div>
      </div>

      <div className="container relative mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Gotowy do Stworzenia
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Swojego Asystenta AI?
              </span>
            </h2>
            
            <p className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Dołącz do tysięcy firm, które już automatyzują obsługę klienta z SiteAgent. 
              Zacznij za darmo i zobacz wyniki w kilka minut.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-white text-purple-600 font-bold px-8 py-4 hover:bg-gray-100 hover:scale-105 transition-all shadow-xl"
            >
              <Link href="/signup">
                🚀 Rozpocznij Darmowy Trial
              </Link>
            </Button>
            
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-white font-bold px-8 py-4 hover:bg-white hover:text-purple-600 transition-all"
            >
              <Link href="#live-demo">
                Zobacz Demo
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>14-dniowy darmowy trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Brak karty kredytowej</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Konfiguracja w 5 minut</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component - Bright Polish Design
function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={32} height={32} />
              <span className="text-xl font-bold">SiteAgent</span>
            </div>
            <p className="text-gray-400">
              Inteligentne chatboty i automatyzacja AI dla nowoczesnych firm.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Produkt</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#features" className="hover:text-white transition-colors">Funkcje</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Cennik</Link></li>
              <li><Link href="/tools/token-counter" className="hover:text-white transition-colors">Licznik Tokenów AI</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Integracje</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wsparcie</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Centrum Pomocy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Dokumentacja</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Firma</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">O nas</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Prywatność</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Regulamin</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Bezpieczeństwo</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SiteAgent. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}

export default function PolishLandingPageClient({ authButtonSlot }: PolishLandingPageClientProps) {
  return (
    <div className="relative min-h-screen bg-white">
      <MouseFollower />
      <Navbar authButtonSlot={authButtonSlot} />
      <HeroSection />
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
    </div>
  );
} 
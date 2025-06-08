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
// AuthButton import is removed as it will be passed as a prop

interface LandingPageClientProps {
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
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
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
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
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
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
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

// Navbar Component
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
      className={`sticky top-0 z-50 w-full border-b border-gray-800/0 backdrop-blur transition-all duration-300 ${
        scrolled ? "border-gray-800/80 bg-gray-900/95 supports-[backdrop-filter]:bg-gray-900/80" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="group flex items-center gap-2">
            <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={40} height={40} priority />
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="relative text-sm font-medium text-gray-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          {authButtonSlot}
        </div>

        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col space-y-2 px-4 pb-4 pt-2">
            {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                {item}
              </Link>
            ))}
            <div className="mt-4 flex flex-col space-y-2 border-t border-gray-700 pt-4">
              {authButtonSlot}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// Hero Section Component
function HeroSection() {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!orb1Ref.current || !orb2Ref.current || !previewRef.current) return;

      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const deltaX = (clientX - centerX) / centerX;
      const deltaY = (clientY - centerY) / centerY;

      orb1Ref.current.style.transform = `translate(${deltaX * 30}px, ${deltaY * 30}px)`;
      orb2Ref.current.style.transform = `translate(${-deltaX * 20}px, ${-deltaY * 20}px)`;
      
      // Parallax for the container of floating cards on desktop
      if (window.innerWidth >= 1024) { // lg breakpoint
        previewRef.current.style.transform = `perspective(1000px) rotateX(${deltaY * 1.5}deg) rotateY(${-deltaX * 1.5}deg)`;
      } else {
        previewRef.current.style.transform = ''; // Reset transform on smaller screens
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);


  const handleGetStarted = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
      // Clear any existing session errors first
      await supabase.auth.signOut({ scope: 'local' });
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // If there's an auth error, treat as non-authenticated
      if (authError || !user) {
        window.location.href = '/signup';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.warn('Auth check failed, redirecting to signup:', err);
      // On any error, just redirect to signup
      window.location.href = '/signup';
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20 md:py-32">
      {/* Animated Gradient Orbs */}
      <div ref={orb1Ref} className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-pink-600/40 opacity-30 blur-3xl filter transition-transform duration-500 ease-out animate-pulse-slow" style={{ '--rotation': '0deg' } as React.CSSProperties}></div>
      <div ref={orb2Ref} className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-green-500/30 via-teal-500/30 to-cyan-500/30 opacity-20 blur-3xl filter transition-transform duration-500 ease-out animate-pulse-slower" style={{ '--rotation': '0deg' } as React.CSSProperties}></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(0deg, transparent 24px, rgba(255,255,255,0.3) 25px), linear-gradient(90deg, transparent 24px, rgba(255,255,255,0.3) 25px)`,
        backgroundSize: '25px 25px',
      }}></div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side content */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-600/10 px-4 py-2 mb-6 shadow-md">
              <Sparkles className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-blue-400 text-sm font-medium">AI-Powered Automation</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Transform Your Website Into an <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Intelligent Agent</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto md:mx-0">
              SiteAgent analyzes your content and instantly creates an AI assistant that can automate tasks, answer questions, and integrate with your business tools.
            </p>
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 md:justify-start justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={loading}
                className="group relative h-14 overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 px-8 text-lg font-medium text-white shadow-2xl shadow-purple-600/25 transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-purple-600 hover:shadow-3xl hover:shadow-purple-600/40 active:scale-95 w-full sm:w-auto"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </span>
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Button>
              <Link href="#live-demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-gray-600 bg-gray-800/30 px-8 text-lg font-medium text-gray-300 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:text-white active:scale-95 w-full sm:w-auto"
                >
                  🚀 Live Demo
                </Button>
              </Link>
            </div>
            {error && <p className="mt-4 text-sm text-red-400 text-center md:text-left">Error: {error}</p>}
            <div className="mt-10 flex items-center justify-center md:justify-start space-x-6 opacity-80">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Check className="h-4 w-4 text-green-400" />
                14-Day Free Trial
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Check className="h-4 w-4 text-green-400" />
                No Credit Card Required
              </div>
            </div>
          </div>

          {/* Right side - Floating UI elements */}
          <div ref={previewRef} className="relative mt-12 md:mt-0 flex flex-col items-center space-y-4 sm:space-y-6 lg:space-y-0 h-auto lg:h-[500px] group">
            {/* Real-Time Demo Card - Always visible */}
            <div className="animate-float w-full max-w-sm block lg:absolute lg:left-[-20px] lg:top-[5%] lg:w-72" style={{ animationDelay: '0s', '--rotation': '-4deg' } as React.CSSProperties}>
              <div className="bg-gradient-to-br from-blue-700/30 to-purple-700/30 backdrop-blur-xl border border-blue-500/40 rounded-xl p-4 sm:p-5 shadow-2xl transition-all duration-300 lg:group-hover:scale-105 lg:hover:!scale-110 lg:hover:shadow-blue-500/40">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                     <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-blue-200 text-sm sm:text-base font-semibold">Real-Time Demo</span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Upload any document and watch it become an intelligent automation system in seconds!
                </p>
              </div>
            </div>

            {/* Instant Automation Card - Always visible */}
            <div className="animate-float w-full max-w-sm block lg:absolute lg:right-[-30px] lg:top-[calc(5%+90px)] lg:w-80" style={{ animationDelay: '0.5s', '--rotation': '3deg' } as React.CSSProperties}>
              <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 sm:p-5 shadow-2xl transition-all duration-300 lg:group-hover:scale-105 lg:hover:!scale-110 lg:hover:shadow-gray-500/40">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                     <Layers className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-green-300 text-sm sm:text-base font-semibold">Instant Automation</span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  AI that acts, not just chats. Automatically create CRM contacts, schedule meetings, and handle customer inquiries.
                </p>
              </div>
            </div>

            {/* Integrations Card - Hidden on mobile, visible on sm and up */}
            <div className="animate-float w-full max-w-sm hidden sm:block lg:absolute lg:left-[5%] lg:top-[calc(5%+220px)] lg:w-64" style={{ animationDelay: '1s', '--rotation': '2deg' } as React.CSSProperties}>
              <div className="bg-gradient-to-br from-orange-700/30 to-red-700/30 backdrop-blur-xl border border-orange-500/40 rounded-xl p-4 sm:p-5 shadow-2xl transition-all duration-300 lg:group-hover:scale-105 lg:hover:!scale-110 lg:hover:shadow-orange-500/40">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                    <Webhook className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-orange-300 text-sm sm:text-base font-semibold">Integrations</span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Connect with HubSpot, Calendly, Jira, Shopify, and more.
                </p>
              </div>
            </div>
            
            {/* Secure & Private Card - Hidden on mobile, visible on md and up */}
            <div className="animate-float w-full max-w-sm hidden md:block lg:absolute lg:right-[0%] lg:top-[calc(5%+350px)] lg:w-72" style={{ animationDelay: '1.2s', '--rotation': '-3deg' } as React.CSSProperties}>
              <div className="bg-gradient-to-br from-teal-700/30 to-cyan-700/30 backdrop-blur-xl border border-teal-500/40 rounded-xl p-4 sm:p-5 shadow-2xl transition-all duration-300 lg:group-hover:scale-105 lg:hover:!scale-110 lg:hover:shadow-teal-500/40">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-teal-300 text-sm sm:text-base font-semibold">Secure & Private</span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Enterprise-grade security, fully GDPR compliant with advanced encryption.
                </p>
              </div>
            </div>

            {/* This div is a conceptual container for the absolute cards on desktop and helps with group hover effects if needed */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none">
            </div>
          </div>
        </div>

        {/* Added key selling points below hero text for mobile, hidden on md+ */}
        <div className="mt-12 sm:mt-16 md:hidden space-y-3 sm:space-y-4">
          {[
            { title: "Enterprise Security", icon: <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> },
            { title: "5-Minute Setup", icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" /> },
            { title: "14-Day Free Trial", icon: <Check className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /> },
          ].map(item => (
            <div key={item.title} className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
              {item.icon}
              <span className="text-gray-200 font-medium">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How Demo Works Section Component with diagonal layout
function HowDemoWorksSection() {
  return (
    <section className="relative py-16 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Diagonal background elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl transform rotate-45"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl transform -rotate-45"></div>
        
        {/* Diagonal lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent transform rotate-12"></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2">
                <span className="text-orange-400 text-sm font-bold">⚡ INSTANT</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  From Upload to
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                  AI Automation
                </span>
              </h2>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                Watch your static content transform into an intelligent automation system in real-time. No complex setup, no technical knowledge required.
              </p>
            </div>

            {/* Process steps in a modern card layout */}
            <div className="space-y-4">
              {[
                { step: "01", title: "Upload Content", desc: "Drop any document, paste text, or enter a website URL" },
                { step: "02", title: "AI Processing", desc: "Our AI analyzes and structures your content automatically" },
                { step: "03", title: "Start Automating", desc: "Your intelligent assistant is ready to handle real tasks" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl hover:border-gray-600/50 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{item.title}</div>
                    <div className="text-gray-400 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Visual demo preview */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4">Live Demo Interface</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="text-blue-300 text-sm font-semibold mb-2">🌐 Paste URL or Upload Documents</div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="text-purple-300 text-sm font-semibold mb-2">🧠 AI Processing</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-purple-300 text-xs ml-2">Analyzing content...</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-green-300 text-sm font-semibold mb-2">✅ Ready to Automate</div>
                    <div className="text-green-100 text-xs">Your AI assistant is live and ready for action!</div>
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
    <section id="live-demo" className="relative py-20 md:py-24 bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Visual separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-600/10 px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
            <span className="text-purple-400 text-sm font-medium">🥇 Unique Interactive Experience</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Not Another Chatbot Demo—
            <span className="block text-purple-400">The Only One That Acts</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-6">
            Competitors show generic examples; we show your actual content. Instantly experience how SiteAgent automates real tasks like scheduling meetings, updating CRM, and more.
          </p>
        </div>

        {/* Demo container with enhanced styling */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-50"></div>
          
          {/* Demo content */}
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 md:p-8">
            <LivePreview />
          </div>
        </div>

        {/* Visual demo preview teaser */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">
            💡 Watch how SiteAgent instantly turns your content into an interactive AI experience
          </p>
          <div className="inline-flex items-center text-blue-400 text-sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Real AI • Real Actions • Real Results</span>
          </div>
        </div>

        {/* Bottom separator with integration preview */}
        <div className="mt-16 pt-12 border-t border-gray-700/50">
          <div className="text-center mb-8">
            <p className="text-gray-400 text-sm">
              Seamlessly integrates with your existing workflow
            </p>
          </div>
          <IntegrationsBar />
        </div>
      </div>

      {/* Bottom visual separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
    </section>
  );
}

// Features Section with modern asymmetric layout
function FeaturesSection() {
  const primaryFeatures = [
    { 
      img: "/icons/AI CHATBOT ICON.svg", 
      title: "Save 70% on Support Costs", 
      description: "Automatically handle routine inquiries, letting your team focus on complex issues that require human expertise.",
      stat: "70% cost reduction"
    },
    { 
      img: "/icons/Website Embedding.svg", 
      title: "Just Paste Your Website URL", 
      description: "No organized docs? No problem! Simply paste your website URL and we'll instantly create an expert chatbot from all your existing content - perfect for busy teams.",
      stat: "0 setup time"
    },
    { 
      img: "/icons/External API Actions.svg", 
      title: "Convert Visitors into Customers", 
      description: "Schedule meetings, update CRM records, and create support tickets automatically - turning every conversation into action.",
      stat: "3x conversion rate"
    }
  ];

  const secondaryFeatures = [
    { 
      img: "/icons/Document Knowledge Base.svg", 
      title: "Instant Expert Knowledge", 
      description: "Upload your documents once and get accurate, contextual answers instantly - like having your best expert available 24/7."
    },
    { 
      img: "/icons/Powerful Analytics.svg", 
      title: "Measure Real Business Impact", 
      description: "Track lead generation, customer satisfaction, and cost savings with detailed analytics that prove ROI."
    },
    { 
      img: "/icons/Enterprise Security.svg", 
      title: "Enterprise-Ready Security", 
      description: "Deploy confidently with bank-level encryption, compliance features, and role-based access controls."
    }
  ];

  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="features" ref={sectionRef} className="relative py-24 bg-gray-900 overflow-hidden">
      {/* Modern background with asymmetric shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-full blur-3xl transform -rotate-45"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl transform rotate-45"></div>
        
        {/* Geometric accents */}
        <div className="absolute top-1/3 right-1/4 w-2 h-32 bg-gradient-to-b from-blue-500/30 to-transparent transform rotate-12"></div>
        <div className="absolute bottom-1/3 left-1/4 w-2 h-32 bg-gradient-to-b from-purple-500/30 to-transparent transform -rotate-12"></div>
      </div>

      <div className="container relative mx-auto px-6">
        {/* Header section with modern positioning */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm font-bold tracking-wide">REAL RESULTS</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black leading-none">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Stop Talking.
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Start Delivering.
                </span>
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl text-gray-400 leading-relaxed">
                Transform your website from a brochure into a revenue-generating machine that works around the clock.
              </p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm font-semibold">70% Cost Reduction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-400 text-sm font-semibold">5-Min Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-400 text-sm font-semibold">24/7 Automation</span>
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
              <div key={index} className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02]">
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
                      <h3 className="text-2xl md:text-3xl font-bold text-white">
                        {feature.title}
                      </h3>
                      <div className="inline-flex items-center bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full px-4 py-2">
                        <span className="text-green-400 text-sm font-bold">{feature.stat}</span>
                      </div>
                    </div>
                    <p className="text-lg text-gray-400 leading-relaxed">
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
              <div key={index} className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/40 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-500 hover:bg-gray-800/80">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-1 flex-shrink-0">
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
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
                    <h4 className="text-lg font-semibold text-white group-hover:text-gray-100">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">
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
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to see these features in action?
            </h3>
            <p className="text-gray-400 mb-6">
              Try our live demo - no signup required, see results in 60 seconds.
            </p>
            <Link href="#live-demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
              <span>🚀 Try Live Demo</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section with interactive step-by-step experience
function HowItWorksSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { 
      number: "01", 
      title: "Create Your Chatbot", 
      description: "Set up your chatbot in minutes with our intuitive dashboard. Define its purpose and personality.", 
      features: ["No coding required", "Customizable appearance", "Multiple chatbot templates"],
      visual: "🤖"
    },
    { 
      number: "02", 
      title: "Connect Your Data", 
      description: "Just paste your website URL for instant setup, or upload documents to give your chatbot the information it needs. No organization required!", 
      features: ["Paste any website URL (easiest!)", "Upload documents (PDF, DOCX, etc.)", "Connect databases & APIs"],
      visual: "📚"
    },
    { 
      number: "03", 
      title: "Configure Actions", 
      description: "Set up integrations with third-party services to allow your chatbot to perform real actions.", 
      features: ["OAuth connections", "Webhook triggers", "Custom API integrations"],
      visual: "⚡"
    },
    { 
      number: "04", 
      title: "Deploy & Analyze", 
      description: "Embed your chatbot on your website and track its performance with detailed analytics.", 
      features: ["Simple embed code", "Conversation analytics", "Continuous improvement"],
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
            <span className="text-blue-400 text-sm font-bold">🛠️ SIMPLE PROCESS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              From Idea to
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Automation
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Follow these simple steps to create and deploy your AI-powered automation system.
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
                  <span>Previous</span>
                </button>

                {currentStep === steps.length - 1 ? (
                  <Link href="/signup">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-green-600 to-green-700 text-white hover:scale-105 shadow-lg hover:shadow-xl hover:from-green-500 hover:to-green-600">
                      <span>that's it! Start now →</span>
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={isAnimating}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span>Next</span>
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
                          <span className="text-blue-300 text-sm font-semibold">Step {currentStepData.number}</span>
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
                
                {/* Floating accent elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA - only show on last step */}
        {currentStep === steps.length - 1 && (
          <div className="mt-16 text-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-400 mb-6">
                See how easy it is with our interactive demo - no setup required!
              </p>
              <Link href="#live-demo" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
                <span>🚀 Try Live Demo</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Integration Ecosystem Showcase Section Component
function IntegrationEcosystemSection() {
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
                  card.classList.add("opacity-100", "translate-y-0", "scale-100");
                }, index * 100);
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

  const integrations = [
    {
      name: "HubSpot",
      description: "Create contacts, update deals, and manage your CRM directly from chat",
      icon: "🚀",
      color: "from-orange-500 to-red-500",
      actions: ["Create Contact", "Update Deal", "Log Activity"]
    },
    {
      name: "Calendly",
      description: "Schedule meetings instantly with seamless calendar integration",
      icon: "📅",
      color: "from-blue-500 to-blue-600",
      actions: ["Schedule Meeting", "Check Availability", "Send Reminders"]
    },
    {
      name: "Jira",
      description: "Create tickets, track issues, and manage projects efficiently",
      icon: "🎯",
      color: "from-blue-600 to-indigo-600",
      actions: ["Create Ticket", "Update Status", "Assign Tasks"]
    },
    {
      name: "Shopify",
      description: "Access order information, product details, and customer data",
      icon: "🛍️",
      color: "from-green-500 to-green-600",
      actions: ["Check Orders", "Product Info", "Customer Support"]
    },
    {
      name: "Monday.com",
      description: "Manage boards, update items, and track project progress",
      icon: "📊",
      color: "from-purple-500 to-pink-500",
      actions: ["Update Board", "Create Item", "Track Progress"]
    },
    {
      name: "Custom APIs",
      description: "Connect to any service with webhook and API integrations",
      icon: "⚡",
      color: "from-gray-500 to-gray-600",
      actions: ["Webhook Triggers", "API Calls", "Data Sync"]
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-20 md:py-24 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-600/10 px-4 py-2 mb-6">
            <Layers className="h-4 w-4 text-purple-400 mr-2" />
            <span className="text-purple-400 text-sm font-medium">Integration Hub</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Connect Everything
            <span className="block text-purple-400">Your Users Need</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Turn conversations into actions with powerful integrations. Your chatbot doesn't just talk—it does.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {integrations.map((integration, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all duration-500 hover:border-purple-500/30 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-purple-500/10 opacity-0 translate-y-8 scale-95"
            >
              <div className="flex items-center mb-4">
                <div className={`rounded-lg bg-gradient-to-r ${integration.color} p-2 shadow-lg transition-transform duration-300 group-hover:scale-110 text-2xl`}>
                  {integration.icon}
                </div>
                <h3 className="ml-3 text-lg font-semibold text-white">{integration.name}</h3>
              </div>
              <p className="text-gray-400 mb-4 text-sm">{integration.description}</p>
              <div className="space-y-2">
                {integration.actions.map((action, actionIndex) => (
                  <div key={actionIndex} className="flex items-center text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                    {action}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Live Integration Demo */}
        <div className="relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">See Integration in Action</h3>
            <p className="text-gray-400">Watch how your chatbot performs real actions</p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-300 text-sm">I can help you schedule a meeting with our sales team. What time works best for you?</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-300 text-sm">Tomorrow at 2 PM would be perfect</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-300 text-sm">Perfect! I've scheduled a 30-minute meeting for tomorrow at 2:00 PM. You'll receive a Calendly confirmation shortly.</p>
                <div className="mt-2 bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-2">
                  <p className="text-green-400 text-xs font-medium">✓ Meeting scheduled via Calendly integration</p>
                </div>
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
    { quote: "SiteAgent has transformed our customer support. Our chatbot handles 70% of inquiries automatically, saving us countless hours." },
    { quote: "The ability to connect our chatbot to our CRM and scheduling tools has been a game-changer. It's like having an extra team member." },
    { quote: "We uploaded our product documentation and within minutes had a chatbot that could answer technical questions accurately. Impressive!" },
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
    <section ref={sectionRef} className="relative bg-gray-800 py-24 md:py-32 overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-l from-purple-500/10 to-blue-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        {/* Enhanced header */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-yellow-500/30 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl px-6 py-3 mb-8">
            <span className="text-yellow-400 text-sm font-semibold tracking-wide">Customer Stories</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Trusted by Innovative
            </span>
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
              Companies
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">See what our customers are saying about SiteAgent.</p>
        </div>
        
        {/* Enhanced testimonials grid */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="group relative rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-8 shadow-2xl backdrop-blur-sm border border-gray-700/50 opacity-0 translate-y-8 transition-all duration-500 ease-out hover:border-gray-600/50 hover:shadow-3xl hover:shadow-yellow-900/10 hover:-translate-y-2"
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 via-transparent to-orange-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl"></div>
              
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
                <blockquote className="mb-8 text-gray-300 text-lg leading-relaxed text-center transition-colors duration-300 group-hover:text-white font-medium">
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

// PRICING SECTION COMPONENT (visual-only)
function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "€0",
      period: "forever",
      description: "Perfect to explore SiteAgent",
      features: [
        "1 Chatbot",
        "100 messages / month",
        "1 MB data storage",
        "Scrape 3 websites",
        "Community support",
      ],
      highlight: false,
      cta: "Get Started Free",
      href: "/signup",
      trial: false,
    },
    {
      name: "SiteAgent Starter",
      price: "€29.99",
      period: "month",
      description: "Perfect for small startups",
      features: [
        "1 Chatbot",
        "500 messages / month",
        "5 MB data storage",
        "Scrape 10 websites",
        "Essential integrations",
        "Email support",
      ],
      highlight: false,
      cta: "Start Free Trial",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Growth",
      price: "€149",
      period: "month",
      description: "Most popular for growing businesses",
      features: [
        "3 Chatbots",
        "3,000 messages / month",
        "25 MB data storage",
        "Scrape 25 websites",
        "All integrations",
        "Priority support",
      ],
      highlight: true,
      cta: "Start Free Trial",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Pro",
      price: "€399",
      period: "month",
      description: "For scaling businesses",
      features: [
        "10 Chatbots",
        "10,000 messages / month",
        "100 MB data storage",
        "Scrape 50 websites",
        "All integrations + Custom API",
        "Dedicated & onboarding support",
      ],
      highlight: false,
      cta: "Start Free Trial",
      href: "/signup",
      trial: true,
    },
    {
      name: "Enterprise",
      price: "Let's talk",
      period: "",
      description: "Enterprise solutions tailored to your needs",
      features: [
        "Unlimited Chatbots",
        "Custom message limits",
        "Unlimited website scraping",
        "Dedicated storage",
        "On-premise deployment",
        "White-label solutions",
        "Priority support & SLA",
        "Custom integrations",
      ],
      highlight: false,
      cta: "Contact Sales",
      href: "/contact",
      trial: false,
    },
  ];

  return (
    <section id="pricing" className="relative bg-gray-900 py-24 md:py-32 overflow-hidden">
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
            <span className="text-green-400 text-sm font-semibold tracking-wide">Transparent Pricing</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Simple, transparent
            </span>
            <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mt-2">
              pricing
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Start for free – upgrade when you need more power. No hidden fees.
          </p>
        </div>
        
        {/* Enhanced pricing grid */}
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
                  Most Popular
                </span>
              )}
              
              {/* Trial badge */}
              {plan.trial && (
                <span className="absolute -top-3 right-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-2 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                  14-day trial
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
                      14 days free, then cancel anytime
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

// FAQ Section Component
function FaqSection() {
  const faqs = [
    { question: "Do I need technical knowledge to use SiteAgent?", answer: "No, SiteAgent is designed to be user-friendly for non-technical users. Our intuitive interface allows you to create and deploy chatbots without any coding knowledge. For more advanced customizations, some technical background may be helpful but is not required." },
    { question: "How does the document knowledge base work?", answer: "SiteAgent uses Retrieval Augmented Generation (RAG) technology. You upload documents (PDFs, DOCXs, etc.) to our platform, and we process them to create embeddings. When a user asks a question, our system retrieves the most relevant information from your documents and uses it to generate accurate answers." },
    { question: "Can I connect my chatbot to my existing tools?", answer: "Yes! SiteAgent supports integrations with many popular third-party services through our Actions feature. You can connect to tools like Calendly, HubSpot, Jira, Shopify, and more. This allows your chatbot to perform tasks like scheduling appointments, updating CRM data, or creating tickets." },
    { question: "How do I embed the chatbot on my website?", answer: "Once you've created your chatbot, you'll receive a simple JavaScript snippet to add to your website. Just paste this code into your site's HTML, and the chatbot will appear. You can customize the appearance and position of the chatbot widget to match your website's design." },
    { question: "Is there a limit to how many messages my chatbot can handle?", answer: "Each pricing plan comes with a specific monthly message limit. The Starter plan includes 5,000 messages per month, the Professional plan includes 25,000 messages, and the Enterprise plan offers unlimited messages. If you exceed your limit, additional messages are billed at a per-message rate." },
    { question: "How secure is my data with SiteAgent?", answer: "We take security seriously. All data is encrypted both in transit and at rest. We use industry-standard security practices and regularly undergo security audits. For Enterprise customers, we offer additional security features like SSO, role-based access control, and custom data retention policies." },
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
    <section id="faq" ref={sectionRef} className="bg-gray-900 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-400">Find answers to common questions about SiteAgent.</p>
        </div>
        <div ref={faqRef} className="mx-auto max-w-3xl opacity-0 translate-y-8 transition-all duration-700 ease-out">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-gray-800 transition-all duration-300 hover:border-gray-700"
              >
                <AccordionTrigger className="group text-left text-white transition-all duration-300 hover:text-blue-400">
                  <span className="transition-transform duration-300 group-hover:translate-x-1">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 transition-colors duration-300 hover:text-gray-300">
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
    <section ref={sectionRef} className="relative bg-gray-800 py-24 md:py-32 overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"></div>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-l from-purple-600/20 to-pink-600/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        <div
          ref={ctaRef}
          className="group mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-12 text-center shadow-3xl backdrop-blur-sm opacity-0 translate-y-8 transition-all duration-700 ease-out md:p-16 hover:shadow-4xl hover:shadow-blue-900/30 relative overflow-hidden"
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
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
              Ready to Transform Your Website
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent mt-2">
                with AI?
              </span>
            </h2>
            
            {/* Enhanced description */}
            <p className="mb-10 text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Start your 14-day free trial today. No credit card required.
            </p>
            
            {/* Enhanced button group */}
            <div className="flex flex-col items-center justify-center space-y-6 sm:flex-row sm:space-x-8 sm:space-y-0">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="group relative h-16 overflow-hidden bg-white text-blue-700 px-10 text-xl font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-white/30 active:scale-95"
                >
                  <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1">
                    Get Started Free
                    <ArrowRight className="ml-3 h-6 w-6 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="group h-16 border-2 border-white/80 bg-white/10 text-white px-10 text-xl font-semibold backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/20 hover:shadow-lg hover:shadow-white/20"
                >
                  <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
                    Contact Sales
                    <ArrowRight className="ml-3 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </span>
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-blue-100/80">
              <div className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">Setup in Minutes</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">14-Day Free Trial</span>
              </div>
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
    <footer className="border-t border-gray-800 bg-gray-900 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 transition-all duration-300 group-hover:bg-blue-500">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
                SiteAgent
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300">
              Build, deploy, and manage AI-powered chatbots that integrate with your tools and data.
            </p>
            <div className="mt-6 flex space-x-4">
              {[
                { icon: Facebook, label: "Facebook" }, { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" }, { icon: Github, label: "GitHub" },
              ].map((social, index) => (
                <a key={index} href="#" className="text-gray-400 transition-all duration-300 hover:text-white hover:scale-110">
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "AI Token Counter", href: "/tools/token-counter" }, { label: "Documentation", href: "/docs" }, { label: "Changelog", href: "/changelog" }] },
            { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }] },
            { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Security", href: "/security" }] },
          ].map((section, index) => (
            <div key={index}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-gray-400 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SiteAgent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPageClient({ authButtonSlot }: LandingPageClientProps) {
  return (
    <div className="relative overflow-hidden bg-gray-900 text-gray-100">
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
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
} 
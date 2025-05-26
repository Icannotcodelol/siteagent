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
      previewRef.current.style.transform = `perspective(1000px) rotateX(${deltaY * 2}deg) rotateY(${-deltaX * 2}deg)`;
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
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Enhanced background with more depth */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      </div>
      
      {/* Enhanced orbs with better gradients */}
      <div
        ref={orb1Ref}
        className="absolute -top-40 left-0 right-0 mx-auto h-[500px] w-[500px] rounded-full bg-gradient-to-r from-blue-600/30 via-blue-400/20 to-purple-600/20 blur-[120px] transition-transform duration-200 ease-out"
      ></div>
      <div
        ref={orb2Ref}
        className="absolute bottom-0 right-0 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-l from-purple-600/20 via-pink-500/10 to-blue-600/15 blur-[80px] transition-transform duration-200 ease-out"
      ></div>
      
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Enhanced badge with better animation */}
          <div className="group mb-8 inline-flex items-center rounded-full border border-gray-700/50 bg-gray-800/60 backdrop-blur-xl px-4 py-2 transition-all duration-500 hover:border-blue-500/30 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-blue-500/10">
            <span className="mr-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-0.5 text-xs font-semibold text-white shadow-lg">NEW</span>
            <span className="text-sm text-gray-300 transition-colors duration-300 group-hover:text-gray-200">Try our AI chatbot instantly - no signup required!</span>
            <ArrowRight className="ml-2 h-3 w-3 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-400" />
          </div>
          
          {/* Enhanced heading with better typography */}
          <h1 className="mb-8 max-w-5xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Build AI Chatbots That{" "}
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent animate-pulse">
              Actually Solve Problems
            </span>
          </h1>
          
          {/* Enhanced description with better spacing */}
          <p className="mb-12 max-w-3xl text-xl leading-relaxed text-gray-400 md:text-2xl">
            Create, deploy, and manage intelligent chatbots that integrate with your tools, understand your documents,
            and deliver real value to your visitors.
          </p>
          
          {/* Enhanced button group with better visual hierarchy */}
          <div className="flex flex-col items-center space-y-6 sm:flex-row sm:space-x-6 sm:space-y-0">
            <Button
              size="lg"
              className="group relative h-14 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 px-8 text-lg font-medium text-white shadow-2xl shadow-blue-600/25 transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-blue-600 hover:shadow-3xl hover:shadow-blue-600/40 active:scale-95"
              onClick={handleGetStarted}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1">
                {loading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </Button>
            
            <Link href="#live-demo">
              <Button
                size="lg"
                variant="outline"
                className="group h-14 border-2 border-gray-600/50 bg-gray-800/30 px-8 text-lg font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500 hover:bg-gray-700/50 hover:text-white hover:shadow-xl hover:shadow-gray-900/50"
              >
                <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
                  Try Live Demo
                  <Sparkles className="ml-2 h-5 w-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                </span>
              </Button>
            </Link>
          </div>
          
          {error && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
              <div className="rounded-lg bg-red-900/20 border border-red-700/50 px-4 py-2 text-red-400 text-sm backdrop-blur-sm">
                {error}
              </div>
            </div>
          )}
          
          {/* Enhanced feature highlights with better visual design */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="group flex items-center transition-all duration-300 hover:text-gray-300">
              <div className="mr-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-2 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">Quick setup</span>
            </div>
            <div className="group flex items-center transition-all duration-300 hover:text-gray-300">
              <div className="mr-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 p-2 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">No coding required</span>
            </div>
            <div className="group flex items-center transition-all duration-300 hover:text-gray-300">
              <div className="mr-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 p-2 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">Enterprise secure</span>
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
          <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-600/10 px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-blue-400 text-sm font-medium">Interactive Experience</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Experience the Magic
            <span className="block text-blue-400">Before You Build</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            See exactly how your chatbot will look and behave on your website. 
            Upload content, watch it train, and interact with your AI assistant in real-time.
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

// Features Section Component
function FeaturesSection() {
  const features = [
    { img: "/icons/AI CHATBOT ICON.svg", title: "AI-Powered Chatbots", description: "Create intelligent conversational agents that understand context and provide helpful responses to your users." },
    { img: "/icons/External API Actions.svg", title: "External API Actions", description: "Connect your chatbot to third-party services like Calendly, HubSpot, Jira, and Shopify to perform real actions." },
    { img: "/icons/Document Knowledge Base.svg", title: "Document Knowledge Base", description: "Upload documents and let your chatbot answer questions based on their content using advanced RAG technology." },
    { img: "/icons/Website Embedding.svg", title: "Website Embedding", description: "Easily embed your chatbots into any website with a simple code snippet that works across all platforms." },
    { img: "/icons/Powerful Analytics.svg", title: "Powerful Analytics", description: "Track conversations, user satisfaction, and chatbot performance with comprehensive analytics." },
    { img: "/icons/Enterprise Security.svg", title: "Enterprise Security", description: "Keep your data secure with end-to-end encryption, role-based access control, and compliance features." },
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

  return (
    <section id="features" ref={sectionRef} className="relative py-24 md:py-32 bg-gray-900">
      {/* Enhanced visual separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      
      {/* Enhanced background elements with better composition */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-l from-purple-500/20 to-pink-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-gradient-to-r from-green-500/15 to-blue-500/15 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        {/* Enhanced header section */}
        <div className="mx-auto mb-20 max-w-4xl text-center">
          <div className="group inline-flex items-center rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl px-6 py-3 mb-8 transition-all duration-500 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20">
            <Database className="h-5 w-5 text-blue-400 mr-3 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-blue-400 text-sm font-semibold tracking-wide">Powerful Features</span>
          </div>
          <h2 className="mb-8 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Everything You Need to Build
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mt-2">
              Powerful AI Chatbots
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            SiteAgent provides all the tools to create, deploy, and manage chatbots that deliver real value to your customers.
          </p>
        </div>
        
        {/* Enhanced feature grid */}
        <div className="grid grid-cols-1 gap-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="group relative overflow-hidden rounded-3xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-8 shadow-2xl backdrop-blur-sm opacity-0 translate-y-8 transition-all duration-500 ease-out hover:border-gray-600/50 hover:shadow-3xl hover:shadow-blue-900/20 hover:-translate-y-2"
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              
              {/* Icon container with enhanced design */}
              <div className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-1 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-white">
                  <Image
                    src={feature.img}
                    alt={feature.title}
                    width={40}
                    height={40}
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
              
              {/* Content with better typography */}
              <div className="relative">
                <h3 className="mb-6 text-2xl font-bold text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-lg transition-colors duration-300 group-hover:text-gray-300">
                  {feature.description}
                </p>
              </div>
              
              {/* Subtle hover effect accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 group-hover:w-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced bottom visual separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </section>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  const steps = [
    { number: "01", title: "Create Your Chatbot", description: "Set up your chatbot in minutes with our intuitive dashboard. Define its purpose and personality.", features: ["No coding required", "Customizable appearance", "Multiple chatbot templates"] },
    { number: "02", title: "Connect Your Data", description: "Upload documents or connect to your existing knowledge base to give your chatbot the information it needs.", features: ["Document upload (PDF, DOCX, etc.)", "Website scraping", "Database connections"] },
    { number: "03", title: "Configure Actions", description: "Set up integrations with third-party services to allow your chatbot to perform real actions.", features: ["OAuth connections", "Webhook triggers", "Custom API integrations"] },
    { number: "04", title: "Deploy & Analyze", description: "Embed your chatbot on your website and track its performance with detailed analytics.", features: ["Simple embed code", "Conversation analytics", "Continuous improvement"] },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stepsRef.current.forEach((step, index) => {
              if (step) {
                setTimeout(() => {
                  step.classList.add("opacity-100", "translate-y-0");
                }, index * 200);
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
    <section id="how-it-works" ref={sectionRef} className="bg-gray-800 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            How SiteAgent Works
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Follow these simple steps to create and deploy your AI-powered chatbot.
          </p>
        </div>
        <div className="mx-auto max-w-5xl">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => { stepsRef.current[index] = el; }}
              className="mb-12 opacity-0 translate-y-8 transition-all duration-700 ease-out last:mb-0"
            >
              <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                <div className="mb-4 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white transition-all duration-300 hover:scale-110 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20 md:mb-0">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="mb-3 text-2xl font-bold text-white transition-colors duration-300 hover:text-blue-400">
                    {step.title}
                  </h3>
                  <p className="mb-4 text-lg text-gray-400">{step.description}</p>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center group">
                        <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/20 transition-all duration-300 group-hover:bg-blue-600/40">
                          <Check className="h-3 w-3 text-blue-500 transition-colors duration-300 group-hover:text-blue-400" />
                        </span>
                        <span className="text-gray-300 transition-colors duration-300 group-hover:text-white">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="ml-8 mt-8 h-12 w-0.5 bg-gradient-to-b from-blue-600/50 to-gray-700 md:ml-8"></div>
              )}
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
        "Community support",
      ],
      highlight: false,
      cta: "Get Started Free",
      href: "/signup",
    },
    {
      name: "Hobby",
      price: "€150",
      period: "month",
      description: "Ideal for side-projects and small teams",
      features: [
        "3 Chatbots",
        "2 000 messages / month",
        "20 MB data storage",
        "Priority support",
      ],
      highlight: true,
      cta: "Start Free Trial",
      href: "/signup",
    },
    {
      name: "Pro",
      price: "€450",
      period: "month",
      description: "For growing businesses that need scale",
      features: [
        "5 Chatbots",
        "8 000 messages / month",
        "50 MB data storage",
        "Premium support",
      ],
      highlight: false,
      cta: "Start Free Trial",
      href: "/signup",
    },
    {
      name: "Custom",
      price: "Let's talk",
      period: "",
      description: "Enterprise solutions tailored to your needs",
      features: [
        "Unlimited Chatbots",
        "Custom message limits",
        "Dedicated storage",
        "White-label solutions",
        "Priority support & SLA",
        "Custom integrations",
      ],
      highlight: false,
      cta: "Contact Sales",
      href: "/contact",
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-8 shadow-2xl backdrop-blur-sm border transition-all duration-500 hover:scale-105 hover:shadow-3xl ${
                plan.highlight 
                  ? "border-blue-500/50 ring-2 ring-blue-500/20 hover:ring-blue-400/30" 
                  : "border-gray-700/50 hover:border-gray-600/50"
              }`}
            >
              {/* Popular badge */}
              {plan.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg uppercase tracking-wider">
                  Most Popular
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
                  <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                    plan.highlight 
                      ? "text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text"
                      : "text-white group-hover:text-gray-200"
                  }`}>{plan.name}</h3>
                  <p className="text-gray-400 leading-relaxed">{plan.description}</p>
                </div>
                
                {/* Pricing */}
                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 text-lg mb-1">/{plan.period}</span>
                    )}
                  </div>
                </div>
                
                {/* Features */}
                <ul className="mb-10 space-y-4 flex-grow">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start">
                      <div className={`mr-3 mt-0.5 rounded-full p-1 ${
                        plan.highlight 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-300 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Link href={plan.href} className="mt-auto inline-flex">
                  <Button
                    size="lg"
                    className={`group w-full h-12 text-lg font-semibold transition-all duration-300 hover:scale-105 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40"
                        : "border-2 border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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

// Testimonials Section Component
function TestimonialsSection() {
  const testimonials = [
    { quote: "SiteAgent has transformed our customer support. Our chatbot handles 70% of inquiries automatically, saving us countless hours.", author: "Sarah Johnson", role: "Customer Success Manager", company: "TechCorp Inc." },
    { quote: "The ability to connect our chatbot to our CRM and scheduling tools has been a game-changer. It's like having an extra team member.", author: "Michael Chen", role: "Marketing Director", company: "GrowthLabs" },
    { quote: "We uploaded our product documentation and within minutes had a chatbot that could answer technical questions accurately. Impressive!", author: "Alex Rodriguez", role: "Product Manager", company: "InnovateSoft" },
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
                
                {/* Author info - uncommented for better visual hierarchy */}
                <div className="text-center pt-6 border-t border-gray-700/50">
                  <p className="font-semibold text-white text-lg mb-1">{testimonial.author}</p>
                  <p className="text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                    {testimonial.role}
                  </p>
                  <p className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-gray-400">
                    {testimonial.company}
                  </p>
                </div>
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
            { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Documentation", href: "/docs" }, { label: "Changelog", href: "/changelog" }] },
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
    <div className="relative min-h-screen overflow-hidden bg-gray-900 text-gray-100">
      <MouseFollower />
      <Navbar authButtonSlot={authButtonSlot} />
      <main className="overflow-x-hidden">
        <HeroSection />
        <LiveDemoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <IntegrationsBar />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
} 
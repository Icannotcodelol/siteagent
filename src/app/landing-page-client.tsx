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
} from "lucide-react";
import { Button, cn } from "@/app/_components/ui/button";
import IntegrationsBar from "@/app/_components/ui/integrations-bar";
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/signup';
      }
    } catch (err) {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800"></div>
      <div
        ref={orb1Ref}
        className="absolute -top-40 left-0 right-0 mx-auto h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px] transition-transform duration-200 ease-out"
      ></div>
      <div
        ref={orb2Ref}
        className="absolute bottom-0 right-0 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/10 blur-[80px] transition-transform duration-200 ease-out"
      ></div>
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-gray-700 bg-gray-800/80 px-3 py-1 backdrop-blur transition-all duration-300 hover:border-gray-600 hover:bg-gray-800">
            <span className="mr-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-medium text-white">NEW</span>
            <span className="text-sm text-gray-300">Introducing Actions for third-party integrations</span>
          </div>
          <h1 className="mb-6 max-w-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Build AI Chatbots That{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Actually Solve Problems
            </span>
          </h1>
          <p className="mb-10 max-w-2xl text-xl text-gray-400">
            Create, deploy, and manage intelligent chatbots that integrate with your tools, understand your documents,
            and deliver real value to your visitors.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-blue-600 text-white transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20"
              onClick={handleGetStarted}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1">
                {loading ? 'Checking...' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 z-0 translate-y-[105%] bg-blue-500 transition-transform duration-300 group-hover:translate-y-0"></span>
            </Button>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-gray-300 transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/50 hover:text-white hover:shadow-lg"
              >
                See How It Works
              </Button>
            </Link>
          </div>
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
          <div className="mt-10 flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <Zap className="mr-2 h-4 w-4 text-blue-500" />
              <span>Quick setup</span>
            </div>
            <div className="flex items-center">
              <Bot className="mr-2 h-4 w-4 text-blue-500" />
              <span>No coding required</span>
            </div>
          </div>
          <div
            ref={previewRef}
            className="mt-16 w-full max-w-5xl rounded-lg border border-gray-800 bg-gray-900/80 shadow-2xl transition-all duration-200 ease-out hover:border-gray-700 hover:shadow-blue-900/10"
          >
            <div className="rounded-t-lg border-b border-gray-800 bg-gray-800/80 px-4 py-2 backdrop-blur">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="ml-2 text-xs text-gray-400">SiteAgent Dashboard</div>
              </div>
            </div>
            <div className="p-4 bg-gray-900 text-white rounded-b-lg h-[350px] overflow-y-auto">
              <div className="mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-md border border-gray-700 bg-gray-800 p-2.5 shadow">
                    <div className="flex items-start space-x-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs flex-shrink-0 mt-0.5">
                        <span>💬</span>
                      </div>
                      <div>
                        <div className="text-base font-semibold text-white">1,234</div>
                        <div className="text-2xs text-gray-400 truncate">Total Conversations</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border border-gray-700 bg-gray-800 p-2.5 shadow">
                    <div className="flex items-start space-x-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-xs flex-shrink-0 mt-0.5">
                         <span>🤖</span>
                      </div>
                      <div>
                        <div className="text-base font-semibold text-white">5</div>
                        <div className="text-2xs text-gray-400 truncate">Active Chatbots</div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block rounded-md border border-gray-700 bg-gray-800 p-2.5 shadow">
                    <div className="flex items-start space-x-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex-shrink-0 mt-0.5">
                        <span>🔌</span>
                      </div>
                      <div>
                        <div className="text-base font-semibold text-white">3</div>
                        <div className="text-2xs text-gray-400 truncate">Connected Services</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-md font-semibold text-gray-200">Your Chatbots</h2>
                </div>
                <div className="rounded-md border border-gray-700 bg-gray-800 p-2.5 shadow mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Support ProBot</h3>
                      <p className="text-2xs text-gray-400">Updated: 2 hours ago</p>
                    </div>
                    <div className="px-1.5 py-0.5 text-2xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-sm cursor-default">View</div>
                  </div>
                  <div className="mt-1.5 flex space-x-3 text-2xs text-gray-400">
                    <div><span className="font-medium text-white">150</span> Msgs</div>
                    <div><span className="font-medium text-white">25</span> Convos</div>
                  </div>
                </div>
                <div className="rounded-md border border-gray-700 bg-gray-800 p-2.5 shadow opacity-80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">FAQ Assistant</h3>
                      <p className="text-2xs text-gray-400">Updated: 1 day ago</p>
                    </div>
                    <div className="px-1.5 py-0.5 text-2xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-sm cursor-default">View</div>
                  </div>
                   <div className="mt-1.5 flex space-x-3 text-2xs text-gray-400">
                    <div><span className="font-medium text-white">88</span> Msgs</div>
                    <div><span className="font-medium text-white">12</span> Convos</div>
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

// Features Section Component
function FeaturesSection() {
  const features = [
    { icon: Bot, title: "AI-Powered Chatbots", description: "Create intelligent conversational agents that understand context and provide helpful responses to your users." },
    { icon: Webhook, title: "External API Actions", description: "Connect your chatbot to third-party services like Calendly, HubSpot, Jira, and Shopify to perform real actions." },
    { icon: FileText, title: "Document Knowledge Base", description: "Upload documents and let your chatbot answer questions based on their content using advanced RAG technology." },
    { icon: Globe, title: "Website Embedding", description: "Easily embed your chatbots into any website with a simple code snippet that works across all platforms." },
    { icon: Database, title: "Powerful Analytics", description: "Track conversations, user satisfaction, and chatbot performance with comprehensive analytics." },
    { icon: Lock, title: "Enterprise Security", description: "Keep your data secure with end-to-end encryption, role-based access control, and compliance features." },
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
    <section id="features" ref={sectionRef} className="bg-gray-900 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Everything You Need to Build Powerful AI Chatbots
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            SiteAgent provides all the tools to create, deploy, and manage chatbots that deliver real value.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="group rounded-lg border border-gray-800 bg-gray-800/50 p-6 opacity-0 transition-all duration-500 ease-out translate-y-8 hover:border-gray-700 hover:bg-gray-800 hover:shadow-lg hover:shadow-blue-900/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20 transition-all duration-300 group-hover:bg-blue-600/30 group-hover:scale-110">
                <feature.icon className="h-6 w-6 text-blue-500 transition-all duration-300 group-hover:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
                {feature.title}
              </h3>
              <p className="text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
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

// Pricing Section Component
function PricingSection() {
  const plans = [
    { name: "Starter", price: "$29", description: "Perfect for small businesses and personal websites.", features: ["1 Chatbot", "5,000 messages per month", "Document upload (up to 50 pages)", "Basic analytics", "Email support"], cta: "Get Started", popular: false },
    { name: "Professional", price: "$79", description: "Ideal for growing businesses with multiple needs.", features: ["3 Chatbots", "25,000 messages per month", "Document upload (up to 500 pages)", "Advanced analytics", "3 External API actions", "Priority support"], cta: "Get Started", popular: true },
    { name: "Enterprise", price: "Custom", description: "For large organizations with advanced requirements.", features: ["Unlimited Chatbots", "Unlimited messages", "Unlimited document upload", "Custom integrations", "Advanced security features", "Dedicated account manager", "SLA guarantees"], cta: "Contact Sales", popular: false },
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
    <section id="pricing" ref={sectionRef} className="bg-gray-900 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Choose the plan that's right for your business. All plans include a 14-day free trial.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className={`group relative rounded-lg border opacity-0 translate-y-8 transition-all duration-500 ease-out ${
                plan.popular ? "border-blue-600 bg-gray-800" : "border-gray-800 bg-gray-800/50"
              } p-6 shadow-lg hover:shadow-xl hover:shadow-blue-900/5 ${
                plan.popular ? "hover:border-blue-500" : "hover:border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-all duration-300 group-hover:bg-blue-500">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="ml-1 text-gray-400">/month</span>}
                </div>
                <p className="mt-2 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                  {plan.description}
                </p>
              </div>
              <ul className="mb-6 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start group/item">
                    <span className="mr-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/20 transition-all duration-300 group-hover/item:bg-blue-600/30">
                      <Check className="h-3 w-3 text-blue-500 transition-colors duration-300 group-hover/item:text-blue-400" />
                    </span>
                    <span className="text-gray-300 transition-colors duration-300 group-hover/item:text-white">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href={plan.price === "Custom" ? "/contact" : "/signup"}>
                <Button
                  className={`group/btn relative w-full overflow-hidden ${
                    plan.popular ? "bg-blue-600 text-white hover:bg-blue-600" : "bg-gray-700 text-white hover:bg-gray-700"
                  }`}
                >
                  <span className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1">
                    {plan.cta}
                  </span>
                  <span
                    className={`absolute inset-0 z-0 translate-y-[105%] transition-transform duration-300 group-hover/btn:translate-y-0 ${
                      plan.popular ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  ></span>
                </Button>
              </Link>
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
    <section ref={sectionRef} className="bg-gray-800 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Trusted by Innovative Companies
          </h2>
          <p className="mt-4 text-lg text-gray-400">See what our customers are saying about SiteAgent.</p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="group rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-lg opacity-0 translate-y-8 transition-all duration-500 ease-out hover:border-gray-600 hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current text-yellow-500 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-400" />
                ))}
              </div>
              <blockquote className="mb-4 text-gray-300 transition-colors duration-300 group-hover:text-white">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-4">
                <p className="font-medium text-white">{testimonial.author}</p>
                <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
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
    <section ref={sectionRef} className="bg-gray-800 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div
          ref={ctaRef}
          className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center shadow-xl opacity-0 translate-y-8 transition-all duration-700 ease-out md:p-12 hover:shadow-2xl hover:shadow-blue-900/20"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Transform Your Website with AI?
          </h2>
          <p className="mb-8 text-lg text-blue-100">Start your 14-day free trial today. No credit card required.</p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/signup">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-white text-blue-700 transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-white/20"
              >
                <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 z-0 translate-y-[105%] bg-blue-50 transition-transform duration-300 group-hover:translate-y-0"></span>
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white transition-all duration-300 hover:bg-blue-700/50 hover:border-blue-300"
              >
                Contact Sales
              </Button>
            </Link>
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
        <FeaturesSection />
        <HowItWorksSection />
        <IntegrationsBar />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
} 
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
  Users,
  Shield,
  Clock,
  TrendingUp,
  BarChart3,
  Headphones,
  Cpu,
  Play
} from "lucide-react";
import { Button, cn } from "@/app/_components/ui/button";
import IntegrationsBar from "@/app/_components/ui/integrations-bar";
import LivePreview from "@/app/_components/live-preview";
import CookieBanner from "@/app/_components/ui/cookie-banner";
import { createClient } from '@/lib/supabase/client';

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
                <span className="text-orange-600 text-sm font-bold">⚡ INSTANTÁNEO</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  De la Carga a la
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Automatización con IA
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Observa cómo tu contenido estático se transforma en un sistema de automatización inteligente en tiempo real. Sin configuración compleja, sin conocimientos técnicos requeridos.
              </p>
            </div>

            {/* Process steps in a modern card layout */}
            <div className="space-y-4">
              {[
                { step: "01", title: "Cargar Contenido", desc: "Sube cualquier documento, pega texto o ingresa la URL de un sitio web" },
                { step: "02", title: "Procesamiento IA", desc: "Nuestra IA analiza y estructura automáticamente tu contenido" },
                { step: "03", title: "Comienza a Automatizar", desc: "Tu asistente inteligente está listo para manejar tareas reales" }
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
                  <span className="text-gray-600 text-sm ml-4">Interfaz de Demo en Vivo</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <div className="text-blue-700 text-sm font-semibold mb-2">🌐 Pegar URL o Cargar Documentos</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                    <div className="text-purple-700 text-sm font-semibold mb-2">🧠 Procesamiento IA</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-purple-700 text-xs ml-2">Analizando contenido...</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <div className="text-green-700 text-sm font-semibold mb-2">✅ Listo para Automatizar</div>
                    <div className="text-green-700 text-xs">¡Tu asistente IA está en vivo y listo para actuar!</div>
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 text-sm font-bold">🚀 DEMO INTERACTIVO</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Pruébalo 
            </span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Ahora Mismo
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experimenta el poder de la automatización con IA. Simplemente carga tu contenido y observa cómo se crea tu chatbot inteligente en segundos.
          </p>
        </div>

        <div className="relative">
          <LivePreview locale="es" />
          
          {/* Decorative elements around the demo */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
          <div className="absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-sm"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-sm"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full blur-sm"></div>
        </div>

        {/* Additional info below demo */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            ⭐ Este es un entorno de demostración completamente funcional. Tus datos no se guardan.
          </p>
        </div>
      </div>
    </section>
  );
}

// Features Section Component - BRIGHT VERSION
function FeaturesSection() {
  const features = [
    {
      icon: "🚀",
      title: "Configuración en 5 Minutos",
      description: "Desde cero hasta un chatbot completamente funcional en menos de 5 minutos. Sin conocimientos técnicos requeridos.",
      highlight: "Configuración Instantánea"
    },
    {
      icon: "🧠",
      title: "IA Avanzada",
      description: "Tecnología de comprensión de lenguaje natural de última generación que entiende el contexto y las intenciones.",
      highlight: "GPT-4 Powered"
    },
    {
      icon: "🔌",
      title: "Integraciones Poderosas",
      description: "Conecta sin problemas con HubSpot, Calendly, Shopify, Jira y más de 50 herramientas empresariales.",
      highlight: "50+ Integraciones"
    },
    {
      icon: "🌍",
      title: "Soporte Multi-idioma",
      description: "Atiende a clientes globalmente con soporte nativo para más de 100 idiomas diferentes.",
      highlight: "100+ Idiomas"
    },
    {
      icon: "📊",
      title: "Análisis en Tiempo Real",
      description: "Obtén insights detallados sobre las interacciones de los clientes y el rendimiento del chatbot.",
      highlight: "Análisis Profundos"
    },
    {
      icon: "🔒",
      title: "Seguridad Empresarial",
      description: "Cumplimiento SOC 2, encriptación de extremo a extremo y controles de acceso granulares.",
      highlight: "Nivel Empresarial"
    }
  ];

  return (
    <section id="features" className="relative py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-full px-4 py-2 mb-6">
            <span className="text-purple-600 text-sm font-bold">✨ CARACTERÍSTICAS</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Todo lo que Necesitas para
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Automatizar con Éxito
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Desde configuración instantánea hasta análisis avanzados, tenemos todo cubierto para hacer que tu automatización con IA sea un éxito rotundo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative bg-white/80 border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
              {/* Highlight badge */}
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {feature.highlight}
              </div>
              
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              
              {/* Hover effect decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Integration showcase */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Se Integra con Tus Herramientas Favoritas
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conecta sin problemas con las herramientas que ya usas todos los días.
            </p>
          </div>
          
          <IntegrationsBar locale="es" />
        </div>
      </div>
    </section>
  );
}

// How It Works Section Component - BRIGHT VERSION
function HowItWorksSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      number: "01",
      title: "Cargar Contenido",
      description: "Sube documentos, pega texto o comparte la URL de tu sitio web",
      details: "Acepta PDFs, archivos de Word, texto plano, URLs de sitios web y más. Nuestro sistema procesa automáticamente todo tipo de contenido.",
      icon: "📄"
    },
    {
      number: "02", 
      title: "Procesamiento IA",
      description: "Nuestra IA analiza y estructura tu contenido automáticamente",
      details: "Algoritmos avanzados extraen información clave, crean mapas de conocimiento y preparan respuestas inteligentes.",
      icon: "🧠"
    },
    {
      number: "03",
      title: "Personalizar Chatbot", 
      description: "Ajusta la personalidad, apariencia y comportamiento",
      details: "Define el tono de voz, colores de marca, flujos de conversación y reglas de escalación específicas para tu negocio.",
      icon: "🎨"
    },
    {
      number: "04",
      title: "Implementar & Automatizar",
      description: "Copia el código e incrústalo en tu sitio web",
      details: "Un simple fragmento de código para implementar. Comienza a automatizar tareas como programar reuniones y actualizar CRM inmediatamente.",
      icon: "🚀"
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  useEffect(() => {
    const interval = setInterval(nextStep, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-purple-50">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-green-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-green-100 border border-blue-300 rounded-full px-4 py-2 mb-6">
            <span className="text-blue-600 text-sm font-bold">⚙️ PROCESO</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Cómo Funciona en
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              4 Pasos Simples
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            De contenido estático a automatización inteligente en minutos. Nuestro proceso simplificado hace que crear un chatbot potente sea tan fácil como arrastrar y soltar.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Desktop Steps Layout */}
          <div className="hidden lg:block">
            <div className="grid lg:grid-cols-4 gap-8 mb-12">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    currentStep === index 
                      ? 'transform scale-105' 
                      : 'opacity-70 hover:opacity-90'
                  }`}
                  onClick={() => goToStep(index)}
                >
                  <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                    {/* Step number */}
                    <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      {step.number}
                    </div>
                    
                    <div className="pt-4">
                      <div className="text-3xl mb-3">{step.icon}</div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                    
                    {/* Active indicator */}
                    {currentStep === index && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-2xl"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed view for current step */}
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-300 rounded-3xl p-8 shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{steps[currentStep].title}</h3>
                <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                  {steps[currentStep].details}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Steps Layout */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-xl flex items-center justify-center shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <p className="text-gray-700 text-sm">{step.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Integration Ecosystem Section - BRIGHT VERSION
function IntegrationEcosystemSection() {
  return (
    <section className="relative py-16 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ecosistema de Integraciones Completo
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conecta con las herramientas que ya conoces y amas. Más de 50 integraciones nativas y creciendo.
          </p>
        </div>
        
        <IntegrationsBar locale="es" />
      </div>
    </section>
  );
}

// Testimonials Section - BRIGHT VERSION  
function TestimonialsSection() {
  const testimonials = [
    { quote: "SiteAgent ha transformado nuestro soporte al cliente. Nuestro chatbot maneja el 70% de las consultas automáticamente, ahorrándonos incontables horas." },
    { quote: "La capacidad de conectar nuestro chatbot a nuestro CRM y herramientas de programación ha sido revolucionaria. Es como tener un miembro extra del equipo." },
    { quote: "Subimos la documentación de nuestro producto y en minutos teníamos un chatbot que podía responder preguntas técnicas con precisión. ¡Impresionante!" },
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
            <span className="text-yellow-400 text-sm font-semibold tracking-wide">Historias de Clientes</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              La Confianza de Empresas
            </span>
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
              Innovadoras
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">Descubre lo que nuestros clientes dicen sobre SiteAgent.</p>
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

// Pricing Section - BRIGHT VERSION - Updated to match English pricing
function PricingSection() {
  const plans = [
    {
      name: "Gratuito",
      price: "€0",
      period: "para siempre",
      description: "Perfecto para explorar SiteAgent",
      features: [
        "1 Chatbot",
        "100 mensajes / mes",
        "1 MB de almacenamiento de datos",
        "Extraer 3 sitios web",
        "Soporte de la comunidad",
      ],
      highlight: false,
      cta: "Comenzar Gratis",
      href: "/signup",
      trial: false,
    },
    {
      name: "SiteAgent Starter",
      price: "€29.99",
      period: "mes",
      description: "Perfecto para pequeñas startups",
      features: [
        "1 Chatbot",
        "500 mensajes / mes",
        "5 MB de almacenamiento de datos",
        "Extraer 10 sitios web",
        "Integraciones esenciales",
        "Soporte por email",
      ],
      highlight: false,
      cta: "Comenzar Prueba Gratuita",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Growth",
      price: "€149",
      period: "mes",
      description: "Más popular para empresas en crecimiento",
      features: [
        "3 Chatbots",
        "3.000 mensajes / mes",
        "25 MB de almacenamiento de datos",
        "Extraer 25 sitios web",
        "Todas las integraciones",
        "Soporte prioritario",
      ],
      highlight: true,
      cta: "Comenzar Prueba Gratuita",
      href: "/signup",
      trial: true,
    },
    {
      name: "SiteAgent Pro",
      price: "€399",
      period: "mes",
      description: "Para empresas en crecimiento",
      features: [
        "10 Chatbots",
        "10.000 mensajes / mes",
        "100 MB de almacenamiento de datos",
        "Extraer 50 sitios web",
        "Todas las integraciones + API personalizada",
        "Soporte dedicado y onboarding",
      ],
      highlight: false,
      cta: "Comenzar Prueba Gratuita",
      href: "/signup",
      trial: true,
    },
    {
      name: "Enterprise",
      price: "Hablemos",
      period: "",
      description: "Soluciones empresariales adaptadas a tus necesidades",
      features: [
        "Chatbots ilimitados",
        "Límites de mensajes personalizados",
        "Rastreo ilimitado de sitios web",
        "Almacenamiento dedicado",
        "Implementación on-premise",
        "Soluciones white-label",
        "Soporte prioritario y SLA",
        "Integraciones personalizadas",
      ],
      highlight: false,
      cta: "Contactar Ventas",
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
            <span className="text-green-400 text-sm font-semibold tracking-wide">Precios Transparentes</span>
          </div>
          <h2 className="mb-6 text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Precios simples y
            </span>
            <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mt-2">
              transparentes
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Comienza gratis – actualiza cuando necesites más potencia. Sin tarifas ocultas.
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
                  Más Popular
                </span>
              )}
              
              {/* Trial badge */}
              {plan.trial && (
                <span className="absolute -top-3 right-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-2 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                  Prueba 14 días
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
                      14 días gratis, luego cancela cuando quieras
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
      question: "¿Qué tan rápido puedo tener mi chatbot funcionando?",
      answer: "La mayoría de nuestros clientes tienen su chatbot funcionando en menos de 5 minutos. Simplemente sube tu contenido, personaliza la apariencia y copia el código de integración."
    },
    {
      question: "¿Necesito conocimientos técnicos para usar SiteAgent?", 
      answer: "Para nada. SiteAgent está diseñado para ser usado por cualquier persona, sin importar su nivel técnico. La interfaz es intuitiva y el proceso de configuración es completamente visual."
    },
    {
      question: "¿Qué tipos de documentos puedo cargar?",
      answer: "Acepta PDFs, archivos de Word, texto plano, URLs de sitios web, archivos CSV y más. Nuestro sistema procesa automáticamente cualquier tipo de contenido de texto."
    },
    {
      question: "¿El chatbot puede manejar múltiples idiomas?",
      answer: "Sí, nuestro chatbot tiene soporte nativo para más de 100 idiomas. Puede detectar automáticamente el idioma del usuario y responder en consecuencia."
    },
    {
      question: "¿Cómo se integra con mis herramientas existentes?",
      answer: "Ofrecemos integraciones nativas con HubSpot, Calendly, Shopify, Jira y más de 50 herramientas empresariales. También tenemos API abierta para integraciones personalizadas."
    },
    {
      question: "¿Qué pasa si necesito cancelar mi suscripción?",
      answer: "Puedes cancelar en cualquier momento desde tu panel de control. No hay penalizaciones ni tarifas de cancelación. Ofrecemos reembolso completo en los primeros 30 días."
    }
  ];

  return (
    <section id="faq" className="relative py-20 md:py-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-full px-4 py-2 mb-6">
            <span className="text-purple-600 text-sm font-bold">❓ PREGUNTAS FRECUENTES</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Preguntas Frecuentes
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Encuentra respuestas a las preguntas más comunes sobre SiteAgent.
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

// CTA Section - BRIGHT VERSION
function CtaSection() {
  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300 rounded-full px-6 py-3">
            <span className="text-orange-600 text-sm font-bold">🚀 COMIENZA HOY</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              ¿Listo para
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Automatizar?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Únete a más de 10,000 empresas que ya están automatizando su atención al cliente con IA. 
            <span className="font-semibold text-blue-600"> Sin configuración compleja, sin conocimientos técnicos.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link href="/signup" className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-300/50 flex items-center gap-3">
              <span>Comenzar Gratis Ahora</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="#live-demo" className="border-2 border-gray-400 text-gray-700 bg-white/80 px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:border-gray-500 hover:text-gray-800 hover:bg-white flex items-center gap-3 shadow-lg">
              <span>Ver Demo Primero</span>
              <span>👀</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 bg-white/80 border border-gray-200 rounded-xl px-6 py-4 shadow-md">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">14 días gratis</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/80 border border-gray-200 rounded-xl px-6 py-4 shadow-md">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">No requiere tarjeta</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/80 border border-gray-200 rounded-xl px-6 py-4 shadow-md">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Cancela cuando quieras</span>
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
    <footer className="bg-gradient-to-b from-purple-50 to-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={32} height={32} />
              <span className="text-xl font-bold text-gray-800">SiteAgent</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Automatiza tu atención al cliente con chatbots inteligentes potenciados por IA. Fácil, rápido y efectivo.
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
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Producto</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Características</Link></li>
              <li><Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Precios</Link></li>
              <li><Link href="/tools/token-counter" className="text-gray-600 hover:text-blue-600 transition-colors">Contador de Tokens IA</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Integraciones</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">Acerca de</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-blue-600 transition-colors">Carreras</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Soporte</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Centro de Ayuda</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentación</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Estado del Sistema</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Comunidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            © 2024 SiteAgent. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacidad</Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Términos</Link>
            <Link href="/security" className="text-gray-600 hover:text-blue-600 transition-colors">Seguridad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Component Export
export default function SpanishLandingPageClient() {
  return (
    <>
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
    </>
  );
} 
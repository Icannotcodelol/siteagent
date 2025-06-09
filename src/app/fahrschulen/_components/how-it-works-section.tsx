'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle, ArrowRight, Check } from 'lucide-react';

// How It Works Section - German Process for Driving Schools
export default function HowItWorksSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { 
      number: "01", 
      title: "Chatbot erstellen", 
      description: "Melden Sie sich an und erstellen Sie Ihren Fahrschul-Chatbot mit unserem intuitiven Dashboard. Geben Sie Namen und Verhalten des Assistenten an.", 
      features: ["Keine Programmierung erforderlich", "Anpassbare Persönlichkeit", "Fahrschul-spezifische Vorlagen"],
      visual: "🤖"
    },
    { 
      number: "02", 
      title: "Daten hinzufügen", 
      description: "Fügen Sie Ihre Fahrschul-Informationen hinzu: Website-URL eingeben (am einfachsten!), Dokumente hochladen oder Texte einfügen.", 
      features: ["Website-URL für sofortige Einrichtung", "Dokumente hochladen (Preislisten, etc.)", "Texte direkt einfügen"],
      visual: "📚"
    },
    { 
      number: "03", 
      title: "Anpassen & Konfigurieren", 
      description: "Passen Sie Aussehen, Integrationen und Automatisierungen an. Verbinden Sie Kalendly für Terminbuchungen oder HubSpot für Lead-Management.", 
      features: ["Design an Ihre Marke anpassen", "Automatische Terminbuchungen", "CRM-Integrationen"],
      visual: "⚡"
    },
    { 
      number: "04", 
      title: "Einbetten & Live gehen", 
      description: "Kopieren Sie den Embed-Code und fügen Sie ihn in Ihre Website ein. Ihr intelligenter Fahrschul-Assistent ist sofort einsatzbereit.", 
      features: ["Einfacher Embed-Code", "Echtzeitanalysen", "24/7 automatische Betreuung"],
      visual: "🚀"
    }
  ];

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
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsAnimating(false);
      }, 150);
    }
  };

  return (
    <section className="py-20 bg-gray-800/30">
      <div className="container relative mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <span className="text-blue-400 text-sm font-bold">🛠️ EINFACHER PROZESS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Von Ihren Infos zum
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              intelligenten Assistenten
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            In nur 4 einfachen Schritten haben Sie Ihren eigenen KI-Assistenten für Ihre Fahrschule.
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
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{steps[currentStep].visual}</div>
                <div>
                  <div className="text-gray-400 text-sm font-medium mb-2">
                    Schritt {steps[currentStep].number}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {steps[currentStep].title}
                  </h3>
                </div>
              </div>
              
              <p className="text-lg text-gray-300 leading-relaxed">
                {steps[currentStep].description}
              </p>
              
              {/* Features list */}
              <div className="space-y-3">
                {steps[currentStep].features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation buttons */}
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
                <span>Zurück</span>
              </button>

              {currentStep === steps.length - 1 ? (
                <Link href="/signup">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-green-600 to-green-700 text-white hover:scale-105 shadow-lg hover:shadow-xl hover:from-green-500 hover:to-green-600">
                    <span>Jetzt starten! →</span>
                  </button>
                </Link>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>Weiter</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏫</div>
                    <h4 className="text-white font-semibold mb-4">Ihre Fahrschul-Informationen</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="text-blue-300 text-sm font-medium">Website URL</div>
                      <div className="text-gray-400 text-xs">www.ihre-fahrschule.de</div>
                    </div>
                    <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="text-blue-300 text-sm font-medium">Preisliste Klasse B</div>
                      <div className="text-gray-400 text-xs">PDF automatisch erkannt</div>
                    </div>
                    <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="text-blue-300 text-sm font-medium">Fahrstunden-Infos</div>
                      <div className="text-gray-400 text-xs">Termine und Abläufe</div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🤖</div>
                    <h4 className="text-white font-semibold mb-4">KI-Analyse läuft...</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm">Preise erkannt ✓</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm">Öffnungszeiten gefunden ✓</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-300 text-sm">Wissensbasis wird erstellt...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎨</div>
                    <h4 className="text-white font-semibold mb-4">Design anpassen</h4>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                      <span className="text-white text-sm font-medium">Fahrschule Müller</span>
                    </div>
                    <div className="bg-blue-600/20 rounded-lg p-3 mb-3">
                      <div className="text-blue-300 text-sm">
                        Hallo! Ich bin Ihr Fahrschul-Assistent. Wie kann ich Ihnen helfen?
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-gray-600/50 rounded-lg px-3 py-1 text-xs text-gray-300">
                        Preise
                      </div>
                      <div className="bg-gray-600/50 rounded-lg px-3 py-1 text-xs text-gray-300">
                        Termine
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🚀</div>
                    <h4 className="text-white font-semibold mb-4">Bereit zum Einsatz!</h4>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                    <div className="text-green-400">{'<script'}</div>
                    <div className="text-blue-400 ml-4">{'src="siteagent.js"'}</div>
                    <div className="text-blue-400 ml-4">{'chatbot-id="ihre-id"'}</div>
                    <div className="text-green-400">{'></script>'}</div>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <div className="text-green-300 font-semibold">🎉 Chatbot ist aktiv!</div>
                    <div className="text-green-400 text-sm">Beantwortet ab sofort alle Fragen</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
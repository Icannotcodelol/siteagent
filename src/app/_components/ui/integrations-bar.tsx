import React from 'react';
import Image from 'next/image'; // Import next/image

interface Integration {
  name: string;
  logo: string; // Changed to string for image path
}

interface IntegrationsBarProps {
  locale?: 'en' | 'it' | 'de' | 'pl' | 'es' | 'nl';
}

// Placeholder simple SVG icons - REMOVED as we are using image paths now

const integrations: Integration[] = [
  { name: 'Calendly', logo: '/integrations/calendly.svg' },
  { name: 'Jira', logo: '/integrations/jira.svg' },
  { name: 'HubSpot', logo: '/integrations/hubspot.svg' },
  { name: 'Shopify', logo: '/integrations/shopify.svg' },
  { name: 'Monday', logo: '/integrations/monday.svg' },
];

const translations = {
  en: {
    title: "Works with your tools",
    description: "Integrate diverse data sources to enrich your agent's knowledge and capabilities."
  },
  it: {
    title: "Lavora con i tuoi strumenti",
    description: "Integra diverse fonti di dati per arricchire le conoscenze e le capacità del tuo agente."
  },
  de: {
    title: "Funktioniert mit Ihren Tools",
    description: "Integrieren Sie verschiedene Datenquellen, um das Wissen und die Fähigkeiten Ihres Agenten zu erweitern."
  },
  pl: {
    title: "Współpracuje z Twoimi narzędziami",
    description: "Integruj różnorodne źródła danych, aby wzbogacić wiedzę i możliwości swojego agenta."
  },
  es: {
    title: "Funciona con tus herramientas",
    description: "Integra diversas fuentes de datos para enriquecer el conocimiento y las capacidades de tu agente."
  },
  nl: {
    title: "Werkt met jouw tools",
    description: "Integreer diverse databronnen om de kennis en mogelijkheden van je agent te verrijken."
  }
};

const IntegrationsBar: React.FC<IntegrationsBarProps> = ({ locale = 'en' }) => {
  const t = translations[locale];
  const isBright = locale === 'en' || locale === 'it' || locale === 'de' || locale === 'pl' || locale === 'es' || locale === 'nl'; // Add English, Spanish and Dutch to bright theme

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 text-center">
          <h3 className={`text-2xl font-bold mb-2 ${
            isBright ? 'text-gray-800' : 'text-white'
          }`}>
            {t.title}
          </h3>
          <p className={`leading-relaxed max-w-2xl mx-auto ${
            isBright ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {t.description}
          </p>
        </div>
        
        {/* Enhanced integration cards */}
        <div className="flex justify-center items-center gap-6 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {integrations.map((integration, index) => (
            <div
              key={integration.name}
              className={`group flex-shrink-0 flex items-center space-x-3 p-4 px-6 backdrop-blur-sm border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${
                isBright 
                  ? 'bg-white/90 border-gray-200 hover:border-gray-300 hover:shadow-blue-200/20' 
                  : 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-700/50 hover:border-gray-600/50 hover:shadow-blue-900/10'
              }`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Icon container with gradient background */}
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl p-2 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                isBright 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                <Image 
                  src={integration.logo}
                  alt={`${integration.name} logo`}
                  width={24}
                  height={24}
                  className="h-6 w-6 filter brightness-0 invert"
                />
              </div>
              
              {/* Integration name with enhanced typography */}
              <span className={`text-lg font-semibold transition-colors duration-300 ${
                isBright 
                  ? 'text-gray-800 group-hover:text-purple-600' 
                  : 'text-white group-hover:text-blue-400'
              }`}>
                {integration.name}
              </span>
              
              {/* Subtle hover indicator */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className={`h-4 w-4 ${
                  isBright ? 'text-purple-600' : 'text-blue-400'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced fade effect for mobile scroll */}
        <div className="relative md:hidden">
          <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none ${
            isBright 
              ? 'bg-gradient-to-l from-blue-50 to-transparent' 
              : 'bg-gradient-to-l from-gray-900 to-transparent'
          }`}></div>
          <div className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none ${
            isBright 
              ? 'bg-gradient-to-r from-blue-50 to-transparent' 
              : 'bg-gradient-to-r from-gray-900 to-transparent'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsBar; 
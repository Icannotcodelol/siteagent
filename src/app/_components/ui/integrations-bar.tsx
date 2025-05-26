import React from 'react';
import Image from 'next/image'; // Import next/image

interface Integration {
  name: string;
  logo: string; // Changed to string for image path
}

// Placeholder simple SVG icons - REMOVED as we are using image paths now

const integrations: Integration[] = [
  { name: 'Calendly', logo: '/integrations/calendly.svg' },
  { name: 'Jira', logo: '/integrations/jira.svg' },
  { name: 'HubSpot', logo: '/integrations/hubspot.svg' },
  { name: 'Shopify', logo: '/integrations/shopify.svg' },
  { name: 'Monday', logo: '/integrations/monday.svg' },
];

const IntegrationsBar: React.FC = () => {
  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Works with your tools</h3>
          <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Integrate diverse data sources to enrich your agent&apos;s knowledge and capabilities.
          </p>
        </div>
        
        {/* Enhanced integration cards */}
        <div className="flex justify-center items-center gap-6 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {integrations.map((integration, index) => (
            <div
              key={integration.name}
              className="group flex-shrink-0 flex items-center space-x-3 p-4 px-6 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg hover:border-gray-600/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Icon container with gradient background */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-2 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Image 
                  src={integration.logo}
                  alt={`${integration.name} logo`}
                  width={24}
                  height={24}
                  className="h-6 w-6 filter brightness-0 invert"
                />
              </div>
              
              {/* Integration name with enhanced typography */}
              <span className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-blue-400">
                {integration.name}
              </span>
              
              {/* Subtle hover indicator */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced fade effect for mobile scroll */}
        <div className="relative md:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsBar; 
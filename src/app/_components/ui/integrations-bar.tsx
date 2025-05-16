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
    <div className="w-full py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-3 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Works with your tools</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Integrate diverse data sources to enrich your agent&apos;s knowledge and capabilities.
          </p>
        </div>
        <div className="flex justify-center space-x-3 overflow-x-auto whitespace-nowrap py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex-shrink-0 flex items-center space-x-2 p-2 px-3 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
            >
              <Image 
                src={integration.logo}
                alt={`${integration.name} logo`}
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="text-sm font-medium text-black">{integration.name}</span>
            </div>
          ))}
          {/* Fade effect for the right side - ensuring background matches page for dark mode */}
          <div className="sticky right-0 top-0 bottom-0 w-16 h-full bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none md:hidden"></div>

        </div>
      </div>
    </div>
  );
};

export default IntegrationsBar; 
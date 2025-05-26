"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/app/_components/ui/button';
import { X, Cookie, Shield, Settings, Check } from 'lucide-react';
import Link from 'next/link';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    timestamp: 0
  });

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem('cookie-consent');
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        // Show banner again if consent is older than 6 months
        const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
        if (parsed.timestamp < sixMonthsAgo) {
          setShowBanner(true);
        }
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = (consentData: Partial<CookieConsent>) => {
    const finalConsent = {
      ...consent,
      ...consentData,
      necessary: true, // Always true
      timestamp: Date.now()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(finalConsent));
    setShowBanner(false);
    
    // Apply consent settings
    applyConsentSettings(finalConsent);
  };

  const applyConsentSettings = (consentData: CookieConsent) => {
    // Here you would integrate with your analytics/marketing tools
    if (consentData.analytics) {
      // Enable Google Analytics, etc.
      console.log('Analytics cookies enabled');
    }
    
    if (consentData.marketing) {
      // Enable marketing cookies
      console.log('Marketing cookies enabled');
    }
  };

  const acceptAll = () => {
    saveConsent({
      analytics: true,
      marketing: true
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      analytics: false,
      marketing: false
    });
  };

  const acceptCustom = () => {
    saveConsent(consent);
    setShowDetails(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
      <div className="container mx-auto px-4 py-4">
        {!showDetails ? (
          // Simple banner view
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold mb-1">We use cookies</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We use essential cookies for authentication and optional cookies to improve your experience. 
                  You can manage your preferences or learn more in our{' '}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Preferences
              </Button>
              <Button
                onClick={acceptNecessary}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Necessary Only
              </Button>
              <Button
                onClick={acceptAll}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          // Detailed preferences view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Necessary Cookies */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Necessary</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Always active</span>
                    <div className="w-8 h-4 bg-blue-600 rounded-full flex items-center justify-end pr-0.5">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-xs">
                  Essential for authentication, security, and basic website functionality.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Analytics</h4>
                  <button
                    onClick={() => setConsent(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                      consent.analytics ? 'bg-blue-600 justify-end pr-0.5' : 'bg-gray-600 justify-start pl-0.5'
                    }`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </button>
                </div>
                <p className="text-gray-300 text-xs">
                  Help us understand how visitors interact with our website.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Marketing</h4>
                  <button
                    onClick={() => setConsent(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                      consent.marketing ? 'bg-blue-600 justify-end pr-0.5' : 'bg-gray-600 justify-start pl-0.5'
                    }`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </button>
                </div>
                <p className="text-gray-300 text-xs">
                  Used to deliver relevant advertisements and measure their effectiveness.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                onClick={acceptNecessary}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Necessary Only
              </Button>
              <Button
                onClick={acceptCustom}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
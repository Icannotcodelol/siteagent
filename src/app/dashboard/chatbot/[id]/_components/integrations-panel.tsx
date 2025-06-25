'use client';

import { useEffect, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client'; // Use client for fetching tokens

// Import OAuth URL actions
import { getHubspotOAuthUrl } from '@/app/actions/hubspot';
import { getJiraOAuthUrl } from '@/app/actions/jira';
import { getCalendlyOAuthUrl } from '@/app/actions/oauth';
import { getShopifyOAuthUrl } from '@/app/actions/shopify'; // Import Shopify action
import { getMondayOAuthUrl } from '@/app/actions/monday'; // Import Monday action
import { getInstagramAuthUrl } from '@/app/actions/instagram'; // Import Instagram action

// Import the reusable connect button
import ConnectServiceButton from '@/app/dashboard/_components/connect-service-button';
import InstagramConnectButton from '@/app/dashboard/_components/instagram-connect-button';

interface Props {
  chatbotId: string;
}

type IntegrationKey = 'hubspot' | 'jira' | 'calendly' | 'shopify' | 'monday' | 'instagram';

interface ChatbotIntegrationState {
  integration_hubspot: boolean;
  integration_jira: boolean;
  integration_calendly: boolean;
  integration_shopify: boolean;
  integration_monday: boolean; // Add Monday
  integration_instagram: boolean; // Add Instagram
}

interface AccountConnectionState {
  hubspot: boolean;
  jira: boolean;
  calendly: boolean;
  shopify: boolean;
  monday: boolean; // Add Monday
  instagram: boolean; // Add Instagram
}

export default function IntegrationsPanel({ chatbotId }: Props) {
  // State for this specific chatbot's enabled integrations
  const [chatbotState, setChatbotState] = useState<ChatbotIntegrationState | null>(null);
  // State for the user's account-level connections
  const [accountConnections, setAccountConnections] = useState<AccountConnectionState | null>(null);
  const [shopifyDomain, setShopifyDomain] = useState<string>(''); // State for Shopify domain input
  const [shopifyConnectError, setShopifyConnectError] = useState<string | null>(null);
  const [isShopifyConnecting, startShopifyConnectTransition] = useTransition();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const supabase = createClient();

  // Fetch both chatbot settings and account connection status
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setShopifyConnectError(null);
      try {
        // 1. Fetch chatbot-specific integration flags
        const resChatbot = await fetch(`/api/chatbots/${chatbotId}/integrations`);
        if (!resChatbot.ok) throw new Error(`Failed to load chatbot settings: ${await resChatbot.text()}`);
        const jsonChatbot = await resChatbot.json();
        setChatbotState(jsonChatbot);

        // 2. Fetch account-level connection status (needs user ID)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated.");

        const { data: tokens, error: tokenError } = await supabase
          .from('user_oauth_tokens')
          .select('service_name')
          .eq('user_id', user.id);

        if (tokenError) throw new Error(`Failed to load account connections: ${tokenError.message}`);

        const connectedServices = tokens?.map(t => t.service_name) ?? [];
        setAccountConnections({
          hubspot: connectedServices.includes('hubspot'),
          jira: connectedServices.includes('jira'),
          calendly: connectedServices.includes('calendly'),
          shopify: connectedServices.includes('shopify'),
          monday: connectedServices.includes('monday'),
          instagram: connectedServices.includes('instagram'),
        });

      } catch (e: any) {
        setError(e.message);
        console.error("Error loading integration data:", e);
      } finally {
        setLoading(false);
      }
    };

    if (chatbotId) loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotId]); // Supabase client is stable

  // Toggle function remains the same (updates chatbot-specific flag)
  const toggleChatbotIntegration = async (service: IntegrationKey, enabled: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, enabled }),
      });
      if (!res.ok) throw new Error(await res.text());
      setChatbotState((prev) => prev ? { ...prev, [`integration_${service}`]: enabled } as ChatbotIntegrationState : prev);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Specific handler for Shopify Connect button ---
  const handleShopifyConnect = () => {
    if (!shopifyDomain.trim()) {
      setShopifyConnectError('Please enter your Shopify store domain (e.g., your-store).');
      return;
    }
    setShopifyConnectError(null);
    startShopifyConnectTransition(async () => {
      const { url, error: actionError } = await getShopifyOAuthUrl(shopifyDomain.trim());
      if (actionError) {
        setShopifyConnectError(actionError);
        return;
      }
      if (url) {
        window.location.href = url;
      } else {
        setShopifyConnectError('Unexpected error: No Shopify OAuth URL returned.');
      }
    });
  };

  if (loading) {
    return <p className="text-gray-400 text-sm">Loading integrations...</p>;
  }
  if (error) {
    return <p className="text-red-500 text-sm">Error loading integrations: {error}</p>;
  }
  if (!chatbotState || !accountConnections) {
    return <p className="text-gray-400 text-sm">Could not load integration status.</p>;
  }

  // --- Render logic for each service ---

  const renderHubspot = () => {
    if (!accountConnections.hubspot) {
      return <ConnectServiceButton 
                serviceName="hubspot" 
                displayName="HubSpot" 
                getOAuthUrlAction={getHubspotOAuthUrl} 
             />;
    }
    const checked = chatbotState.integration_hubspot;
    return renderToggle('HubSpot', 'hubspot', checked);
  };

  const renderJira = () => {
    if (!accountConnections.jira) {
      return <ConnectServiceButton 
                serviceName="jira" 
                displayName="Jira" 
                getOAuthUrlAction={getJiraOAuthUrl} 
             />;
    }
    const checked = chatbotState.integration_jira;
    return renderToggle('Jira', 'jira', checked);
  };

  const renderCalendly = () => {
    if (!accountConnections.calendly) {
      return <ConnectServiceButton 
                serviceName="calendly" 
                displayName="Calendly" 
                getOAuthUrlAction={getCalendlyOAuthUrl} 
             />;
    }
    const checked = chatbotState.integration_calendly;
    return renderToggle('Calendly', 'calendly', checked);
  };
  
  // --- Specific render logic for Shopify ---
  const renderShopify = () => {
    if (!accountConnections.shopify) {
      // Render input + connect button
      return (
        <div className="py-3 border-b border-gray-700 last:border-b-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Shopify: Not Connected</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="your-store-name" 
                value={shopifyDomain}
                onChange={(e) => setShopifyDomain(e.target.value)}
                className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isShopifyConnecting}
              />
              <span className="text-xs text-gray-500">.myshopify.com</span> 
              <button
                onClick={handleShopifyConnect}
                disabled={isShopifyConnecting}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-blue-700 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isShopifyConnecting ? 'Connecting...' : 'Connect Shopify'}
              </button>
            </div>
          </div>
          {shopifyConnectError && <p className="text-xs text-red-500 mt-1 pl-1">Error: {shopifyConnectError}</p>}
        </div>
      );
    }
    
    // Account IS connected, render toggle
    const checked = chatbotState.integration_shopify; // Uncomment when ready
    return renderToggle('Shopify', 'shopify', checked);
  };
  
  // General toggle rendering function (used when account IS connected)
  const renderToggle = (label: string, key: IntegrationKey, isChecked: boolean) => {
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isChecked}
            disabled={saving}
            onChange={(e) => toggleChatbotIntegration(key, e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-600 rounded-full 
                        peer peer-focus:ring-2 peer-focus:ring-purple-400 peer-focus:ring-offset-2 peer-focus:ring-offset-gray-900 
                        peer-checked:bg-purple-600 transition-colors duration-200 ease-in-out">
          </div>
          <div className="absolute left-[2px] top-[2px] h-5 w-5 bg-white rounded-full 
                        transition-transform duration-200 ease-in-out 
                        peer-checked:translate-x-5">
          </div>
        </label>
      </div>
    );
  };

  const renderMonday = () => {
    if (!accountConnections.monday) {
      return <ConnectServiceButton 
                serviceName="monday" 
                displayName="Monday.com" 
                getOAuthUrlAction={getMondayOAuthUrl} 
             />;
    }
    const checked = chatbotState.integration_monday;
    return renderToggle('Monday.com', 'monday', checked);
  };

  const renderInstagram = () => {
    if (!accountConnections.instagram) {
      return <InstagramConnectButton 
                serviceName="instagram" 
                displayName="Instagram" 
             />;
    }
    const checked = chatbotState.integration_instagram;
    return renderToggle('Instagram', 'instagram', checked);
  };

  return (
    <div className="space-y-1">
      {renderHubspot()}
      {renderJira()}
      {renderCalendly()}
      {renderShopify()}
      {renderMonday()}
      {renderInstagram()}
    </div>
  );
} 
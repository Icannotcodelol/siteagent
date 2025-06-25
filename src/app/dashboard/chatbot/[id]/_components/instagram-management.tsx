'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  getInstagramConnections, 
  disconnectInstagram, 
  enableInstagramForChatbot,
  disableInstagramForChatbot 
} from '@/app/actions/instagram';

interface InstagramConnection {
  id: string;
  page_id: string;
  page_name: string;
  instagram_business_account_id: string | null;
  instagram_business_account_username: string | null;
  created_at: string;
}

interface Props {
  chatbotId: string;
}

export default function InstagramManagement({ chatbotId }: Props) {
  const [connections, setConnections] = useState<InstagramConnection[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [chatbotId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Instagram connections
      const instagramConnections = await getInstagramConnections();
      setConnections(instagramConnections || []);

      // Get chatbot integration status
      const { data: chatbot } = await supabase
        .from('chatbots')
        .select('integration_instagram')
        .eq('id', chatbotId)
        .single();

      setIsEnabled(chatbot?.integration_instagram || false);

      // Find which page is connected to this chatbot (if any)
      // For now, we'll use the first connection
      if (instagramConnections && instagramConnections.length > 0) {
        setSelectedPageId(instagramConnections[0].page_id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async () => {
    if (!selectedPageId && !isEnabled) {
      setError('Please select an Instagram account first');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEnabled) {
        // Disable integration
        await disableInstagramForChatbot(chatbotId);
        setIsEnabled(false);
      } else {
        // Enable integration
        await enableInstagramForChatbot(chatbotId, selectedPageId!);
        setIsEnabled(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (pageId: string) => {
    if (confirm('Are you sure you want to disconnect this Instagram account?')) {
      try {
        setSaving(true);
        await disconnectInstagram(pageId);
        await loadData(); // Refresh data
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <p className="text-gray-400">Loading Instagram connections...</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">📷</span>
        Instagram Direct Messages
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {connections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No Instagram accounts connected yet.</p>
          <p className="text-sm text-gray-500">
            Connect your Instagram Business account to enable automatic DM responses.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {connections.map((connection) => (
              <div 
                key={connection.id} 
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div>
                  <p className="font-medium text-white">{connection.page_name}</p>
                  {connection.instagram_business_account_username && (
                    <p className="text-sm text-gray-400">
                      @{connection.instagram_business_account_username}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Connected {new Date(connection.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDisconnect(connection.page_id)}
                  disabled={saving}
                  className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 
                           bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 
                           rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>

          {connections.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Instagram Account for this Chatbot
              </label>
              <select
                value={selectedPageId || ''}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                         text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isEnabled || saving}
              >
                <option value="">Select an account...</option>
                {connections.map((connection) => (
                  <option key={connection.page_id} value={connection.page_id}>
                    {connection.page_name} 
                    {connection.instagram_business_account_username && 
                      ` (@${connection.instagram_business_account_username})`
                    }
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Enable Instagram DM Auto-Response
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Your chatbot will automatically respond to Instagram Direct Messages
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isEnabled}
                onChange={handleToggleIntegration}
                disabled={saving || (!selectedPageId && !isEnabled)}
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full 
                            peer peer-focus:ring-2 peer-focus:ring-purple-400 
                            peer-focus:ring-offset-2 peer-focus:ring-offset-gray-900 
                            peer-checked:bg-gradient-to-r peer-checked:from-purple-600 
                            peer-checked:to-pink-600 transition-all duration-200">
              </div>
              <div className="absolute left-[2px] top-[2px] h-5 w-5 bg-white rounded-full 
                            transition-transform duration-200 ease-in-out 
                            peer-checked:translate-x-5">
              </div>
            </label>
          </div>
        </>
      )}

      {isEnabled && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-400">
            ✅ Instagram integration is active. Your chatbot is responding to DMs automatically.
          </p>
        </div>
      )}
    </div>
  );
} 
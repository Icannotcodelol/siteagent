'use client';

import { useState, useTransition } from 'react';
import { getInstagramAuthUrl } from '@/app/actions/instagram';

interface Props {
  serviceName: string;
  displayName: string;
}

export default function InstagramConnectButton({ serviceName, displayName }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConnect = () => {
    setError(null);
    startTransition(async () => {
      const result = await getInstagramAuthUrl();
      
      if ('error' in result && result.error) {
        setError(result.error);
        return;
      }
      
      if (result.url && result.state) {
        // Store state in cookie on client side
        document.cookie = `instagram_oauth_state=${result.state}; path=/; max-age=600; samesite=lax`;
        window.location.href = result.url;
      } else {
        setError('Failed to generate OAuth URL');
      }
    });
  };

  return (
    <div className="py-3 border-b border-gray-700 last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">{displayName}: Not Connected</span>
        <button
          onClick={handleConnect}
          disabled={isPending}
          className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-700 rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isPending ? 'Connecting...' : `Connect ${displayName}`}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1 pl-1">Error: {error}</p>}
    </div>
  );
} 
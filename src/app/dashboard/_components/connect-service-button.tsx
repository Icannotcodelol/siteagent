'use client';

import { useState, useTransition } from 'react';

interface Props {
  serviceName: string; // e.g., 'hubspot', 'jira'
  displayName: string; // e.g., 'HubSpot', 'Jira'
  getOAuthUrlAction: () => Promise<{ error?: string; url?: string }>;
}

export default function ConnectServiceButton({ serviceName, displayName, getOAuthUrlAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onConnect = () => {
    setError(null);
    startTransition(async () => {
      const { url, error: actionError } = await getOAuthUrlAction();
      if (actionError) {
        setError(actionError);
        return;
      }
      if (url) {
        window.location.href = url; // Redirect user to OAuth provider
      } else {
        setError('Unexpected error: No OAuth URL returned.');
      }
    });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
      <span className="text-sm font-medium text-gray-400">{displayName}: Not Connected</span>
      <div className="flex flex-col items-end">
        <button
          onClick={onConnect}
          disabled={isPending}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-blue-700 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Connecting...' : `Connect ${displayName}`}
        </button>
        {error && <p className="text-xs text-red-500 mt-1">Error: {error}</p>}
      </div>
    </div>
  );
} 
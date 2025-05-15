'use client';

import { useState, useTransition } from 'react';

interface Props {
  serviceName: string;
  displayName: string;
  disconnectAction: (serviceName: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function DisconnectButton({ serviceName, displayName, disconnectAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDisconnect = () => {
    setError(null);
    if (window.confirm(`Are you sure you want to disconnect ${displayName}? This will remove the connection for all your chatbots.`)) {
      startTransition(async () => {
        const result = await disconnectAction(serviceName);
        if (result?.error) {
          setError(result.error);
        }
        // No need to handle success explicitly, revalidatePath in action handles refresh
      });
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
      <span className="text-sm font-medium text-green-500">✓ {displayName} Connected</span>
      <div className="flex flex-col items-end">
        <button
          onClick={handleDisconnect}
          disabled={isPending}
          className="px-3 py-1 text-xs font-medium text-red-400 bg-gray-800 border border-red-900 rounded-md hover:bg-red-900 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Disconnecting...' : 'Disconnect'}
        </button>
        {error && <p className="text-xs text-red-500 mt-1">Error: {error}</p>}
      </div>
    </div>
  );
} 
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/app/_components/ui/button';

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
    <div className="flex flex-col items-end">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDisconnect}
        disabled={isPending}
      >
        {isPending ? 'Disconnecting...' : 'Disconnect'}
      </Button>
      {error && <p className="text-xs text-red-400 mt-1">Error: {error}</p>}
    </div>
  );
} 
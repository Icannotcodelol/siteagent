'use client';

import { useState, useTransition } from 'react';
import { getJiraOAuthUrl } from '@/app/actions/jira';

const buttonStyles: React.CSSProperties = {
  padding: '10px 15px',
  backgroundColor: '#0b5f9c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  opacity: 1,
  marginRight: '10px',
};

const disabledButtonStyles: React.CSSProperties = {
  ...buttonStyles,
  opacity: 0.6,
  cursor: 'not-allowed',
};

interface Props {
  isConnected: boolean;
}

export default function ConnectJiraButton({ isConnected }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onConnect = () => {
    setError(null);
    startTransition(async () => {
      const { url, error } = await getJiraOAuthUrl();
      if (error) {
        setError(error);
        return;
      }
      if (url) {
        window.location.href = url;
      } else {
        setError('Unexpected error: no URL returned.');
      }
    });
  };

  if (isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ marginRight: '10px', color: '#28a745' }}>✓ Jira Connected</span>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={onConnect}
        disabled={isPending}
        style={isPending ? disabledButtonStyles : buttonStyles}
      >
        {isPending ? 'Connecting…' : 'Connect to Jira'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '5px' }}>Error: {error}</p>}
    </div>
  );
} 
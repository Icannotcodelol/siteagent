'use client';

import { useState, useTransition } from 'react';
import { getCalendlyOAuthUrl } from '@/app/actions/oauth'; // Adjust path if needed

// Basic button styling, you can replace with your UI library components (e.g., Shadcn Button)
const buttonStyles: React.CSSProperties = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
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

interface ConnectCalendlyButtonProps {
  isConnected: boolean;
  // Add specific chatbotId if connection is per-chatbot, and adjust server action and callback if needed
  // chatbotId?: string; 
}

export default function ConnectCalendlyButton({ isConnected }: ConnectCalendlyButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    setError(null);
    startTransition(async () => {
      const result = await getCalendlyOAuthUrl();
      if (result.error) {
        setError(result.error);
        console.error('Failed to get Calendly OAuth URL:', result.error);
      } else if (result.url) {
        window.location.href = result.url;
      } else {
        setError('An unexpected error occurred. No URL was returned.');
      }
    });
  };

  if (isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ marginRight: '10px', color: '#28a745' }}>✓ Calendly Connected</span>
        {/* Optionally, add a disconnect button here if needed */}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <button 
        onClick={handleConnect} 
        disabled={isPending}
        style={isPending ? disabledButtonStyles : buttonStyles}
      >
        {isPending ? 'Connecting...' : 'Connect to Calendly'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '5px' }}>Error: {error}</p>}
    </div>
  );
} 
'use client';

import { useState, useTransition } from 'react';
import { getShopifyOAuthUrl } from '@/app/actions/shopify';

const inputStyles: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginRight: '8px',
  minWidth: '220px',
};

const buttonStyles: React.CSSProperties = {
  padding: '10px 15px',
  backgroundColor: '#111827',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  opacity: 1,
};

const disabledButtonStyles: React.CSSProperties = {
  ...buttonStyles,
  opacity: 0.6,
  cursor: 'not-allowed',
};

interface Props {
  isConnected: boolean;
  // chatbotId?: string;
}

export default function ConnectShopifyForm({ isConnected }: Props) {
  const [storeDomain, setStoreDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onConnect = () => {
    if (!storeDomain.trim()) {
      setError('Store domain is required');
      return;
    }
    setError(null);
    startTransition(async () => {
      const { url, error } = await getShopifyOAuthUrl(storeDomain.trim());
      if (error) {
        setError(error);
        return;
      }
      if (url) {
        window.location.href = url;
      }
    });
  };

  if (isConnected) {
    return <span style={{ color: '#28a745' }}>✓ Shopify Connected</span>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="text"
        placeholder="your-store"
        value={storeDomain}
        onChange={(e) => setStoreDomain(e.target.value)}
        style={inputStyles}
      />
      <button
        onClick={onConnect}
        disabled={isPending}
        style={isPending ? disabledButtonStyles : buttonStyles}
      >
        {isPending ? 'Connecting…' : 'Connect Shopify'}
      </button>
      {error && <p style={{ color: 'red', marginLeft: '8px' }}>{error}</p>}
    </div>
  );
} 
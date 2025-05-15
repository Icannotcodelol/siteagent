'use client';

import { useState, useTransition } from 'react';
import { testShopifyApi } from '@/app/actions/shopify';

const buttonStyles: React.CSSProperties = {
  padding: '8px 15px',
  backgroundColor: '#22c55e', // Green color
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  opacity: 1,
  marginTop: '10px',
};

const disabledButtonStyles: React.CSSProperties = {
  ...buttonStyles,
  opacity: 0.6,
  cursor: 'not-allowed',
};

const preStyles: React.CSSProperties = {
  background: '#1f2937', // gray-800
  color: '#e5e7eb', // gray-200
  padding: '10px',
  borderRadius: '5px',
  marginTop: '10px',
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  fontSize: '13px',
};

export default function TestShopifyButton() {
  const [isPending, startTransition] = useTransition();
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestApi = () => {
    setError(null);
    setApiResponse(null);
    startTransition(async () => {
      const result = await testShopifyApi();
      if (result.error) {
        setError(result.error);
      } else {
        setApiResponse(result.data);
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleTestApi}
        disabled={isPending}
        style={isPending ? disabledButtonStyles : buttonStyles}
      >
        {isPending ? 'Testing API...' : 'Test Shopify API (Fetch Shop Info)'}
      </button>
      {error && (
        <pre style={preStyles}>Error: {error}</pre>
      )}
      {apiResponse && (
        <pre style={preStyles}>{JSON.stringify(apiResponse, null, 2)}</pre>
      )}
    </div>
  );
} 
'use client';

import { useState, useTransition } from 'react';
import { getShopifyOrderDetailsByName } from '@/app/actions/shopify';

const inputStyles: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginRight: '8px',
  minWidth: '180px',
  backgroundColor: '#374151', // gray-700 for dark mode
  color: '#f3f4f6', // gray-100 for dark mode
};

const buttonStyles: React.CSSProperties = {
  padding: '8px 15px',
  backgroundColor: '#4f46e5', // Indigo color
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  opacity: 1,
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
  border: '1px solid #4b5563', // gray-600
};

export default function FetchShopifyOrderForm() {
  const [orderName, setOrderName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchOrder = () => {
    if (!orderName.trim()) {
      setError('Please enter an order number (e.g., #1001 or 1001).');
      setApiResponse(null);
      return;
    }
    setError(null);
    setApiResponse(null);
    startTransition(async () => {
      const result = await getShopifyOrderDetailsByName(orderName);
      if (result.error) {
        setError(result.error);
      } else {
        setApiResponse(result.data);
      }
    });
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid #4b5563', paddingTop: '20px' }}>
      <h3 style={{ fontSize: '1.1em', fontWeight: '600', marginBottom: '10px', color: '#d1d5db' }}>
        Fetch Shopify Order Details
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Order # (e.g. #1001)"
          value={orderName}
          onChange={(e) => setOrderName(e.target.value)}
          style={inputStyles}
          disabled={isPending}
        />
        <button
          onClick={handleFetchOrder}
          disabled={isPending || !orderName.trim()}
          style={(isPending || !orderName.trim()) ? disabledButtonStyles : buttonStyles}
        >
          {isPending ? 'Fetching Order...' : 'Get Order Details'}
        </button>
      </div>
      {error && (
        <pre style={preStyles}>Error: {error}</pre>
      )}
      {apiResponse && (
        <pre style={preStyles}>{JSON.stringify(apiResponse, null, 2)}</pre>
      )}
    </div>
  );
} 
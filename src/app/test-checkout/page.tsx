import { Suspense } from 'react';

// Test component for verifying checkout with new trial prices
function TestCheckoutPage() {
  const testPrices = [
    {
      name: 'SiteAgent Starter (14-day trial)',
      priceId: 'price_1RUNOwBfQYOjY6rPrQguYAFs',
      amount: '€29.99/month',
      description: '14-day free trial, then €29.99/month'
    },
    {
      name: 'SiteAgent Growth (14-day trial)',
      priceId: 'price_1RUNQ6BfQYOjY6rPVUUozp0k', 
      amount: '€149/month',
      description: '14-day free trial, then €149/month'
    },
    {
      name: 'SiteAgent Pro (14-day trial)',
      priceId: 'price_1RUNQGBfQYOjY6rPoqSflANu',
      amount: '€399/month', 
      description: '14-day free trial, then €399/month'
    }
  ];

  const handleCheckout = async (priceId: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      
      if (sessionId) {
        // In a real app, you'd redirect to Stripe Checkout here
        console.log('Checkout session created:', sessionId);
        alert(`Checkout session created: ${sessionId}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Test New Trial-Enabled Pricing
        </h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h2 className="text-yellow-800 font-semibold mb-2">⚠️ Test Environment</h2>
          <p className="text-yellow-700">
            This page is for testing the new pricing structure with 14-day trials. 
            All prices include automatic 14-day free trials.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testPrices.map((price) => (
            <div key={price.priceId} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {price.name}
              </h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {price.amount}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                {price.description}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Price ID: {price.priceId}
              </p>
              <button
                onClick={() => handleCheckout(price.priceId)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Test Checkout
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-800 font-semibold mb-3">✅ Updates Completed</h3>
          <ul className="text-blue-700 space-y-2">
            <li>• New products created in Stripe with 14-day trials</li>
            <li>• Database schema updated with website scraping limits</li>
            <li>• Billing page updated to show new features</li>
            <li>• Landing page pricing section updated</li>
            <li>• All trial-enabled prices are ready for production</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/dashboard/billing" 
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Go to Billing Page
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TestCheckoutPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestCheckoutPage />
    </Suspense>
  );
} 
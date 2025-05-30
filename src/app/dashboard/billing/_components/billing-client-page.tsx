'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import type { User } from '@supabase/supabase-js';
import type { Plan, UserSubscriptionWithPlan } from '@/lib/services/subscriptionService';

// --- UI Components (Placeholders - Replace with your actual UI components) ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}
const Button = ({ children, className, isLoading, variant, size, ...props }: ButtonProps) => (
  <button 
    className={`px-4 py-2 rounded-md font-semibold transition-colors 
                ${variant === 'outline' ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : 
                  variant === 'destructive' ? 'bg-red-500 text-white hover:bg-red-600' : 
                  'bg-blue-500 text-white hover:bg-blue-600'} 
                ${className || ''}`}
    disabled={isLoading}
    {...props}
  >
    {isLoading ? 'Loading...' : children}
  </button>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
}
const Card = ({ children, className }: CardProps) => <div className={`bg-white shadow-md rounded-lg p-6 ${className || ''}`}>{children}</div>;
const CardHeader = ({ children, className }: CardProps) => <div className={`mb-4 ${className || ''}`}>{children}</div>;
const CardTitle = ({ children, className }: CardProps) => <h2 className={`text-xl font-semibold text-gray-900 ${className || ''}`}>{children}</h2>;
const CardDescription = ({ children, className }: CardProps) => <p className={`text-sm text-gray-700 ${className || ''}`}>{children}</p>;
const CardContent = ({ children, className }: CardProps) => <div className={`text-gray-800 ${className || ''}`}>{children}</div>;
const CardFooter = ({ children, className }: CardProps) => <div className={`mt-6 pt-4 border-t border-gray-200 ${className || ''}`}>{children}</div>;
// --- End UI Component Placeholders ---

interface BillingClientPageProps {
  user: User;
  initialSubscription: UserSubscriptionWithPlan | null;
  plans: Plan[];
  errorFetchingSubscription: string | null;
  errorFetchingPlans: string | null;
  stripePublishableKey?: string | null;
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = (key: string) => {
  if (!stripePromise && key) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export default function BillingClientPage({
  user,
  initialSubscription,
  plans,
  errorFetchingSubscription,
  errorFetchingPlans,
  stripePublishableKey,
}: BillingClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      setMessage('Subscription successful! Your details are being updated.');
      // Optionally, clear the session_id from URL or redirect to a clean URL
      // router.replace('/dashboard/billing');
      // You might want to re-fetch subscription details here or rely on webhooks to update UI eventually
    }
    const canceled = searchParams.get('canceled');
    if (canceled) {
      setMessage('Checkout canceled. Your subscription was not changed.');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (stripePublishableKey) {
      getStripe(stripePublishableKey);
    }
  }, [stripePublishableKey]);

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) {
      setMessage('This plan cannot be subscribed to directly.');
      return;
    }
    if (!stripePublishableKey) {
      setMessage('Stripe is not configured correctly. Please contact support.');
      console.error('Stripe publishable key is not available.');
      return;
    }

    setIsLoading(true);
    setSelectedPlanId(priceId);
    setMessage(null);

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Could not create checkout session.');
        if (data.manageSubscriptionUrl && data.error === 'Already subscribed to this plan.') {
          // Offer to redirect to portal if already subscribed
        }
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const stripe = await getStripe(stripePublishableKey);
      if (!stripe || !data.sessionId) {
        setMessage('Stripe.js failed to load or session ID missing.');
        throw new Error('Stripe.js failed to load or session ID missing.');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (stripeError) {
        setMessage(`Stripe redirect error: ${stripeError.message}`);
        console.error('Stripe redirect error:', stripeError);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      // Message is likely already set if error came from fetch response
      if (!message) setMessage(error.message || 'An unexpected error occurred during subscription.');
    } finally {
      setIsLoading(false);
      // setSelectedPlanId(null); // Keep it selected to show loading on that button or clear it
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Could not create portal session.');
        if (data.redirectTo) {
          // Handle suggestion to go to billing if no active paid sub
          router.push(data.redirectTo);
        }
        throw new Error(data.error || 'Failed to create portal session');
      }

      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch (error: any) {
      console.error('Portal session error:', error);
      if(!message) setMessage(error.message || 'An error occurred while trying to access the billing portal.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (errorFetchingSubscription) {
    return <Card className="max-w-md mx-auto mt-10"><CardContent><p className="text-red-500">Error: {errorFetchingSubscription}</p></CardContent></Card>;
  }
  if (errorFetchingPlans && plans.length === 0) {
    return <Card className="max-w-md mx-auto mt-10"><CardContent><p className="text-red-500">Error: {errorFetchingPlans}</p></CardContent></Card>;
  }
  if (!stripePublishableKey) {
     return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Stripe payments are not configured correctly. Please contact support.</p>
            <p className="text-sm text-gray-500 mt-2">Administrator: Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your environment variables.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Subscription Management</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes('Error') || message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Current Subscription Section */} 
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Your Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {initialSubscription && initialSubscription.plans ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-lg font-semibold text-gray-900">{initialSubscription.plans.name}</p>
                {!initialSubscription.plans.is_active && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Legacy Plan
                  </span>
                )}
              </div>
              <p className="text-gray-700">Status: <span className="font-medium capitalize text-gray-800">{initialSubscription.stripe_subscription_status || 'N/A'}</span></p>
              {initialSubscription.stripe_subscription_status === 'active' && initialSubscription.current_period_end && (
                <p className="text-gray-700">Renews on: {formatDate(initialSubscription.current_period_end)}</p>
              )}
              {initialSubscription.cancel_at_period_end && initialSubscription.current_period_end && (
                 <p className="text-orange-600">Set to cancel on: {formatDate(initialSubscription.current_period_end)}</p>
              )}
               <p className="text-gray-700">Messages used this cycle: {initialSubscription.current_messages_used_in_cycle} / {initialSubscription.plans.max_messages_per_month + initialSubscription.plans.message_overage_allowance}</p>
              {!initialSubscription.plans.is_active && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">
                    You're on a legacy plan. Consider upgrading to our new plans with enhanced features and 14-day trials.
                  </p>
                </div>
              )}
              {/* Add more details like chatbot count, data usage when that logic is available */}
            </div>
          ) : (
            <p className="text-gray-700">You are currently on the Free plan or have no active subscription.</p>
          )}
        </CardContent>
        <CardFooter>
          {initialSubscription && initialSubscription.stripe_customer_id && initialSubscription.stripe_subscription_id ? (
            <Button onClick={handleManageSubscription} isLoading={isLoading} variant="outline">
              Manage Billing & Subscription
            </Button>
          ) : (
            <p className="text-sm text-gray-500">Subscribe to a plan to manage your billing.</p>
          )}
        </CardFooter>
      </Card>

      {/* Available Plans Section */} 
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Choose a Plan</h2>
      {errorFetchingPlans && <p className="text-red-500 mb-4">Error loading plans: {errorFetchingPlans}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.filter(plan => 
          plan.is_active || plan.id === initialSubscription?.plan_id
        ).map((plan) => {
          const isCurrentPlan = initialSubscription?.plan_id === plan.id;
          const canSubscribe = plan.stripe_price_id && !isCurrentPlan && initialSubscription?.stripe_subscription_status !== 'active';
          const canSwitch = plan.stripe_price_id && !isCurrentPlan && initialSubscription?.stripe_subscription_status === 'active';
          
          let buttonText = 'Subscribe';
          if (isCurrentPlan && initialSubscription?.stripe_subscription_status === 'active') buttonText = 'Current Plan';
          else if (isCurrentPlan) buttonText = 'Your Plan (Inactive)';
          else if (initialSubscription?.stripe_subscription_status === 'active') buttonText = 'Switch to this Plan';

          return (
            <Card key={plan.id} className={`flex flex-col justify-between ${isCurrentPlan && initialSubscription?.stripe_subscription_status === 'active' ? 'border-2 border-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {!plan.is_active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Legacy
                      </span>
                    )}
                  </CardTitle>
                  {plan.stripe_price_id && plan.is_active && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      14-day trial
                    </span>
                  )}
                </div>
                <CardDescription>
                  {formatCurrency(plan.price_monthly_eur)} / month
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{plan.max_chatbots} Chatbot{plan.max_chatbots !== 1 ? 's' : ''}</li>
                  <li>{plan.max_messages_per_month.toLocaleString()} Messages/month</li>
                  <li>{plan.max_data_mb}MB Data Storage</li>
                  {plan.max_websites_scraped > 0 && (
                    <li>Scrape {plan.max_websites_scraped} website{plan.max_websites_scraped !== 1 ? 's' : ''}</li>
                  )}
                  {plan.max_websites_scraped === 0 && plan.name !== 'Free' && (
                    <li>No website scraping</li>
                  )}
                  {plan.name === 'Free' && (
                    <li>Manual data upload only</li>
                  )}
                  {plan.message_overage_allowance > 0 && (
                    <li>Up to {plan.message_overage_allowance.toLocaleString()} overage messages</li>
                  )}
                  {plan.name === 'SiteAgent Starter' && (
                    <>
                      <li>Essential integrations</li>
                      <li>Email support</li>
                    </>
                  )}
                  {plan.name === 'SiteAgent Growth' && (
                    <>
                      <li>All integrations</li>
                      <li>Priority support</li>
                      <li className="text-blue-600 font-medium">🌟 Most Popular</li>
                    </>
                  )}
                  {plan.name === 'SiteAgent Pro' && (
                    <>
                      <li>All integrations + Custom API</li>
                      <li>Dedicated & onboarding support</li>
                    </>
                  )}
                  {plan.stripe_price_id && (
                    <li className="text-green-600 font-medium">✨ 14-day free trial</li>
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.stripe_price_id ? (
                  <Button 
                    onClick={() => handleSubscribe(plan.stripe_price_id)}
                    isLoading={isLoading && selectedPlanId === plan.stripe_price_id}
                    disabled={isLoading || (isCurrentPlan && initialSubscription?.stripe_subscription_status === 'active')}
                    className="w-full"
                  >
                    {buttonText}
                  </Button>
                ) : (
                  <Button disabled className="w-full" variant="outline">Details</Button> // Free plan or non-subscribable
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 
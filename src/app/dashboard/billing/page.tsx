import { createClient } from '@/lib/supabase/server';
import { getUserSubscriptionWithPlanDetails, UserSubscriptionWithPlan } from '@/lib/services/subscriptionService';
import { Plan } from '@/lib/services/subscriptionService'; // Assuming Plan type is also exported
import BillingClientPage from './_components/billing-client-page';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // console.error('User not authenticated for billing page:', authError);
    redirect('/login?message=Please log in to view your billing details.');
  }

  let userSubscription: UserSubscriptionWithPlan | null = null;
  let plans: Plan[] = [];
  let errorFetchingSubscription: string | null = null;
  let errorFetchingPlans: string | null = null;

  try {
    userSubscription = await getUserSubscriptionWithPlanDetails(user.id, supabase);
  } catch (e: any) {
    console.error('Error fetching user subscription on billing page:', e);
    errorFetchingSubscription = e.message || 'Could not load your subscription details.';
  }

  try {
    // We could also fetch plans via the API route /api/plans, 
    // but direct DB access is fine in a Server Component.
    const { data: fetchedPlans, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .order('price_monthly_eur', { ascending: true });

    if (plansError) {
      console.error('Error fetching plans on billing page:', plansError);
      errorFetchingPlans = plansError.message || 'Could not load subscription plans.';
    } else {
      plans = fetchedPlans as Plan[];
    }
  } catch (e: any) {
    console.error('Error fetching plans on billing page (catch block):', e);
    errorFetchingPlans = e.message || 'Could not load subscription plans.';
  }

  // If NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set, the client-side Stripe.js won't load.
  // It's good practice to ensure it's available for the client component.
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripePublishableKey) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe checkout will fail.');
    // Optionally, you could pass this error to the client page to display a more user-friendly message.
  }

  return (
    <BillingClientPage
      user={user} // Pass the user object for potential display or use
      initialSubscription={userSubscription}
      plans={plans}
      errorFetchingSubscription={errorFetchingSubscription}
      errorFetchingPlans={errorFetchingPlans}
      stripePublishableKey={stripePublishableKey}
    />
  );
} 
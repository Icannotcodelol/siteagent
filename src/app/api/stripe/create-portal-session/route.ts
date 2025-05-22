import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { getUserSubscriptionWithPlanDetails } from '@/lib/services/subscriptionService';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('User not authenticated for portal session:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const subscription = await getUserSubscriptionWithPlanDetails(user.id, supabase);

    if (!subscription?.stripe_customer_id) {
      console.warn(`User ${user.id} attempting to access billing portal without a Stripe customer ID.`);
      // This can happen if they are on a free plan and never subscribed to a paid one.
      // You might want to redirect them to the main billing/plans page instead of showing an error.
      return NextResponse.json(
        { 
          error: 'No active paid subscription found. Please subscribe to a plan to manage billing.',
          redirectTo: '/dashboard/billing' // Suggest client-side redirect
        }, 
        { status: 404 } // Not Found or Bad Request could be argued
      );
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    if (!portalSession.url) {
      console.error('Could not create Stripe Customer Portal session for user:', user.id);
      return NextResponse.json({ error: 'Could not create customer portal session' }, { status: 500 });
    }

    return NextResponse.json({ portalUrl: portalSession.url });

  } catch (e: any) {
    console.error('Error in /api/stripe/create-portal-session:', e);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: e.message }, 
      { status: 500 }
    );
  }
} 
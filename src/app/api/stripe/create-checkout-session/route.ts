import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Server-side Supabase client
import { stripe } from '@/lib/stripe';
import { ensureStripeCustomer, getUserSubscriptionWithPlanDetails } from '@/lib/services/subscriptionService';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('User not authenticated:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { priceId, quantity = 1 } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    // 1. Ensure Stripe customer exists for this user
    const customerId = await ensureStripeCustomer(user.id, user.email, supabase);

    // 2. Check if user already has an active subscription to this priceId to prevent duplicate checkouts
    const currentSubscription = await getUserSubscriptionWithPlanDetails(user.id, supabase);
    if (currentSubscription && 
        currentSubscription.plans?.stripe_price_id === priceId && 
        currentSubscription.stripe_subscription_status === 'active') {
        // If they are trying to subscribe to the exact same plan they already have and it's active.
        console.warn(`User ${user.id} attempting to re-subscribe to active plan ${priceId}. Redirecting to billing.`);
        return NextResponse.json({ error: 'Already subscribed to this plan.', manageSubscriptionUrl: '/dashboard/billing' }, { status: 409 }); 
    }


    const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`;

    // 3. Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      // client_reference_id is useful for linking the session back to your internal user ID in webhooks
      // if you aren't using customer metadata or retrieving customer before this call.
      // metadata can also be used for this.
      metadata: {
        supabase_user_id: user.id, // Store Supabase user ID in metadata
      },
      // For new subscriptions, if you want to control trial periods or subscription start dates:
      // subscription_data: {
      //   trial_period_days: 30, // Example: 30-day trial
      // },
    });

    if (!checkoutSession.id) {
      console.error('Could not create Stripe Checkout session for user:', user.id);
      return NextResponse.json({ error: 'Could not create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: checkoutSession.id });

  } catch (e: any) {
    console.error('Error in /api/stripe/create-checkout-session:', e);
    // Differentiate between known Stripe errors and other errors if possible
    // if (e.type === 'StripeCardError') { ... }
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: e.message }, 
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
// Assuming a direct Supabase client instantiation for service role operations in webhooks
import { createClient, SupabaseClient } from '@supabase/supabase-js'; 
// We will create/update this function in subscriptionService.ts next
import { updateUserSubscriptionOnWebhookEvent } from '@/lib/services/subscriptionService'; 

const relevantEvents = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.created', // Good for initial setup verification if needed
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

// Function to create a Supabase client for service role operations
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in your environment
const getSupabaseServiceRoleClient = (): SupabaseClient => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase URL or Service Role Key is not set for webhook operations.');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('Stripe-Signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('🔴 Stripe webhook error: Missing signature or webhook secret.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`🔴 Stripe webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Received Stripe event: ${event.type}, ID: ${event.id}`);

  if (relevantEvents.has(event.type)) {
    const supabase = getSupabaseServiceRoleClient(); // Use the dedicated service role client
    try {
      await updateUserSubscriptionOnWebhookEvent(event, supabase);
      console.log(`✅ Successfully processed Stripe event: ${event.type}, ID: ${event.id}`);
    } catch (error: any) {
      console.error(`🔴 Error processing Stripe event ${event.type} (ID: ${event.id}):`, error.message);
      // Return 500 so Stripe retries the event if processing fails
      // Be cautious with automatic retries for non-idempotent operations
      return NextResponse.json({ error: 'Webhook handler failed. See logs.', details: error.message }, { status: 500 });
    }
  } else {
    console.log(`🤷‍♀️ Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 
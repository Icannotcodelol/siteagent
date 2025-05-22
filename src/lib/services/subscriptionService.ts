import { SupabaseClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe'; // Assuming stripe.ts is in src/lib
import Stripe from 'stripe'; // Import Stripe namespace for types

// Basic type definitions (replace with auto-generated types later if possible)
export interface Plan {
  id: string; // uuid
  name: string;
  stripe_price_id: string | null;
  price_monthly_eur: number;
  max_chatbots: number;
  max_data_mb: number;
  max_messages_per_month: number;
  message_overage_allowance: number;
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

export interface UserSubscription {
  user_id: string; // uuid, references auth.users.id
  plan_id: string; // uuid, references plans.id
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  current_period_start: string | null; // timestamp with time zone
  current_period_end: string | null; // timestamp with time zone
  cancel_at_period_end: boolean;
  canceled_at: string | null; // timestamp with time zone
  trial_start_at: string | null; // timestamp with time zone
  trial_end_at: string | null; // timestamp with time zone
  current_messages_used_in_cycle: number;
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

// Define combined type for user subscription with plan details
export type UserSubscriptionWithPlan = UserSubscription & {
  plans: Plan | null; // from the join
};

/**
 * Assigns the default 'Free' plan to a new user upon signup.
 * This function should be called after a new user is created in auth.users.
 *
 * @param userId The ID of the new user.
 * @param supabase An instance of the Supabase client (usually service role for backend operations).
 * @returns The created user subscription record or null if the free plan is not found.
 * @throws Error if the 'Free' plan is not found in the database or if an error occurs during insertion.
 */
export async function assignFreePlanOnSignup(
  userId: string,
  supabase: SupabaseClient
): Promise<UserSubscription | null> {
  console.log(`Attempting to assign free plan to user: ${userId}`);

  // 1. Find the 'Free' plan ID
  const { data: freePlan, error: planError } = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'Free')
    .single();

  if (planError) {
    console.error('Error fetching free plan:', planError);
    throw new Error(`Could not fetch the Free plan: ${planError.message}`);
  }
  if (!freePlan) {
    console.error('Free plan not found in database.');
    throw new Error('Default Free plan not found. Please ensure it is seeded.');
  }

  console.log(`Found Free plan ID: ${freePlan.id} for user: ${userId}`);

  // 2. Create the user_subscriptions record
  const subscriptionData: Omit<UserSubscription, 'created_at' | 'updated_at' | 'user_id'> & { user_id: string } = {
    user_id: userId,
    plan_id: freePlan.id,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_subscription_status: 'active', // Free plan is considered active
    current_period_start: new Date().toISOString(),
    current_period_end: null, // Or set to a far future date if preferred for free plans
    cancel_at_period_end: false,
    canceled_at: null,
    trial_start_at: null,
    trial_end_at: null,
    current_messages_used_in_cycle: 0,
  };

  const { data: newSubscription, error: insertError } = await supabase
    .from('user_subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting free subscription:', insertError);
    // Check for unique constraint violation if user already has a subscription (should not happen on signup)
    if (insertError.code === '23505') { // PostgreSQL unique violation
        console.warn(`User ${userId} already has a subscription. Skipping free plan assignment.`);
        // Optionally, fetch and return existing subscription
        const { data: existingSub, error: existingSubError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (existingSubError) {
            console.error('Error fetching existing subscription after unique violation:', existingSubError);
            throw new Error(`Failed to assign free plan due to existing record and failed to fetch it: ${existingSubError.message}`);
        }
        return existingSub as UserSubscription;
    }
    throw new Error(`Could not assign Free plan to user ${userId}: ${insertError.message}`);
  }

  console.log(`Successfully assigned Free plan to user ${userId}, subscription ID: ${newSubscription?.user_id}`);
  return newSubscription as UserSubscription;
}

/**
 * Fetches the user's current subscription details along with their plan information.
 *
 * @param userId The ID of the user.
 * @param supabase An instance of the Supabase client.
 * @returns The user's subscription with plan details, or null if not found.
 */
export async function getUserSubscriptionWithPlanDetails(
  userId: string,
  supabase: SupabaseClient
): Promise<UserSubscriptionWithPlan | null> {
  if (!userId) {
    console.warn('getUserSubscriptionWithPlanDetails called with no userId');
    return null;
  }
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plans (*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    // It's common for a user not to have a subscription initially, so don't throw, just log and return null.
    // Only log as error if it's not a "not found" (PGRST116)
    if (error.code !== 'PGRST116') {
        console.error(`Error fetching user subscription for ${userId}:`, error);
    } else {
        console.log(`No subscription found for user ${userId}.`);
    }
    return null;
  }

  return data as UserSubscriptionWithPlan;
}

/**
 * Ensures a Stripe customer record exists for the user, creating one if not.
 * Stores the Stripe Customer ID in the user_subscriptions table.
 *
 * @param userId The ID of the user.
 * @param email The email of the user.
 * @param supabase An instance of the Supabase client (usually service role for backend operations).
 * @returns The Stripe Customer ID.
 * @throws Error if Stripe customer creation or database update fails.
 */
export async function ensureStripeCustomer(
  userId: string,
  email: string | undefined, // User email might not always be available
  supabase: SupabaseClient
): Promise<string> {
  if (!userId) {
    throw new Error('ensureStripeCustomer requires a userId.');
  }
  if (!email) {
    // Attempt to fetch email from auth.users if not provided
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) {
        console.error(`Could not retrieve email for user ${userId}:`, userError);
        throw new Error(`Cannot create Stripe customer without an email for user ${userId}.`);
    }
    email = userData.user.email;
  }


  // Check if user already has a stripe_customer_id in user_subscriptions
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (subError && subError.code !== 'PGRST116') { // PGRST116: Row not found (user might not have a subscription row yet)
    console.error(`Error fetching subscription for stripe_customer_id check for user ${userId}:`, subError);
    throw new Error(`Database error checking for Stripe customer ID: ${subError.message}`);
  }

  if (subscription?.stripe_customer_id) {
    console.log(`User ${userId} already has Stripe customer ID: ${subscription.stripe_customer_id}`);
    return subscription.stripe_customer_id;
  }

  // If no stripe_customer_id, or no subscription row yet, create one in Stripe
  console.log(`No Stripe customer ID found for user ${userId}. Creating new Stripe customer.`);
  const customer = await stripe.customers.create({
    email: email,
    name: email, // Or fetch a display name if you have one
    metadata: {
      supabase_user_id: userId,
    },
  });

  if (!customer.id) {
    throw new Error('Stripe customer creation failed.');
  }
  console.log(`Stripe customer created for user ${userId}: ${customer.id}`);

  // Now, update or insert the stripe_customer_id into user_subscriptions
  // This assumes assignFreePlanOnSignup has already run, or a subscription row exists.
  // If not, this might need to create the subscription row or rely on assignFreePlanOnSignup to be called first.
  // For simplicity, let's assume a subscription row SHOULD exist (e.g., free plan assigned on signup).

  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ stripe_customer_id: customer.id })
    .eq('user_id', userId);

  if (updateError) {
    console.error(`Failed to update user_subscriptions with Stripe customer ID ${customer.id} for user ${userId}:`, updateError);
    // This is critical. If this fails, we have an orphaned Stripe customer.
    // Consider retry logic or a cleanup mechanism for orphaned Stripe customers.
    throw new Error(`Failed to store Stripe customer ID in database: ${updateError.message}`);
  }

  console.log(`Stored Stripe customer ID ${customer.id} for user ${userId} in database.`);
  return customer.id;
}

// Utility to get the appropriate Stripe client (test vs live) depending on event.livemode
const stripeLiveKey = process.env.STRIPE_SECRET_KEY_LIVE;
const stripeTestKey = process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;

function getStripeClient(liveMode: boolean): Stripe {
  if (liveMode) {
    if (!stripeLiveKey) {
      // Fallback to default stripe instance (may still be test)
      console.warn('⚠️ STRIPE_SECRET_KEY_LIVE not set; using default Stripe key for live webhook event');
      return stripe;
    }
    return new Stripe(stripeLiveKey, { apiVersion: '2024-04-10', typescript: true });
  }
  // test mode – reuse singleton to avoid creating many instances
  return stripe;
}

/**
 * Processes Stripe webhook events and updates user subscription data in Supabase.
 *
 * @param event The Stripe.Event object.
 * @param supabase A SupabaseClient instance (should be service role for this function).
 */
export async function updateUserSubscriptionOnWebhookEvent(
  event: Stripe.Event,
  supabase: SupabaseClient
): Promise<void> {
  const eventType = event.type;
  const liveMode = !!(event as any).livemode; // Stripe sets livemode boolean on event root
  // Dynamically pick the correct Stripe key
  const stripeClient = getStripeClient(liveMode);
  const dataObject = event.data.object as any; // Cast to any to access properties dynamically, or use type guards

  let userId: string | null = null;
  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;

  // Extract common identifiers
  if (dataObject.object === 'checkout.session' && eventType === 'checkout.session.completed') {
    const session = dataObject as Stripe.Checkout.Session;
    stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
    stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;
    userId = session.metadata?.supabase_user_id || (session.client_reference_id as string | null);
  } else if (dataObject.object === 'subscription') {
    const subscription = dataObject as Stripe.Subscription;
    stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;
    stripeSubscriptionId = subscription.id;
    userId = subscription.metadata?.supabase_user_id || null;
  } else if (dataObject.object === 'invoice') {
    const invoice = dataObject as Stripe.Invoice;
    stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null;
    stripeSubscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id || null;
    if (!userId && stripeSubscriptionId) { // Try to get userId from subscription metadata if invoice doesn't have it directly
        const sub = await stripeClient.subscriptions.retrieve(stripeSubscriptionId);
        userId = sub.metadata?.supabase_user_id || null;
    }
  }

  if (!userId && stripeCustomerId && !stripeSubscriptionId) { // e.g. customer.created, customer.updated
    // Try to find user by stripe_customer_id if direct supabase_user_id isn't in metadata
    const { data: userSub, error: userSubError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();
    if (userSub) userId = userSub.user_id;
    else if (userSubError && userSubError.code !== 'PGRST116') console.warn('Error fetching user by stripe_customer_id:', userSubError.message);
  }
  
  if (!userId && stripeSubscriptionId) { // Last resort for subscription events if metadata was missing
      try {
        const sub = await stripeClient.subscriptions.retrieve(stripeSubscriptionId);
        userId = sub.metadata?.supabase_user_id || null;
        if (!userId && typeof sub.customer === 'string') {
            stripeCustomerId = sub.customer;
            const { data: userSub } = await supabase.from('user_subscriptions').select('user_id').eq('stripe_customer_id', stripeCustomerId).single();
            if (userSub) userId = userSub.user_id;
        }
      } catch (e: any) {
          console.warn(`Could not retrieve subscription ${stripeSubscriptionId} to find user ID: ${e.message}`)
      }
  }

  if (!userId && (eventType.startsWith('customer.subscription.') || eventType.startsWith('invoice.') || eventType === 'checkout.session.completed')) {
    // If we still don't have a userId for critical subscription/payment events, it's a problem.
    console.error(`🔴 Webhook Error: supabase_user_id not found in Stripe metadata for event ${eventType}, customer: ${stripeCustomerId}, subscription: ${stripeSubscriptionId}. Cannot process.`);
    // You might want to throw an error here to signal Stripe to retry, or handle it based on your business logic
    // For now, we'll log and return to prevent infinite retries if metadata is consistently missing.
    return; 
  }

  console.log(`Processing webhook event: ${eventType} for user ${userId || 'UnknownUser'}, stripe_customer_id: ${stripeCustomerId}, stripe_subscription_id: ${stripeSubscriptionId}`);

  switch (eventType) {
    case 'checkout.session.completed':
      const session = dataObject as Stripe.Checkout.Session;
      if (!userId || !stripeSubscriptionId || !stripeCustomerId) {
        console.error('Missing critical IDs in checkout.session.completed');
        return;
      }
      // Fetch the subscription first so we can reliably get the price used
      const stripeSub = await stripeClient.subscriptions.retrieve(stripeSubscriptionId, {
        expand: ['items.data.price'],
      });
      
      const priceId = stripeSub.items.data[0]?.price.id;
      if (!priceId) {
        console.error('Could not determine priceId from subscription in checkout.session.completed');
        return;
      }

      // Look up our internal plan that matches this Stripe price
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('stripe_price_id', priceId)
        .single();

      if (planError || !plan) {
        console.error(`🔴 Error fetching plan for priceId ${priceId}:`, planError?.message);
        return;
      }
      
      const stripeSubForInsert = await stripeClient.subscriptions.retrieve(stripeSubscriptionId);

      const userSubDataForInsert: Partial<UserSubscription> = {
        user_id: userId!,
        plan_id: plan.id,
        stripe_customer_id: stripeCustomerId!,
        stripe_subscription_id: stripeSubscriptionId!,
        stripe_subscription_status: stripeSubForInsert.status,
        current_period_start: new Date(stripeSubForInsert.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubForInsert.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubForInsert.cancel_at_period_end,
        trial_start_at: stripeSubForInsert.trial_start ? new Date(stripeSubForInsert.trial_start * 1000).toISOString() : null,
        trial_end_at: stripeSubForInsert.trial_end ? new Date(stripeSubForInsert.trial_end * 1000).toISOString() : null,
        current_messages_used_in_cycle: 0, // Reset on new subscription
      };

      // Use upsert to handle cases where a user might rapidly change plans or if webhook order is unusual
      const { error: upsertError } = await supabase
        .from('user_subscriptions')
        .upsert(userSubDataForInsert, { onConflict: 'user_id' }); 

      if (upsertError) {
        console.error(`🔴 Error upserting subscription for user ${userId} on checkout completion:`, upsertError.message);
        throw upsertError; // Throw to let webhook handler return 500 for retry
      }
      console.log(`✅ Subscription created/updated for user ${userId} from checkout session.`);
      break;

    case 'invoice.paid':
      const invoice = dataObject as Stripe.Invoice;
      if (!userId || !stripeSubscriptionId) {
         console.warn('Skipping invoice.paid: missing userId or stripeSubscriptionId.');
         return;
      }
      // Update subscription period and reset usage count
      const stripeSubscriptionForInvoice = await stripeClient.subscriptions.retrieve(stripeSubscriptionId);
      const updateDataForInvoicePaid: Partial<UserSubscription> = {
        stripe_subscription_status: stripeSubscriptionForInvoice.status,
        current_period_start: new Date(stripeSubscriptionForInvoice.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscriptionForInvoice.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscriptionForInvoice.cancel_at_period_end,
        current_messages_used_in_cycle: 0, // Reset message count on new billing cycle
      };
      const { error: invoicePaidError } = await supabase
        .from('user_subscriptions')
        .update(updateDataForInvoicePaid)
        .eq('user_id', userId)
        .eq('stripe_subscription_id', stripeSubscriptionId); 

      if (invoicePaidError) {
        console.error(`🔴 Error updating subscription for user ${userId} on invoice paid:`, invoicePaidError.message);
        throw invoicePaidError;
      }
      console.log(`✅ Subscription updated for user ${userId} from invoice paid.`);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = dataObject as Stripe.Invoice;
      if (!userId || !stripeSubscriptionId) {
         console.warn('Skipping invoice.payment_failed: missing userId or stripeSubscriptionId.');
         return;
      }
      const stripeSubForPaymentFailure = await stripeClient.subscriptions.retrieve(stripeSubscriptionId);
      const updateDataForPaymentFailure: Partial<UserSubscription> = {
        stripe_subscription_status: stripeSubForPaymentFailure.status, // e.g., 'past_due' or 'unpaid'
      };
      const { error: paymentFailedError } = await supabase
        .from('user_subscriptions')
        .update(updateDataForPaymentFailure)
        .eq('user_id', userId)
        .eq('stripe_subscription_id', stripeSubscriptionId);

      if (paymentFailedError) {
        console.error(`🔴 Error updating subscription for user ${userId} on invoice payment failed:`, paymentFailedError.message);
        throw paymentFailedError;
      }
      console.log(`🔔 Subscription status updated for user ${userId} due to payment failure.`);
      // TODO: Implement user notification (email) about payment failure
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = dataObject as Stripe.Subscription;
      if (!userId) {
         console.warn('Skipping customer.subscription.updated: missing userId.');
         return;
      }
      const newPriceId = updatedSubscription.items.data[0].price.id;
      const { data: newPlan, error: newPlanError } = await supabase
        .from('plans')
        .select('id')
        .eq('stripe_price_id', newPriceId)
        .single();

      if (newPlanError || !newPlan) {
        console.error(`🔴 Error fetching plan for new priceId ${newPriceId} during subscription update:`, newPlanError?.message);
        // If plan not found, it might be a Stripe-only plan or misconfiguration. Log and decide if to error out.
        return; 
      }

      const updateDataForSubUpdate: Partial<UserSubscription> = {
        plan_id: newPlan.id,
        stripe_subscription_status: updatedSubscription.status,
        current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        trial_start_at: updatedSubscription.trial_start ? new Date(updatedSubscription.trial_start * 1000).toISOString() : null,
        trial_end_at: updatedSubscription.trial_end ? new Date(updatedSubscription.trial_end * 1000).toISOString() : null,
      };
      // If the plan changes, typically message count resets. This is handled by invoice.paid for the new cycle.
      // If an upgrade is immediate and prorated, invoice.paid for that proration should reset it.
      // If it is a downgrade scheduled for period end, limits effectively change when cancel_at_period_end becomes false on the new cycle.
      // For simplicity here, we don't reset message count directly on plan_id change, relying on invoice.paid.
      
      const { error: subUpdateError } = await supabase
        .from('user_subscriptions')
        .update(updateDataForSubUpdate)
        .eq('user_id', userId)
        .eq('stripe_subscription_id', updatedSubscription.id);

      if (subUpdateError) {
        console.error(`🔴 Error updating subscription for user ${userId} on subscription update:`, subUpdateError.message);
        throw subUpdateError;
      }
      console.log(`✅ Subscription updated for user ${userId}. New plan: ${newPlan.id}`);
      break;

    case 'customer.subscription.deleted': // Handles cancellations (immediate or at period end)
      const deletedSubscription = dataObject as Stripe.Subscription;
       if (!userId) {
         console.warn('Skipping customer.subscription.deleted: missing userId.');
         return;
      }

      // Revert user to Free plan
      const { data: freePlan, error: freePlanError } = await supabase
        .from('plans')
        .select('id')
        .eq('name', 'Free')
        .single();

      if (freePlanError || !freePlan) {
        console.error('🔴 Could not find Free plan to revert user to on subscription deletion:', freePlanError?.message);
        // This is critical. Decide how to handle. Maybe create a 'canceled_no_plan' status.
        return; 
      }

      const updateDataForSubDeleted: Partial<UserSubscription> = {
        plan_id: freePlan.id,
        stripe_subscription_id: null, // Clear Stripe subscription ID
        stripe_subscription_status: 'canceled', 
        current_period_start: null, // Or set to now
        current_period_end: null,   // Or set to now
        cancel_at_period_end: false,
        canceled_at: new Date().toISOString(),
        current_messages_used_in_cycle: 0, // Reset usage
      };

      const { error: subDeletedError } = await supabase
        .from('user_subscriptions')
        .update(updateDataForSubDeleted)
        .eq('user_id', userId)
        .eq('stripe_subscription_id', deletedSubscription.id); // ensure we target the correct subscription if user had multiple over time (though stripe_subscription_id is unique)

      if (subDeletedError) {
        console.error(`🔴 Error reverting user ${userId} to Free plan on subscription deletion:`, subDeletedError.message);
        throw subDeletedError;
      }
      console.log(`✅ User ${userId} reverted to Free plan due to subscription deletion.`);
      break;

    default:
      console.log(`🤷‍♀️ Webhook handler for ${eventType} not implemented yet.`);
  }
}

/**
 * Checks if a user can create another chatbot based on their current plan limits.
 *
 * @param userId The ID of the user.
 * @param supabase A SupabaseClient instance.
 * @returns True if the user can create a new chatbot, false otherwise.
 */
export async function canCreateChatbot(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  if (!userId) return false;

  const subscription = await getUserSubscriptionWithPlanDetails(userId, supabase);
  if (!subscription || !subscription.plans) {
    // No subscription or plan details found (e.g. error, or free plan not configured properly)
    // Default to false or handle as an error specific to your app's logic for missing subscriptions
    console.warn(`canCreateChatbot: No active plan found for user ${userId}. Denying chatbot creation.`);
    return false;
  }

  // Count current chatbots for the user
  // This assumes you have a 'chatbots' table with a 'user_id' column.
  const { count, error: countError } = await supabase
    .from('chatbots') // Replace 'chatbots' with your actual table name
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    console.error(`Error counting chatbots for user ${userId}:`, countError.message);
    return false; // Fail closed
  }

  const currentChatbotCount = count || 0;
  const canCreate = currentChatbotCount < subscription.plans.max_chatbots;
  console.log(`User ${userId}: Chatbots ${currentChatbotCount}/${subscription.plans.max_chatbots}. Can create: ${canCreate}`);
  return canCreate;
}

/**
 * Checks if a user can upload more data based on their current plan limits.
 *
 * @param userId The ID of the user.
 * @param uploadSizeMb The size of the data the user is attempting to upload in MB.
 * @param supabase A SupabaseClient instance.
 * @returns True if the user can upload the data, false otherwise.
 */
export async function canUploadData(
  userId: string,
  uploadSizeMb: number,
  supabase: SupabaseClient
): Promise<boolean> {
  if (!userId) return false;

  const subscription = await getUserSubscriptionWithPlanDetails(userId, supabase);
  if (!subscription || !subscription.plans) {
    console.warn(`canUploadData: No active plan found for user ${userId}. Denying data upload.`);
    return false;
  }

  // Calculate current total data usage for the user.
  // This is a HYPOTHETICAL example. Adjust to your actual schema.
  // Assuming you have a 'documents' table with 'user_id' and 'size_mb' columns.
  const { data: usageData, error: usageError } = await supabase
    .from('documents') // Replace 'documents' with your actual table name & logic
    .select('size_mb')
    .eq('user_id', userId);

  if (usageError) {
    console.error(`Error fetching data usage for user ${userId}:`, usageError.message);
    return false; // Fail closed
  }

  const currentTotalDataMb = usageData?.reduce((sum, doc) => sum + (doc.size_mb || 0), 0) || 0;
  const canUpload = (currentTotalDataMb + uploadSizeMb) <= subscription.plans.max_data_mb;
  console.log(`User ${userId}: Data Usage ${currentTotalDataMb}MB + ${uploadSizeMb}MB / ${subscription.plans.max_data_mb}MB. Can upload: ${canUpload}`);
  return canUpload;
}

/**
 * Checks if a user can send another message based on their current plan limits and usage.
 *
 * @param userId The ID of the user.
 * @param supabase A SupabaseClient instance.
 * @returns True if the user can send a message, false otherwise.
 */
export async function canSendMessage(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  if (!userId) return false;

  const subscription = await getUserSubscriptionWithPlanDetails(userId, supabase);
  if (!subscription || !subscription.plans || subscription.stripe_subscription_status === 'past_due' || subscription.stripe_subscription_status === 'unpaid') {
    // Also deny if subscription is past_due or unpaid, even if within message limits technically
    console.warn(`canSendMessage: No active/valid plan or subscription found for user ${userId} (status: ${subscription?.stripe_subscription_status}). Denying message send.`);
    return false;
  }

  // If subscription status is something like 'canceled' but they are still within a paid period 
  // (cancel_at_period_end = true), they should still be able to use messages.
  // The core check is against current_messages_used_in_cycle.
  
  const messagesAllowed = subscription.plans.max_messages_per_month + subscription.plans.message_overage_allowance;
  const canSend = subscription.current_messages_used_in_cycle < messagesAllowed;
  
  console.log(`User ${userId}: Messages ${subscription.current_messages_used_in_cycle}/${messagesAllowed}. Can send: ${canSend}`);
  
  // Future: Add overage warning email trigger here if `subscription.current_messages_used_in_cycle` approaches `subscription.plans.max_messages_per_month`
  if (subscription.current_messages_used_in_cycle >= subscription.plans.max_messages_per_month && 
      subscription.current_messages_used_in_cycle < messagesAllowed) {
    console.log(`User ${userId} is now in their overage allowance.`);
    // Trigger overage warning email (implement this separately)
  }
  
  return canSend;
}

/**
 * Increments the message count for a user in their current billing cycle using an RPC call.
 * This should be called after a message is successfully processed/sent by one of the user's chatbots.
 *
 * @param userId The ID of the user (chatbot creator).
 * @param supabase A SupabaseClient instance.
 */
export async function incrementMessageCount(
  userId: string,
  supabase: SupabaseClient 
): Promise<void> {
  if (!userId) {
    console.warn('incrementMessageCount called with no userId');
    return;
  }

  const { error } = await supabase.rpc('increment_user_message_count', { user_uuid: userId });

  if (error) {
    console.error(`Failed to increment message count for user ${userId} via RPC:`, error.message);
    // Depending on criticality, you might want to throw this error
    // or have a retry mechanism, or log to an error monitoring service.
  } else {
    // console.log(`Incremented message count for user ${userId} via RPC`);
  }
} 
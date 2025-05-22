CREATE TABLE public.user_subscriptions (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    stripe_customer_id text,
    stripe_subscription_id text UNIQUE, -- A user should only have one active Stripe subscription managed by us
    stripe_subscription_status text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean NOT NULL DEFAULT false,
    canceled_at timestamp with time zone,
    trial_start_at timestamp with time zone,
    trial_end_at timestamp with time zone,
    current_messages_used_in_cycle integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.user_subscriptions.plan_id IS 'The currently active plan for the user.';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'Stripe Subscription ID. Nullable for free tier or if subscription is canceled.';
COMMENT ON COLUMN public.user_subscriptions.current_messages_used_in_cycle IS 'Number of messages used in the current billing cycle.';

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscription
CREATE POLICY "Allow user to read own subscription"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow service_role full access (for backend operations like webhooks)
CREATE POLICY "Allow service_role full access to user_subscriptions"
ON public.user_subscriptions
FOR ALL
TO service_role
USING (true);

-- Policy for updates (typically handled by backend/service_role via webhooks)
-- If you need users to directly update some fields (e.g. initiate cancellation through a custom flow NOT via Stripe portal):
-- CREATE POLICY "Allow user to update specific fields (e.g., cancel)"
-- ON public.user_subscriptions
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id AND -- ensure they can only modify specific fields related to cancellation, etc.
--             -- Example: (column_name = new_value AND another_column = old_value) -- Be very specific
--            false -- Placeholder, be very careful with direct user updates to subscription table
-- ); 
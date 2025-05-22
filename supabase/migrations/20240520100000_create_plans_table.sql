CREATE TABLE public.plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    stripe_price_id text,
    price_monthly_eur numeric(10, 2) NOT NULL DEFAULT 0.00,
    max_chatbots integer NOT NULL,
    max_data_mb integer NOT NULL,
    max_messages_per_month integer NOT NULL,
    message_overage_allowance integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.plans.max_data_mb IS 'Total data allowance for the plan in MB.';
COMMENT ON COLUMN public.plans.stripe_price_id IS 'Stripe Price ID for this plan. Nullable for the Free tier.';

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to plans
CREATE POLICY "Allow public read access to plans"
ON public.plans
FOR SELECT
TO public, authenticated, anon
USING (true);

-- Allow admin full access (replace with your admin role or specific user IDs if needed)
-- THIS IS A PLACEHOLDER - SECURE THIS PROPERLY BASED ON YOUR ADMIN ROLE SETUP
-- For example, if you have an 'admin' role in Supabase Auth:
-- CREATE POLICY "Allow admin full access"
-- ON public.plans
-- FOR ALL
-- TO authenticated
-- USING (auth.role() = 'admin');
-- OR for specific service_role key access (typically used by backend):
CREATE POLICY "Allow service_role full access"
ON public.plans
FOR ALL
TO service_role
USING (true); 
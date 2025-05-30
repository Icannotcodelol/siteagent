-- Migration to update plans with new trial-enabled prices and revised structure
-- This replaces the old plans with the new pricing structure

-- First, update existing plans or insert new ones
INSERT INTO public.plans (name, stripe_price_id, price_monthly_eur, max_chatbots, max_data_mb, max_messages_per_month, message_overage_allowance)
VALUES
    ('Free', NULL, 0.00, 1, 1, 100, 0),
    ('SiteAgent Starter', 'price_1RUNOwBfQYOjY6rPrQguYAFs', 29.99, 1, 5, 500, 0),
    ('SiteAgent Growth', 'price_1RUNQ6BfQYOjY6rPVUUozp0k', 149.00, 3, 25, 3000, 500), 
    ('SiteAgent Pro', 'price_1RUNQGBfQYOjY6rPoqSflANu', 399.00, 10, 100, 10000, 1000)
ON CONFLICT (name) DO UPDATE SET
    stripe_price_id = EXCLUDED.stripe_price_id,
    price_monthly_eur = EXCLUDED.price_monthly_eur,
    max_chatbots = EXCLUDED.max_chatbots,
    max_data_mb = EXCLUDED.max_data_mb,
    max_messages_per_month = EXCLUDED.max_messages_per_month,
    message_overage_allowance = EXCLUDED.message_overage_allowance,
    updated_at = now();

-- Add new column for website scraping limits if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'max_websites_scraped') THEN
        ALTER TABLE public.plans ADD COLUMN max_websites_scraped integer NOT NULL DEFAULT 0;
        COMMENT ON COLUMN public.plans.max_websites_scraped IS 'Number of websites that can be scraped for training the chatbot.';
    END IF;
END $$;

-- Update plans with website scraping limits
UPDATE public.plans SET max_websites_scraped = CASE 
    WHEN name = 'Free' THEN 0
    WHEN name = 'SiteAgent Starter' THEN 1
    WHEN name = 'SiteAgent Growth' THEN 5
    WHEN name = 'SiteAgent Pro' THEN 20
    ELSE 0
END;

-- Remove old plans that are no longer needed (be careful with this in production)
-- DELETE FROM public.plans WHERE name IN ('Hobby', 'Pro') AND name NOT IN ('SiteAgent Starter', 'SiteAgent Growth', 'SiteAgent Pro', 'Free'); 
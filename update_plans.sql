-- Update plans with new trial-enabled prices and revised structure

-- Add new column for website scraping limits if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'max_websites_scraped') THEN
        ALTER TABLE public.plans ADD COLUMN max_websites_scraped integer NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Update existing plans or insert new ones
INSERT INTO public.plans (name, stripe_price_id, price_monthly_eur, max_chatbots, max_data_mb, max_messages_per_month, message_overage_allowance, max_websites_scraped)
VALUES
    ('Free', NULL, 0.00, 1, 1, 100, 0, 0),
    ('SiteAgent Starter', 'price_1RUNOwBfQYOjY6rPrQguYAFs', 29.99, 1, 5, 500, 0, 1),
    ('SiteAgent Growth', 'price_1RUNQ6BfQYOjY6rPVUUozp0k', 149.00, 3, 25, 3000, 500, 5), 
    ('SiteAgent Pro', 'price_1RUNQGBfQYOjY6rPoqSflANu', 399.00, 10, 100, 10000, 1000, 20)
ON CONFLICT (name) DO UPDATE SET
    stripe_price_id = EXCLUDED.stripe_price_id,
    price_monthly_eur = EXCLUDED.price_monthly_eur,
    max_chatbots = EXCLUDED.max_chatbots,
    max_data_mb = EXCLUDED.max_data_mb,
    max_messages_per_month = EXCLUDED.max_messages_per_month,
    message_overage_allowance = EXCLUDED.message_overage_allowance,
    max_websites_scraped = EXCLUDED.max_websites_scraped,
    updated_at = now();

-- Select all plans to verify the update
SELECT name, stripe_price_id, price_monthly_eur, max_chatbots, max_data_mb, max_messages_per_month, max_websites_scraped FROM public.plans ORDER BY price_monthly_eur; 
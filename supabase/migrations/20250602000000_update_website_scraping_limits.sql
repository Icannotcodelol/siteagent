-- Migration: Update website scraping limits to new values (2025-06-02)

-- Ensure the column exists (safety, should already be present)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plans' AND column_name = 'max_websites_scraped'
    ) THEN
        ALTER TABLE public.plans ADD COLUMN max_websites_scraped integer NOT NULL DEFAULT 0;
        COMMENT ON COLUMN public.plans.max_websites_scraped IS 'Number of websites that can be scraped for training the chatbot.';
    END IF;
END $$;

-- Update active plans with the new limits
UPDATE public.plans SET max_websites_scraped = CASE 
    WHEN name = 'Free' THEN 3
    WHEN name = 'SiteAgent Starter' THEN 10
    WHEN name = 'SiteAgent Growth' THEN 25
    WHEN name = 'SiteAgent Pro' THEN 50
    ELSE max_websites_scraped -- leave other/legacy/enterprise plans unchanged
END,
updated_at = NOW()
WHERE name IN ('Free', 'SiteAgent Starter', 'SiteAgent Growth', 'SiteAgent Pro'); 
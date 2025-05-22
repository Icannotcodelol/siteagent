-- Seed data for plans table
-- IMPORTANT: Replace 'price_YOUR_HOBBY_PRICE_ID' and 'price_YOUR_PRO_PRICE_ID' with actual Stripe Price IDs.
INSERT INTO public.plans (name, stripe_price_id, price_monthly_eur, max_chatbots, max_data_mb, max_messages_per_month, message_overage_allowance)
VALUES
    ('Free', NULL, 0.00, 1, 1, 100, 0),
    ('Hobby', 'price_YOUR_HOBBY_PRICE_ID', 150.00, 3, 20, 2000, 1000), 
    ('Pro', 'price_YOUR_PRO_PRICE_ID', 450.00, 5, 50, 8000, 1000)
ON CONFLICT (name) DO NOTHING;

-- You might have other seed data here, this will just add the plans or do nothing if they already exist by name. 
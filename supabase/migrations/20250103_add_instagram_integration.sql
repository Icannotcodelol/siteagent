-- Add Instagram integration column to chatbots table
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS integration_instagram BOOLEAN DEFAULT false;

-- Create table for Instagram webhooks tracking
CREATE TABLE IF NOT EXISTS instagram_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    message_text TEXT,
    message_id TEXT,
    timestamp BIGINT NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(event_id, chatbot_id)
);

-- Add index for performance
CREATE INDEX idx_instagram_webhook_events_chatbot_timestamp ON instagram_webhook_events(chatbot_id, timestamp DESC);
CREATE INDEX idx_instagram_webhook_events_processed ON instagram_webhook_events(processed, created_at);

-- Create table to store Instagram page connections
CREATE TABLE IF NOT EXISTS instagram_page_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    page_id TEXT NOT NULL,
    page_name TEXT NOT NULL,
    instagram_business_account_id TEXT,
    instagram_business_account_username TEXT,
    page_access_token TEXT NOT NULL, -- Will be encrypted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, page_id)
);

-- Add RLS policies
ALTER TABLE instagram_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_page_connections ENABLE ROW LEVEL SECURITY;

-- Policies for instagram_webhook_events
CREATE POLICY "Users can view webhook events for their chatbots" ON instagram_webhook_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chatbots 
            WHERE chatbots.id = instagram_webhook_events.chatbot_id 
            AND chatbots.user_id = auth.uid()
        )
    );

-- Policies for instagram_page_connections  
CREATE POLICY "Users can view their own Instagram connections" ON instagram_page_connections
    FOR ALL USING (user_id = auth.uid()); 
-- Migration: Add Hybrid Chat System
-- Date: 2025-01-31
-- Purpose: Add tables and schema for hybrid AI/human chat functionality

-- =====================================================
-- PART 1: New Tables for Conversation Management
-- =====================================================

-- Conversation sessions with status tracking
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- Links to existing chat_messages.session_id
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting_for_agent', 'agent_responding', 'resolved', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_user_message_at TIMESTAMP WITH TIME ZONE,
  assigned_agent_id UUID REFERENCES auth.users(id),
  handoff_requested_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  customer_info JSONB DEFAULT '{}', -- Email, name, etc. from integrations
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chatbot_id, session_id) -- Ensure one conversation per session
);

-- Agent notifications and preferences
CREATE TABLE IF NOT EXISTS agent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_message', 'handoff_request', 'mention', 'assignment')),
  message TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent preferences for notifications
CREATE TABLE IF NOT EXISTS agent_preferences (
  agent_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00", "timezone": "UTC", "days": [1,2,3,4,5]}',
  auto_assignment BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 2: Schema Modifications to Existing Tables
-- =====================================================

-- Add hybrid mode settings to chatbots
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS hybrid_mode_enabled BOOLEAN DEFAULT false;
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS auto_handoff_triggers JSONB DEFAULT '{"keywords": ["human", "agent", "help", "speak to someone"], "sentiment_threshold": -0.5, "max_messages": 10}';
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{"enabled": false, "hours": {"start": "09:00", "end": "17:00", "timezone": "UTC", "days": [1,2,3,4,5]}}';

-- Update existing session_handoffs table
ALTER TABLE session_handoffs ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id);
ALTER TABLE session_handoffs ADD COLUMN IF NOT EXISTS handoff_type TEXT CHECK (handoff_type IN ('manual', 'auto_keyword', 'auto_sentiment', 'auto_escalation', 'business_hours'));

-- =====================================================
-- PART 3: Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversations_chatbot_id ON conversations(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_agent ON conversations(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_notifications_agent_id ON agent_notifications(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_notifications_conversation_id ON agent_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_notifications_read_status ON agent_notifications(agent_id, read_at) WHERE read_at IS NULL;

-- =====================================================
-- PART 4: Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_preferences ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Chatbot owners can view all conversations" ON conversations
FOR SELECT TO authenticated
USING (chatbot_id IN (
  SELECT id FROM chatbots WHERE user_id = (select auth.uid())
));

CREATE POLICY "Assigned agents can view their conversations" ON conversations
FOR SELECT TO authenticated
USING (assigned_agent_id = (select auth.uid()));

CREATE POLICY "Chatbot owners can manage conversations" ON conversations
FOR ALL TO authenticated
USING (chatbot_id IN (
  SELECT id FROM chatbots WHERE user_id = (select auth.uid())
))
WITH CHECK (chatbot_id IN (
  SELECT id FROM chatbots WHERE user_id = (select auth.uid())
));

-- Agent notifications policies
CREATE POLICY "Agents can view their own notifications" ON agent_notifications
FOR SELECT TO authenticated
USING (agent_id = (select auth.uid()));

CREATE POLICY "Agents can update their own notifications" ON agent_notifications
FOR UPDATE TO authenticated
USING (agent_id = (select auth.uid()))
WITH CHECK (agent_id = (select auth.uid()));

CREATE POLICY "System can create notifications for agents" ON agent_notifications
FOR INSERT TO authenticated
WITH CHECK (
  -- Either creating for yourself or you own the chatbot
  agent_id = (select auth.uid()) OR 
  chatbot_id IN (SELECT id FROM chatbots WHERE user_id = (select auth.uid()))
);

-- Agent preferences policies
CREATE POLICY "Agents can manage their own preferences" ON agent_preferences
FOR ALL TO authenticated
USING (agent_id = (select auth.uid()))
WITH CHECK (agent_id = (select auth.uid()));

-- =====================================================
-- PART 5: Functions and Triggers
-- =====================================================

-- Function to automatically create conversation when first message is sent
CREATE OR REPLACE FUNCTION create_conversation_if_not_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create conversation for user messages in hybrid mode
  IF NEW.is_user_message = true THEN
    INSERT INTO conversations (chatbot_id, session_id, last_user_message_at)
    VALUES (NEW.chatbot_id, NEW.session_id, NOW())
    ON CONFLICT (chatbot_id, session_id) 
    DO UPDATE SET 
      last_message_at = NOW(),
      last_user_message_at = CASE 
        WHEN NEW.is_user_message THEN NOW() 
        ELSE conversations.last_user_message_at 
      END,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only for chatbots with hybrid mode enabled
CREATE OR REPLACE FUNCTION should_create_conversation()
RETURNS TRIGGER AS $$
DECLARE
  hybrid_enabled BOOLEAN;
BEGIN
  SELECT hybrid_mode_enabled INTO hybrid_enabled
  FROM chatbots
  WHERE id = NEW.chatbot_id;
  
  IF hybrid_enabled = true THEN
    PERFORM create_conversation_if_not_exists();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_conversation
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION should_create_conversation();

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NOW(),
    last_user_message_at = CASE 
      WHEN NEW.is_user_message THEN NOW() 
      ELSE last_user_message_at 
    END,
    updated_at = NOW()
  WHERE chatbot_id = NEW.chatbot_id AND session_id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Function to create notification when handoff is requested
CREATE OR REPLACE FUNCTION notify_agent_handoff()
RETURNS TRIGGER AS $$
DECLARE
  chatbot_owner_id UUID;
BEGIN
  -- Get chatbot owner
  SELECT user_id INTO chatbot_owner_id
  FROM chatbots
  WHERE id = NEW.chatbot_id;
  
  -- Create notification for chatbot owner
  INSERT INTO agent_notifications (agent_id, chatbot_id, conversation_id, type, message)
  VALUES (
    chatbot_owner_id,
    NEW.chatbot_id,
    NEW.id,
    'handoff_request',
    'A customer has requested to speak with a human agent.'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_handoff
AFTER UPDATE OF status ON conversations
FOR EACH ROW
WHEN (OLD.status != 'waiting_for_agent' AND NEW.status = 'waiting_for_agent')
EXECUTE FUNCTION notify_agent_handoff();

-- =====================================================
-- PART 6: Helper Functions
-- =====================================================

-- Function to check if agent is available
CREATE OR REPLACE FUNCTION is_agent_available(p_agent_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  working_hours JSONB;
  current_hour TIME;
  current_day INT;
  start_time TIME;
  end_time TIME;
  working_days INT[];
BEGIN
  -- Get agent preferences
  SELECT ap.working_hours INTO working_hours
  FROM agent_preferences ap
  WHERE ap.agent_id = p_agent_id;
  
  -- If no preferences, assume available
  IF working_hours IS NULL THEN
    RETURN true;
  END IF;
  
  -- Get current time in agent's timezone
  current_hour := CURRENT_TIME AT TIME ZONE COALESCE(working_hours->>'timezone', 'UTC');
  current_day := EXTRACT(ISODOW FROM CURRENT_DATE);
  
  -- Parse working hours
  start_time := (working_hours->>'start')::TIME;
  end_time := (working_hours->>'end')::TIME;
  working_days := ARRAY(SELECT jsonb_array_elements_text(working_hours->'days'))::INT[];
  
  -- Check if current day and time are within working hours
  RETURN current_day = ANY(working_days) AND 
         current_hour >= start_time AND 
         current_hour <= end_time;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign conversation to available agent
CREATE OR REPLACE FUNCTION auto_assign_conversation(p_conversation_id UUID)
RETURNS UUID AS $$
DECLARE
  assigned_agent UUID;
  chatbot_owner UUID;
BEGIN
  -- Get chatbot owner
  SELECT cb.user_id INTO chatbot_owner
  FROM conversations c
  JOIN chatbots cb ON c.chatbot_id = cb.id
  WHERE c.id = p_conversation_id;
  
  -- For now, assign to chatbot owner if available
  IF is_agent_available(chatbot_owner) THEN
    UPDATE conversations
    SET assigned_agent_id = chatbot_owner
    WHERE id = p_conversation_id;
    
    assigned_agent := chatbot_owner;
  END IF;
  
  RETURN assigned_agent;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 7: Views for Easier Querying
-- =====================================================

-- View for conversation details with chatbot info
CREATE OR REPLACE VIEW conversation_details AS
SELECT 
  c.*,
  cb.name as chatbot_name,
  cb.user_id as owner_id,
  u.email as assigned_agent_email,
  (
    SELECT COUNT(*) 
    FROM chat_messages cm 
    WHERE cm.chatbot_id = c.chatbot_id 
    AND cm.session_id = c.session_id
  ) as message_count,
  (
    SELECT COUNT(*) 
    FROM agent_notifications an 
    WHERE an.conversation_id = c.id 
    AND an.read_at IS NULL
  ) as unread_notifications
FROM conversations c
JOIN chatbots cb ON c.chatbot_id = cb.id
LEFT JOIN auth.users u ON c.assigned_agent_id = u.id;

-- Grant permissions on the view
GRANT SELECT ON conversation_details TO authenticated;

-- =====================================================
-- PART 8: Initial Data and Settings
-- =====================================================

-- Create default agent preferences for existing chatbot owners
INSERT INTO agent_preferences (agent_id)
SELECT DISTINCT user_id 
FROM chatbots
ON CONFLICT (agent_id) DO NOTHING; 
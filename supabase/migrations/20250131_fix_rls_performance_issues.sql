-- Migration: Fix RLS Performance Issues and Optimize Database
-- Date: 2025-01-31
-- Purpose: Address all performance warnings from Supabase Security Advisor

-- =====================================================
-- PART 1: Fix Auth RLS Initialization Plan Issues
-- =====================================================
-- Wrap auth.uid() and auth.role() calls in subqueries for better performance

-- Fix chatbots table policies
DROP POLICY IF EXISTS "Allow users to delete their own chatbots" ON chatbots;
CREATE POLICY "Allow users to delete their own chatbots" ON chatbots
FOR DELETE TO public
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own chatbots" ON chatbots;
CREATE POLICY "Allow users to insert their own chatbots" ON chatbots
FOR INSERT TO public
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow users to select their own chatbots" ON chatbots;
CREATE POLICY "Allow users to select their own chatbots" ON chatbots
FOR SELECT TO public
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow users to update their own chatbots" ON chatbots;
CREATE POLICY "Allow users to update their own chatbots" ON chatbots
FOR UPDATE TO public
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Fix chatbot_actions table policies
DROP POLICY IF EXISTS "Allow users to delete actions for their own chatbots" ON chatbot_actions;
CREATE POLICY "Allow users to delete actions for their own chatbots" ON chatbot_actions
FOR DELETE TO public
USING (( SELECT chatbots.user_id FROM chatbots WHERE (chatbots.id = chatbot_actions.chatbot_id)) = (select auth.uid()));

DROP POLICY IF EXISTS "Allow users to insert actions for their own chatbots" ON chatbot_actions;
CREATE POLICY "Allow users to insert actions for their own chatbots" ON chatbot_actions
FOR INSERT TO public
WITH CHECK (( SELECT chatbots.user_id FROM chatbots WHERE (chatbots.id = chatbot_actions.chatbot_id)) = (select auth.uid()));

DROP POLICY IF EXISTS "Allow users to select actions for their own chatbots" ON chatbot_actions;
CREATE POLICY "Allow users to select actions for their own chatbots" ON chatbot_actions
FOR SELECT TO public
USING (( SELECT chatbots.user_id FROM chatbots WHERE (chatbots.id = chatbot_actions.chatbot_id)) = (select auth.uid()));

DROP POLICY IF EXISTS "Allow users to update actions for their own chatbots" ON chatbot_actions;
CREATE POLICY "Allow users to update actions for their own chatbots" ON chatbot_actions
FOR UPDATE TO public
USING (( SELECT chatbots.user_id FROM chatbots WHERE (chatbots.id = chatbot_actions.chatbot_id)) = (select auth.uid()))
WITH CHECK (( SELECT chatbots.user_id FROM chatbots WHERE (chatbots.id = chatbot_actions.chatbot_id)) = (select auth.uid()));

-- Fix documents table policies
DROP POLICY IF EXISTS "Allow users to delete their own documents" ON documents;
CREATE POLICY "Allow users to delete their own documents" ON documents
FOR DELETE TO public
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own documents" ON documents;
CREATE POLICY "Allow users to insert their own documents" ON documents
FOR INSERT TO public
WITH CHECK (((select auth.uid()) = user_id) AND (( SELECT chatbots.user_id FROM chatbots WHERE (chatbots.id = documents.chatbot_id)) = (select auth.uid())));

DROP POLICY IF EXISTS "Allow users to select their own documents" ON documents;
CREATE POLICY "Allow users to select their own documents" ON documents
FOR SELECT TO public
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow users to update their own documents" ON documents;
CREATE POLICY "Allow users to update their own documents" ON documents
FOR UPDATE TO public
USING ((select auth.uid()) = user_id)
WITH CHECK (((select auth.uid()) = user_id) AND (( SELECT chatbots.user_id FROM chatbots WHERE (chatbots.id = documents.chatbot_id)) = (select auth.uid())));

-- Fix document_chunks table policies
DROP POLICY IF EXISTS "Allow users to select chunks for their own documents" ON document_chunks;
CREATE POLICY "Allow users to select chunks for their own documents" ON document_chunks
FOR SELECT TO public
USING (( SELECT d.user_id FROM documents d WHERE (d.id = document_chunks.document_id)) = (select auth.uid()));

-- Fix chat_messages table policies
DROP POLICY IF EXISTS "Allow users to select messages for their own chatbots" ON chat_messages;
CREATE POLICY "Allow users to select messages for their own chatbots" ON chat_messages
FOR SELECT TO public
USING (( SELECT cb.user_id FROM chatbots cb WHERE (cb.id = chat_messages.chatbot_id)) = (select auth.uid()));

-- Fix user_oauth_tokens table policies
DROP POLICY IF EXISTS "Allow users to manage their own OAuth tokens" ON user_oauth_tokens;
CREATE POLICY "Allow users to manage their own OAuth tokens" ON user_oauth_tokens
FOR ALL TO public
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Fix user_chatbot_secrets table policies
DROP POLICY IF EXISTS "delete_own_secrets" ON user_chatbot_secrets;
CREATE POLICY "delete_own_secrets" ON user_chatbot_secrets
FOR DELETE TO public
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "insert_own_secrets" ON user_chatbot_secrets;
CREATE POLICY "insert_own_secrets" ON user_chatbot_secrets
FOR INSERT TO public
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "select_own_secrets" ON user_chatbot_secrets;
CREATE POLICY "select_own_secrets" ON user_chatbot_secrets
FOR SELECT TO public
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "update_own_secrets" ON user_chatbot_secrets;
CREATE POLICY "update_own_secrets" ON user_chatbot_secrets
FOR UPDATE TO public
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Fix proactive_messages table policies
DROP POLICY IF EXISTS "Enable ALL for chatbot owners" ON proactive_messages;
CREATE POLICY "Enable ALL for chatbot owners" ON proactive_messages
FOR ALL TO public
USING (chatbot_id IN ( SELECT cb.id FROM chatbots cb WHERE (cb.user_id = (select auth.uid()))))
WITH CHECK (chatbot_id IN ( SELECT cb.id FROM chatbots cb WHERE (cb.user_id = (select auth.uid()))));

-- Fix user_subscriptions table policies
DROP POLICY IF EXISTS "Allow user to read own subscription" ON user_subscriptions;
CREATE POLICY "Allow user to read own subscription" ON user_subscriptions
FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

-- Fix vector_cleanup_queue table policies
DROP POLICY IF EXISTS "Service role can manage vector cleanup queue" ON vector_cleanup_queue;
CREATE POLICY "Service role can manage vector cleanup queue" ON vector_cleanup_queue
FOR ALL TO public
USING ((select auth.role()) = 'service_role'::text);

-- Fix interrogation_sessions table policies
DROP POLICY IF EXISTS "session_owner_access" ON interrogation_sessions;
CREATE POLICY "session_owner_access" ON interrogation_sessions
FOR ALL TO public
USING (admin_user_id = (select auth.uid()))
WITH CHECK (admin_user_id = (select auth.uid()));

-- Fix interrogation_messages table policies
DROP POLICY IF EXISTS "session_owner_messages" ON interrogation_messages;
CREATE POLICY "session_owner_messages" ON interrogation_messages
FOR ALL TO public
USING (EXISTS ( SELECT 1 FROM interrogation_sessions s WHERE ((s.id = interrogation_messages.session_id) AND (s.admin_user_id = (select auth.uid())))))
WITH CHECK (EXISTS ( SELECT 1 FROM interrogation_sessions s WHERE ((s.id = interrogation_messages.session_id) AND (s.admin_user_id = (select auth.uid())))));

-- Fix training_corrections table policies
DROP POLICY IF EXISTS "owner_corrections" ON training_corrections;
CREATE POLICY "owner_corrections" ON training_corrections
FOR ALL TO public
USING (EXISTS ( SELECT 1 FROM (interrogation_messages m JOIN interrogation_sessions s ON ((s.id = m.session_id))) WHERE ((m.id = training_corrections.message_id) AND (s.admin_user_id = (select auth.uid())))))
WITH CHECK (EXISTS ( SELECT 1 FROM (interrogation_messages m JOIN interrogation_sessions s ON ((s.id = m.session_id))) WHERE ((m.id = training_corrections.message_id) AND (s.admin_user_id = (select auth.uid())))));

-- Fix chatbot_message_summaries table policies
DROP POLICY IF EXISTS "Users can view summaries for their chatbots" ON chatbot_message_summaries;
CREATE POLICY "Users can view summaries for their chatbots" ON chatbot_message_summaries
FOR SELECT TO authenticated
USING (chatbot_id IN ( SELECT chatbots.id FROM chatbots WHERE (chatbots.user_id = (select auth.uid()))));

-- Fix message_analysis table policies
DROP POLICY IF EXISTS "Users can view analysis for their chatbots" ON message_analysis;
CREATE POLICY "Users can view analysis for their chatbots" ON message_analysis
FOR SELECT TO authenticated
USING (chatbot_id IN ( SELECT chatbots.id FROM chatbots WHERE (chatbots.user_id = (select auth.uid()))));

-- =====================================================
-- PART 2: Consolidate Multiple Permissive Policies
-- =====================================================

-- Consolidate documents table policies
-- Keep service_role policy separate as it's for different role
-- User policies remain as optimized above

-- Consolidate document_chunks table policies
-- Keep service_role policy separate
-- User policy remains as optimized above

-- Consolidate chat_messages table policies
-- Service role policy uses current_setting which is already optimized
-- User policy remains as optimized above

-- Consolidate chatbots table policies
-- Keep public read access policy separate as it serves different purpose
-- User policies remain as optimized above

-- Consolidate proactive_messages table policies
-- Keep public read access policy separate
-- Owner policy remains as optimized above

-- =====================================================
-- PART 3: Fix Duplicate Indexes
-- =====================================================

-- Drop duplicate indexes on interrogation_messages
DROP INDEX IF EXISTS idx_interrogation_messages_session;
-- Keep interrogation_messages_session_id_idx

-- Drop duplicate indexes on interrogation_sessions  
DROP INDEX IF EXISTS idx_interrogation_session_chatbot;
-- Keep interrogation_sessions_chatbot_id_idx

-- =====================================================
-- PART 4: Add Missing Indexes for RLS Performance
-- =====================================================

-- Add indexes on foreign key columns used in RLS policies if not already present
CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON chatbots(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_chatbot_id ON documents(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chatbot_id ON chat_messages(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_actions_chatbot_id ON chatbot_actions(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_user_oauth_tokens_user_id ON user_oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chatbot_secrets_user_id ON user_chatbot_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_chatbot_id ON proactive_messages(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_interrogation_sessions_admin_user_id ON interrogation_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_interrogation_messages_session_id ON interrogation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_training_corrections_message_id ON training_corrections(message_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_message_summaries_chatbot_id ON chatbot_message_summaries(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_message_analysis_chatbot_id ON message_analysis(chatbot_id);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this migration, you can verify the improvements by:
-- 1. Re-running the Supabase Security Advisor
-- 2. Testing query performance with EXPLAIN ANALYZE
-- 3. Monitoring your application performance metrics

-- All changes in this migration are performance optimizations only.
-- No functional changes are made to the security policies. 
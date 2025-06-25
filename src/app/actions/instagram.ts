'use server';

import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import crypto from 'crypto';

export async function getInstagramAuthUrl() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'User not authenticated' };
  }

  // Generate random state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  
  // Set cookie via headers - this needs to be handled by the client
  // Since server actions can't directly set cookies, we'll use a different approach
  
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/instagram/callback`,
    scope: 'pages_show_list,instagram_basic,instagram_manage_messages,pages_messaging,pages_read_engagement',
    response_type: 'code',
    state,
  });

  // We'll store the state differently - either in session or pass it back
  // For now, let's use a simplified approach where the state is embedded
  return {
    url: `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`,
    state, // Return state for the client to store
  };
}

export async function getInstagramConnections() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('instagram_page_connections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch Instagram connections: ${error.message}`);
  }

  return data;
}

export async function disconnectInstagram(pageId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Delete the connection
  const { error } = await supabase
    .from('instagram_page_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('page_id', pageId);

  if (error) {
    throw new Error(`Failed to disconnect Instagram: ${error.message}`);
  }

  // Also disable Instagram integration on all chatbots
  await supabase
    .from('chatbots')
    .update({ integration_instagram: false })
    .eq('user_id', user.id);

  return { success: true };
}

export async function enableInstagramForChatbot(chatbotId: string, pageId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user owns the chatbot
  const { data: chatbot } = await supabase
    .from('chatbots')
    .select('id')
    .eq('id', chatbotId)
    .eq('user_id', user.id)
    .single();

  if (!chatbot) {
    throw new Error('Chatbot not found');
  }

  // Verify user has access to the Instagram page
  const { data: connection } = await supabase
    .from('instagram_page_connections')
    .select('id')
    .eq('user_id', user.id)
    .eq('page_id', pageId)
    .single();

  if (!connection) {
    throw new Error('Instagram page not connected');
  }

  // Enable Instagram integration for the chatbot
  const { error } = await supabase
    .from('chatbots')
    .update({ integration_instagram: true })
    .eq('id', chatbotId);

  if (error) {
    throw new Error(`Failed to enable Instagram: ${error.message}`);
  }

  // Subscribe to webhooks for this page
  await subscribeToWebhooks(pageId);

  return { success: true };
}

export async function disableInstagramForChatbot(chatbotId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('chatbots')
    .update({ integration_instagram: false })
    .eq('id', chatbotId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to disable Instagram: ${error.message}`);
  }

  return { success: true };
}

async function subscribeToWebhooks(pageId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  // Get page access token
  const { data: connection } = await supabase
    .from('instagram_page_connections')
    .select('page_access_token')
    .eq('user_id', user.id)
    .eq('page_id', pageId)
    .single();

  if (!connection) return;

  const pageAccessToken = decrypt(connection.page_access_token);
  if (!pageAccessToken) return;

  try {
    // Subscribe to Instagram webhooks
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/subscribed_apps`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribed_fields: 'messages,messaging_postbacks',
          access_token: pageAccessToken,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to subscribe to webhooks:', error);
    }
  } catch (error) {
    console.error('Error subscribing to webhooks:', error);
  }
}

export async function getInstagramChatHistory(chatbotId: string, senderId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user owns the chatbot
  const { data: chatbot } = await supabase
    .from('chatbots')
    .select('id')
    .eq('id', chatbotId)
    .eq('user_id', user.id)
    .single();

  if (!chatbot) {
    throw new Error('Chatbot not found');
  }

  // Get conversation history from public_conversations table
  const conversationId = `instagram_${senderId}`;
  const { data, error } = await supabase
    .from('public_conversations')
    .select('messages')
    .eq('chatbot_id', chatbotId)
    .eq('conversation_id', conversationId)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
    throw new Error(`Failed to fetch chat history: ${error.message}`);
  }

  return data?.messages || [];
} 
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export interface ProactiveMessage {
  id: string
  chatbot_id: string
  message_content: string
  delay_seconds: number
  is_enabled: boolean
  created_at: string
  updated_at: string
  color: string | null
}

export async function getProactiveMessageForChatbot(
  chatbotId: string,
): Promise<ProactiveMessage | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('proactive_messages')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching proactive message:', error)
    // Potentially throw a more specific error or return a structured error response
    return null
  }

  return data
}

export async function upsertProactiveMessage(
  chatbotId: string,
  formData: {
    message_content: string
    delay_seconds: number
    is_enabled: boolean
    color?: string | null
  },
  existingMessageId?: string | null, // If provided, we are updating
): Promise<{ data: ProactiveMessage | null; error: string | null }> {
  const supabase = createClient()

  const messageData = {
    chatbot_id: chatbotId,
    message_content: formData.message_content,
    delay_seconds: formData.delay_seconds,
    is_enabled: formData.is_enabled,
    color: formData.color ?? '#111827',
  }

  let response
  if (existingMessageId) {
    response = await supabase
      .from('proactive_messages')
      .update(messageData)
      .eq('id', existingMessageId)
      .eq('chatbot_id', chatbotId) // Ensure user owns this message via RLS + explicit check
      .select()
      .single()
  } else {
    const existing = await getProactiveMessageForChatbot(chatbotId)
    if (existing) {
        response = await supabase
        .from('proactive_messages')
        .update(messageData)
        .eq('id', existing.id)
        .eq('chatbot_id', chatbotId)
        .select()
        .single()
    } else {
        response = await supabase
        .from('proactive_messages')
        .insert(messageData)
        .select()
        .single()
    }
  }

  const { data, error } = response

  if (error) {
    console.error('Error upserting proactive message:', error)
    return { data: null, error: error.message }
  }

  revalidatePath(`/dashboard/chatbot/${chatbotId}`)
  // Also consider revalidating any page where this message might be displayed or listed.
  return { data, error: null }
}

export async function deleteProactiveMessage(
  messageId: string,
  chatbotId: string, // Used for revalidation and to ensure context
): Promise<{ error: string | null }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('proactive_messages')
    .delete()
    .eq('id', messageId)
    .eq('chatbot_id', chatbotId) // RLS will also enforce this, but good for explicit check.

  if (error) {
    console.error('Error deleting proactive message:', error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/chatbot/${chatbotId}`)
  return { error: null }
} 
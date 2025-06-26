import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConversationView from './_components/conversation-view'

export default async function ConversationPage({
  params
}: {
  params: { id: string; conversationId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id: chatbotId, conversationId } = params

  // Verify access to conversation
  const { data: conversation } = await supabase
    .from('conversation_details')
    .select('*')
    .eq('id', conversationId)
    .eq('chatbot_id', chatbotId)
    .single()

  if (!conversation || (conversation.owner_id !== user.id && conversation.assigned_agent_id !== user.id)) {
    redirect('/dashboard')
  }

  return <ConversationView conversation={conversation} currentUserId={user.id} />
} 
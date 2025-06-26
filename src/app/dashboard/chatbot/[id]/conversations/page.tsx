import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConversationList from './_components/conversation-list'
import HybridModeToggle from './_components/hybrid-mode-toggle'
import ConversationStats from './_components/conversation-stats'
import EnableHybridButton from './_components/enable-hybrid-button'

export default async function ConversationsPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const chatbotId = params.id

  // Verify user owns the chatbot
  const { data: chatbot } = await supabase
    .from('chatbots')
    .select('id, name, user_id, hybrid_mode_enabled')
    .eq('id', chatbotId)
    .eq('user_id', user.id)
    .single()

  if (!chatbot) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage customer conversations for {chatbot.name}
          </p>
        </div>
        <HybridModeToggle 
          chatbotId={chatbotId} 
          initialEnabled={chatbot.hybrid_mode_enabled}
        />
      </div>

      {chatbot.hybrid_mode_enabled ? (
        <>
          <ConversationStats chatbotId={chatbotId} />
          <ConversationList chatbotId={chatbotId} />
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hybrid Mode Disabled</h3>
            <p className="text-gray-500 mb-6">
              Enable hybrid mode to allow human agents to monitor and respond to conversations alongside your AI chatbot.
            </p>
            <EnableHybridButton />
          </div>
        </div>
      )}
    </div>
  )
} 
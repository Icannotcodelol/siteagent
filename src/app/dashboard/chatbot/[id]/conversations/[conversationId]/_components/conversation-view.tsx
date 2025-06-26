'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import MessageThread from './message-thread'
import AgentResponseBox from './agent-response-box'
import ConversationHeader from './conversation-header'

interface ConversationViewProps {
  conversation: any
  currentUserId: string
}

export default function ConversationView({ conversation, currentUserId }: ConversationViewProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chatbots/${conversation.chatbot_id}/conversations/${conversation.id}/messages`)
      if (!response.ok) throw new Error('Failed to load messages')
      
      const data = await response.json()
      setMessages(data.messages)
      
      // Mark notifications as read
      await markNotificationsRead()
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markNotificationsRead = async () => {
    await supabase
      .from('agent_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversation.id)
      .eq('agent_id', currentUserId)
      .is('read_at', null)
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/chatbots/${conversation.chatbot_id}/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const data = await response.json()
      
      // Add the new message to the list
      setMessages(prev => [...prev, {
        ...data.message,
        agent: { email: currentUserId }
      }])
      
      // Update conversation status if needed
      if (conversation.status === 'waiting_for_agent') {
        await updateConversationStatus('agent_responding')
      }
      
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const updateConversationStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/chatbots/${conversation.chatbot_id}/conversations/${conversation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      // Update local state
      conversation.status = status
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chatbot_id=eq.${conversation.chatbot_id},session_id=eq.${conversation.session_id}`
        },
        (payload) => {
          // Add new message to the list
          setMessages(prev => [...prev, payload.new as any])
          scrollToBottom()
          
          // Mark as read if it's from user
          if ((payload.new as any).is_user_message) {
            markNotificationsRead()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <ConversationHeader 
        conversation={conversation}
        onStatusChange={updateConversationStatus}
      />
      
      <MessageThread 
        messages={messages}
        currentUserId={currentUserId}
      />
      
      <div ref={messagesEndRef} />
      
      {conversation.status !== 'resolved' && conversation.status !== 'archived' && (
        <AgentResponseBox 
          onSend={sendMessage}
          sending={sending}
        />
      )}
    </div>
  )
} 
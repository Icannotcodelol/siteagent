'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
  id: string
  chatbot_id: string
  session_id: string
  status: 'active' | 'waiting_for_agent' | 'agent_responding' | 'resolved' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  last_message_at: string
  last_user_message_at: string | null
  assigned_agent_id: string | null
  assigned_agent_email: string | null
  customer_info: any
  tags: string[]
  message_count: number
  unread_notifications: number
}

interface ConversationListProps {
  chatbotId: string
}

export default function ConversationList({ chatbotId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    status: string
    priority: string
  }>({
    status: 'all',
    priority: 'all'
  })

  const supabase = createClient()

  const loadConversations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter.status !== 'all') params.append('status', filter.status)
      if (filter.priority !== 'all') params.append('priority', filter.priority)

      const response = await fetch(`/api/chatbots/${chatbotId}/conversations?${params}`)
      if (!response.ok) throw new Error('Failed to load conversations')
      
      const data = await response.json()
      setConversations(data.conversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    loadConversations()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`conversations:${chatbotId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `chatbot_id=eq.${chatbotId}`
        },
        () => {
          // Reload conversations when changes occur
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatbotId, filter])

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      waiting_for_agent: 'bg-yellow-100 text-yellow-800',
      agent_responding: 'bg-blue-100 text-blue-800',
      resolved: 'bg-gray-100 text-gray-800',
      archived: 'bg-gray-100 text-gray-500'
    }

    const labels = {
      active: 'Active',
      waiting_for_agent: 'Waiting',
      agent_responding: 'Agent Responding',
      resolved: 'Resolved',
      archived: 'Archived'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'text-gray-600',
      normal: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }

    return (
      <span className={`text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filters */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="block w-full pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="waiting_for_agent">Waiting for Agent</option>
              <option value="agent_responding">Agent Responding</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority-filter" className="block text-xs font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority-filter"
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="block w-full pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="divide-y divide-gray-200">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/chatbot/${chatbotId}/conversations/${conversation.id}`}
              className="block hover:bg-gray-50 transition-colors"
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        Session {conversation.session_id.slice(0, 8)}...
                      </h3>
                      {getStatusBadge(conversation.status)}
                      {getPriorityBadge(conversation.priority)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a8.965 8.965 0 01-4.126-.993L3 20l1.993-5.874A8.965 8.965 0 013 12c0-4.418 4.03-8 9-8s8 3.582 8 8z" />
                        </svg>
                        {conversation.message_count} messages
                      </span>
                      
                      {conversation.assigned_agent_email && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {conversation.assigned_agent_email}
                        </span>
                      )}
                      
                      <span>
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                      </span>
                    </div>

                    {conversation.tags.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        {conversation.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {conversation.unread_notifications > 0 && (
                    <div className="ml-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
                        {conversation.unread_notifications}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
} 
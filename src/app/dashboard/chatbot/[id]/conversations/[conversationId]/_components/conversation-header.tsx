'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ConversationHeaderProps {
  conversation: any
  onStatusChange: (status: string) => void
}

export default function ConversationHeader({ conversation, onStatusChange }: ConversationHeaderProps) {
  const [showActions, setShowActions] = useState(false)

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    waiting_for_agent: 'bg-yellow-100 text-yellow-800',
    agent_responding: 'bg-blue-100 text-blue-800',
    resolved: 'bg-gray-100 text-gray-800',
    archived: 'bg-gray-100 text-gray-500'
  }

  const statusLabels = {
    active: 'Active',
    waiting_for_agent: 'Waiting for Agent',
    agent_responding: 'Agent Responding',
    resolved: 'Resolved',
    archived: 'Archived'
  }

  return (
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/chatbot/${conversation.chatbot_id}/conversations`}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Conversation with Session {conversation.session_id.slice(0, 8)}...
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[conversation.status as keyof typeof statusColors]}`}>
                {statusLabels[conversation.status as keyof typeof statusLabels]}
              </span>
              
              {conversation.assigned_agent_email && (
                <span className="text-sm text-gray-500">
                  Assigned to {conversation.assigned_agent_email}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Actions
            <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showActions && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu">
                {conversation.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      onStatusChange('resolved')
                      setShowActions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mark as Resolved
                  </button>
                )}
                
                {conversation.status === 'resolved' && (
                  <button
                    onClick={() => {
                      onStatusChange('active')
                      setShowActions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Reopen Conversation
                  </button>
                )}
                
                {conversation.status !== 'waiting_for_agent' && conversation.status !== 'agent_responding' && (
                  <button
                    onClick={() => {
                      onStatusChange('waiting_for_agent')
                      setShowActions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Request Agent
                  </button>
                )}
                
                <button
                  onClick={() => {
                    onStatusChange('archived')
                    setShowActions(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Archive Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {conversation.customer_info && Object.keys(conversation.customer_info).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(conversation.customer_info).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="ml-2 text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
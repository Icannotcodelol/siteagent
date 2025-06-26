'use client'

import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  content: string
  is_user_message: boolean
  created_at: string
  agent_id?: string
  agent?: { email: string }
  metadata?: any
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
}

export default function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const getMessageSender = (message: Message) => {
    if (message.is_user_message) {
      return 'Customer'
    } else if (message.agent_id || message.metadata?.sent_by === 'agent') {
      return message.agent?.email || message.metadata?.agent_email || 'Agent'
    } else {
      return 'AI Assistant'
    }
  }

  const getMessageStyle = (message: Message) => {
    if (message.is_user_message) {
      return 'bg-gray-100 text-gray-900'
    } else if (message.agent_id || message.metadata?.sent_by === 'agent') {
      return 'bg-blue-600 text-white'
    } else {
      return 'bg-blue-500 text-white'
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isUser = message.is_user_message
        const isAgent = message.agent_id || message.metadata?.sent_by === 'agent'
        
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${isUser ? 'text-gray-500' : 'text-gray-600'}`}>
                  {getMessageSender(message)}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <div className={`rounded-lg px-4 py-2 ${getMessageStyle(message)}`}>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
              
              {isAgent && (
                <div className="mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-500">Human agent</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No messages yet in this conversation.</p>
        </div>
      )}
    </div>
  )
} 
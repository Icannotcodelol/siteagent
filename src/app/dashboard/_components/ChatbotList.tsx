'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/_components/ui/button'

// Chatbot type with additional metadata (kept in sync with DashboardPage)
export type Chatbot = {
  id: string
  name: string
  description: string | null
  created_at: string
  messageCount: number
  conversationCount?: number
}

interface ChatbotListProps {
  chatbots: Chatbot[]
}

interface ChatbotListItemProps {
  chatbot: Chatbot
  index: number
}

function ChatbotListItem({ chatbot, index }: ChatbotListItemProps) {
  const router = useRouter()
  const [formattedDate, setFormattedDate] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Format date only on the client after mount
    setFormattedDate(new Date(chatbot.created_at).toLocaleDateString('en-GB', { 
        day: '2-digit', month: '2-digit', year: 'numeric' 
    }))
  }, [chatbot.created_at]) // Re-run if created_at changes (unlikely but safe)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling

    if (!window.confirm(`Are you sure you want to delete chatbot "${chatbot.name}"? This will delete the chatbot and all associated documents.`)) {
      return;
    }

    setDeletingId(chatbot.id);
    setError(null);

    try {
      // Call the API route (we will create this next)
      const response = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMsg = `Failed to delete chatbot (Status: ${response.status}).`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (parseErr) { /* Ignore */ }
        throw new Error(errorMsg);
      }

      // Success
      setError(null);
      router.refresh(); // Refresh the dashboard list

    } catch (err: any) {
      console.error('Delete chatbot error:', err);
      setError(err.message || 'An unexpected error occurred during deletion.');
    } finally {
      setDeletingId(null);
    }
  };

  // Gradient accent colors for variety
  const gradientColors = [
    'from-blue-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-blue-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-red-500',
  ]
  const gradient = gradientColors[index % gradientColors.length]

  // Activity level indicator
  const activityLevel = () => {
    if (chatbot.messageCount > 100) return { text: 'High Activity', color: 'text-green-400' }
    if (chatbot.messageCount > 50) return { text: 'Moderate Activity', color: 'text-yellow-400' }
    return { text: 'Low Activity', color: 'text-gray-400' }
  }

  const activity = activityLevel()

  return (
    <li className="group relative">
      <Link
        href={`/dashboard/chatbot/${chatbot.id}`}
        className="block h-full"
      >
        <div className="card-base card-hover h-full flex flex-col overflow-hidden relative">
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
          
          {/* Status indicator */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Online</span>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 pt-2">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:gradient-text transition-all duration-300">
                {chatbot.name}
              </h3>
              {chatbot.description && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {chatbot.description}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="glass rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Conversations</span>
                  <span className="text-lg font-bold text-white">
                    {chatbot.conversationCount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
              <div className="glass rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Messages</span>
                  <span className="text-lg font-bold text-white">
                    {chatbot.messageCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity & Date */}
            <div className="flex items-center justify-between text-xs">
              <span className={activity.color}>{activity.text}</span>
              <span className="text-gray-500">Updated {formattedDate}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              onClick={(e) => {
                e.preventDefault()
                router.push(`/dashboard/chatbot/${chatbot.id}`)
              }}
            >
              <span className="mr-2">⚙️</span>
              Manage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deletingId === chatbot.id}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              {deletingId === chatbot.id ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <span className="mr-2">🗑️</span>
                  Delete
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500/10 border-t border-red-500/30 p-2">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
      </Link>
    </li>
  )
}

export default function ChatbotList({ chatbots }: ChatbotListProps) {
  if (!chatbots || chatbots.length === 0) {
    return (
      <div className="card-base text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No chatbots yet</h3>
          <p className="text-gray-400 mb-6">Create your first AI assistant to get started!</p>
          <Link href="/dashboard/chatbot/new">
            <Button className="gradient-primary text-white btn-scale glow">
              <span className="mr-2">✨</span>
              Create Your First Chatbot
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {chatbots.map((chatbot, index) => (
        <ChatbotListItem key={chatbot.id} chatbot={chatbot} index={index} />
      ))}
    </ul>
  )
} 
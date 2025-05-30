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

  // Color accent for the top border – rotate through a small palette for visual variety
  const accentColors = [
    'border-blue-500',
    'border-green-500',
    'border-purple-500',
    'border-yellow-500',
    'border-pink-500',
  ]
  const accent = accentColors[index % accentColors.length]

  return (
    <li className={`flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-lg ${accent} border-t-4`}>
      {/* Clickable body */}
      <Link
        href={`/dashboard/chatbot/${chatbot.id}`}
        className="flex flex-grow flex-col gap-2 p-4 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-label={`Manage chatbot ${chatbot.name}`}
      >
        {/* Name & updated date */}
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-base font-semibold text-slate-100">
            {chatbot.name}
          </p>
          <p className="whitespace-nowrap text-xs text-slate-400">Updated {formattedDate}</p>
        </div>

        {/* Description */}
        {chatbot.description && (
          <p className="truncate text-sm text-slate-300">
            {chatbot.description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-slate-400">
          <div className="flex space-x-4">
            {chatbot.conversationCount !== undefined && (
              <span>
                <span className="font-medium text-slate-100">{chatbot.conversationCount}</span>{' '}
                Conversations
              </span>
            )}
            <span>
              <span className="font-medium text-slate-100">{chatbot.messageCount}</span>{' '}
              Messages
            </span>
          </div>
          <span className="font-medium text-blue-400 hover:text-blue-300">Manage</span>
        </div>
      </Link>

      {/* Delete action */}
      <div className="flex items-center justify-end border-t border-slate-700 bg-slate-800/50 px-4 py-2">
        {error && <p className="mr-auto text-xs text-red-400">Error: {error}</p>}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deletingId === chatbot.id}
          className="text-xs"
          title="Delete chatbot"
          aria-label={`Delete chatbot ${chatbot.name}`}
        >
          {deletingId === chatbot.id ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </li>
  )
}

export default function ChatbotList({ chatbots }: ChatbotListProps) {
  if (!chatbots || chatbots.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-center shadow-md">
        <p className="text-slate-400">You haven't created any chatbots yet.</p>
        <p className="mt-1 text-sm text-slate-500">Use the button above to create your first one!</p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
      {chatbots.map((chatbot, index) => (
        <ChatbotListItem key={chatbot.id} chatbot={chatbot} index={index} />
      ))}
    </ul>
  )
} 
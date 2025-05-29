'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PencilIcon, TrashIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline'

interface ChatbotInterrogationPageProps {
  params: { id: string }
}

interface InterrogationSession {
  id: string
  created_at: string
  title: string | null
  status: string
}

export default function ChatbotInterrogationPage({ params }: ChatbotInterrogationPageProps) {
  const router = useRouter()
  const chatbotId = params.id
  const [sessions, setSessions] = useState<InterrogationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [creating, setCreating] = useState(false)

  const supabase = createClient()

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('interrogation_sessions')
        .select('id, created_at, title, status')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [chatbotId])

  const createSession = async () => {
    if (creating) return
    setCreating(true)
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/interrogation/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create session')

      router.push(`/dashboard/chatbot/${chatbotId}/interrogation/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (session: InterrogationSession) => {
    setEditingId(session.id)
    setEditTitle(session.title || 'Untitled session')
  }

  const saveEdit = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/interrogation/sessions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, title: editTitle.trim() }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update session')
      }

      const updatedSession = await res.json()
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: updatedSession.title } : s
      ))
      setEditingId(null)
      setEditTitle('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const deleteSession = async (sessionId: string, title: string | null) => {
    const confirmMsg = `Are you sure you want to delete "${title || 'Untitled session'}"? This action cannot be undone.`
    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/interrogation/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete session')
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link 
            href={`/dashboard/chatbot/${chatbotId}`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Chatbot
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Interrogation Sessions</h1>
        </div>
        <button
          onClick={createSession}
          disabled={creating}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? (
            <>
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Creating...
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Session
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sessions list */}
      {sessions.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li key={session.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === session.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(session.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          className="flex-1 px-3 py-1 text-lg font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Session title..."
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(session.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Link 
                        href={`/dashboard/chatbot/${chatbotId}/interrogation/${session.id}`}
                        className="block group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {session.title || 'Untitled session'}
                            </h3>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="capitalize">
                                Status: <span className={`font-medium ${
                                  session.status === 'active' ? 'text-green-600' : 
                                  session.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                                }`}>{session.status}</span>
                              </span>
                              <span>
                                Created: {new Date(session.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>

                  {editingId !== session.id && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          startEdit(session)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Rename session"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          deleteSession(session.id, session.title)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete session"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.965 8.965 0 01-4.126-.993L3 20l1.993-5.874A8.965 8.965 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interrogation sessions yet</h3>
          <p className="text-gray-500 mb-6">
            Start an interrogation session to test and improve your chatbot's responses.
          </p>
          <button
            onClick={createSession}
            disabled={creating}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create First Session
          </button>
        </div>
      )}
    </div>
  )
} 
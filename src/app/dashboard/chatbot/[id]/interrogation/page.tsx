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
  interrogation_messages: Array<{ count: number }> | null
  training_corrections: Array<{ count: number }> | null
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
      // First, get basic session data
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('interrogation_sessions')
        .select(`
          id, 
          created_at, 
          title, 
          status
        `)
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

      if (sessionsError) throw sessionsError

      // For each session, get message and correction counts separately
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          // Get message count
          const { count: messageCount } = await supabase
            .from('interrogation_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)

          // Get correction count via messages
          const { data: flaggedMessages } = await supabase
            .from('interrogation_messages')
            .select('id')
            .eq('session_id', session.id)
            .eq('flagged', true)

          let correctionCount = 0
          if (flaggedMessages && flaggedMessages.length > 0) {
            const messageIds = flaggedMessages.map(msg => msg.id)
            const { count } = await supabase
              .from('training_corrections')
              .select('*', { count: 'exact', head: true })
              .in('message_id', messageIds)
            correctionCount = count || 0
          }

          return {
            ...session,
            interrogation_messages: [{ count: messageCount || 0 }],
            training_corrections: [{ count: correctionCount }]
          }
        })
      )

      setSessions(sessionsWithCounts)
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

  const createSessionWithTemplate = async (title: string) => {
    if (creating) return
    setCreating(true)
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/interrogation/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
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
        <div className="relative group">
          <button
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
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
          {!creating && (
            <div className="absolute right-0 z-10 hidden group-hover:block w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="py-2">
                <button 
                  onClick={createSession}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  🆕 Blank Session
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Templates</div>
                <button 
                  onClick={() => createSessionWithTemplate("General Knowledge Test")}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  📚 General Knowledge Test
                </button>
                <button 
                  onClick={() => createSessionWithTemplate("Product Information Test")}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  🛍️ Product Information Test
                </button>
                <button 
                  onClick={() => createSessionWithTemplate("Customer Support Test")}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  🎧 Customer Support Test
                </button>
                <button 
                  onClick={() => createSessionWithTemplate("Edge Cases & Limits Test")}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  ⚡ Edge Cases & Limits Test
                </button>
                <button 
                  onClick={() => createSessionWithTemplate("Tone & Personality Test")}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  🎭 Tone & Personality Test
                </button>
              </div>
            </div>
          )}
        </div>
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

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.965 8.965 0 01-4.126-.993L3 20l1.993-5.874A8.965 8.965 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sessions.reduce((total, session) => total + (session.interrogation_messages?.[0]?.count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21a2 2 0 012 2v11a2 2 0 01-2 2H3z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Corrections</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sessions.reduce((total, session) => total + (session.training_corrections?.[0]?.count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {session.title || 'Untitled session'}
                            </h3>
                            <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.965 8.965 0 01-4.126-.993L3 20l1.993-5.874A8.965 8.965 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                                </svg>
                                {session.interrogation_messages?.[0]?.count || 0} messages
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21a2 2 0 012 2v11a2 2 0 01-2 2H3z" />
                                </svg>
                                {session.training_corrections?.[0]?.count || 0} corrections
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                session.status === 'active' ? 'bg-green-100 text-green-800' : 
                                session.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {session.status}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              Created: {new Date(session.created_at).toLocaleString()}
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
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Interrogation mode helps you systematically test and improve your chatbot by chatting with it and flagging incorrect responses.
          </p>
          
          {/* How it works */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">How Interrogation Mode Works</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                <p className="font-medium text-blue-900">Chat & Test</p>
                <p className="text-blue-700">Ask questions and chat with your bot to identify issues</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                <p className="font-medium text-blue-900">Flag Problems</p>
                <p className="text-blue-700">Flag incorrect responses and provide the correct answer</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                <p className="font-medium text-blue-900">Auto-Improvement</p>
                <p className="text-blue-700">Corrections automatically improve future responses</p>
              </div>
            </div>
          </div>

          <button
            onClick={createSession}
            disabled={creating}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Start Your First Interrogation Session
          </button>
        </div>
      )}
    </div>
  )
} 
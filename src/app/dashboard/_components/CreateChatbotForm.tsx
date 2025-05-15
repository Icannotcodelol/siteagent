'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateChatbotForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const chatbotName = name.trim() || `New Chatbot ${new Date().toLocaleTimeString()}`

    setLoading(true)

    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: chatbotName }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create chatbot (Status: ${response.status})`)
      }

      const newChatbot = await response.json()

      if (!newChatbot || !newChatbot.id) {
        throw new Error("Failed to get ID of the newly created chatbot from API response.")
      }

      router.push(`/dashboard/chatbot/${newChatbot.id}`)

    } catch (err: any) {
      console.error('Creation error:', err)
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
      <div className="flex-grow w-full sm:w-auto">
        <label htmlFor="chatbotName" className="sr-only">
          New Chatbot Name (Optional)
        </label>
        <input
          id="chatbotName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Chatbot Name (Optional)"
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? 'Creating...' : '+ Create Chatbot'}
      </button>
    </form>
  )
} 
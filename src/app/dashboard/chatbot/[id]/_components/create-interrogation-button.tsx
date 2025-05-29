'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  chatbotId: string
}

export default function CreateInterrogationButton({ chatbotId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/chatbots/${chatbotId}/interrogation/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start')

      router.push(`/dashboard/chatbot/${chatbotId}/interrogation/${data.id}`)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Creating…' : '+ New Session'}
    </button>
  )
} 
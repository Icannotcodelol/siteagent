"use client"

import ChatPreview from '../../new/_components/chat-preview'

interface Props { chatbotId: string; sessionId: string }

export default function InterrogationChat({ chatbotId, sessionId }: Props) {
  // Persist Q/A pair
  const persist = async (question: string, answer: string) => {
    const res = await fetch(`/api/chatbots/${chatbotId}/interrogation/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    })
    if (!res.ok) {
      console.error('Persist failed', await res.text())
      return
    }
    return await res.json()
  }

  const flag = async (assistantMessageId: string, errorCategory: string, description: string, correctAnswer: string) => {
    const res = await fetch(`/api/chatbots/${chatbotId}/interrogation/sessions/${sessionId}/messages/${assistantMessageId}/correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error_category: errorCategory, description, correct_answer: correctAnswer })
    })
    if (!res.ok) {
      console.error('Flag failed', await res.text())
      throw new Error('Flag failed')
    }
  }

  return (
    <ChatPreview
      chatbotId={chatbotId}
      sessionId={sessionId}
      isInterrogation
      onPersistMessages={persist}
      onFlag={flag}
    />
  )
} 
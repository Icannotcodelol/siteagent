import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Type for request body
interface FeedbackRequestBody {
  sessionId: string
  messageId?: string // Optional because frontend may not know DB message ID yet
  feedbackType: 'thumbs_up' | 'thumbs_down'
  userComment?: string
}

export async function POST(request: NextRequest, { params }: { params: { chatbotId: string } }) {
  const chatbotId = params.chatbotId

  if (!chatbotId) {
    return NextResponse.json({ error: 'Missing chatbotId in URL.' }, { status: 400 })
  }

  let body: FeedbackRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { sessionId, messageId, feedbackType, userComment } = body

  if (!sessionId || !feedbackType) {
    return NextResponse.json({ error: 'sessionId and feedbackType are required.' }, { status: 400 })
  }

  if (feedbackType !== 'thumbs_up' && feedbackType !== 'thumbs_down') {
    return NextResponse.json({ error: 'feedbackType must be thumbs_up or thumbs_down.' }, { status: 400 })
  }

  try {
    const supabase = createClient()

    const { error } = await supabase.from('message_feedback').insert({
      chatbot_id: chatbotId,
      session_id: sessionId,
      message_id: messageId ?? null,
      feedback_type: feedbackType,
      user_comment: userComment ?? null,
    })

    if (error) {
      console.error('Error inserting feedback:', error)
      return NextResponse.json({ error: 'Failed to store feedback.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Unexpected error in feedback route:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
} 
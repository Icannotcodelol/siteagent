import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, CookieOptions } from '@supabase/ssr'

interface RouteContext {
  params: {
    sessionId: string
  }
}

interface CorrectionBody {
  chatMessageId: string
  errorType: string
  description?: string
  correctAnswer: string
  additionalNotes?: string
}

function getSupabaseClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore.get(name)
        return cookie?.value
      },
      async set(name: string, value: string, options: CookieOptions) {
        await cookieStore.set({ name, value, ...options })
      },
      async remove(name: string, options: CookieOptions) {
        await cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { sessionId } = params

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId param missing' }, { status: 400 })
  }

  // Parse body
  let payload: CorrectionBody
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { chatMessageId, errorType, description, correctAnswer, additionalNotes } = payload

  if (!chatMessageId || !errorType || !correctAnswer) {
    return NextResponse.json(
      { error: 'chatMessageId, errorType and correctAnswer are required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure user owns the interrogation session
  const { data: session, error: sessionError } = await supabase
    .from('interrogation_sessions')
    .select('admin_user_id, chatbot_id')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Interrogation session not found' }, { status: 404 })
  }

  if (session.admin_user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Write correction to interrogation_corrections table
  const { data: correction, error: insertError } = await supabase
    .from('interrogation_corrections')
    .insert({
      message_id: chatMessageId,
      error_type: errorType,
      description,
      correct_answer: correctAnswer,
      additional_notes: additionalNotes,
    })
    .select('id, created_at')
    .single()

  if (insertError) {
    console.error('Failed to insert correction', insertError)
    return NextResponse.json({ error: 'Failed to save correction' }, { status: 500 })
  }

  console.log('New interrogation correction recorded', correction.id)

  // -------------------------------------------------------
  // Create an inline document so the corrected answer is
  // ingested by the RAG pipeline and improves future answers
  // -------------------------------------------------------
  try {
    // Create a more detailed correction document that's more likely to be retrieved
    const correctionContent = `
CORRECTION: ${errorType}

Original Question Context: This correction addresses issues that may arise when users ask similar questions.

${description ? `Problem Description: ${description}\n\n` : ''}

Correct Answer: ${correctAnswer}

${additionalNotes ? `Additional Notes: ${additionalNotes}\n\n` : ''}

Keywords: correction, interrogation, improvement, ${errorType}`

    const { data: docRow, error: docErr } = await supabase
      .from('documents')
      .insert({
        chatbot_id: session.chatbot_id,
        user_id: user.id,
        file_name: `correction-${errorType}-${Date.now()}.txt`,
        content: correctionContent.trim(),
        embedding_status: 'pending',
        file_type: 'text',
        // Add metadata to identify this as a correction document
        metadata: {
          type: 'interrogation_correction',
          message_id: chatMessageId,
          error_type: errorType,
          priority: 'high'
        }
      })
      .select('id')
      .single()

    if (docErr) {
      console.error('Failed to create correction document', docErr)
    } else {
      console.log('Queued correction document for embedding', docRow.id)
      
      // Directly invoke generate-embeddings function
      try {
        const { error: invokeError } = await supabase.functions.invoke(
          'generate-embeddings',
          {
            body: {
              invoker: 'interrogation-correction',
              documentId: docRow.id,
              scrapedContent: correctionContent.trim()
            }
          }
        )
        
        if (invokeError) {
          console.error('Failed to invoke generate-embeddings for correction', invokeError)
        } else {
          console.log('Successfully triggered embedding generation for correction', docRow.id)
        }
      } catch (invokeErr) {
        console.error('Error invoking generate-embeddings function', invokeErr)
      }
    }
  } catch (e) {
    console.error('Unexpected error creating correction document', e)
  }

  return NextResponse.json({ correctionId: correction.id, createdAt: correction.created_at })
} 
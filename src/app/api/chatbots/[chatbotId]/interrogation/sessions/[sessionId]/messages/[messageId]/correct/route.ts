import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getIds(request: NextRequest) {
  const parts = request.nextUrl.pathname.split('/')
  const chatbotId = parts[parts.indexOf('chatbots') + 1]
  const sessionId = parts[parts.indexOf('sessions') + 1]
  const messageId = parts[parts.indexOf('messages') + 1]
  return { chatbotId, sessionId, messageId }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chatbotId, sessionId, messageId } = getIds(request)
  if (!chatbotId || !sessionId || !messageId) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

  // Validate session ownership
  const { data: session, error: sessErr } = await supabase
    .from('interrogation_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('chatbot_id', chatbotId)
    .maybeSingle()
  if (sessErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  // Validate message belongs to session
  const { data: msg, error: msgErr } = await supabase
    .from('interrogation_messages')
    .select('id, flagged')
    .eq('id', messageId)
    .eq('session_id', sessionId)
    .maybeSingle()
  if (msgErr || !msg) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { error_category, description, correct_answer, additional_context } = body
  if (!correct_answer) return NextResponse.json({ error: 'correct_answer is required' }, { status: 400 })

  // Update message flagged true if not already
  if (!msg.flagged) {
    await supabase.from('interrogation_messages').update({ flagged: true }).eq('id', messageId)
  }

  const { data: correction, error: insertErr } = await supabase
    .from('training_corrections')
    .insert({
      message_id: messageId,
      corrected_by: user.id,
      error_category,
      description,
      correct_answer,
      additional_context
    })
    .select()
    .single()

  if (insertErr) {
    console.error('Failed to insert correction', insertErr)
    return NextResponse.json({ error: 'Failed to create correction' }, { status: 500 })
  }

  // -------------------------------------------------------
  // Create an inline document so the corrected answer is
  // ingested by the RAG pipeline and improves future answers
  // -------------------------------------------------------
  try {
    // Create a more detailed correction document that's more likely to be retrieved
    const correctionContent = `
CORRECTION: ${error_category || 'General correction'}

Original Question Context: This correction addresses issues that may arise when users ask similar questions.

${description ? `Problem Description: ${description}\n\n` : ''}

Correct Answer: ${correct_answer}

${additional_context ? `Additional Context: ${additional_context}\n\n` : ''}

Keywords: correction, interrogation, improvement, ${error_category || 'general'}`

    const { data: docRow, error: docErr } = await supabase
      .from('documents')
      .insert({
        chatbot_id: chatbotId,
        user_id: user.id,
        file_name: `correction-${error_category || 'general'}-${Date.now()}.txt`,
        content: correctionContent.trim(),
        embedding_status: 'pending',
        file_type: 'text', // Treat as plain text inline doc
        // Add metadata to identify this as a correction document
        metadata: {
          type: 'interrogation_correction',
          message_id: messageId,
          error_category: error_category || 'general',
          priority: 'high'
        }
      })
      .select('id')
      .single()

    if (docErr) {
      // Not fatal – the correction is still stored, but log for visibility
      console.error('Failed to create correction document', docErr)
    } else {
      console.log('Queued correction document for embedding', docRow.id)
      
      // Directly invoke generate-embeddings function since there's no automatic trigger
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

  return NextResponse.json(correction, { status: 201 })
} 
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { updateSystemPromptFromCorrection } from '@/app/actions'

// Helper to extract IDs from the request URL
function getIds(request: NextRequest) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  
  const chatbotIdIndex = pathSegments.findIndex(segment => segment === 'chatbots') + 1
  const sessionIdIndex = pathSegments.findIndex(segment => segment === 'sessions') + 1
  const messageIdIndex = pathSegments.findIndex(segment => segment === 'messages') + 1
  
  return {
    chatbotId: pathSegments[chatbotIdIndex] || null,
    sessionId: pathSegments[sessionIdIndex] || null,
    messageId: pathSegments[messageIdIndex] || null
  }
}

function createClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseKey, {
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

  // Determine correction type and handle accordingly
  const behaviorIssues = ['tone', 'personality', 'format', 'instructions']
  const dataIssues = ['factual', 'incomplete', 'context', 'relevance']
  
  if (behaviorIssues.includes(error_category)) {
    // -------------------------------------------------------
    // Handle behavior/tone issues by updating system prompt
    // -------------------------------------------------------
    console.log(`Processing behavior correction: ${error_category}`)
    
    try {
      const result = await updateSystemPromptFromCorrection(
        chatbotId,
        error_category,
        description || '',
        correct_answer
      )
      
      if (!result.success) {
        console.error('Failed to update system prompt:', result.error)
        // Don't fail the whole request, just log the issue
      } else {
        console.log('Successfully updated system prompt with behavior correction')
      }
    } catch (error) {
      console.error('Error updating system prompt:', error)
      // Don't fail the whole request, just log the issue
    }
    
  } else if (dataIssues.includes(error_category)) {
    // -------------------------------------------------------
    // Handle data/information issues by creating correction documents
    // -------------------------------------------------------
    console.log(`Processing data correction: ${error_category}`)
    
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
          file_type: 'text'
        })
        .select('id')
        .single()

      if (docErr) {
        console.error('Failed to create correction document', docErr)
      } else {
        console.log('Queued correction document for embedding', docRow.id)
        
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
  } else {
    // Unknown category, default to data issue behavior
    console.log(`Unknown error category: ${error_category}, defaulting to data correction`)
    
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
          file_type: 'text'
        })
        .select('id')
        .single()

      if (docErr) {
        console.error('Failed to create correction document', docErr)
      } else {
        console.log('Queued correction document for embedding', docRow.id)
        
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
  }

  return NextResponse.json(correction, { status: 201 })
} 
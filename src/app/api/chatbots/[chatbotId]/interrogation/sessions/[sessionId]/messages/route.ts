import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Extract ids from path
function getIds(request: NextRequest) {
  const parts = request.nextUrl.pathname.split('/')
  const chatbotIdx = parts.indexOf('chatbots') + 1
  const chatbotId = parts[chatbotIdx]
  const sessionIdx = parts.indexOf('sessions') + 1
  const sessionId = parts[sessionIdx]
  return { chatbotId, sessionId }
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chatbotId, sessionId } = getIds(request)
  if (!chatbotId || !sessionId) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

  // Verify access by selecting session (RLS)
  const { data: session, error: sessErr } = await supabase
    .from('interrogation_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('chatbot_id', chatbotId)
    .maybeSingle()
  if (sessErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const { data: messages, error } = await supabase
    .from('interrogation_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at')
  if (error) return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })

  return NextResponse.json({ messages }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chatbotId, sessionId } = getIds(request)
  if (!chatbotId || !sessionId) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { question, answer, flagged: flaggedParam = false } = body
  if (!question || !answer) return NextResponse.json({ error: 'question and answer are required' }, { status: 400 })

  // Verify access (same as GET)
  const { data: session, error: sessErr } = await supabase
    .from('interrogation_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('chatbot_id', chatbotId)
    .maybeSingle()
  if (sessErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  // Insert user message
  const { data: userMsg, error: userErr } = await supabase
    .from('interrogation_messages')
    .insert({ session_id: sessionId, role: 'user', content: question })
    .select('id')
    .single()

  if (userErr) {
    console.error('Failed to insert user message', userErr)
    return NextResponse.json({ error: 'Failed to insert user message' }, { status: 500 })
  }

  const { data: assistantMsg, error: aiErr } = await supabase
    .from('interrogation_messages')
    .insert({ session_id: sessionId, role: 'assistant', content: answer, flagged: flaggedParam })
    .select('id')
    .single()

  if (aiErr) {
    console.error('Failed to insert assistant message', aiErr)
    return NextResponse.json({ error: 'Failed to insert assistant message' }, { status: 500 })
  }

  return NextResponse.json({ 
    userMessageId: userMsg.id, 
    assistantMessageId: assistantMsg.id 
  }, { status: 201 })
} 
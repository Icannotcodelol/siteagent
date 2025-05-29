import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper: extract chatbotId from the dynamic route path
function getChatbotId(request: NextRequest): string | null {
  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/')
  const chatbotIndex = segments.indexOf('chatbots')
  return chatbotIndex !== -1 && segments[chatbotIndex + 1] ? segments[chatbotIndex + 1] : null
}

// GET -> list sessions. POST -> create new session
export async function GET(request: NextRequest) {
  const supabase = createClient()

  // 1. Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse chatbotId
  const chatbotId = getChatbotId(request)
  if (!chatbotId) {
    return NextResponse.json({ error: 'Missing chatbotId' }, { status: 400 })
  }

  // 3. List sessions (RLS will ensure ownership)
  const { data, error } = await supabase
    .from('interrogation_sessions')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to list interrogation sessions', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }

  return NextResponse.json({ sessions: data }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // 1. Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse chatbotId
  const chatbotId = getChatbotId(request)
  if (!chatbotId) {
    return NextResponse.json({ error: 'Missing chatbotId' }, { status: 400 })
  }

  // 3. Verify ownership via RLS attempt to select chatbot
  const { data: chatbot, error: chatbotError } = await supabase
    .from('chatbots')
    .select('id')
    .eq('id', chatbotId)
    .maybeSingle()
  if (chatbotError || !chatbot) {
    return NextResponse.json({ error: 'Chatbot not found or access denied' }, { status: 404 })
  }

  // 4. Create new session
  const { data: session, error: insertError } = await supabase
    .from('interrogation_sessions')
    .insert({ chatbot_id: chatbotId, admin_user_id: user.id })
    .select()
    .single()

  if (insertError) {
    console.error('Failed to create interrogation session', insertError)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  return NextResponse.json(session, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()

  // 1. Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse chatbotId
  const chatbotId = getChatbotId(request)
  if (!chatbotId) {
    return NextResponse.json({ error: 'Missing chatbotId' }, { status: 400 })
  }

  // 3. Parse body
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { sessionId, title } = body
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  // 4. Update session title (RLS will ensure ownership)
  const { data: session, error: updateError } = await supabase
    .from('interrogation_sessions')
    .update({ title: title?.trim() || null })
    .eq('id', sessionId)
    .eq('chatbot_id', chatbotId)
    .select()
    .single()

  if (updateError) {
    console.error('Failed to update interrogation session', updateError)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }

  if (!session) {
    return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 })
  }

  return NextResponse.json(session, { status: 200 })
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient()

  // 1. Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse chatbotId
  const chatbotId = getChatbotId(request)
  if (!chatbotId) {
    return NextResponse.json({ error: 'Missing chatbotId' }, { status: 400 })
  }

  // 3. Get sessionId from URL search params
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId parameter is required' }, { status: 400 })
  }

  // 4. Delete session (RLS will ensure ownership)
  const { error: deleteError } = await supabase
    .from('interrogation_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('chatbot_id', chatbotId)

  if (deleteError) {
    console.error('Failed to delete interrogation session', deleteError)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
} 
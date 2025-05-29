// route.ts – handles chat messages during Interrogation Mode
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface ChatRequestBody {
  chatbotId: string
  query: string
  sessionId: string
}

// Helper – create a Supabase client bound to the request cookies so that
// RLS policies for the signed-in admin are respected.
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

export async function POST(request: NextRequest) {
  // 1. Validate payload
  let body: ChatRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { chatbotId, query, sessionId } = body || {}

  if (!chatbotId || !query || !sessionId) {
    return NextResponse.json(
      { error: 'chatbotId, query and sessionId are required' },
      { status: 400 }
    )
  }

  // 2. Ensure the current user owns the interrogation session
  const supabase = getSupabaseClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: session, error: sessionError } = await supabase
    .from('interrogation_sessions')
    .select('id, admin_user_id')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Interrogation session not found' }, { status: 404 })
  }

  if (session.admin_user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Forward the question to the main chat endpoint which handles RAG & actions
  const baseUrl = request.nextUrl.origin
  const chatRes = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Pass through the same cookies so that /api/chat can authenticate the user
    // (It will fall back to public if not authenticated)
    body: JSON.stringify({ chatbotId, query, sessionId }),
  })

  const chatData = await chatRes.json()

  if (!chatRes.ok) {
    // Simply bubble up the error from the underlying chat route
    return NextResponse.json(chatData, { status: chatRes.status })
  }

  const answer: string = chatData.answer

  // 4. Persist both user question & assistant answer to interrogation_messages for analytics
  try {
    await supabase.from('interrogation_messages').insert([
      { session_id: sessionId, role: 'user', content: query },
      { session_id: sessionId, role: 'assistant', content: answer },
    ])
  } catch (e) {
    // Non-fatal – log for visibility
    console.error('Failed to persist interrogation messages', e)
  }

  return NextResponse.json({ answer, sessionId })
} 
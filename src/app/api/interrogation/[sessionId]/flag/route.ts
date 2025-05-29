import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, CookieOptions } from '@supabase/ssr'

interface RouteContext {
  params: {
    sessionId: string
  }
}

async function initializeSupabaseClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase env vars not set')

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore.get(name)
        return cookie?.value
      },
      async set(name: string, value: string, options: CookieOptions) {
        try { await cookieStore.set({ name, value, ...options }) } catch (e) { console.error('Cookie set failed', e) }
      },
      async remove(name: string, options: CookieOptions) {
        try { await cookieStore.set({ name, value: '', ...options }) } catch (e) { console.error('Cookie remove failed', e) }
      },
    },
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { sessionId } = context.params

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId param missing' }, { status: 400 })
  }

  let supabase
  try {
    supabase = await initializeSupabaseClient()
  } catch (err: any) {
    console.error('Supabase init error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  // Auth check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate body
  let chatMessageId: string | undefined
  let flagType: string | undefined
  let description: string | undefined
  try {
    const body = await request.json()
    chatMessageId = body.chatMessageId
    flagType = body.flagType
    description = body.description

    if (!chatMessageId || typeof chatMessageId !== 'string') throw new Error('chatMessageId required')
    if (!flagType || typeof flagType !== 'string') throw new Error('flagType required')
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Verify that the session exists and is owned by user
  const { data: session, error: sessionError } = await supabase
    .from('interrogation_sessions')
    .select('id, admin_user_id')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.admin_user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Insert flagged response
  const { data: flagRow, error: flagError } = await supabase
    .from('flagged_responses')
    .insert({
      session_id: sessionId,
      chat_message_id: chatMessageId,
      flag_type: flagType,
      description,
    })
    .select('id, created_at')
    .single()

  if (flagError) {
    console.error('Failed to flag response', flagError)
    return NextResponse.json({ error: 'Failed to flag response' }, { status: 500 })
  }

  return NextResponse.json({ flaggedResponseId: flagRow.id, createdAt: flagRow.created_at })
} 
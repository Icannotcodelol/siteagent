import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, CookieOptions } from '@supabase/ssr'

// Helper to create a Supabase client with the incoming request cookies
async function initializeSupabaseClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore.get(name)
        return cookie?.value
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          await cookieStore.set({ name, value, ...options })
        } catch (err) {
          console.error('Failed to set cookie:', err)
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          await cookieStore.set({ name, value: '', ...options })
        } catch (err) {
          console.error('Failed to remove cookie:', err)
        }
      },
    },
  })
}

export async function POST(request: NextRequest) {
  let supabase
  try {
    supabase = await initializeSupabaseClient()
  } catch (err: any) {
    console.error('Supabase init error:', err)
    return NextResponse.json(
      { error: 'Server mis-configuration. Please contact support.' },
      { status: 500 }
    )
  }

  // Parse and validate body
  let chatbotId: string | undefined
  let name: string | undefined
  try {
    const body = await request.json()
    chatbotId = body.chatbotId
    name = body.name

    if (!chatbotId || typeof chatbotId !== 'string') {
      throw new Error('chatbotId is required')
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Ensure user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create new interrogation session
  const { data: session, error: insertError } = await supabase
    .from('interrogation_sessions')
    .insert({
      admin_user_id: user.id,
      chatbot_id: chatbotId,
      name,
    })
    .select('id, created_at')
    .single()

  if (insertError) {
    console.error('Failed to create interrogation session:', insertError)
    return NextResponse.json(
      { error: 'Failed to create interrogation session' },
      { status: 500 }
    )
  }

  return NextResponse.json({ sessionId: session.id, createdAt: session.created_at })
} 
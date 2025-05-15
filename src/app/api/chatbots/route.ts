import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

// Helper function to create Supabase client within Route Handler
// Needed because Route Handlers don't directly use the layout's context
function createRouteHandlerClient() {
    const cookieStore = cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          // Route Handlers need request/response for setting cookies
          // but for simple inserts based on auth, we might not need set/remove here
          // If needed later, pass request/response objects
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient()

  // 1. Check user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse request body
  let name: string
  try {
    const body = await request.json()
    name = body.name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Chatbot name is required and must be a non-empty string.')
    }
    name = name.trim()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body. Please provide a \'name\' field.' }, { status: 400 })
  }

  // 3. Insert into Supabase
  const { data: newChatbot, error: insertError } = await supabase
    .from('chatbots')
    .insert({ user_id: user.id, name: name })
    .select()
    .single() // Expecting only one row back

  if (insertError) {
    console.error('Error inserting chatbot:', insertError)
    // Provide more specific error message if possible (e.g., duplicate name check if added)
    return NextResponse.json({ error: 'Failed to create chatbot. ' + insertError.message }, { status: 500 })
  }

  // 4. Return success response
  return NextResponse.json(newChatbot, { status: 201 })
} 
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'
import { canCreateChatbot } from '@/lib/services/subscriptionService'

// Helper function to create Supabase client within Route Handler
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
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // set() was called from a Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // delete() was called from a Server Component
          }
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

  // 2. Check if user can create another chatbot based on their plan
  const userCanCreate = await canCreateChatbot(user.id, supabase)
  if (!userCanCreate) {
    return NextResponse.json({ 
      error: 'Chatbot limit reached. You have reached the maximum number of chatbots allowed for your current plan. Please upgrade your plan or delete an existing chatbot to create a new one.' 
    }, { status: 403 })
  }

  // 3. Parse request body
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

  // 4. Insert into Supabase
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

  // 5. Return success response
  return NextResponse.json(newChatbot, { status: 201 })
} 
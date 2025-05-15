'use server' // Required directive for Server Actions

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Helper function to create Supabase client within Server Action
// (Similar pattern to Server Components, only 'get' needed for auth check)
function createActionClient() {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const store = await cookies();
            const cookie = store.get(name)
            return cookie?.value
          },
          // No set/remove needed for this specific action's auth check
        },
      }
    )
}

// Server Action to update the system prompt
export async function updateSystemPrompt(chatbotId: string, newPrompt: string | null): Promise<{ success: boolean; error?: string }> {
  const supabase = createActionClient()

  // 1. Verify user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('Server Action Auth Error:', userError)
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Perform the update
  // RLS policy on `chatbots` table should ensure user owns the chatbot.
  // Add explicit .eq('user_id', user.id) for extra safety if RLS isn't fully trusted.
  const { error: updateError } = await supabase
    .from('chatbots')
    .update({ system_prompt: newPrompt === '' ? null : newPrompt }) // Store empty string as NULL
    .eq('id', chatbotId)
    .eq('user_id', user.id) // Explicit ownership check

  if (updateError) {
    console.error('Failed to update system prompt:', updateError)
    return { success: false, error: `Failed to save prompt: ${updateError.message}` }
  }

  // 3. Revalidate the chatbot detail page path to show updated data
  revalidatePath(`/chatbot/${chatbotId}`)

  return { success: true }
} 
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

// Server Action to update system prompt based on interrogation correction
export async function updateSystemPromptFromCorrection(
  chatbotId: string, 
  errorType: string, 
  description: string, 
  correctAnswer: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createActionClient()

  // 1. Verify user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('Server Action Auth Error:', userError)
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Get current chatbot data
  const { data: chatbot, error: fetchError } = await supabase
    .from('chatbots')
    .select('system_prompt')
    .eq('id', chatbotId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !chatbot) {
    console.error('Failed to fetch chatbot:', fetchError)
    return { success: false, error: 'Chatbot not found' }
  }

  // 3. Generate correction instruction based on error type
  let correctionInstruction = ''
  switch (errorType) {
    case 'tone':
      correctionInstruction = `Tone Correction: ${description ? description + ' - ' : ''}${correctAnswer}`
      break
    case 'personality':
      correctionInstruction = `Personality Adjustment: ${description ? description + ' - ' : ''}${correctAnswer}`
      break
    case 'format':
      correctionInstruction = `Format Requirement: ${description ? description + ' - ' : ''}${correctAnswer}`
      break
    case 'instructions':
      correctionInstruction = `Important Rule: ${description ? description + ' - ' : ''}${correctAnswer}`
      break
    default:
      correctionInstruction = `Behavioral Correction: ${description ? description + ' - ' : ''}${correctAnswer}`
  }

  // 4. Update system prompt intelligently
  const currentPrompt = chatbot.system_prompt || 'You are a helpful AI assistant.'
  
  // Check if there's already a corrections section
  let updatedPrompt = currentPrompt
  if (currentPrompt.includes('\n\n--- Behavioral Corrections ---')) {
    // Append to existing corrections section
    updatedPrompt = currentPrompt + `\n- ${correctionInstruction}`
  } else {
    // Add new corrections section
    updatedPrompt = `${currentPrompt}\n\n--- Behavioral Corrections ---\n- ${correctionInstruction}`
  }

  // 5. Perform the update
  const { error: updateError } = await supabase
    .from('chatbots')
    .update({ system_prompt: updatedPrompt })
    .eq('id', chatbotId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Failed to update system prompt from correction:', updateError)
    return { success: false, error: `Failed to update prompt: ${updateError.message}` }
  }

  // 6. Revalidate the chatbot detail page path to show updated data
  revalidatePath(`/chatbot/${chatbotId}`)

  return { success: true }
} 
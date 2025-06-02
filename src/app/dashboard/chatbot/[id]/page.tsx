import { createClient } from '@/lib/supabase/server' // Use the shared server client
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PromptEditor from './_components/prompt-editor'

// Import Builder components
import BuilderHeader from '../new/_components/builder-header' // Re-use header from 'new' page
import ChatbotBuilderForm from '../new/_components/chatbot-builder-form' // Re-use form from 'new' page
import ChatPreview from '../new/_components/chat-preview' // Re-use preview from 'new' page
import { ChatbotAppearanceProvider } from '../new/_components/chatbot-appearance-context'

// Define types for fetched data
type Chatbot = {
  id: string
  name: string
  user_id: string
  system_prompt: string | null
  primary_color?: string | null
  secondary_color?: string | null
  background_color?: string | null
  text_color?: string | null
  font_family?: string | null
  welcome_message?: string | null
  bot_avatar_url?: string | null
  user_avatar_url?: string | null
  chat_bubble_style?: string | null
  header_text?: string | null
  input_placeholder?: string | null
  show_branding?: boolean | null
}

type Document = {
  id: string
  file_name: string
  created_at: string
  embedding_status: string
}

interface ChatbotDetailPageProps {
  params: {
    id: string // Chatbot ID from the URL
  }
}

export default async function ChatbotDetailPage({ params }: ChatbotDetailPageProps) {
  // Call createClient without arguments
  // const cookieStore = await cookies() // No longer needed here
  const supabase = createClient() // No argument

  const chatbotId = params.id

  // Fetch user session first - needed for RLS
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    // This should ideally be handled by the layout, but double-check here
    console.error('Auth error on detail page:', userError)
    // Redirecting here might cause issues if layout already handles it
    // Consider just returning an error message or relying on layout redirect
    return <div className="text-red-500 p-6 bg-gray-950">Authentication error.</div>
  }

  // Fetch chatbot details ensuring user owns it (RLS handles this)
  const { data: chatbot, error: chatbotError } = await supabase
    .from('chatbots')
    .select(`
      id, name, user_id, system_prompt,
      primary_color, secondary_color, background_color, text_color, font_family,
      welcome_message, bot_avatar_url, user_avatar_url, chat_bubble_style,
      header_text, input_placeholder, show_branding
    `)
    .eq('id', chatbotId)
    // .eq('user_id', user.id) // RLS makes this implicit, but explicit check adds layer
    .maybeSingle()

  if (chatbotError || !chatbot) {
    console.error(`Error fetching chatbot ${chatbotId}:`, chatbotError)
    // Use Next.js notFound() helper to render 404 page
    notFound()
  }

  // RLS check: Ensure fetched chatbot user_id matches logged-in user
  // This is a defense-in-depth check in case RLS fails or isn't configured perfectly
  if (chatbot.user_id !== user.id) {
      console.warn(`User ${user.id} attempted to access chatbot ${chatbotId} owned by ${chatbot.user_id}`)
      notFound(); // Treat as not found for security
  }


  // Documents are now fetched client-side with React Query for real-time updates

  return (
    <ChatbotAppearanceProvider initialAppearance={{
      primaryColor: chatbot.primary_color,
      secondaryColor: chatbot.secondary_color,
      backgroundColor: chatbot.background_color,
      textColor: chatbot.text_color,
      fontFamily: chatbot.font_family,
      welcomeMessage: chatbot.welcome_message,
      botAvatarUrl: chatbot.bot_avatar_url,
      userAvatarUrl: chatbot.user_avatar_url,
      chatBubbleStyle: chatbot.chat_bubble_style,
      headerText: chatbot.header_text,
      inputPlaceholder: chatbot.input_placeholder,
      showBranding: chatbot.show_branding,
    }}>
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        {/* Pass chatbot name as title to header */}
        <BuilderHeader title={chatbot.name} /> 

        {/* Three-column layout: Vertical Tabs (within Form) | Form Content (within Form) | Chat Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left & Middle Columns: ChatbotBuilderForm handles its internal two-column (tabs | content) */}
          <div className="xl:col-span-2">
            <ChatbotBuilderForm 
              initialName={chatbot.name} 
              initialSystemPrompt={chatbot.system_prompt ?? ''} 
              chatbotId={chatbot.id}
              initialPrimaryColor={chatbot.primary_color ?? ''}
              initialSecondaryColor={chatbot.secondary_color ?? ''}
              initialBackgroundColor={chatbot.background_color ?? ''}
              initialTextColor={chatbot.text_color ?? ''}
              initialFontFamily={chatbot.font_family ?? ''}
              initialWelcomeMessage={chatbot.welcome_message ?? ''}
              initialBotAvatarUrl={chatbot.bot_avatar_url ?? ''}
              initialUserAvatarUrl={chatbot.user_avatar_url ?? ''}
              initialChatBubbleStyle={chatbot.chat_bubble_style ?? 'rounded'}
              initialHeaderText={chatbot.header_text ?? ''}
              initialInputPlaceholder={chatbot.input_placeholder ?? ''}
              initialShowBranding={chatbot.show_branding ?? true}
            />
          </div>

          {/* Right Column: Chat Preview */}
          <div className="xl:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-8 h-[calc(100vh-8rem)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  Live Preview
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Real-time updates</span>
                </div>
              </div>
              <div className="h-[calc(100%-60px)] rounded-xl overflow-hidden">
                <ChatPreview chatbotId={chatbotId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ChatbotAppearanceProvider>
  )
} 
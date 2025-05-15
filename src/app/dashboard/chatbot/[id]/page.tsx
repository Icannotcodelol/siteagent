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


  // Fetch associated documents for this chatbot
  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('id, file_name, created_at, embedding_status')
    .eq('chatbot_id', chatbotId)
    .order('created_at', { ascending: false })

  if (documentsError) {
    console.error(`Error fetching documents for chatbot ${chatbotId}:`, documentsError)
    // Show an error message for documents, but still render the page
  }

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
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      {/* Pass chatbot name as title to header */}
      <BuilderHeader title={chatbot.name} /> 

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Form */}
        <div className="md:w-2/3 bg-gray-900 p-6 rounded-lg shadow border border-gray-700">
           {/* Pass initial data AND document data to the form */}
           <ChatbotBuilderForm 
             initialName={chatbot.name} 
             initialSystemPrompt={chatbot.system_prompt ?? ''} 
             chatbotId={chatbot.id} 
             documents={documents ?? []} // Pass documents
             documentsError={documentsError} // Pass error
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

        {/* Right Column: Chat Preview/Interface */}
        <div className="md:w-1/3 h-[calc(100vh-150px)] flex flex-col gap-4">
           <div className="flex-1"> 
             {/* Pass chatbotId to the interactive preview */}
             <ChatPreview chatbotId={chatbotId} />
           </div>
           {/* Remove commented out ChatInterface section if no longer needed */}
        </div>
      </div>
    </div>
    </ChatbotAppearanceProvider>
  )
} 
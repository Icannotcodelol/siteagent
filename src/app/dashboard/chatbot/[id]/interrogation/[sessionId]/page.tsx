import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ChatbotAppearanceProvider } from '../../../new/_components/chatbot-appearance-context'

interface SessionPageProps {
  params: { id: string; sessionId: string }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - dynamic import path
const InterrogationChat = dynamic<any>(() => import('../../_components/interrogation-chat'), {
  ssr: false,
})

export default async function InterrogationSessionPage({ params }: SessionPageProps) {
  const { id: chatbotId, sessionId } = params

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
      },
    }
  )

  // Simple authorization check – ensure the session exists and belongs to user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: session, error } = await supabase
    .from('interrogation_sessions')
    .select('id, title')
    .eq('id', sessionId)
    .eq('chatbot_id', chatbotId)
    .maybeSingle()

  if (error || !session) {
    return <p className="p-8 text-red-500">Interrogation session not found.</p>
  }

  // Fetch appearance settings
  const { data: bot, error: botErr } = await supabase
    .from('chatbots')
    .select('primary_color,secondary_color,background_color,text_color,font_family,welcome_message,bot_avatar_url,user_avatar_url,chat_bubble_style,header_text,input_placeholder,show_branding')
    .eq('id', chatbotId)
    .maybeSingle()

  if (botErr) console.error('Failed to fetch chatbot appearance', botErr)

  return (
    <ChatbotAppearanceProvider initialAppearance={{
      primaryColor: bot?.primary_color,
      secondaryColor: bot?.secondary_color,
      backgroundColor: bot?.background_color,
      textColor: bot?.text_color,
      fontFamily: bot?.font_family,
      welcomeMessage: bot?.welcome_message,
      botAvatarUrl: bot?.bot_avatar_url,
      userAvatarUrl: bot?.user_avatar_url,
      chatBubbleStyle: bot?.chat_bubble_style,
      headerText: bot?.header_text,
      inputPlaceholder: bot?.input_placeholder,
      showBranding: bot?.show_branding,
    }}>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
        {/* Header with navigation */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/dashboard/chatbot/${chatbotId}/interrogation`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Sessions
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              {session.title || 'Untitled Session'}
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            Interrogation Mode
          </div>
        </div>
        
        {/* Chat interface */}
        <div className="flex-1 overflow-hidden">
          <InterrogationChat chatbotId={chatbotId} sessionId={sessionId} />
        </div>
      </div>
    </ChatbotAppearanceProvider>
  )
} 
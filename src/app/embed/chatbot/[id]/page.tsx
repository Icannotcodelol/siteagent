import { createClient } from '@/lib/supabase/server';
import ChatInterface from '@/app/dashboard/chatbot/[id]/_components/chat-interface';
import { notFound } from 'next/navigation';

// Props received from dynamic route segment
interface EmbedPageProps {
  params: {
    id: string; // Chatbot ID from the URL segment '[id]'
  };
}

// This page component renders the chat interface for embedding
export default async function EmbedChatbotPage({ params }: EmbedPageProps) {
  const chatbotId = params.id;

  // Basic check if ID is present
  if (!chatbotId) {
    // Render a simple error message suitable for iframe display
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#dc2626' }}>
            Error: Chatbot ID missing from URL.
        </div>
    );
  }

  const supabase = createClient();
  const { data: chatbot, error } = await supabase
    .from('chatbots')
    .select(`
      id, name, user_id, system_prompt,
      primary_color, secondary_color, background_color, text_color, font_family,
      welcome_message, bot_avatar_url, user_avatar_url, chat_bubble_style,
      header_text, input_placeholder, show_branding, hybrid_mode_enabled
    `)
    .eq('id', chatbotId)
    .maybeSingle();

  if (error || !chatbot) {
    console.error(`Embed page: Chatbot not found or error. ID: ${chatbotId}, Error: ${error?.message}`);
    notFound();
  }

  return (
    // Container ensures the chat interface fills the iframe space
    // Remove any default margins/paddings from potential parent layouts if needed
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, boxSizing: 'border-box' }}>
        <ChatInterface
          chatbotId={chatbotId}
          primaryColor={chatbot.primary_color}
          secondaryColor={chatbot.secondary_color}
          backgroundColor={chatbot.background_color}
          textColor={chatbot.text_color}
          fontFamily={chatbot.font_family}
          welcomeMessage={chatbot.welcome_message}
          botAvatarUrl={chatbot.bot_avatar_url}
          userAvatarUrl={chatbot.user_avatar_url}
          chatBubbleStyle={chatbot.chat_bubble_style}
          headerText={chatbot.header_text}
          inputPlaceholder={chatbot.input_placeholder}
          showBranding={chatbot.show_branding}
        />
    </div>
  );
}

// Optional: Configure viewport for embedded context if necessary
// export const viewport = { ... };

// Note: Consider creating a minimal root layout specifically for the `/embed` route group
// (`src/app/embed/layout.tsx`) to ensure no default margins/paddings interfere
// if your main root layout adds them.
// Example minimal layout:
// export default function EmbedLayout({ children }: { children: React.ReactNode }) {
//   return <>{children}</>;
// } 
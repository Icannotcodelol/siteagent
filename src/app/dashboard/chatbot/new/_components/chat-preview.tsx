'use client' // Keep as client component for potential future interactivity

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import CalendlyEmbed from '../../[id]/_components/calendly-embed';
import { useChatbotAppearance } from './chatbot-appearance-context';

// Define message type
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatPreviewProps {
  chatbotId: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  fontFamily?: string | null;
  welcomeMessage?: string | null;
  botAvatarUrl?: string | null;
  userAvatarUrl?: string | null;
  chatBubbleStyle?: string | null;
  headerText?: string | null;
  inputPlaceholder?: string | null;
  showBranding?: boolean | null;
}

export default function ChatPreview(props: ChatPreviewProps) {
  const { appearance } = useChatbotAppearance();

  const {
    chatbotId,
    primaryColor: pPrimary,
    secondaryColor: pSecondary,
    backgroundColor: pBackground,
    textColor: pText,
    fontFamily: pFont,
    welcomeMessage: pWelcome,
    botAvatarUrl: pBotAvatar,
    userAvatarUrl: pUserAvatar,
    chatBubbleStyle: pBubble,
    headerText: pHeader,
    inputPlaceholder: pPlaceholder,
    showBranding: pBranding,
  } = props;

  const primaryColor = appearance.primaryColor ?? pPrimary;
  const secondaryColor = appearance.secondaryColor ?? pSecondary;
  const backgroundColor = appearance.backgroundColor ?? pBackground;
  const textColor = appearance.textColor ?? pText;
  const fontFamily = appearance.fontFamily ?? pFont;
  const welcomeMessage = appearance.welcomeMessage ?? pWelcome;
  const botAvatarUrl = appearance.botAvatarUrl ?? pBotAvatar;
  const userAvatarUrl = appearance.userAvatarUrl ?? pUserAvatar;
  const chatBubbleStyle = appearance.chatBubbleStyle ?? pBubble;
  const headerText = appearance.headerText ?? pHeader;
  const inputPlaceholder = appearance.inputPlaceholder ?? pPlaceholder;
  const showBranding = appearance.showBranding ?? pBranding;

  const [messages, setMessages] = useState<Message[]>([
      { sender: 'bot', text: welcomeMessage || 'How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingIndicatorDots, setTypingIndicatorDots] = useState('.');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Generate a sessionId once on mount if none exists
  useEffect(() => {
    if (!sessionId) {
      try {
        setSessionId(crypto.randomUUID());
      } catch {
        // Fallback for environments that might not support crypto.randomUUID
        setSessionId(Math.random().toString(36).substring(2) + Date.now().toString(36));
      }
    }
  }, [sessionId]);

  // Scroll to bottom when messages change without affecting parent page
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Effect for animating typing indicator
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isLoading) {
      setTypingIndicatorDots('.'); // Reset to one dot when loading starts
      intervalId = setInterval(() => {
        setTypingIndicatorDots(prevDots => {
          if (prevDots === '...') return '.';
          if (prevDots === '..') return '...';
          if (prevDots === '.') return '..';
          return '.'; // Default case, though should not be reached
        });
      }, 500); // Adjust speed as needed
    } else {
      setTypingIndicatorDots('.'); // Reset when not loading
    }
    return () => clearInterval(intervalId); // Cleanup interval on unmount or when isLoading changes
  }, [isLoading]);

  const handleSendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Call the public API route
      const response = await fetch('/api/chat/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            query: userMessage,
            chatbotId: chatbotId,
            sessionId: sessionId,
            history: messages.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get response.' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result = await response.json();

      // Capture sessionId returned from server (public route returns it)
      if (result.sessionId && !sessionId) {
          setSessionId(result.sessionId);
      }

      // Add bot response to chat
      if (result.answer) {
          setMessages(prev => [...prev, { sender: 'bot', text: result.answer }]);
      } else {
          throw new Error("Received empty answer from bot.");
      }

    } catch (err: any) {
      console.error("Chat API error:", err);
      setError(err.message || "Failed to get response from the bot.");
      // Optional: Add error message to chat?
      // setMessages(prev => [...prev, { sender: 'bot', text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault(); // Prevent newline on Enter
          handleSendMessage();
      }
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden border border-gray-700 shadow"
      style={{
        background: backgroundColor || '#1a1a1a',
        color: textColor || '#fff',
        fontFamily: fontFamily || 'inherit',
      }}
    >
      {/* Header - Slightly darker */}
      <div className="p-3 border-b border-gray-700" style={{ background: secondaryColor || '#23232b' }}>
        <p className="text-sm font-medium text-white text-center">
          {headerText || 'Chatbot Preview'}
        </p>
      </div>
      {/* Message Area */}
      <div
        ref={messagesContainerRef}
        className="flex-grow p-4 space-y-3 overflow-y-auto"
        style={{ background: backgroundColor || '#1a1a1a' }}
      >
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar */}
            {msg.sender === 'bot' && botAvatarUrl && (
              <img src={botAvatarUrl} alt="Bot Avatar" className="w-7 h-7 rounded-full mr-2 self-end" />
            )}
            {msg.sender === 'user' && userAvatarUrl && (
              <img src={userAvatarUrl} alt="User Avatar" className="w-7 h-7 rounded-full ml-2 self-end" />
            )}
            {/* Message Bubble */}
            {(() => {
              if (msg.sender !== 'bot') {
                return (
                  <div
                    className={`text-sm py-2 px-3 max-w-[80%] whitespace-pre-wrap ${chatBubbleStyle === 'square' ? 'rounded-md' : 'rounded-lg'} bg-gray-700 text-white`}
                  >
                    {msg.text}
                  </div>
                );
              }

              // Try JSON parse first
              try {
                const parsed = JSON.parse(msg.text);
                if (parsed.type === 'calendly_embed' && typeof parsed.url === 'string') {
                  return (
                    <div className="max-w-[80%] p-2 rounded-lg bg-gray-800">
                      <CalendlyEmbed url={parsed.url} />
                    </div>
                  );
                }
              } catch {}

              // Fallback to plain link detection
              const linkMatch = msg.text.match(/https:\/\/calendly\.com\/\S+/);
              if (linkMatch) {
                return (
                  <div className="max-w-[80%] p-2 rounded-lg bg-gray-800">
                    <CalendlyEmbed url={linkMatch[0]} />
                  </div>
                );
              }

              // Default display
              return (
                <div className={`text-sm py-2 px-3 max-w-[80%] whitespace-pre-wrap ${chatBubbleStyle === 'square' ? 'rounded-md' : 'rounded-lg'}`} style={{ background: primaryColor || '#9333ea', color: textColor || '#fff' }}>
                  <ReactMarkdown
                    components={{
                      a: ({node, href, ...props}) => {
                        if (href && href.startsWith('mailto:')) {
                          return <a {...props} href={href} className="text-blue-400 hover:underline" />
                        }
                        return <a {...props} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" />
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              );
            })()}
          </div>
        ))}
        {/* Loading indicator */}
        {isLoading && (
             <div className="flex justify-start">
                <div className="bg-purple-600 text-white text-sm p-2 rounded-lg animate-pulse">
                   {typingIndicatorDots}
                 </div>
             </div>
        )}
         {/* Error display */}
         {error && (
             <div className="flex justify-start">
                <div className="bg-red-700 text-white text-sm p-2 rounded-lg max-w-[80%]">
                    Error: {error}
                 </div>
             </div>
         )}
        {/* Container-based scrolling handles auto-scroll; anchor not needed */}
      </div>
      {/* Input Area */}
      <div className="p-3 border-t border-gray-700" style={{ background: secondaryColor || '#23232b' }}>
        <div className="flex items-center border border-gray-700 rounded-md" style={{ background: backgroundColor || '#1a1a1a' }}>
          <input 
            type="text"
            placeholder={inputPlaceholder || 'Type your message...'}
            className="flex-grow bg-transparent px-3 py-2 text-white placeholder-gray-500 focus:outline-none text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            style={{ color: textColor || '#fff', fontFamily: fontFamily || 'inherit' }}
          />
          {/* Purple send button */}
          <button 
            className="p-2 text-purple-500 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
      {/* Branding */}
      {showBranding !== false && (
        <div className="text-xs text-gray-400 text-center py-2">Powered by SiteAgent</div>
      )}
    </div>
  );
} 
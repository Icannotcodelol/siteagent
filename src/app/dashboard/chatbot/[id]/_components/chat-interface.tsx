'use client'

import { useState, FormEvent, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
import CalendlyEmbed from './calendly-embed';

// Define the structure of a chat message
interface Message {
  id: string; // Or number, if preferred
  sender: 'user' | 'ai';
  text: string;
}

interface ChatInterfaceProps {
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

// Utility to convert URLs in plain text AND Markdown links to clickable <a> links
function renderTextWithLinks(text: string) {
  // Regex to find Markdown links like [text](url) OR plain URLs
  // It captures: 1: preceding text, 2: link text (for MD), 3: URL (for MD or plain)
  const combinedRegex = /([^]*?)(\[([^\]]+)\]\((https?:\/\/[^\)]+)\)|(https?:\/\/[^\s]+))/g;

  const elements: JSX.Element[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add any text before this match
    if (match[1]) {
      elements.push(<span key={`text-${lastIndex}`}>{match[1]}</span>);
    }

    const linkText = match[3]; // Text from [linkText](...)
    const url = match[4] || match[5]; // URL from (...URL...) or plain URL

    if (url) {
      elements.push(
        <a key={`link-${lastIndex}`} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
          {linkText || url} 
        </a>
      );
    }
    lastIndex = combinedRegex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return elements.length > 0 ? <>{elements}</> : <>{text}</>; // Fallback to raw text if no links found or error
}

export default function ChatInterface({ chatbotId, primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, welcomeMessage, botAvatarUrl, userAvatarUrl, chatBubbleStyle, headerText, inputPlaceholder, showBranding }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: crypto.randomUUID(), sender: 'ai', text: welcomeMessage || 'How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for scrolling
  const pathname = usePathname(); // Get the current path

  // Determine if we are in the embed context
  const isEmbed = pathname?.startsWith('/embed/chatbot/');
  const chatApiEndpoint = isEmbed ? '/api/chat/public' : '/api/chat';

  // Generate a sessionId on first mount if none exists (client-side only)
  useEffect(() => {
    if (!sessionId) {
      try {
        const newId = crypto.randomUUID();
        setSessionId(newId);
      } catch {
        // Fallback for environments without crypto.randomUUID
        setSessionId(Math.random().toString(36).substring(2) + Date.now().toString(36));
      }
    }
  }, []); // empty deps = run once on mount

  // Function to scroll to the bottom of the message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessageText = inputValue.trim();
    if (!userMessageText || isLoading) return;

    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: userMessageText,
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    console.log(`Sending message to ${isEmbed ? 'public' : 'authenticated'} endpoint: ${chatApiEndpoint}`);

    // --- Make the actual API Call ---
    try {
      const response = await fetch(chatApiEndpoint, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              query: userMessageText,
              chatbotId: chatbotId,
              history: messages.slice(1),
              sessionId: sessionId,
          }),
      });

      if (!response.ok) {
          // Try to parse error message from backend
          let errorMsg = `API Error: ${response.status} ${response.statusText}`;
          try {
              const errorData = await response.json();
              errorMsg = errorData.error || errorMsg;
          } catch (parseError) {
              // Ignore if response body is not JSON or empty
          }
          throw new Error(errorMsg);
      }

      const aiData = await response.json();
      const aiMessageText = aiData.answer; // Assuming the backend returns { answer: "..." }
      const returnedSessionId = aiData.sessionId;

      if (returnedSessionId && !sessionId) {
        setSessionId(returnedSessionId);
      }

      if (!aiMessageText) {
          throw new Error("Received empty answer from backend.");
      }

      const newAiMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: aiMessageText,
      };
      setMessages((prevMessages) => [...prevMessages, newAiMessage]);

    } catch (err: any) {
      console.error("Chat API error:", err);
      setError(err.message || "Failed to get response from the chatbot.");
      const errorAiMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: `Sorry, I encountered an error: ${err.message || 'Unknown error'}. Please try again.`,
      };
      setMessages((prevMessages) => [...prevMessages, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="rounded shadow-md flex flex-col h-full"
      style={{
        background: backgroundColor || '#fff',
        color: textColor || '#222',
        fontFamily: fontFamily || 'inherit',
      }}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200" style={{ background: secondaryColor || '#f3f4f6' }}>
        <p className="text-sm font-medium text-center" style={{ color: textColor || '#222' }}>
          {headerText || 'Chatbot'}
        </p>
      </div>
      {/* Message Display Area */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto" style={{ background: backgroundColor || '#fff' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar */}
            {message.sender === 'ai' && botAvatarUrl && (
              <img src={botAvatarUrl} alt="Bot Avatar" className="w-7 h-7 rounded-full mr-2 self-end" />
            )}
            {message.sender === 'user' && userAvatarUrl && (
              <img src={userAvatarUrl} alt="User Avatar" className="w-7 h-7 rounded-full ml-2 self-end" />
            )}
            {/* Message Bubble */}
            {(() => {
              if (message.sender !== 'ai') {
                return (
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 ${chatBubbleStyle === 'square' ? 'rounded-md' : 'rounded-lg'} bg-gray-700 text-white whitespace-pre-wrap`}
                  >
                    <p className="text-sm">{renderTextWithLinks(message.text)}</p>
                  </div>
                );
              }

              // Try to parse JSON structure for embed instructions
              try {
                const parsed = JSON.parse(message.text);
                if (parsed.type === 'calendly_embed' && typeof parsed.url === 'string') {
                  return (
                    <div className="max-w-xs lg:max-w-md p-2 rounded-lg bg-gray-200 text-gray-800">
                      <CalendlyEmbed url={parsed.url} />
                    </div>
                  );
                }
              } catch {
                /* not JSON, ignore */ }

              // Fallback: check for plain Calendly link
              const plainMatch = message.text.match(/https:\/\/calendly\.com\/\S+/);
              if (plainMatch) {
                return (
                  <div className="max-w-xs lg:max-w-md p-2 rounded-lg bg-gray-200 text-gray-800">
                    <CalendlyEmbed url={plainMatch[0]} />
                  </div>
                );
              }

              // Default render as text
              return (
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 ${chatBubbleStyle === 'square' ? 'rounded-md' : 'rounded-lg'}`}
                  style={{ background: primaryColor || '#9333ea', color: textColor || '#fff' }}
                >
                  <p className="text-sm whitespace-pre-wrap">{renderTextWithLinks(message.text)}</p>
                </div>
              );
            })()}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200" style={{ background: secondaryColor || '#f3f4f6' }}>
        <div className="flex items-center border border-gray-300 rounded-md" style={{ background: backgroundColor || '#fff' }}>
          <input
            type="text"
            placeholder={inputPlaceholder || 'Type your message...'}
            className="flex-grow bg-transparent px-3 py-2 placeholder-gray-500 focus:outline-none text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            style={{ color: textColor || '#222', fontFamily: fontFamily || 'inherit' }}
          />
          <button
            type="submit"
            className="p-2 text-purple-500 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !inputValue.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
      {/* Branding */}
      {showBranding !== false && (
        <div className="text-xs text-gray-400 text-center py-2">Powered by Redario</div>
      )}
    </div>
  );
} 
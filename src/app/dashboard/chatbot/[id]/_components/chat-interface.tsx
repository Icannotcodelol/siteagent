'use client'

import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
import ReactMarkdown from 'react-markdown';
import CalendlyEmbed from './calendly-embed';
import ProactiveMessageBubble from '@/app/embed/chatbot/[id]/_components/proactive-message-bubble'; // Import ProactiveMessageBubble

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
function renderTextWithLinks(text: string, backgroundColor?: string | null, isAIMessage?: boolean) {
  // Regex to find Markdown links like [text](url) OR plain URLs (http, https, mailto)
  // It captures: 1: preceding text, 2: link text (for MD), 3: URL (for MD or plain)
  const combinedRegex = /([^]*?)(\[([^\]]+)\]\(((?:https?|mailto):[^\)]+)\)|((?:https?|mailto):[^\s]+))/g;

  const elements: JSX.Element[] = [];
  let lastIndex = 0;
  let match;

  // Determine link styling based on context
  const getLinkClasses = () => {
    if (isAIMessage) {
      // For AI messages (bot bubbles), use high contrast white/light colors
      return "text-white underline decoration-2 hover:text-blue-100 font-medium break-all";
    } else {
      // For user messages, use standard blue
      return "text-blue-600 underline decoration-2 hover:text-blue-800 font-medium break-all";
    }
  };

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add any text before this match
    if (match[1]) {
      elements.push(<span key={`text-${lastIndex}`}>{match[1]}</span>);
    }

    const linkText = match[3]; // Text from [linkText](...)
    const url = match[4] || match[5]; // URL from (...URL...) or plain URL

    if (url) {
      if (url.startsWith('mailto:')) {
        elements.push(
          <a key={`link-${lastIndex}`} href={url} className={getLinkClasses()}>
            {linkText || url.substring(7)} {/* Show email address without mailto: prefix if no explicit text */}
          </a>
        );
      } else {
        elements.push(
          <a key={`link-${lastIndex}`} href={url} target="_blank" rel="noopener noreferrer" className={getLinkClasses()}>
            {linkText || url}
          </a>
        );
      }
    }
    lastIndex = combinedRegex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return elements.length > 0 ? <>{elements}</> : <>{text}</>; // Fallback to raw text if no links found or error
}

// Utility function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  if (!color) return true; // Default to light if no color
  
  // Remove # if present and handle 3-digit hex
  let hex = color.replace('#', '');
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Ensure we have a valid 6-digit hex
  if (hex.length !== 6) {
    return true; // Default to light for invalid colors
  }
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using standard formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}

// Utility function to get appropriate input text color
function getInputTextColor(backgroundColor?: string | null, textColor?: string | null): string {
  console.log('[Input Color Debug]', { backgroundColor, textColor });
  
  // If no background color, use default dark text for readability
  if (!backgroundColor) {
    console.log('[Input Color Debug] No background color, using #222');
    return '#222';
  }
  
  const isLight = isLightColor(backgroundColor);
  console.log('[Input Color Debug] Background color analysis:', { 
    backgroundColor, 
    isLight, 
    willUse: isLight ? '#222' : (textColor || '#fff')
  });
  
  // If background is light (like white #ffffff), always ensure text is dark for visibility
  if (isLight) {
    return '#222'; // Always use dark text on light backgrounds
  }
  
  // If background is dark, use light text or provided textColor
  return textColor || '#fff';
}

export default function ChatInterface({ chatbotId, primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, welcomeMessage, botAvatarUrl, userAvatarUrl, chatBubbleStyle, headerText, inputPlaceholder, showBranding }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: crypto.randomUUID(), sender: 'ai', text: welcomeMessage || 'How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [typingIndicatorDots, setTypingIndicatorDots] = useState('.');

  // Proactive Message State
  const [proactiveMessageData, setProactiveMessageData] = useState<{ content: string; delay: number; color?: string | null } | null>(null);
  const [showProactiveBubble, setShowProactiveBubble] = useState(false);
  const [proactiveBubbleInteracted, setProactiveBubbleInteracted] = useState(false);
  const proactiveMessageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to the scrollable messages container (instead of relying on an invisible anchor)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null); // Ref for focusing input
  const pathname = usePathname(); // Get the current path

  // Determine if we are in the embed context
  const isEmbed = pathname?.startsWith('/embed/chatbot/');
  const chatApiEndpoint = isEmbed ? '/api/chat/public' : '/api/chat';

  // Determine the base origin for postMessage
  const [baseOrigin, setBaseOrigin] = useState('');
  useEffect(() => {
    // Ensure this runs client-side only
    setBaseOrigin(window.location.origin);
    
    // Listen for focus messages from parent window (widget)
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'siteagent-focus-input') {
        // Focus the input when requested by parent window
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // Runs once on mount to set baseOrigin

  // useEffect to post message when botAvatarUrl changes or is initially available
  useEffect(() => {
    if (botAvatarUrl && window.parent !== window) {
      window.parent.postMessage({
        type: 'siteagent-avatar-update',
        avatarUrl: botAvatarUrl
      }, baseOrigin || '*'); // Use baseOrigin if available, otherwise wildcard for safety in dev
    }
  }, [botAvatarUrl, baseOrigin]); // Trigger also when baseOrigin is set

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

  // Fetch proactive message for embed - DISABLED since widget handles proactive messages
  useEffect(() => {
    // Proactive messages are now handled by the widget on the parent page, not inside the iframe
    console.log('[ProactiveMsg] Iframe-based proactive messages disabled - widget handles this');
  }, [isEmbed, chatbotId, proactiveBubbleInteracted]);

  // Schedule proactive message display - DISABLED since widget handles this
  useEffect(() => {
    console.log('[ProactiveMsg Scheduler] Disabled - widget handles proactive message scheduling');
    // No scheduling needed since widget handles this on parent page
  }, [isEmbed, proactiveMessageData, proactiveBubbleInteracted, isLoading]);

  // Function to scroll to the bottom of the message list WITHOUT affecting the parent page.
  // Using scrollTo on the dedicated container avoids the browser trying to bring the iframe
  // itself into view, which was causing the host page to jump.
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
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
          return '.'; // Default case
        });
      }, 500); // Adjust speed as needed
    } else {
      setTypingIndicatorDots('.'); // Reset when not loading
    }
    return () => clearInterval(intervalId); // Cleanup interval
  }, [isLoading]);

  const handleUserInteraction = useCallback(() => {
    console.log('[ProactiveMsg Interaction] handleUserInteraction called. Current proactiveBubbleInteracted:', proactiveBubbleInteracted);
    if (!proactiveBubbleInteracted) {
      setProactiveBubbleInteracted(true);
      setShowProactiveBubble(false); // Ensure bubble is hidden on interaction
      if (proactiveMessageTimerRef.current) {
        clearTimeout(proactiveMessageTimerRef.current);
        proactiveMessageTimerRef.current = null;
      }
    }
    // Inform parent window (widget) about user interaction in embed mode
    if (isEmbed && baseOrigin) {
      window.parent.postMessage({ type: 'siteagent-user-interaction' }, baseOrigin);
      console.log('[ProactiveMsg Interaction] Sent siteagent-user-interaction to parent');
    }
  }, [proactiveBubbleInteracted, isEmbed, baseOrigin]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleUserInteraction(); // User sending a message is an interaction
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
              history: messages,
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
      // Auto-focus the input field after sending a message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleCloseProactiveBubble = () => {
    setShowProactiveBubble(false);
    setProactiveBubbleInteracted(true); // User closed it
    if (proactiveMessageTimerRef.current) {
      clearTimeout(proactiveMessageTimerRef.current);
      proactiveMessageTimerRef.current = null;
    }
  };

  const handleClickProactiveBubble = () => {
    setShowProactiveBubble(false);
    setProactiveBubbleInteracted(true); // User clicked it
    if (proactiveMessageTimerRef.current) {
      clearTimeout(proactiveMessageTimerRef.current);
      proactiveMessageTimerRef.current = null;
    }
    // Optionally, focus the input field
    inputRef.current?.focus();
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
      <div
        ref={messagesContainerRef}
        className="flex-grow p-4 space-y-4 overflow-y-auto"
        style={{ background: backgroundColor || '#fff' }}
      >
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
                    className={`max-w-full md:max-w-md px-4 py-2 ${chatBubbleStyle === 'square' ? 'rounded-md' : 'rounded-lg'} bg-gray-700 text-white whitespace-pre-wrap break-words`}
                  >
                    <p className="text-sm">{renderTextWithLinks(message.text, backgroundColor, false)}</p>
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
                  className={`max-w-full md:max-w-md px-4 py-2 ${chatBubbleStyle === 'square' ? 'rounded-md' : 'rounded-lg'} whitespace-pre-wrap break-words`}
                  style={{ background: primaryColor || '#9333ea', color: textColor || '#fff' }}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">
                    <ReactMarkdown
                      components={{
                        a: ({node, href, ...props}) => {
                          if (href && href.startsWith('mailto:')) {
                            return <a {...props} href={href} className="text-white underline decoration-2 hover:text-blue-100 font-medium break-all" />
                          }
                          return <a {...props} href={href} target="_blank" rel="noopener noreferrer" className="text-white underline decoration-2 hover:text-blue-100 font-medium break-all" />
                        }
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })()}
          </div>
        ))}
        {/* Loading/Typing indicator */}
        {isLoading && (
          <div className="flex justify-start items-end space-x-2 py-2"> {/* Added py-2 for some vertical spacing like other messages */}
            {botAvatarUrl && (
              <img src={botAvatarUrl} alt="Bot typing" className="w-7 h-7 rounded-full" />
            )}
            <div
              className={`px-4 py-2 animate-pulse ${chatBubbleStyle === 'square' ? 'rounded-md' : 'rounded-lg'} max-w-xs`} // Reduced max-width as "..." is short
              style={{
                background: primaryColor || '#9333ea',
                color: textColor || '#fff',
              }}
            >
              {typingIndicatorDots}
            </div>
          </div>
        )}
      </div>
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200" style={{ background: secondaryColor || '#f3f4f6' }}>
        <div className="flex items-center border border-gray-300 rounded-md" style={{ background: backgroundColor || '#fff' }}>
          <input
            ref={inputRef} // Assign ref to input
            type="text"
            placeholder={inputPlaceholder || 'Type your message...'}
            className="flex-grow bg-transparent px-3 py-2 placeholder-gray-500 focus:outline-none text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            style={{ 
              color: getInputTextColor(backgroundColor, textColor), 
              fontFamily: fontFamily || 'inherit' 
            }}
            onFocus={handleUserInteraction} // Focusing input is also an interaction
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && inputValue.trim()) {
                  handleSubmit(e as any);
                }
              }
            }}
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
        <div className="text-xs text-gray-400 text-center py-2">
          <a href="https://SiteAgent.eu" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Powered by SiteAgent
          </a>
        </div>
      )}

      {/* Proactive Message Bubble - DISABLED since widget handles this on parent page */}
      {/* 
      {isEmbed && proactiveMessageData && (
        <ProactiveMessageBubble
          messageContent={proactiveMessageData.content}
          onClose={handleCloseProactiveBubble}
          onClick={handleClickProactiveBubble}
          isVisible={showProactiveBubble}
          bubbleColor={proactiveMessageData.color}
        />
      )}
      */}
    </div>
  );
} 
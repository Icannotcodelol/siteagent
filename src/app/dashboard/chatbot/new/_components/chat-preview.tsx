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
  /* Interrogation mode */
  isInterrogation?: boolean;
  /* Session persistence - if provided, will load existing messages */
  sessionId?: string;
  /* Optional callback to persist the user+assistant pair. Should return the assistantMessageId so we can later flag it */
  onPersistMessages?: (userMessage: string, assistantMessage: string) => Promise<{ assistantMessageId?: string } | void>;
  /* Optional callback for flag submissions */
  onFlag?: (assistantMessageId: string, errorCategory: string, description: string, correctAnswer: string) => Promise<void>;
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
    /* Interrogation mode */
    isInterrogation = false,
    /* Session persistence - if provided, will load existing messages */
    sessionId,
    /* Optional callback to persist the user+assistant pair. Should return the assistantMessageId so we can later flag it */
    onPersistMessages,
    /* Optional callback for flag submissions */
    onFlag,
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
      { sender: 'bot', text: welcomeMessage || 'How can I help you today?', id: crypto.randomUUID?.() ?? Math.random().toString(36) } as any
  ] as (Message & { id?: string; flagged?: boolean })[]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingIndicatorDots, setTypingIndicatorDots] = useState('.');
  const [internalSessionId, setInternalSessionId] = useState<string | null>(sessionId || null);

  // For interrogation flag modal
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);
  const flagDescRef = useRef<HTMLTextAreaElement | null>(null);
  const flagTypeRef = useRef<HTMLSelectElement | null>(null);
  const correctAnswerRef = useRef<HTMLTextAreaElement | null>(null);

  // Generate a sessionId once on mount if none exists and none provided via props
  useEffect(() => {
    if (!internalSessionId) {
      try {
        setInternalSessionId(crypto.randomUUID());
      } catch {
        // Fallback for environments that might not support crypto.randomUUID
        setInternalSessionId(Math.random().toString(36).substring(2) + Date.now().toString(36));
      }
    }
  }, [internalSessionId]);

  // Load existing messages when sessionId is provided (for interrogation mode)
  useEffect(() => {
    if (sessionId && isInterrogation) {
      const loadExistingMessages = async () => {
        try {
          const response = await fetch(`/api/chatbots/${chatbotId}/interrogation/sessions/${sessionId}/messages`);
          if (!response.ok) {
            console.error('Failed to load existing messages:', await response.text());
            return;
          }
          
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            // Convert interrogation messages to chat format
            const loadedMessages = data.messages.map((msg: any) => ({
              id: msg.id,
              sender: msg.role === 'user' ? 'user' : 'bot',
              text: msg.content,
              flagged: msg.flagged || false
            }));
            
            // Replace default welcome message with loaded history
            setMessages(loadedMessages);
          }
        } catch (error) {
          console.error('Error loading existing messages:', error);
        }
      };
      
      loadExistingMessages();
    }
  }, [sessionId, chatbotId, isInterrogation]);

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
    const userBubbleId = crypto.randomUUID?.() ?? Math.random().toString(36);
    setMessages(prev => [...prev, { id: userBubbleId, sender: 'user', text: userMessage } as any]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Use authenticated endpoint for interrogation mode, public for regular preview
      const chatEndpoint = isInterrogation ? '/api/chat' : '/api/chat/public';
      const effectiveSessionId = sessionId || internalSessionId;
      
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            query: userMessage,
            chatbotId: chatbotId,
            sessionId: effectiveSessionId,
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
      if (result.sessionId && !internalSessionId) {
          setInternalSessionId(result.sessionId);
      }

      // Add bot response to chat
      if (result.answer) {
          setMessages(prev => [...prev, { sender: 'bot', text: result.answer }]);
      } else {
          throw new Error("Received empty answer from bot.");
      }

      // Persist messages in interrogation mode
      if (isInterrogation && onPersistMessages) {
        try {
          const res = await onPersistMessages(userMessage, result.answer);
          if (res && res.assistantMessageId) {
            // attach id to last assistant message
            setMessages(prev => prev.map((m,i)=> i===prev.length-1 && m.sender==='bot'? { ...m, id: res.assistantMessageId}: m));
          }
        } catch(e){ console.error('Persist failed',e); }
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
      className="flex flex-col h-full rounded-2xl overflow-hidden glass shadow-2xl"
      style={{
        background: backgroundColor || 'rgba(17, 17, 17, 0.8)',
        color: textColor || '#fff',
        fontFamily: fontFamily || 'inherit',
      }}
    >
      {/* Header - Modern gradient */}
      <div 
        className="p-4 backdrop-blur-md border-b border-gray-700/50" 
        style={{ 
          background: secondaryColor ? secondaryColor : 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))'
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">
            {headerText || '💬 Chat Preview'}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Live Preview</span>
          </div>
        </div>
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
                const bubbleClass = chatBubbleStyle === 'square' ? 'rounded-md' : 
                                   chatBubbleStyle === 'pill' ? 'rounded-full' :
                                   chatBubbleStyle === 'minimal' ? 'rounded-sm' : 'rounded-lg'
                return (
                  <div
                    className={`relative text-sm py-2 px-3 max-w-[80%] whitespace-pre-wrap ${bubbleClass}`}
                    style={{ background: primaryColor || '#9333ea', color: textColor || '#fff' }}
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

              // Default display for bot messages
              const bubbleClass = chatBubbleStyle === 'square' ? 'rounded-md' : 
                                 chatBubbleStyle === 'pill' ? 'rounded-full' :
                                 chatBubbleStyle === 'minimal' ? 'rounded-sm' : 'rounded-lg'
              return (
                <div className={`relative text-sm py-2 px-3 max-w-[80%] whitespace-pre-wrap ${bubbleClass}`} style={{ background: primaryColor || '#9333ea', color: textColor || '#fff' }}>
                  <ReactMarkdown
                    components={{
                      a: ({node, href, ...props}) => {
                        if (href && href.startsWith('mailto:')) {
                          return <a {...props} href={href} className="text-white underline decoration-2 hover:text-blue-100 font-medium" />
                        }
                        return <a {...props} href={href} target="_blank" rel="noopener noreferrer" className="text-white underline decoration-2 hover:text-blue-100 font-medium" />
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                  {/* Flag link - only show on bot messages */}
                  {isInterrogation && (
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => setFlagTargetId((msg as any).id ?? '')}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          (msg as any).flagged 
                            ? 'bg-red-100 text-red-700 cursor-not-allowed' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        }`}
                        disabled={(msg as any).flagged}
                      >
                        {(msg as any).flagged ? (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Flagged
                          </span>
                        ) : 'Flag as incorrect'}
                      </button>
                      {(msg as any).flagged && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Correction submitted
                        </span>
                      )}
                    </div>
                  )}
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
      {/* Flag modal */}
      {isInterrogation && flagTargetId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl text-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Flag Incorrect Response</h2>
              <button 
                onClick={() => setFlagTargetId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 <strong>Information issues</strong> will be added to the knowledge base. <strong>Behavior issues</strong> will improve the system prompt.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of error is this? <span className="text-red-500">*</span>
                </label>
                <select 
                  ref={flagTypeRef} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <optgroup label="📚 Information/Data Issues (will add to knowledge base)">
                    <option value="factual">Factual error - Wrong information provided</option>
                    <option value="incomplete">Incomplete answer - Missing important details</option>
                    <option value="context">Context misunderstanding - Didn't understand the question</option>
                    <option value="relevance">Irrelevant answer - Answer doesn't address the question</option>
                  </optgroup>
                  <optgroup label="🎭 Behavior/Tone Issues (will update system prompt)">
                    <option value="tone">Wrong tone - Inappropriate style or approach</option>
                    <option value="personality">Wrong personality - Not matching desired character</option>
                    <option value="format">Wrong format - Response structure or style issues</option>
                    <option value="instructions">Not following instructions - Ignoring specific rules</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the problem (optional)
                </label>
                <textarea 
                  ref={flagDescRef} 
                  rows={3} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                  placeholder="What specifically was wrong with the response?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What should the correct answer be? <span className="text-red-500">*</span>
                </label>
                <textarea 
                  ref={correctAnswerRef} 
                  rows={4} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Provide the accurate response the chatbot should have given..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setFlagTargetId(null)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!onFlag) { setFlagTargetId(null); return; }
                  
                  const cat = flagTypeRef.current?.value || 'factual';
                  const desc = flagDescRef.current?.value || '';
                  const corr = correctAnswerRef.current?.value?.trim() || '';
                  
                  if (!corr) {
                    alert('Please provide a correct answer before submitting.');
                    return;
                  }
                  
                  try {
                    await onFlag(flagTargetId!, cat, desc, corr);
                    // mark flagged
                    setMessages(prev => prev.map(m => (m as any).id===flagTargetId ? { ...m, flagged:true }: m));
                    setFlagTargetId(null);
                    
                    // Show success feedback based on correction type
                    const behaviorIssues = ['tone', 'personality', 'format', 'instructions'];
                    const isDataIssue = ['factual', 'incomplete', 'context', 'relevance'].includes(cat);
                    const isBehaviorIssue = behaviorIssues.includes(cat);
                    
                    if (isBehaviorIssue) {
                      alert('✅ Behavior correction applied! The system prompt has been updated to improve future responses.');
                    } else if (isDataIssue) {
                      alert('✅ Information correction submitted! This has been added to the knowledge base.');
                    } else {
                      alert('✅ Response flagged successfully! This correction will help improve future responses.');
                    }
                  } catch(e){ 
                    console.error('Flag error',e);
                    alert('❌ Failed to submit flag. Please try again.');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Branding */}
      {showBranding !== false && !isInterrogation && (
        <div className="text-xs text-gray-400 text-center py-2">Powered by SiteAgent</div>
      )}
    </div>
  );
} 
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/_components/ui/button';
import { 
  Upload, 
  Globe, 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Minimize2,
  X,
  Bot,
  User,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface PreviewSession {
  sessionToken: string;
  status: 'processing' | 'completed' | 'failed';
  suggestedQuestions: string[];
  messageCount: number;
  maxMessages: number;
  remainingMessages: number;
  errorMessage?: string;
}

type ContentType = 'document' | 'website' | 'text';

export default function LivePreview() {
  const [activeTab, setActiveTab] = useState<ContentType>('document');
  const [session, setSession] = useState<PreviewSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollContainer = messagesEndRef.current.closest('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Poll for status updates when processing
  useEffect(() => {
    if (!session || session.status !== 'processing') return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/preview/status?sessionToken=${session.sessionToken}`);
        if (response.ok) {
          const data = await response.json();
          setSession(prev => prev ? { ...prev, ...data } : null);
          
          if (data.status === 'completed') {
            // Add welcome message when ready
            const welcomeMessage: Message = {
              id: Date.now().toString(),
              content: "Hello! I'm ready to help you with questions about your uploaded content. What would you like to know?",
              isUser: false,
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
          } else if (data.status === 'failed') {
            // Show error message if processing failed
            setError(data.error_message || 'Failed to process content. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [session]);

  const resetPreview = () => {
    setSession(null);
    setMessages([]);
    setInputMessage('');
    setError(null);
    setUploadProgress(0);
    setWebsiteUrl('');
    setTextContent('');
    setIsDragOver(false);
    setIsLoading(false);
    setIsSending(false);
    setShowDemo(false);
  };

  // Clear error when switching tabs
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF and TXT files are supported');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    setShowDemo(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/preview/upload-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSession({
        sessionToken: data.sessionToken,
        status: 'processing',
        suggestedQuestions: [],
        messageCount: 0,
        maxMessages: 10,
        remainingMessages: 10
      });

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowDemo(true);

    try {
      const response = await fetch('/api/preview/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Website scraping failed');
      }

      setSession({
        sessionToken: data.sessionToken,
        status: 'processing',
        suggestedQuestions: [],
        messageCount: 0,
        maxMessages: 10,
        remainingMessages: 10
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Website scraping failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowDemo(true);

    try {
      const response = await fetch('/api/preview/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Text processing failed');
      }

      setSession({
        sessionToken: data.sessionToken,
        status: 'processing',
        suggestedQuestions: [],
        messageCount: 0,
        maxMessages: 10,
        remainingMessages: 10
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Text processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || session.remainingMessages <= 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/preview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: session.sessionToken,
          message: content.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSession(prev => prev ? {
        ...prev,
        messageCount: prev.messageCount + 1,
        remainingMessages: prev.remainingMessages - 1
      } : null);

    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Render the demo setup area
  const renderDemoSetup = () => {
    if (showDemo) return null;

    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Live Interactive Demo</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            See Your Chatbot in Action
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload a document, scrape a website, or paste text to instantly create a chatbot that looks and feels exactly like what your customers will experience.
          </p>
        </div>

        {/* Content Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 p-1 rounded-lg border border-gray-700">
            {[
              { type: 'document' as ContentType, icon: FileText, label: 'Upload Document' },
              { type: 'website' as ContentType, icon: Globe, label: 'Scrape Website' },
              { type: 'text' as ContentType, icon: MessageCircle, label: 'Paste Text' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === type
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Input Area */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
          {activeTab === 'document' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Upload Your Document
              </h3>
              <p className="text-gray-400 mb-4">
                Drag and drop a PDF or TXT file, or click to browse
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-3">
                Supports PDF and TXT files up to 5MB
              </p>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={handleWebsiteSubmit}
                    disabled={!websiteUrl.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Scrape
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                We'll extract the content from the website to train your chatbot
              </p>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text content here..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <Button
                onClick={handleTextSubmit}
                disabled={!textContent.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Chatbot
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-200 font-medium mb-1">Error</h4>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the embedded chatbot widget
  const renderChatbotWidget = () => {
    if (!showDemo) return null;

    return (
      <div className="w-full max-w-6xl mx-auto">
        {/* Mock Website Context */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-4">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Demo Chatbot Created!</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              This is how your chatbot appears to visitors
            </h3>
            <p className="text-gray-400">
              The widget below shows exactly what your customers will see and interact with on your website
            </p>
          </div>

          {/* Mock website content */}
          <div className="bg-white rounded-lg p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Your Business Website</h4>
                  <p className="text-sm text-gray-600">Powered by SiteAgent</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-gray-800">
                <div>
                  <h5 className="font-semibold mb-2">About Our Service</h5>
                  <p className="text-sm leading-relaxed">
                    Welcome to our support center. Our AI assistant can help you find answers instantly using the content you just uploaded.
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Quick Links</h5>
                  <div className="space-y-1 text-sm">
                    <a href="/signup" className="block text-blue-600 hover:text-blue-800 transition-colors">• Start Free Trial</a>
                    <a href="/#features" className="block text-blue-600 hover:text-blue-800 transition-colors">• See Features</a>
                    <a href="/#pricing" className="block text-blue-600 hover:text-blue-800 transition-colors">• View Pricing</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Widget */}
        <div className="fixed bottom-6 right-6 z-50">
          {isMinimized ? (
            // Minimized widget launcher
            <button
              onClick={() => setIsMinimized(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 group border-2 border-blue-500"
            >
              <MessageCircle className="h-6 w-6" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </button>
          ) : (
            // Expanded widget
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col overflow-hidden">
              {/* Widget Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">AI Assistant</h4>
                      <div className="flex items-center gap-1 text-xs text-blue-100">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Online
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="p-1 hover:bg-white/20 rounded-md transition-colors"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={resetPreview}
                      className="p-1 hover:bg-white/20 rounded-md transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {session?.status === 'processing' && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Training your AI assistant...</p>
                  </div>
                )}

                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          message.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-left">{message.content}</p>
                        <div className={`text-xs mt-1 ${
                          message.isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {session?.status === 'completed' && session.suggestedQuestions.length > 0 && messages.length <= 1 && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                  <div className="space-y-1">
                    {session.suggestedQuestions.slice(0, 2).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="w-full text-left p-2 bg-white hover:bg-gray-100 rounded-lg text-xs text-gray-700 border border-gray-200 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              {session?.status === 'completed' && session.remainingMessages > 0 && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSending}
                    />
                    <button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isSending}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{session.remainingMessages} messages remaining in demo</span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Secure
                    </span>
                  </div>
                </div>
              )}

              {/* Upgrade Prompt */}
              {session?.remainingMessages === 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
                  <Sparkles className="h-5 w-5 mx-auto mb-2" />
                  <p className="font-medium text-sm mb-1">Demo completed!</p>
                  <p className="text-xs text-blue-100 mb-3">
                    Create unlimited chatbots and embed them on your website
                  </p>
                  <Button
                    onClick={() => window.location.href = '/signup'}
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-gray-100 text-xs"
                  >
                    Start Free Trial
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo Controls */}
        <div className="text-center mt-8">
          <Button
            onClick={resetPreview}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Try Another Demo
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderDemoSetup()}
      {renderChatbotWidget()}
    </div>
  );
} 
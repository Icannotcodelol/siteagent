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
    if (!session || session.status !== 'processing') {
      console.log('Polling stopped - session status:', session?.status);
      return;
    }

    console.log('Starting polling for session:', session.sessionToken);

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/preview/status?sessionToken=${session.sessionToken}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Polling status update:', data); // Debug log
          
          // Force state update with new data - ensure we're updating all relevant fields
          setSession(prev => {
            if (!prev) return null;
            
            const updatedSession = {
              ...prev,
              status: data.status,
              suggestedQuestions: data.suggestedQuestions || [],
              messageCount: data.messageCount || 0,
              maxMessages: data.maxMessages || 10,
              remainingMessages: data.remainingMessages || 10,
              errorMessage: data.errorMessage
            };
            
            console.log('Previous session state:', prev);
            console.log('Updated session state:', updatedSession);
            return updatedSession;
          });
          
          // Handle status changes
          if (data.status === 'completed') {
            console.log('Status completed, adding welcome message'); // Debug log
            // Add welcome message when ready
            setTimeout(() => {
              const welcomeMessage: Message = {
                id: Date.now().toString(),
                content: "Hello! I'm ready to help you with questions about your uploaded content. What would you like to know?",
                isUser: false,
                timestamp: new Date()
              };
              setMessages([welcomeMessage]);
            }, 100); // Small delay to ensure state is updated
          } else if (data.status === 'failed') {
            console.log('Status failed:', data.errorMessage); // Debug log
            // Show error message if processing failed
            setError(data.errorMessage || 'Failed to process content. Please try again.');
          }
        } else {
          console.error('Status polling failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    // Poll immediately, then every 2 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    
    return () => {
      console.log('Cleaning up polling interval');
      clearInterval(interval);
    };
  }, [session?.sessionToken, session?.status]); // Add sessionToken to dependencies

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
    const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/csv'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, TXT, and CSV files are supported');
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
      <div className="w-full max-w-4xl mx-auto transition-all duration-500 ease-in-out">
        {/* Header */}
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Choose Your Content Source
          </h3>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Start by uploading a document, entering a website URL, or pasting text content. 
            Watch as we create an intelligent chatbot in seconds.
          </p>
        </div>

        {/* Content Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/60 backdrop-blur-sm p-1.5 rounded-xl border border-gray-700/50 shadow-xl">
            {[
              { type: 'document' as ContentType, icon: FileText, label: 'Upload Document' },
              { type: 'website' as ContentType, icon: Globe, label: 'Scrape Website' },
              { type: 'text' as ContentType, icon: MessageCircle, label: 'Paste Text' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === type
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Input Area */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {activeTab === 'document' && (
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-blue-400 bg-blue-500/10 scale-[1.02]'
                  : 'border-gray-600/60 hover:border-gray-500/80 hover:bg-gray-700/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  Upload Your Document
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Drag and drop a PDF, TXT, or CSV file, or click to browse. 
                  We'll extract the content and create your chatbot instantly.
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/20 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>
                                  <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />
                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    PDF, TXT & CSV
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Max 5MB
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Instant setup
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Globe className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Scrape Website Content
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Enter any website URL and we'll extract the content to train your chatbot
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Website URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <Button
                    onClick={handleWebsiteSubmit}
                    disabled={!websiteUrl.trim() || isLoading}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 px-8 shadow-lg hover:shadow-blue-600/20"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Globe className="h-5 w-5 mr-2" />
                        Scrape
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secure extraction
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Real-time processing
                </div>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <MessageCircle className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Paste Text Content
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Paste any text content and we'll create a chatbot that can answer questions about it
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text content here... This could be product descriptions, FAQs, documentation, or any other text you want your chatbot to understand."
                  rows={8}
                  className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Any text format
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Instant training
                  </div>
                </div>
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textContent.trim() || isLoading}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Create Chatbot
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-900/30 border border-red-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-top duration-300">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-200 font-medium mb-2">Something went wrong</h4>
                  <p className="text-red-300 text-sm leading-relaxed">{error}</p>
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
      <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* Demo Status Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-6 shadow-lg backdrop-blur-sm">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">Demo Chatbot Ready!</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            This is how your chatbot appears to visitors
          </h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The widget below shows exactly what your customers will see and interact with on your website.
            Try asking questions about the content you just provided.
          </p>
        </div>

        {/* Mock Website Context */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8 mb-8 shadow-2xl backdrop-blur-sm">
          {/* Mock website content */}
          <div className="bg-white rounded-xl p-8 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Your Business Website</h4>
                  <p className="text-sm text-gray-600">Powered by SiteAgent AI</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    AI Assistant Online
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-gray-800">
                <div>
                  <h5 className="font-semibold mb-3 text-gray-900">About Our Service</h5>
                  <p className="text-sm leading-relaxed text-gray-700">
                    Welcome to our support center. Our AI assistant can help you find answers instantly using the content you just uploaded.
                    It's trained on your specific information and ready to assist your visitors 24/7.
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold mb-3 text-gray-900">Quick Links</h5>
                  <div className="space-y-2 text-sm">
                    <a href="/signup" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                      <ArrowRight className="h-3 w-3 mr-2" />
                      Start Free Trial
                    </a>
                    <a href="/#features" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                      <ArrowRight className="h-3 w-3 mr-2" />
                      See Features
                    </a>
                    <a href="/#pricing" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                      <ArrowRight className="h-3 w-3 mr-2" />
                      View Pricing
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Widget */}
        <div 
          className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300"
          style={{
            /* Safari fix: Ensure widget doesn't get trapped in transform stacking context */
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        >
          {isMinimized ? (
            // Minimized widget launcher
            <button
              onClick={() => setIsMinimized(false)}
              className="group bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-blue-500/50"
            >
              <MessageCircle className="h-7 w-7" />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </button>
          ) : (
            // Expanded widget
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Widget Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">AI Assistant</h4>
                      <div className="flex items-center gap-1 text-xs text-blue-100">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Online
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={resetPreview}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {session?.status === 'processing' && (
                  <div className="text-center py-12 animate-in fade-in duration-500">
                    <div className="relative">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                      <div className="absolute inset-0 animate-ping">
                        <Loader2 className="h-10 w-10 text-blue-400 mx-auto opacity-20" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Training your AI assistant...</p>
                    <p className="text-gray-500 text-xs mt-1">This usually takes just a few seconds</p>
                  </div>
                )}

                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          message.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-left leading-relaxed">{message.content}</p>
                        <div className={`text-xs mt-2 ${
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
                    <div className="flex justify-start animate-in fade-in duration-300">
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-1">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {session?.status === 'completed' && session.suggestedQuestions.length > 0 && messages.length <= 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 animate-in slide-in-from-bottom duration-300 delay-200">
                  <p className="text-xs text-gray-500 mb-3 font-medium">Try these questions:</p>
                  <div className="space-y-2">
                    {session.suggestedQuestions.slice(0, 2).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="w-full text-left p-3 bg-white hover:bg-blue-50 rounded-xl text-xs text-gray-700 border border-gray-200 transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
                      >
                        <span className="text-blue-600 mr-1">💬</span>
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              {session?.status === 'completed' && session.remainingMessages > 0 && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={isSending}
                    />
                    <button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isSending}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.remainingMessages} messages remaining
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Secure & Private
                    </span>
                  </div>
                </div>
              )}

              {/* Upgrade Prompt */}
              {session?.remainingMessages === 0 && (
                <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center animate-in slide-in-from-bottom duration-300">
                  <Sparkles className="h-6 w-6 mx-auto mb-3 animate-pulse" />
                  <p className="font-semibold text-base mb-2">Demo completed!</p>
                  <p className="text-xs text-blue-100 mb-4 leading-relaxed">
                    Ready to create unlimited chatbots and embed them on your website?
                  </p>
                  <Button
                    onClick={() => window.location.href = '/signup'}
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-gray-100 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo Controls */}
        <div className="text-center mt-12 animate-in fade-in duration-500 delay-500">
          <div className="inline-flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Want to try with different content?</p>
            <Button
              onClick={resetPreview}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              Try Another Demo
            </Button>
          </div>
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
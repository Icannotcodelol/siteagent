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
  Sparkles
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
              content: "Hi! I'm ready to answer questions about your content. Try asking me something or use one of the suggested questions below.",
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
    if (!session || !content.trim() || isSending) return;

    setIsSending(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('/api/preview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: session.sessionToken,
          message: content.trim(),
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.content
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update session with new message count
      setSession(prev => prev ? {
        ...prev,
        messageCount: prev.messageCount + 1,
        remainingMessages: data.remainingMessages
      } : null);

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const renderUploadSection = () => {
    if (session) return null;

    return (
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'document', label: 'Upload Document', icon: Upload },
            { id: 'website', label: 'Scrape Website', icon: Globe },
            { id: 'text', label: 'Paste Text', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as ContentType)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        <div className="min-h-[200px]">
          {activeTab === 'document' && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-blue-500'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-blue-400' : 'text-gray-400'}`} />
                <p className={`mb-2 ${isDragOver ? 'text-blue-300' : 'text-gray-300'}`}>
                  {isDragOver ? 'Drop your file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">PDF or TXT files (max 5MB)</p>
                {isLoading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Uploading...</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleWebsiteSubmit}
                disabled={!websiteUrl.trim() || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping Website...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Scrape Website
                  </>
                )}
              </Button>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Text Content</label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text content here (max 5000 characters)..."
                  rows={8}
                  maxLength={5000}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="text-right text-xs text-gray-500">
                  {textContent.length}/5000 characters
                </div>
              </div>
              <Button
                onClick={handleTextSubmit}
                disabled={!textContent.trim() || textContent.length < 50 || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Text...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Process Text
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-md p-3 text-red-200 text-sm">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Upload Error</p>
                <p>{error}</p>
                {error.includes('PDF') && (
                  <div className="mt-2 text-xs text-red-300">
                    <p className="font-medium mb-1">Having trouble with your PDF?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Try converting your PDF to a TXT file first</li>
                      <li>Copy and paste the text content using the "Paste Text" tab</li>
                      <li>Some PDFs with images or complex formatting may not work well</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChatInterface = () => {
    if (!session) return null;

    return (
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            {session.status === 'processing' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-300">Processing content...</span>
              </>
            )}
            {session.status === 'completed' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">Ready to chat!</span>
              </>
            )}
            {session.status === 'failed' && (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-300">Processing failed</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {session.remainingMessages} messages left
            </span>
            <Button
              onClick={resetPreview}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              New Preview
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-gray-800 rounded-lg p-4 h-80 overflow-y-auto scroll-smooth" style={{ scrollBehavior: 'auto' }}>
          {messages.length === 0 && session.status === 'processing' && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Processing your content...</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm text-gray-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {session.status === 'completed' && session.suggestedQuestions.length > 0 && messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Suggested questions:</p>
            <div className="grid gap-2">
              {session.suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-left p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        {session.status === 'completed' && session.remainingMessages > 0 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
              placeholder="Ask a question about your content..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Upgrade Prompt */}
        {session.remainingMessages === 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-white" />
            <p className="text-white font-medium mb-2">
              You've reached the 10 message limit for this preview!
            </p>
            <p className="text-blue-100 text-sm mb-3">
              Sign up for SiteAgent to get unlimited conversations and embed this chatbot on your website.
            </p>
            <Button
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900 rounded-lg border border-gray-700 p-6">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          🎯 Try SiteAgent Now - No Signup Required
        </h3>
        <p className="text-gray-400 text-sm">
          Upload a document, scrape a website, or paste text to create an instant AI chatbot
        </p>
      </div>

      {renderUploadSection()}
      {renderChatInterface()}
    </div>
  );
} 
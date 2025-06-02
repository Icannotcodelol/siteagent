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

// Translation objects
const translations = {
  en: {
    chooseContentSource: "Choose Your Content Source",
    contentSourceDescription: "Start by uploading a document, entering a website URL, or pasting text content. Watch as we create an intelligent chatbot in seconds.",
    uploadDocument: "Upload Document",
    scrapeWebsite: "Scrape Website", 
    pasteText: "Paste Text",
    uploadYourDocument: "Upload Your Document",
    dragDropDescription: "Drag and drop a PDF, TXT, or CSV file, or click to browse. We'll extract the content and create your chatbot instantly.",
    processing: "Processing...",
    chooseFile: "Choose File",
    scrapeWebsiteContent: "Scrape Website Content",
    websiteUrlDescription: "Enter any website URL and we'll extract the content to train your chatbot",
    websiteUrl: "Website URL",
    scrape: "Scrape",
    pasteTextContent: "Paste Text Content",
    pasteTextDescription: "Paste any text content and we'll create a chatbot that can answer questions about it",
    textContent: "Text Content",
    textPlaceholder: "Paste your text content here... This could be product descriptions, FAQs, documentation, or any other text you want your chatbot to understand.",
    createChatbot: "Create Chatbot",
    anyTextFormat: "Any text format",
    instantTraining: "Instant training",
    secureExtraction: "Secure extraction",
    realTimeProcessing: "Real-time processing",
    instantSetup: "Instant setup",
    maxSize: "Max 5MB",
    somethingWentWrong: "Something went wrong",
    demoChatbotReady: "Demo Chatbot Ready!",
    howChatbotAppears: "This is how your chatbot appears to visitors",
    widgetDescription: "The widget below shows exactly what your customers will see and interact with on your website. Try asking questions about the content you just provided.",
    yourBusinessWebsite: "Your Business Website",
    poweredBySiteAgent: "Powered by SiteAgent AI",
    aiAssistantOnline: "AI Assistant Online",
    aboutOurService: "About Our Service",
    serviceDescription: "Welcome to our support center. Our AI assistant can help you find answers instantly using the content you just uploaded. It's trained on your specific information and ready to assist your visitors 24/7.",
    quickLinks: "Quick Links",
    startFreeTrial: "Start Free Trial",
    seeFeatures: "See Features", 
    viewPricing: "View Pricing",
    aiAssistant: "AI Assistant",
    online: "Online",
    trainingAssistant: "Training your AI assistant...",
    trainingDescription: "This usually takes just a few seconds",
    trainingProblem: "We ran into a problem while training your assistant.",
    tryAgainLater: "Please try again with different content or come back later.",
    aiTyping: "AI is typing...",
    tryTheseQuestions: "Try these questions:",
    askAnything: "Ask me anything...",
    messagesRemaining: "messages remaining",
    securePrivate: "Secure & Private",
    demoCompleted: "Demo completed!",
    readyToCreate: "Ready to create unlimited chatbots and embed them on your website?",
    tryAnotherDemo: "Try Another Demo",
    tryDifferentContent: "Want to try with different content?",
    welcomeMessage: "Hello! I'm ready to help you with questions about your uploaded content. What would you like to know?"
  },
  it: {
    chooseContentSource: "Scegli la Tua Fonte di Contenuti",
    contentSourceDescription: "Inizia caricando un documento, inserendo l'URL di un sito web o incollando contenuto testuale. Guarda come creiamo un chatbot intelligente in pochi secondi.",
    uploadDocument: "Carica Documento",
    scrapeWebsite: "Estrai da Sito Web",
    pasteText: "Incolla Testo",
    uploadYourDocument: "Carica il Tuo Documento",
    dragDropDescription: "Trascina e rilascia un file PDF, TXT o CSV, oppure clicca per sfogliare. Estrarremo il contenuto e creeremo il tuo chatbot istantaneamente.",
    processing: "Elaborazione...",
    chooseFile: "Scegli File",
    scrapeWebsiteContent: "Estrai Contenuto dal Sito Web",
    websiteUrlDescription: "Inserisci qualsiasi URL di un sito web e estrarremo il contenuto per addestrare il tuo chatbot",
    websiteUrl: "URL del Sito Web",
    scrape: "Estrai",
    pasteTextContent: "Incolla Contenuto Testuale",
    pasteTextDescription: "Incolla qualsiasi contenuto testuale e creeremo un chatbot che può rispondere a domande su di esso",
    textContent: "Contenuto Testuale",
    textPlaceholder: "Incolla qui il tuo contenuto testuale... Potrebbero essere descrizioni prodotti, FAQ, documentazione o qualsiasi altro testo di cui vuoi che il tuo chatbot abbia conoscenza.",
    createChatbot: "Crea Chatbot",
    anyTextFormat: "Qualsiasi formato testo",
    instantTraining: "Addestramento istantaneo",
    secureExtraction: "Estrazione sicura",
    realTimeProcessing: "Elaborazione in tempo reale",
    instantSetup: "Setup istantaneo",
    maxSize: "Max 5MB",
    somethingWentWrong: "Qualcosa è andato storto",
    demoChatbotReady: "Demo Chatbot Pronto!",
    howChatbotAppears: "Ecco come appare il tuo chatbot ai visitatori",
    widgetDescription: "Il widget qui sotto mostra esattamente cosa vedranno e con cui interagiranno i tuoi clienti sul tuo sito web. Prova a fare domande sul contenuto che hai appena fornito.",
    yourBusinessWebsite: "Il Sito Web della Tua Azienda",
    poweredBySiteAgent: "Powered by SiteAgent AI",
    aiAssistantOnline: "Assistente AI Online",
    aboutOurService: "Chi Siamo",
    serviceDescription: "Benvenuto nel nostro centro assistenza. Il nostro assistente AI può aiutarti a trovare risposte istantaneamente utilizzando il contenuto che hai appena caricato. È addestrato sulle tue informazioni specifiche e pronto ad assistere i tuoi visitatori 24/7.",
    quickLinks: "Link Rapidi",
    startFreeTrial: "Inizia Prova Gratuita",
    seeFeatures: "Vedi Funzionalità",
    viewPricing: "Vedi Prezzi",
    aiAssistant: "Assistente AI",
    online: "Online",
    trainingAssistant: "Addestrando il tuo assistente AI...",
    trainingDescription: "Di solito richiede solo pochi secondi",
    trainingProblem: "Abbiamo riscontrato un problema durante l'addestramento del tuo assistente.",
    tryAgainLater: "Prova di nuovo con contenuto diverso o torna più tardi.",
    aiTyping: "AI sta scrivendo...",
    tryTheseQuestions: "Prova queste domande:",
    askAnything: "Chiedimi qualsiasi cosa...",
    messagesRemaining: "messaggi rimanenti",
    securePrivate: "Sicuro e Privato",
    demoCompleted: "Demo completata!",
    readyToCreate: "Pronto a creare chatbot illimitati e incorporarli nel tuo sito web?",
    tryAnotherDemo: "Prova Un'Altra Demo",
    tryDifferentContent: "Vuoi provare con contenuto diverso?",
    welcomeMessage: "Ciao! Sono pronto ad aiutarti con domande sul contenuto che hai caricato. Cosa vorresti sapere?"
  },
  de: {
    chooseContentSource: "Wählen Sie Ihre Inhaltsquelle",
    contentSourceDescription: "Beginnen Sie mit dem Hochladen eines Dokuments, der Eingabe einer Website-URL oder dem Einfügen von Textinhalten. Schauen Sie zu, wie wir in Sekunden einen intelligenten Chatbot erstellen.",
    uploadDocument: "Dokument hochladen",
    scrapeWebsite: "Website extrahieren",
    pasteText: "Text einfügen",
    uploadYourDocument: "Laden Sie Ihr Dokument hoch",
    dragDropDescription: "Ziehen Sie eine PDF-, TXT- oder CSV-Datei per Drag & Drop hierher oder klicken Sie zum Durchsuchen. Wir extrahieren den Inhalt und erstellen sofort Ihren Chatbot.",
    processing: "Verarbeitung...",
    chooseFile: "Datei wählen",
    scrapeWebsiteContent: "Website-Inhalte extrahieren",
    websiteUrlDescription: "Geben Sie eine beliebige Website-URL ein und wir extrahieren den Inhalt, um Ihren Chatbot zu trainieren",
    websiteUrl: "Website-URL",
    scrape: "Extrahieren",
    pasteTextContent: "Textinhalt einfügen",
    pasteTextDescription: "Fügen Sie beliebige Textinhalte ein und wir erstellen einen Chatbot, der Fragen dazu beantworten kann",
    textContent: "Textinhalt",
    textPlaceholder: "Fügen Sie hier Ihren Textinhalt ein... Das könnten Produktbeschreibungen, FAQs, Dokumentationen oder jeder andere Text sein, den Ihr Chatbot verstehen soll.",
    createChatbot: "Chatbot erstellen",
    anyTextFormat: "Jedes Textformat",
    instantTraining: "Sofortiges Training",
    secureExtraction: "Sichere Extraktion",
    realTimeProcessing: "Echtzeitverarbeitung",
    instantSetup: "Sofortiges Setup",
    maxSize: "Max 5MB",
    somethingWentWrong: "Etwas ist schiefgelaufen",
    demoChatbotReady: "Demo-Chatbot bereit!",
    howChatbotAppears: "So erscheint Ihr Chatbot für Besucher",
    widgetDescription: "Das Widget unten zeigt genau, was Ihre Kunden auf Ihrer Website sehen und womit sie interagieren werden. Versuchen Sie, Fragen zum soeben bereitgestellten Inhalt zu stellen.",
    yourBusinessWebsite: "Ihre Unternehmens-Website",
    poweredBySiteAgent: "Powered by SiteAgent AI",
    aiAssistantOnline: "KI-Assistent online",
    aboutOurService: "Über unseren Service",
    serviceDescription: "Willkommen in unserem Support-Center. Unser KI-Assistent kann Ihnen sofort Antworten geben, basierend auf dem Inhalt, den Sie gerade hochgeladen haben. Er ist auf Ihre spezifischen Informationen trainiert und bereit, Ihre Besucher 24/7 zu unterstützen.",
    quickLinks: "Schnellzugriffe",
    startFreeTrial: "Kostenlose Testversion starten",
    seeFeatures: "Funktionen ansehen",
    viewPricing: "Preise ansehen",
    aiAssistant: "KI-Assistent",
    online: "Online",
    trainingAssistant: "Trainiere Ihren KI-Assistenten...",
    trainingDescription: "Das dauert normalerweise nur wenige Sekunden",
    trainingProblem: "Wir sind auf ein Problem beim Training Ihres Assistenten gestoßen.",
    tryAgainLater: "Bitte versuchen Sie es mit anderem Inhalt erneut oder kommen Sie später zurück.",
    aiTyping: "KI tippt...",
    tryTheseQuestions: "Versuchen Sie diese Fragen:",
    askAnything: "Fragen Sie mich alles...",
    messagesRemaining: "verbleibende Nachrichten",
    securePrivate: "Sicher & Privat",
    demoCompleted: "Demo abgeschlossen!",
    readyToCreate: "Bereit, unbegrenzte Chatbots zu erstellen und sie in Ihre Website einzubetten?",
    tryAnotherDemo: "Andere Demo ausprobieren",
    tryDifferentContent: "Möchten Sie es mit anderem Inhalt versuchen?",
    welcomeMessage: "Hallo! Ich bin bereit, Ihnen bei Fragen zu Ihrem hochgeladenen Inhalt zu helfen. Was möchten Sie wissen?"
  }
};

type Locale = 'en' | 'it' | 'de';

interface LivePreviewProps {
  locale?: Locale;
}

export default function LivePreview({ locale = 'en' }: LivePreviewProps) {
  const t = translations[locale];
  const isBright = locale === 'it' || locale === 'de'; // Both Italian and German use bright theme
  
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

  // Auto-scroll to bottom of messages only when user sends a message or AI responds
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 1) { // Only auto-scroll after initial message
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
              status: data.status ?? prev.status,
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
                content: t.welcomeMessage,
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
  }, [session?.sessionToken, session?.status, t.welcomeMessage]); // Add t.welcomeMessage to dependencies

  useEffect(() => {
    if (session?.status === 'processing') {
      const timeout = setTimeout(() => {
        // If we are still processing after 60s, surface an error
        setError('Processing is taking longer than expected. Please try again shortly.');
        setSession(prev => prev ? { ...prev, status: 'failed' } : null);
      }, 60000); // 60 seconds
      return () => clearTimeout(timeout);
    }
  }, [session?.status]);

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
          <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
            isBright ? 'text-gray-800' : 'text-white'
          }`}>
            {t.chooseContentSource}
          </h3>
          <p className={`text-base md:text-lg max-w-xl mx-auto leading-relaxed ${
            isBright ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {t.contentSourceDescription}
          </p>
        </div>

        {/* Content Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className={`p-1.5 rounded-xl border shadow-xl ${
            isBright 
              ? 'bg-white/90 backdrop-blur-sm border-gray-200' 
              : 'bg-gray-800/60 backdrop-blur-sm border-gray-700/50'
          }`}>
            {[
              { type: 'document' as ContentType, icon: FileText, label: t.uploadDocument },
              { type: 'website' as ContentType, icon: Globe, label: t.scrapeWebsite },
              { type: 'text' as ContentType, icon: MessageCircle, label: t.pasteText }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === type
                    ? isBright
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                    : isBright
                      ? 'text-gray-600 hover:text-gray-800 hover:bg-blue-50'
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
        <div className={`backdrop-blur-sm border rounded-2xl p-8 shadow-2xl ${
          isBright 
            ? 'bg-white/95 border-gray-200' 
            : 'bg-gray-800/40 border-gray-700/50'
        }`}>
          {activeTab === 'document' && (
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                isDragOver
                  ? isBright
                    ? 'border-blue-400 bg-blue-50/80 scale-[1.02]'
                    : 'border-blue-400 bg-blue-500/10 scale-[1.02]'
                  : isBright
                    ? 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/40'
                    : 'border-gray-600/60 hover:border-gray-500/80 hover:bg-gray-700/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
                <Upload className={`h-16 w-16 mx-auto mb-6 ${
                  isBright ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <h3 className={`text-xl font-semibold mb-3 ${
                  isBright ? 'text-gray-800' : 'text-white'
                }`}>
                  {t.uploadYourDocument}
                </h3>
                <p className={`mb-6 max-w-md mx-auto ${
                  isBright ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {t.dragDropDescription}
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  size="lg"
                  className={`shadow-lg transition-all duration-300 ${
                    isBright
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      {t.chooseFile}
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
                <div className={`mt-6 flex items-center justify-center gap-6 text-xs ${
                  isBright ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    PDF, TXT & CSV
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {t.maxSize}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {t.instantSetup}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Globe className={`h-16 w-16 mx-auto mb-4 ${
                  isBright ? 'text-purple-500' : 'text-blue-400'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  isBright ? 'text-gray-800' : 'text-white'
                }`}>
                  {t.scrapeWebsiteContent}
                </h3>
                <p className={`max-w-md mx-auto ${
                  isBright ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {t.websiteUrlDescription}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  isBright ? 'text-gray-700' : 'text-white'
                }`}>
                  {t.websiteUrl}
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className={`flex-1 px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isBright
                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        : 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400'
                    }`}
                  />
                  <Button
                    onClick={handleWebsiteSubmit}
                    disabled={!websiteUrl.trim() || isLoading}
                    size="lg"
                    className={`px-8 shadow-lg ${
                      isBright
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-purple-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Globe className="h-5 w-5 mr-2" />
                        {t.scrape}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className={`flex items-center justify-center gap-6 text-xs ${
                isBright ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {t.secureExtraction}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {t.realTimeProcessing}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <MessageCircle className={`h-16 w-16 mx-auto mb-4 ${
                  isBright ? 'text-green-500' : 'text-purple-400'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  isBright ? 'text-gray-800' : 'text-white'
                }`}>
                  {t.pasteTextContent}
                </h3>
                <p className={`max-w-md mx-auto ${
                  isBright ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {t.pasteTextDescription}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  isBright ? 'text-gray-700' : 'text-white'
                }`}>
                  {t.textContent}
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder={t.textPlaceholder}
                  rows={8}
                  className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${
                    isBright
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-6 text-xs ${
                  isBright ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {t.anyTextFormat}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {t.instantTraining}
                  </div>
                </div>
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textContent.trim() || isLoading}
                  size="lg"
                  className={`shadow-lg ${
                    isBright
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:shadow-green-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      {t.createChatbot}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className={`mt-6 border rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-top duration-300 ${
              isBright
                ? 'bg-red-50 border-red-200'
                : 'bg-red-900/30 border-red-700/50'
            }`}>
              <div className="flex items-start gap-3">
                <XCircle className={`h-6 w-6 mt-0.5 flex-shrink-0 ${
                  isBright ? 'text-red-500' : 'text-red-400'
                }`} />
                <div>
                  <h4 className={`font-medium mb-2 ${
                    isBright ? 'text-red-800' : 'text-red-200'
                  }`}>
                    {t.somethingWentWrong}
                  </h4>
                  <p className={`text-sm leading-relaxed ${
                    isBright ? 'text-red-700' : 'text-red-300'
                  }`}>{error}</p>
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
          <div className={`inline-flex items-center gap-2 rounded-full px-6 py-3 mb-6 shadow-lg backdrop-blur-sm ${
            isBright 
              ? 'bg-green-100 border border-green-300' 
              : 'bg-green-500/10 border border-green-500/20'
          }`}>
            <CheckCircle className={`h-5 w-5 ${isBright ? 'text-green-600' : 'text-green-400'}`} />
            <span className={`font-medium ${isBright ? 'text-green-700' : 'text-green-400'}`}>
              {t.demoChatbotReady}
            </span>
          </div>
          <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${
            isBright ? 'text-gray-800' : 'text-white'
          }`}>
            {t.howChatbotAppears}
          </h3>
          <p className={`text-lg max-w-2xl mx-auto ${
            isBright ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {t.widgetDescription}
          </p>
        </div>

        {/* Mock Website Context */}
        <div className={`rounded-2xl border p-8 mb-8 shadow-2xl backdrop-blur-sm ${
          isBright 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
        }`}>
          {/* Mock website content */}
          <div className="bg-white rounded-xl p-8 relative overflow-hidden shadow-xl">
            <div className={`absolute inset-0 ${
              isBright 
                ? 'bg-gradient-to-br from-blue-50 to-purple-50' 
                : 'bg-gradient-to-br from-blue-50 to-purple-50'
            }`}></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  isBright 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-blue-600'
                }`}>
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {t.yourBusinessWebsite}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t.poweredBySiteAgent}
                  </p>
                </div>
                <div className="ml-auto">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    isBright 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {t.aiAssistantOnline}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-gray-800">
                <div>
                  <h5 className="font-semibold mb-3 text-gray-900">
                    {t.aboutOurService}
                  </h5>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {t.serviceDescription}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold mb-3 text-gray-900">
                    {t.quickLinks}
                  </h5>
                  <div className="space-y-2 text-sm">
                    <a href="/signup" className={`flex items-center transition-colors ${
                      isBright 
                        ? 'text-purple-600 hover:text-purple-800' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}>
                      <ArrowRight className="h-3 w-3 mr-2" />
                      {t.startFreeTrial}
                    </a>
                    <a href="/#features" className={`flex items-center transition-colors ${
                      isBright 
                        ? 'text-purple-600 hover:text-purple-800' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}>
                      <ArrowRight className="h-3 w-3 mr-2" />
                      {t.seeFeatures}
                    </a>
                    <a href="/#pricing" className={`flex items-center transition-colors ${
                      isBright 
                        ? 'text-purple-600 hover:text-purple-800' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}>
                      <ArrowRight className="h-3 w-3 mr-2" />
                      {t.viewPricing}
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
              className={`group text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 ${
                isBright 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-blue-400/50' 
                  : 'bg-blue-600 hover:bg-blue-700 border-blue-500/50'
              }`}
            >
              <MessageCircle className="h-7 w-7" />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </button>
          ) : (
            // Expanded widget
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[32rem] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Widget Header */}
              <div className={`p-4 text-white ${
                isBright 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        {t.aiAssistant}
                      </h4>
                      <div className={`flex items-center gap-1 text-xs ${
                        isBright ? 'text-blue-100' : 'text-blue-100'
                      }`}>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        {t.online}
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

              {/* Messages Container - uses remaining space between header and input */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Messages Area - scrollable */}
                <div className={`flex-1 overflow-y-auto p-4 ${
                  isBright ? 'bg-blue-50/30' : 'bg-gray-50'
                }`}>
                  {session?.status === 'processing' && (
                    <div className="text-center py-12 animate-in fade-in duration-500">
                      <div className="relative">
                        <Loader2 className={`h-10 w-10 animate-spin mx-auto mb-4 ${
                          isBright ? 'text-purple-500' : 'text-blue-600'
                        }`} />
                        <div className="absolute inset-0 animate-ping">
                          <Loader2 className={`h-10 w-10 mx-auto opacity-20 ${
                            isBright ? 'text-purple-400' : 'text-blue-400'
                          }`} />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm font-medium">
                        {t.trainingAssistant}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {t.trainingDescription}
                      </p>
                    </div>
                  )}

                  {session?.status === 'failed' && (
                    <div className="text-center py-12 animate-in fade-in duration-500">
                      <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                      <p className="text-gray-600 text-sm font-medium mb-1">
                        {t.trainingProblem}
                      </p>
                      <p className="text-gray-500 text-xs max-w-xs mx-auto whitespace-pre-wrap">
                        {error || t.tryAgainLater}
                      </p>
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
                              ? isBright
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                : 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-left leading-relaxed">{message.content}</p>
                          <div className={`text-xs mt-2 ${
                            message.isUser 
                              ? isBright ? 'text-blue-100' : 'text-blue-100'
                              : 'text-gray-500'
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
                              <div className={`w-2 h-2 rounded-full animate-bounce ${
                                isBright ? 'bg-purple-400' : 'bg-gray-400'
                              }`}></div>
                              <div className={`w-2 h-2 rounded-full animate-bounce ${
                                isBright ? 'bg-purple-400' : 'bg-gray-400'
                              }`} style={{ animationDelay: '0.1s' }}></div>
                              <div className={`w-2 h-2 rounded-full animate-bounce ${
                                isBright ? 'bg-purple-400' : 'bg-gray-400'
                              }`} style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-1">
                              {t.aiTyping}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions - ultra compact, single line */}
                {session?.status === 'completed' && session.suggestedQuestions.length > 0 && messages.length <= 1 && (
                  <div className={`px-3 py-1.5 border-t border-gray-200 animate-in slide-in-from-bottom duration-300 delay-200 flex-shrink-0 ${
                    isBright ? 'bg-blue-50/30' : 'bg-gray-50'
                  }`}>
                    <div className="flex gap-1.5 overflow-x-auto">
                      {session.suggestedQuestions.slice(0, 2).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(question)}
                          className={`flex-shrink-0 px-2 py-1 bg-white rounded text-xs text-gray-700 border transition-all duration-200 hover:shadow-sm whitespace-nowrap ${
                            isBright 
                              ? 'border-blue-200 hover:bg-blue-50 hover:border-blue-300' 
                              : 'border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                          }`}
                        >
                          💬 {question.length > 30 ? question.substring(0, 30) + '...' : question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              {session?.status === 'completed' && session.remainingMessages > 0 && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                      placeholder={t.askAnything}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={isSending}
                    />
                    <button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isSending}
                      className={`disabled:opacity-50 text-white p-3 rounded-xl transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed ${
                        isBright 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.remainingMessages} {t.messagesRemaining}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {t.securePrivate}
                    </span>
                  </div>
                </div>
              )}

              {/* Upgrade Prompt */}
              {session?.remainingMessages === 0 && (
                <div className={`p-6 text-white text-center animate-in slide-in-from-bottom duration-300 ${
                  isBright 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}>
                  <Sparkles className="h-6 w-6 mx-auto mb-3 animate-pulse" />
                  <p className="font-semibold text-base mb-2">
                    {t.demoCompleted}
                  </p>
                  <p className={`text-xs mb-4 leading-relaxed ${
                    isBright ? 'text-blue-100' : 'text-blue-100'
                  }`}>
                    {t.readyToCreate}
                  </p>
                  <Button
                    onClick={() => window.location.href = '/signup'}
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-gray-100 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {t.startFreeTrial}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo Controls */}
        <div className="text-center mt-12 animate-in fade-in duration-500 delay-500">
          <div className={`inline-flex items-center gap-4 backdrop-blur-sm border rounded-xl p-4 ${
            isBright 
              ? 'bg-white/80 border-gray-200' 
              : 'bg-gray-800/50 border-gray-700/50'
          }`}>
            <p className={`text-sm ${
              isBright ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {t.tryDifferentContent}
            </p>
            <Button
              onClick={resetPreview}
              variant="outline"
              size="sm"
              className={`transition-all duration-200 ${
                isBright 
                  ? 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {t.tryAnotherDemo}
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
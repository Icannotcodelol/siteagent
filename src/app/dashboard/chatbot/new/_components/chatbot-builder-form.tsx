'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient as createSupabaseBrowserClient } from '@/lib/supabase/client'
// We will update the action import later
import { createChatbotAction, updateChatbotAction } from '../actions'
import { useRouter } from 'next/navigation'
import PromptInput from './prompt-input' // Import the new component
import MultipleDomainInput from './multiple-domain-input'

// Import components for tabs (adjust paths if necessary)
import DocumentUploadForm from '../../[id]/_components/document-upload-form' 
import DocumentList from '../../[id]/_components/document-list'
import ProcessingStatus from '../../[id]/_components/processing-status'
// Import enhanced components
import EnhancedDocumentUpload from '../../[id]/_components/enhanced-document-upload'
import EnhancedDocumentList from '../../[id]/_components/enhanced-document-list'
import EnhancedProcessingStatus from '../../[id]/_components/enhanced-processing-status'
import EmbedCodeDisplay from '../../[id]/_components/embed-code-display'
// Import the new (placeholder) Actions component
import ActionManager from '../../[id]/_components/action-manager'
// Import ChatInterface for the preview tab
import ChatInterface from '../../[id]/_components/chat-interface'
import IntegrationsPanel from '../../[id]/_components/integrations-panel'
import AnalyticsPanel from '../../[id]/_components/analytics-panel'
import { useChatbotAppearance } from './chatbot-appearance-context'

// Import new loading and error components
import { 
  FormSkeleton, 
  OverallProgress, 
  LoadingButton, 
  AutoSaveIndicator 
} from './loading-states'
import { 
  ErrorToast, 
  FieldError, 
  ValidationErrorSummary, 
  NetworkStatus,
  useRetry,
  createError,
  getErrorMessage,
  type AppError 
} from './error-handling'
import SimplifiedAppearanceTab from './simplified-appearance-tab'

// Define possible section values
type Section = 'settings' | 'dataSources' | 'appearance' | 'embed' | 'actions' | 'integrations' | 'analytics';

// Define props for the component
interface ChatbotBuilderFormProps {
  initialName?: string;
  initialSystemPrompt?: string;
  chatbotId?: string; // ID indicates edit mode
  initialPrimaryColor?: string;
  initialSecondaryColor?: string;
  initialBackgroundColor?: string;
  initialTextColor?: string;
  initialFontFamily?: string;
  initialWelcomeMessage?: string;
  initialBotAvatarUrl?: string;
  initialUserAvatarUrl?: string;
  initialChatBubbleStyle?: string;
  initialHeaderText?: string;
  initialInputPlaceholder?: string;
  initialShowBranding?: boolean;
}

export default function ChatbotBuilderForm({
  initialName = '',
  initialSystemPrompt = '',
  chatbotId,
  initialPrimaryColor = '',
  initialSecondaryColor = '',
  initialBackgroundColor = '',
  initialTextColor = '',
  initialFontFamily = '',
  initialWelcomeMessage = '',
  initialBotAvatarUrl = '',
  initialUserAvatarUrl = '',
  initialChatBubbleStyle = 'rounded',
  initialHeaderText = '',
  initialInputPlaceholder = '',
  initialShowBranding = true,
}: ChatbotBuilderFormProps) {
  const [name, setName] = useState(initialName)
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt)
  const [pastedText, setPastedText] = useState('');
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<Section>('settings');
  const [isPending, setIsPending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const [isOnline, setIsOnline] = useState(true)
  const [showProgress, setShowProgress] = useState(false)
  const [progressSteps, setProgressSteps] = useState<Array<{
    title: string
    description?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    error?: string
  }>>([])
  const [currentStep, setCurrentStep] = useState(0)
  
  const router = useRouter()
  const isEditMode = !!chatbotId;
  const [primaryColor, setPrimaryColor] = useState<string>(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState<string>(initialSecondaryColor);
  const [backgroundColor, setBackgroundColor] = useState<string>(initialBackgroundColor);
  const [textColor, setTextColor] = useState<string>(initialTextColor);
  const [fontFamily, setFontFamily] = useState<string>(initialFontFamily);
  const [welcomeMessage, setWelcomeMessage] = useState<string>(initialWelcomeMessage);
  const [botAvatarUrl, setBotAvatarUrl] = useState<string>(initialBotAvatarUrl);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>(initialUserAvatarUrl);
  const [chatBubbleStyle, setChatBubbleStyle] = useState<string>(initialChatBubbleStyle);
  const [headerText, setHeaderText] = useState<string>(initialHeaderText);
  const [inputPlaceholder, setInputPlaceholder] = useState<string>(initialInputPlaceholder);
  const [showBranding, setShowBranding] = useState<boolean>(initialShowBranding);

  // Create a supabase instance
  const supabase = createSupabaseBrowserClient()

  // Initialize the appearance context
  const { appearance, setAppearance } = useChatbotAppearance()

  // Effect to sync props with appearance context when component mounts
  useEffect(() => {
    setAppearance({
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      welcomeMessage,
      botAvatarUrl,
      userAvatarUrl,
      chatBubbleStyle,
      headerText,
      inputPlaceholder,
      showBranding
    })
  }, [
    primaryColor, secondaryColor, backgroundColor, textColor, fontFamily,
    welcomeMessage, botAvatarUrl, userAvatarUrl, chatBubbleStyle,
    headerText, inputPlaceholder, showBranding, setAppearance
  ])

  // Detect online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Scroll spy to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['settings', 'dataSources', 'appearance', 'embed', 'actions', 'integrations', 'analytics'];
      const scrollPosition = window.scrollY + 200; // Offset for better UX

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section as Section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-retry with exponential backoff
  const { isRetrying, retry: handleRetry } = useRetry()

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!name.trim()) {
      errors.name = 'Chatbot name is required'
    } else if (name.trim().length < 2) {
      errors.name = 'Chatbot name must be at least 2 characters'
    } else if (name.trim().length > 100) {
      errors.name = 'Chatbot name must be less than 100 characters'
    }
    
    // Basic URL validation for website URLs
    websiteUrls.forEach((url, index) => {
      if (url.trim()) {
        try {
          new URL(url.trim())
        } catch {
          errors[`url_${index}`] = `Invalid URL format for website ${index + 1}`
        }
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Auto-save functionality (if needed)
  const triggerAutoSave = () => {
    // Implementation for auto-save
    // This could be debounced and called on form changes
  }

  const initializeProgressSteps = (hasWebsiteUrls: boolean, hasPastedText: boolean) => {
    const steps = [
      {
        title: 'Creating Chatbot',
        description: 'Setting up your chatbot configuration',
        status: 'pending' as const
      }
    ]
    
    if (hasPastedText) {
      steps.push({
        title: 'Processing Text Content',
        description: 'Analyzing and indexing your text content',
        status: 'pending' as const
      })
    }
    
    if (hasWebsiteUrls) {
      steps.push({
        title: 'Scraping Websites',
        description: 'Extracting content from provided URLs',
        status: 'pending' as const
      })
    }
    
    steps.push({
      title: 'Finalizing Setup',
      description: 'Completing chatbot initialization',
      status: 'pending' as const
    })
    
    setProgressSteps(steps)
    setCurrentStep(0)
  }

  const updateProgressStep = (stepIndex: number, status: 'processing' | 'completed' | 'failed', error?: string) => {
    setProgressSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, error } : step
    ))
    setCurrentStep(stepIndex)
  }

  // Helper function to get the next tab in the sequence
  const getNextSection = (currentSection: Section): Section | null => {
    const sectionSequence: Section[] = ['settings', 'dataSources', 'appearance', 'embed', 'actions', 'integrations', 'analytics']
    const currentIndex = sectionSequence.indexOf(currentSection)
    
    if (currentIndex >= 0 && currentIndex < sectionSequence.length - 1) {
      return sectionSequence[currentIndex + 1]
    }
    
    return null // No next section (we're on the last section)
  }

  // Helper function to check if current section is the last section
  const isLastSection = (currentSection: Section): boolean => {
    return currentSection === 'analytics'
  }

  const handleSave = async (silent = false, autoAdvance = false) => {
    if (!validateForm()) {
      if (!silent) {
        setError(createError('validation', 'Please fix the validation errors before saving'))
      }
      return
    }
    
    setIsPending(true)
    setError(null)
    
    if (!silent) {
      const hasWebsiteUrls = websiteUrls.some(url => url.trim())
      const hasPastedText = pastedText.trim().length > 0
      
      if (!isEditMode && (hasWebsiteUrls || hasPastedText)) {
        initializeProgressSteps(hasWebsiteUrls, hasPastedText)
        setShowProgress(true)
      }
    }

    const dataToSave = {
      name: name.trim(),
      system_prompt: systemPrompt.trim(),
      pasted_text: pastedText.trim(),
      website_urls: websiteUrls.filter(url => url.trim()),
      primary_color: primaryColor || null,
      secondary_color: secondaryColor || null,
      background_color: backgroundColor || null,
      text_color: textColor || null,
      font_family: fontFamily || null,
      welcome_message: welcomeMessage || null,
      bot_avatar_url: botAvatarUrl || null,
      user_avatar_url: userAvatarUrl || null,
      chat_bubble_style: chatBubbleStyle || null,
      header_text: headerText || null,
      input_placeholder: inputPlaceholder || null,
      show_branding: showBranding,
    };

    try {
      let result;
      
      if (!silent && !isEditMode) {
        updateProgressStep(0, 'processing')
      }
      
      if (isEditMode) {
        result = await updateChatbotAction(chatbotId, { 
            name: dataToSave.name, 
            system_prompt: dataToSave.system_prompt,
            pasted_text: dataToSave.pasted_text,
            website_urls: dataToSave.website_urls,
            primary_color: dataToSave.primary_color,
            secondary_color: dataToSave.secondary_color,
            background_color: dataToSave.background_color,
            text_color: dataToSave.text_color,
            font_family: dataToSave.font_family,
            welcome_message: dataToSave.welcome_message,
            bot_avatar_url: dataToSave.bot_avatar_url,
            user_avatar_url: dataToSave.user_avatar_url,
            chat_bubble_style: dataToSave.chat_bubble_style,
            header_text: dataToSave.header_text,
            input_placeholder: dataToSave.input_placeholder,
            show_branding: dataToSave.show_branding,
        });
      } else {
        result = await createChatbotAction(dataToSave);
      }

      if (!silent && !isEditMode) {
        updateProgressStep(0, 'completed')
        
        // Simulate progress for additional steps
        if (progressSteps.length > 1) {
          for (let i = 1; i < progressSteps.length - 1; i++) {
            updateProgressStep(i, 'processing')
            await new Promise(resolve => setTimeout(resolve, 1000))
            updateProgressStep(i, 'completed')
          }
          
          updateProgressStep(progressSteps.length - 1, 'processing')
          await new Promise(resolve => setTimeout(resolve, 500))
          updateProgressStep(progressSteps.length - 1, 'completed')
        }
      }

      if (result.success) {
        setAutoSaveStatus('saved')
        setLastSaved(new Date())
        
        if (!silent) {
          if (isEditMode) {
            // Show success message (you could implement a success toast component)
            console.log('Chatbot updated successfully!')
            router.refresh()
          } else {
            console.log('Chatbot created successfully!')
            if (result.chatbotId) {
              if (typeof window !== 'undefined') {
                window.location.href = `/dashboard/chatbot/${result.chatbotId}`;
              } else {
                router.push(`/dashboard/chatbot/${result.chatbotId}`);
              }
            }
          }
        }
      } else {
        throw new Error(result.error || 'Unknown error occurred')
      }
    } catch (err: any) {
      console.error('Save error:', err)
      const errorMessage = getErrorMessage(err)
      setError(createError('server', errorMessage, { retryable: true }))
      setAutoSaveStatus('error')
      
      if (!silent && !isEditMode && progressSteps.length > 0) {
        updateProgressStep(currentStep, 'failed', errorMessage)
      }
    } finally {
      setIsPending(false)
      if (!silent) {
        setShowProgress(false)
      }
    }
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  const handleFieldFocus = (field: string) => {
    // Clear validation error when field is focused
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const scrollToSection = (sectionId: Section) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const getSectionClass = (sectionName: Section) => {
    const isActive = activeSection === sectionName;
    return `
      relative w-full text-left px-3 py-3 text-sm rounded-xl cursor-pointer group
      transition-all duration-200 ease-in-out
      ${isActive 
        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10' 
        : 'text-gray-300 hover:text-white hover:bg-gray-700/40 border border-transparent hover:border-gray-600/30'
      }
      ${isActive ? 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-gradient-to-b before:from-blue-500 before:to-purple-500 before:rounded-r-full' : ''}
    `;
  };

  // Section icon mapping
  const sectionIcons: Record<Section, string> = {
    settings: '⚙️',
    dataSources: '📚',
    appearance: '🎨',
    embed: '🔗',
    actions: '⚡',
    integrations: '🔌',
    analytics: '📊'
  };

  // Show loading skeleton while form is initializing
  if (isLoading) {
    return <FormSkeleton />
  }

  return (
    <>
      {/* Progress Modal */}
      <OverallProgress 
        steps={progressSteps}
        currentStep={currentStep}
        isVisible={showProgress}
      />
      
      {/* Error Toast */}
      {error && (
        <ErrorToast
          error={error}
          onDismiss={() => setError(null)}
          onRetry={error.retryable ? () => handleRetry(() => handleSave(false, false)) : undefined}
        />
      )}
      
      {/* Network Status */}
      <NetworkStatus isOnline={isOnline} />
      
      {/* Validation Error Summary */}
      <ValidationErrorSummary 
        errors={validationErrors}
        onFieldFocus={handleFieldFocus}
      />

      {/* Two-column layout: Navigation sidebar + Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Navigation Sidebar */}
        <div className="lg:w-60 flex-shrink-0">
          <div className="sticky top-24">
            {/* Navigation Header */}
            <div className="glass rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">Chatbot Setup</h3>
                  <p className="text-xs text-gray-400 truncate">Step {Object.keys(sectionIcons).indexOf(activeSection) + 1} of {Object.keys(sectionIcons).length}</p>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((Object.keys(sectionIcons).indexOf(activeSection) + 1) / Object.keys(sectionIcons).length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="glass rounded-xl p-3">
              <ul className="space-y-1">
                {Object.entries(sectionIcons).map(([section, icon]) => (
                  <li key={section}>
                    <button 
                      type="button" 
                      className={getSectionClass(section as Section)} 
                      onClick={() => scrollToSection(section as Section)}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg flex-shrink-0">{icon}</span>
                        <div className="flex-1 text-left min-w-0">
                          <span className="block font-medium text-sm truncate">{section === 'dataSources' ? 'Data Sources' : section.charAt(0).toUpperCase() + section.slice(1)}</span>
                          <span className="block text-xs opacity-70 truncate">
                            {section === 'settings' && 'Basic config'}
                            {section === 'dataSources' && 'Upload content'}
                            {section === 'appearance' && 'Design'}
                            {section === 'embed' && 'Integration'}
                            {section === 'actions' && 'Workflows'}
                            {section === 'integrations' && 'Services'}
                            {section === 'analytics' && 'Metrics'}
                          </span>
                        </div>
                        {activeSection === section && (
                          <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              
              {/* Additional Links */}
              {isEditMode && chatbotId && (
                <div className="mt-4 pt-3 border-t border-gray-700/30">
                  <a
                    href={`/dashboard/chatbot/${chatbotId}/interrogation`}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-gray-400 bg-gray-800/30 hover:bg-gray-700/50 hover:text-white border border-gray-700/30 hover:border-gray-600/50 group"
                  >
                    <span className="text-lg">🔍</span>
                    <div className="flex-1 text-left min-w-0">
                      <span className="block font-medium text-sm truncate">Interrogation</span>
                      <span className="block text-xs opacity-70 truncate">Debug chats</span>
                    </div>
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Right Column: Main Configuration Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Settings Section */}
          <section id="settings" className="glass rounded-xl p-6 xl:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{sectionIcons.settings}</span>
                <span>Settings</span>
              </h2>
              <p className="text-gray-400 mt-2">
                Configure basic chatbot settings and behavior
              </p>
            </div>

            <div className="space-y-8">
              {/* Name Input */}
              <div>
                <label htmlFor="chatbot-name" className="block text-sm font-medium text-gray-300 mb-2">
                  Chatbot Name *
                </label>
                <input
                  type="text"
                  id="chatbot-name"
                  name="name"
                  value={name}
                  onChange={(e) => { 
                    const v = e.target.value; 
                    setName(v);
                    // Clear validation error when user starts typing
                    if (validationErrors.name) {
                      setValidationErrors(prev => ({ ...prev, name: '' }))
                    }
                  }}
                  placeholder="e.g., Product Support Assistant"
                  required
                  className={`block w-full px-4 py-3 bg-gray-800/50 border rounded-xl shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-700/50'
                  }`}
                  disabled={isPending}
                />
                <FieldError error={validationErrors.name} />
              </div>

              {/* System Prompt Input */}
              <div>
                <PromptInput
                  value={systemPrompt}
                  onChange={(v) => { setSystemPrompt(v); }}
                  disabled={isPending}
                />
              </div>
            </div>
          </section>

          {/* Data Sources Section */}
          <section id="dataSources" className="glass rounded-xl p-6 xl:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{sectionIcons.dataSources}</span>
                <span>Data Sources</span>
              </h2>
              <p className="text-gray-400 mt-2">
                Add documents, websites, and text to train your chatbot
              </p>
            </div>

            <div className="space-y-8">
              {/* Text Input Section */}
              <div className="glass rounded-xl p-6">
                <label htmlFor="pasted-text" className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    Paste Text Content
                  </span>
                </label>
                <p className="text-xs text-gray-500 mb-4">Add any text content you want your chatbot to learn from.</p>
                <textarea
                  id="pasted-text"
                  rows={8}
                  value={pastedText}
                  onChange={(e) => { const v=e.target.value; setPastedText(v); }}
                  placeholder="Paste your content here..."
                  className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  disabled={isPending}
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>{pastedText.length} characters</span>
                  <span>Tip: Include FAQs, product info, or documentation</span>
                </div>
              </div>

              {/* Website Scrape Section */}
              <div className="glass rounded-xl p-6">
                <label htmlFor="website-url" className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    Website Scraping
                  </span>
                </label>
                <p className="text-xs text-gray-500 mb-4">Enter URLs to automatically extract content from websites.</p>
                <MultipleDomainInput
                  domains={websiteUrls}
                  onChange={setWebsiteUrls}
                  disabled={isPending}
                />
                {/* Show URL validation errors */}
                {Object.entries(validationErrors).filter(([key]) => key.startsWith('url_')).map(([key, error]) => (
                  <FieldError key={key} error={error} />
                ))}
              </div>

              {/* File Upload Section (Conditional based on mode) */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">📁</span>
                    Document Upload
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mb-4">Upload PDFs, text files, Markdown, or CSV documents.</p>
                {isEditMode && chatbotId ? (
                  <>
                    {/* Enhanced Processing Status Component */}
                    <EnhancedProcessingStatus chatbotId={chatbotId} />
                    
                    {/* Enhanced Document Upload Component */}
                    <EnhancedDocumentUpload chatbotId={chatbotId} disabled={isPending} />
                    
                    {/* Enhanced Document List Component */}
                    <EnhancedDocumentList chatbotId={chatbotId} />
                  </>
                ) : (
                  <div className="border-2 border-dashed border-gray-700/50 rounded-xl p-8 text-center hover:border-gray-600/50 transition-colors">
                    <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1">File Upload Available After Save</h3>
                    <p className="text-xs text-gray-500">Save your chatbot to enable document uploads</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section id="appearance" className="glass rounded-xl p-6 xl:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{sectionIcons.appearance}</span>
                <span>Appearance</span>
              </h2>
              <p className="text-gray-400 mt-2">
                Customize the look and feel of your chatbot
              </p>
            </div>

            <SimplifiedAppearanceTab
              chatbotId={chatbotId}
              settings={{
                primaryColor,
                secondaryColor,
                backgroundColor,
                textColor,
                fontFamily,
                welcomeMessage,
                headerText,
                inputPlaceholder,
                botAvatarUrl,
                userAvatarUrl,
                chatBubbleStyle,
                showBranding,
              }}
              onChange={(updates) => {
                if (updates.primaryColor !== undefined) setPrimaryColor(updates.primaryColor);
                if (updates.secondaryColor !== undefined) setSecondaryColor(updates.secondaryColor);
                if (updates.backgroundColor !== undefined) setBackgroundColor(updates.backgroundColor);
                if (updates.textColor !== undefined) setTextColor(updates.textColor);
                if (updates.fontFamily !== undefined) setFontFamily(updates.fontFamily);
                if (updates.welcomeMessage !== undefined) setWelcomeMessage(updates.welcomeMessage);
                if (updates.headerText !== undefined) setHeaderText(updates.headerText);
                if (updates.inputPlaceholder !== undefined) setInputPlaceholder(updates.inputPlaceholder);
                if (updates.botAvatarUrl !== undefined) setBotAvatarUrl(updates.botAvatarUrl);
                if (updates.userAvatarUrl !== undefined) setUserAvatarUrl(updates.userAvatarUrl);
                if (updates.chatBubbleStyle !== undefined) setChatBubbleStyle(updates.chatBubbleStyle);
                if (updates.showBranding !== undefined) setShowBranding(updates.showBranding);
                
                // Update the appearance context as well
                setAppearance(updates);
                
                // Trigger auto-save
                triggerAutoSave();
              }}
            />
          </section>

          {/* Embed Section */}
          <section id="embed" className="glass rounded-xl p-6 xl:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{sectionIcons.embed}</span>
                <span>Embed</span>
              </h2>
              <p className="text-gray-400 mt-2">
                Get the code to add your chatbot to any website
              </p>
            </div>

            {isEditMode && chatbotId ? (
              <EmbedCodeDisplay chatbotId={chatbotId} launcherIconUrl={botAvatarUrl} />
            ) : (
              <p className="text-gray-400">Embed code will be available after the chatbot is saved.</p>
            )}
          </section>

          {/* Actions Section */}
          <section id="actions" className="glass rounded-xl p-6 xl:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{sectionIcons.actions}</span>
                <span>Actions</span>
              </h2>
              <p className="text-gray-400 mt-2">
                Set up automated actions and workflows
              </p>
            </div>

            {isEditMode && chatbotId ? (
              <ActionManager chatbotId={chatbotId} />
            ) : (
              <p className="text-gray-400">Actions can be configured after the chatbot is saved.</p>
            )}
          </section>

          {/* Integrations Section */}
          <section id="integrations" className="glass rounded-xl p-6 xl:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{sectionIcons.integrations}</span>
                <span>Integrations</span>
              </h2>
              <p className="text-gray-400 mt-2">
                Connect your chatbot to external services
              </p>
            </div>

            {isEditMode && chatbotId ? (
              <IntegrationsPanel chatbotId={chatbotId} />
            ) : (
              <p className="text-gray-400">Integrations can be configured after the chatbot is saved.</p>
            )}
          </section>

          {/* Analytics Section */}
          <section id="analytics" className="glass rounded-xl p-6 xl:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{sectionIcons.analytics}</span>
                <span>Analytics</span>
              </h2>
              <p className="text-gray-400 mt-2">
                View chatbot performance and usage metrics
              </p>
            </div>

            {isEditMode && chatbotId ? (
              <AnalyticsPanel chatbotId={chatbotId} />
            ) : (
              <p className="text-gray-400">Analytics are available after the chatbot is saved and has activity.</p>
            )}
          </section>

          {/* Fixed Action Buttons */}
          <div className="sticky bottom-8 left-0 right-0 z-10">
            <div className="glass rounded-xl p-6 flex justify-end space-x-3">
              <LoadingButton
                isLoading={false}
                loadingText="Canceling..."
                onClick={handleCancel}
                disabled={isPending}
                variant="secondary"
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                isLoading={isPending || isRetrying}
                loadingText={isEditMode ? 'Updating...' : 'Saving...'}
                onClick={() => handleSave(false, false)}
                disabled={isPending || !isOnline}
              >
                {isEditMode ? 'Update Chatbot' : 'Save Chatbot'}
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
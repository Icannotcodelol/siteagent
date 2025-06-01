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
import EnhancedAppearanceTab from './enhanced-appearance-tab'

// Define possible tab values
type ActiveTab = 'settings' | 'dataSources' | 'appearance' | 'embed' | 'actions' | 'integrations' | 'analytics';

// Define props for the component
interface ChatbotBuilderFormProps {
  initialName?: string;
  initialSystemPrompt?: string;
  chatbotId?: string; // ID indicates edit mode
  documents?: any[]; // Add documents prop (use specific type if available)
  documentsError?: Error | null; // Add documents error prop
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
  documents = [],
  documentsError = null,
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
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
  const { setAppearance } = useChatbotAppearance();
  const supabase = createSupabaseBrowserClient();
  const { retry, retryCount, isRetrying, canRetry } = useRetry();
  
  // Auto-save timer ref
  const autoSaveTimer = useRef<NodeJS.Timeout>()

  const popularFontFamilies = [
    { name: "Inter (Modern Sans-Serif)", value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" },
    { name: "Roboto (Google Sans-Serif)", value: "'Roboto', sans-serif" },
    { name: "Open Sans (Google Sans-Serif)", value: "'Open Sans', sans-serif" },
    { name: "Lato (Google Sans-Serif)", value: "'Lato', sans-serif" },
    { name: "Montserrat (Google Sans-Serif)", value: "'Montserrat', sans-serif" },
    { name: "Nunito (Google Sans-Serif)", value: "'Nunito', sans-serif" },
    { name: "Arial (Classic Sans-Serif)", value: "Arial, Helvetica, sans-serif" },
    { name: "Verdana (Readable Sans-Serif)", value: "Verdana, Geneva, sans-serif" },
    { name: "Georgia (Classic Serif)", value: "Georgia, serif" },
    { name: "Times New Roman (Classic Serif)", value: "'Times New Roman', Times, serif" },
    { name: "Courier New (Monospace)", value: "'Courier New', Courier, monospace" },
  ];

  // Network status monitoring
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

  // Update state if props change (e.g., navigating between chatbots)
  useEffect(() => {
    setName(initialName);
    setSystemPrompt(initialSystemPrompt);
    setPastedText('');
    setWebsiteUrls([]);
    setValidationErrors({});
    setError(null);
  }, [initialName, initialSystemPrompt, chatbotId]);

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!name.trim()) {
      errors.name = 'Chatbot name is required'
    }
    
    if (name.trim().length > 100) {
      errors.name = 'Chatbot name must be less than 100 characters'
    }
    
    // Validate URLs
    websiteUrls.forEach((url, index) => {
      if (url.trim() && !url.match(/^https?:\/\/.+/)) {
        errors[`url_${index}`] = `Invalid URL format: ${url}`
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Auto-save functionality - DISABLED
  const triggerAutoSave = () => {
    // Auto-save disabled - manual save only
    return
  }

  // Auto-save trigger - DISABLED
  // useEffect(() => {
  //   triggerAutoSave()
  //   return () => {
  //     if (autoSaveTimer.current) {
  //       clearTimeout(autoSaveTimer.current)
  //     }
  //   }
  // }, [name, systemPrompt, pastedText, websiteUrls, primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, welcomeMessage, botAvatarUrl, userAvatarUrl, chatBubbleStyle, headerText, inputPlaceholder, showBranding])

  const initializeProgressSteps = (hasWebsiteUrls: boolean, hasPastedText: boolean) => {
    const steps = [
      {
        title: 'Creating chatbot',
        description: 'Setting up basic configuration',
        status: 'pending' as const
      }
    ]
    
    if (hasPastedText) {
      steps.push({
        title: 'Processing text content',
        description: 'Adding pasted text to knowledge base',
        status: 'pending' as const
      })
    }
    
    if (hasWebsiteUrls) {
      steps.push({
        title: 'Scraping websites',
        description: 'Extracting content from provided URLs',
        status: 'pending' as const
      })
    }
    
    steps.push({
      title: 'Finalizing setup',
      description: 'Completing chatbot configuration',
      status: 'pending' as const
    })
    
    setProgressSteps(steps)
    setCurrentStep(0)
  }

  const updateProgressStep = (stepIndex: number, status: 'processing' | 'completed' | 'failed', error?: string) => {
    setProgressSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, error } : step
    ))
    if (status === 'completed' || status === 'failed') {
      setCurrentStep(prev => prev + 1)
    }
  }

  // Helper function to get the next tab in the sequence
  const getNextTab = (currentTab: ActiveTab): ActiveTab | null => {
    const tabSequence: ActiveTab[] = ['settings', 'dataSources', 'appearance', 'embed', 'actions', 'integrations', 'analytics']
    const currentIndex = tabSequence.indexOf(currentTab)
    
    if (currentIndex >= 0 && currentIndex < tabSequence.length - 1) {
      return tabSequence[currentIndex + 1]
    }
    
    return null // No next tab (we're on the last tab)
  }

  // Helper function to check if current tab is the last tab
  const isLastTab = (currentTab: ActiveTab): boolean => {
    return currentTab === 'analytics'
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

      if (result?.success) {
        if (!isEditMode && result.chatbotId) {
          if (!silent) {
            setTimeout(() => {
              setShowProgress(false)
              router.push(`/dashboard/chatbot/${result.chatbotId}`)
            }, 1000)
          }
        } else if (isEditMode) {
          if (!silent) {
            console.log('Update successful');
            
            // Auto-advance to next tab if requested and we're in edit mode
            if (autoAdvance) {
              const nextTab = getNextTab(activeTab)
              if (nextTab) {
                setActiveTab(nextTab)
              }
            } else {
              router.refresh();
            }
          }
        } else {
          throw new Error('Chatbot created but failed to get ID.');
        }
      } else {
        throw new Error(result?.error || 'An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      const appError = createError('server', errorMessage, { retryable: true })
      setError(appError)
      
      if (!silent && !isEditMode && progressSteps.length > 0) {
        updateProgressStep(currentStep, 'failed', errorMessage)
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleRetry = async () => {
    if (!canRetry) return
    
    try {
      await retry(() => handleSave(false, isEditMode))
      setError(null)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(createError('server', errorMessage, { retryable: canRetry }))
    }
  }

  const handleCancel = () => {
    if (isEditMode) {
        router.back();
    } else {
        router.push('/dashboard');
    }
  }

  const handleFieldFocus = (field: string) => {
    // Focus on the field with validation error
    const element = document.getElementById(field) || document.querySelector(`[name="${field}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (element instanceof HTMLElement) {
        element.focus()
      }
    }
  }

  // Helper function for tab button classes
  const getTabClass = (tabName: ActiveTab) => {
    const isActive = activeTab === tabName;
    return `
      relative w-full text-left px-5 py-3 text-sm font-medium rounded-xl 
      transition-all duration-200 
      ${isActive 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
        : 'text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 hover:border-gray-600/50'
      }
      ${isActive ? 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-600/20 before:to-purple-600/20 before:blur-xl before:rounded-xl' : ''}
    `;
  };

  // Tab icon mapping
  const tabIcons: Record<ActiveTab, string> = {
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
          onRetry={error.retryable ? handleRetry : undefined}
        />
      )}
      
      {/* Network Status */}
      <NetworkStatus isOnline={isOnline} />
      
      {/* Validation Error Summary */}
      <ValidationErrorSummary 
        errors={validationErrors}
        onFieldFocus={handleFieldFocus}
      />

      {/* Auto-save Indicator - DISABLED */}
      {/* <div className="flex justify-between items-center mb-4">
        <div></div>
        <AutoSaveIndicator 
          status={autoSaveStatus}
          lastSaved={lastSaved}
          error={error?.message}
        />
      </div> */}

      {/* Main container: flex row, form card styling */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Vertical Tab Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="glass rounded-xl p-4 sticky top-24">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Configuration</h3>
            <div className="space-y-2">
              {Object.entries(tabIcons).map(([tab, icon]) => (
                <button 
                  key={tab}
                  type="button" 
                  className={getTabClass(tab as ActiveTab)} 
                  onClick={() => setActiveTab(tab as ActiveTab)}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <span className="capitalize">{tab === 'dataSources' ? 'Data Sources' : tab}</span>
                  </span>
                </button>
              ))}
              {isEditMode && chatbotId && (
                <a
                  href={`/dashboard/chatbot/${chatbotId}/interrogation`}
                  className="relative w-full text-left px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 hover:border-gray-600/50 flex items-center gap-3"
                >
                  <span className="text-lg">🔍</span>
                  <span>Interrogation</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tab Content Area */}
        <div className="flex-1">
          <div className="glass rounded-xl p-8">
            {/* Tab Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{tabIcons[activeTab]}</span>
                <span className="capitalize">{activeTab === 'dataSources' ? 'Data Sources' : activeTab}</span>
              </h2>
              <p className="text-gray-400 mt-2">
                {activeTab === 'settings' && 'Configure basic chatbot settings and behavior'}
                {activeTab === 'dataSources' && 'Add documents, websites, and text to train your chatbot'}
                {activeTab === 'appearance' && 'Customize the look and feel of your chatbot'}
                {activeTab === 'embed' && 'Get the code to add your chatbot to any website'}
                {activeTab === 'actions' && 'Set up automated actions and workflows'}
                {activeTab === 'integrations' && 'Connect your chatbot to external services'}
                {activeTab === 'analytics' && 'View chatbot performance and usage metrics'}
              </p>
            </div>

            {/* Settings Tab Content */}
            {activeTab === 'settings' && (
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
                
                {/* Action Buttons for this tab */}
                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
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
                    onClick={() => handleSave(false, isEditMode)}
                    disabled={isPending || !isOnline}
                  >
                    {isEditMode ? (isLastTab(activeTab) ? 'Update Chatbot' : 'Save & Continue →') : 'Save Chatbot'}
                  </LoadingButton>
                </div>
              </div>
            )}

             {/* Data Sources Tab Content */}
             {activeTab === 'dataSources' && (
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
                             {/* Processing Status Component */}
                             <ProcessingStatus chatbotId={chatbotId} />
                             
                             <DocumentUploadForm chatbotId={chatbotId} />
                             {documentsError && (
                                <div className="mt-4 bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl" role="alert">
                                    <strong className="font-bold">Error loading documents:</strong>
                                    <span className="block sm:inline"> {documentsError.message}</span>
                                </div>
                             )}
                             <DocumentList documents={documents ?? []} /> 
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
                    
                    {/* Action Buttons for this tab */}
                    <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
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
                        onClick={() => handleSave(false, isEditMode)}
                        disabled={isPending || !isOnline}
                      >
                        {isEditMode ? (isLastTab(activeTab) ? 'Update Chatbot' : 'Save & Continue →') : 'Save Chatbot'}
                      </LoadingButton>
                    </div>
                 </div>
             )}

             {/* Appearance Tab Content */}
             {activeTab === 'appearance' && (
                <div>
                  <EnhancedAppearanceTab
                    chatbotId={chatbotId}
                    isEditMode={isEditMode}
                    primaryColor={primaryColor}
                    setPrimaryColor={setPrimaryColor}
                    secondaryColor={secondaryColor}
                    setSecondaryColor={setSecondaryColor}
                    backgroundColor={backgroundColor}
                    setBackgroundColor={setBackgroundColor}
                    textColor={textColor}
                    setTextColor={setTextColor}
                    fontFamily={fontFamily}
                    setFontFamily={setFontFamily}
                    welcomeMessage={welcomeMessage}
                    setWelcomeMessage={setWelcomeMessage}
                    botAvatarUrl={botAvatarUrl}
                    setBotAvatarUrl={setBotAvatarUrl}
                    userAvatarUrl={userAvatarUrl}
                    setUserAvatarUrl={setUserAvatarUrl}
                    chatBubbleStyle={chatBubbleStyle}
                    setChatBubbleStyle={setChatBubbleStyle}
                    headerText={headerText}
                    setHeaderText={setHeaderText}
                    inputPlaceholder={inputPlaceholder}
                    setInputPlaceholder={setInputPlaceholder}
                    showBranding={showBranding}
                    setShowBranding={setShowBranding}
                    supabase={supabase}
                    setError={setError}
                    createError={createError}
                  />
                  
                  {/* Action Buttons for this tab */}
                  <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
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
                      onClick={() => handleSave(false, isEditMode)}
                      disabled={isPending || !isOnline}
                    >
                      {isEditMode ? (isLastTab(activeTab) ? 'Update Chatbot' : 'Save & Continue →') : 'Save Chatbot'}
                    </LoadingButton>
                  </div>
                </div>
             )}

             {/* Embed Tab Content */}
             {activeTab === 'embed' && (
                <div>
                    {isEditMode && chatbotId ? (
                        <EmbedCodeDisplay chatbotId={chatbotId} launcherIconUrl={botAvatarUrl} />
                     ) : (
                        <p className="text-gray-400">Embed code will be available after the chatbot is saved.</p>
                     )}
                     {/* Action Buttons for this tab (conditional for edit mode) */}
                     {isEditMode && chatbotId && (
                        <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
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
                            onClick={() => handleSave(false, isEditMode)}
                            disabled={isPending || !isOnline}
                          >
                            {isEditMode ? (isLastTab(activeTab) ? 'Update Chatbot' : 'Save & Continue →') : 'Save Chatbot'}
                          </LoadingButton>
                        </div>
                     )}
                </div>
             )}

             {/* Actions Tab Content */}
             {activeTab === 'actions' && (
                <div>
                    {isEditMode && chatbotId ? (
                        <ActionManager chatbotId={chatbotId} />
                     ) : (
                        <p className="text-gray-400">Actions can be configured after the chatbot is saved.</p>
                     )}
                     {/* Action Buttons for this tab (conditional for edit mode) */}
                     {isEditMode && chatbotId && (
                        <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
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
                            onClick={() => handleSave(false, isEditMode)}
                            disabled={isPending || !isOnline}
                          >
                            {isEditMode ? (isLastTab(activeTab) ? 'Update Chatbot' : 'Save & Continue →') : 'Save Chatbot'}
                          </LoadingButton>
                        </div>
                     )}
                </div>
             )}

             {/* Integrations Tab Content */}
             {activeTab === 'integrations' && (
                <div>
                    {isEditMode && chatbotId ? (
                        <IntegrationsPanel chatbotId={chatbotId} />
                     ) : (
                        <p className="text-gray-400">Integrations can be configured after the chatbot is saved.</p>
                     )}
                     {/* Action Buttons for this tab (conditional for edit mode) */}
                     {isEditMode && chatbotId && (
                        <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
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
                            onClick={() => handleSave(false, isEditMode)}
                            disabled={isPending || !isOnline}
                          >
                            {isEditMode ? (isLastTab(activeTab) ? 'Update Chatbot' : 'Save & Continue →') : 'Save Chatbot'}
                          </LoadingButton>
                        </div>
                     )}
                </div>
             )}

             {/* Analytics Tab Content */}
             {activeTab === 'analytics' && (
                <div>
                  {isEditMode && chatbotId ? (
                    <AnalyticsPanel chatbotId={chatbotId} />
                  ) : (
                    <p className="text-gray-400">Analytics are available after the chatbot is saved and has activity.</p>
                  )}
                </div>
             )}
           </div>
        </div>
      </div>
    </>
  )
} 
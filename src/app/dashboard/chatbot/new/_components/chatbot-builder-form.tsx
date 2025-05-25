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
import EmbedCodeDisplay from '../../[id]/_components/embed-code-display'
// Import the new (placeholder) Actions component
import ActionManager from '../../[id]/_components/action-manager'
// Import ChatInterface for the preview tab
import ChatInterface from '../../[id]/_components/chat-interface'
import IntegrationsPanel from '../../[id]/_components/integrations-panel'
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
type ActiveTab = 'settings' | 'dataSources' | 'appearance' | 'embed' | 'actions' | 'integrations';

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

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (!isEditMode || !name.trim()) return
    
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }
    
    autoSaveTimer.current = setTimeout(async () => {
      if (!validateForm()) return
      
      setAutoSaveStatus('saving')
      try {
        await handleSave(true) // Silent save
        setAutoSaveStatus('saved')
        setLastSaved(new Date())
        setTimeout(() => setAutoSaveStatus('idle'), 3000)
      } catch (error) {
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus('idle'), 5000)
      }
    }, 2000)
  }

  // Trigger auto-save when form data changes
  useEffect(() => {
    triggerAutoSave()
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [name, systemPrompt, pastedText, websiteUrls, primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, welcomeMessage, botAvatarUrl, userAvatarUrl, chatBubbleStyle, headerText, inputPlaceholder, showBranding])

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

  const handleSave = async (silent = false) => {
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
            router.refresh();
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
      await retry(() => handleSave())
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
    return `w-full text-left px-4 py-3 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-150 ${activeTab === tabName 
        ? 'bg-purple-600 text-white shadow-md' 
        : 'text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white'}`;
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

      {/* Auto-save Indicator */}
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <AutoSaveIndicator 
          status={autoSaveStatus}
          lastSaved={lastSaved}
          error={error?.message}
        />
      </div>

      {/* Main container: flex row, form card styling */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700">
        {/* Left Column: Vertical Tab Navigation */}
        <div className="md:w-1/4 lg:w-1/5 border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6">
          <div className="flex flex-row md:flex-col md:space-y-2 overflow-x-auto md:overflow-x-visible">
              <button type="button" className={`${getTabClass('settings')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('settings')}>Settings</button>
              <button type="button" className={`${getTabClass('dataSources')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('dataSources')}>Data Sources</button>
              <button type="button" className={`${getTabClass('appearance')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('appearance')}>Appearance</button>
              <button type="button" className={`${getTabClass('embed')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('embed')}>Embed Code</button>
              <button type="button" className={`${getTabClass('actions')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('actions')}>Actions</button>
              <button type="button" className={`${getTabClass('integrations')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('integrations')}>Integrations</button>
          </div>
        </div>

        {/* Right Column: Tab Content Area */}
        <div className="flex-1 min-h-[400px]">

          {/* Settings Tab Content */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="chatbot-name" className="block text-sm font-medium text-gray-300 mb-1">
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
                  className={`block w-full px-3 py-2 bg-gray-800 border rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-700'
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
                  onClick={() => handleSave()}
                  disabled={isPending || !isOnline}
                >
                  {isEditMode ? 'Update Chatbot' : 'Save Chatbot'}
                </LoadingButton>
              </div>
            </div>
          )}

           {/* Data Sources Tab Content */}
           {activeTab === 'dataSources' && (
               <div className="space-y-6">
                   {/* Text Input Section */}
                   <div>
                      <label htmlFor="pasted-text" className="block text-sm font-medium text-gray-300 mb-1">
                          Paste Text
                      </label>
                      <p className="text-xs text-gray-500 mb-2">Paste any text content you want the chatbot to know about.</p>
                      <textarea
                          id="pasted-text"
                          rows={8}
                          value={pastedText}
                          onChange={(e) => { const v=e.target.value; setPastedText(v); }}
                          placeholder="Paste text here..."
                          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          disabled={isPending}
                      />
                   </div>

                   {/* Website Scrape Section */}
                   <div>
                      <label htmlFor="website-url" className="block text-sm font-medium text-gray-300 mb-1">
                          Scrape Website
                      </label>
                      <p className="text-xs text-gray-500 mb-2">Enter URLs to scrape text content from websites.</p>
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
                  <div className="border-t border-gray-700 pt-6">
                       <h3 className="text-sm font-medium text-gray-300 mb-1">Upload Files</h3>
                       <p className="text-xs text-gray-500 mb-3">Upload documents like PDF, TXT, or MD.</p>
                       {isEditMode && chatbotId ? (
                         <>
                           <DocumentUploadForm chatbotId={chatbotId} />
                           {documentsError && (
                              <div className="mt-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative" role="alert">
                                  <strong className="font-bold">Error loading documents:</strong>
                                  <span className="block sm:inline"> {documentsError.message}</span>
                              </div>
                           )}
                           <DocumentList documents={documents ?? []} /> 
                         </>
                       ) : (
                          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                              <svg className="mx-auto h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>
                              <h3 className="mt-2 text-sm font-medium text-white">Upload Files</h3>
                              <p className="mt-1 text-sm text-gray-500">Save the chatbot first to enable file uploads.</p>
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
                      onClick={() => handleSave()}
                      disabled={isPending || !isOnline}
                    >
                      {isEditMode ? 'Update Chatbot' : 'Save Chatbot'}
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
                    onClick={() => handleSave()}
                    disabled={isPending || !isOnline}
                  >
                    {isEditMode ? 'Update Chatbot' : 'Save Chatbot'}
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
                          onClick={() => handleSave()}
                          disabled={isPending || !isOnline}
                        >
                          {isEditMode ? 'Update Chatbot' : 'Save Chatbot'}
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
                          onClick={() => handleSave()}
                          disabled={isPending || !isOnline}
                        >
                          {isEditMode ? 'Update Chatbot' : 'Save Chatbot'}
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
                          onClick={() => handleSave()}
                          disabled={isPending || !isOnline}
                        >
                          {isEditMode ? 'Update Chatbot' : 'Save Chatbot'}
                        </LoadingButton>
                      </div>
                   )}
              </div>
           )}
         </div>
      </div>
    </>
  )
} 
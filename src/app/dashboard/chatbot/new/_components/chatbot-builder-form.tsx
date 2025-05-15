'use client'

import { useState, useEffect } from 'react'
import { createClient as createSupabaseBrowserClient } from '@/lib/supabase/client'
// We will update the action import later
import { createChatbotAction, updateChatbotAction } from '../actions'
import { useRouter } from 'next/navigation'
import PromptInput from './prompt-input' // Import the new component

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
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  // Update state if props change (e.g., navigating between chatbots)
  useEffect(() => {
    setName(initialName);
    setSystemPrompt(initialSystemPrompt);
    setPastedText('');
    setWebsiteUrl('');
  }, [initialName, initialSystemPrompt, chatbotId]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Chatbot name cannot be empty.')
      return
    }
    
    setIsPending(true)
    setError(null)

    const dataToSave = {
      name: name.trim(),
      system_prompt: systemPrompt.trim(),
      pasted_text: pastedText.trim(),
      website_url: websiteUrl.trim(),
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

    let result;
    if (isEditMode) {
      // Call update action - Pass all relevant fields from dataToSave
      result = await updateChatbotAction(chatbotId, { 
          name: dataToSave.name, 
          system_prompt: dataToSave.system_prompt,
          pasted_text: dataToSave.pasted_text, // Pass pasted text
          website_url: dataToSave.website_url,  // Pass website URL
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
      // Call create action
      result = await createChatbotAction(dataToSave);
    }

    setIsPending(false)

    // Defensive check: Ensure result is defined before accessing properties
    if (result?.success) { // Use optional chaining (?.)
      if (!isEditMode && result.chatbotId) {
         // Redirect only on successful creation
         router.push(`/dashboard/chatbot/${result.chatbotId}`)
      } else if (isEditMode) {
          // Optionally show a success message for updates
          console.log('Update successful');
          // Revalidate data on the current page after update
          router.refresh();
      } else {
          // Handle case where creation succeeded but ID missing (shouldn't happen)
          setError('Chatbot created but failed to get ID.');
      }
    } else {
      // If result exists and success is false, or if result is undefined
      setError(result?.error || 'An unexpected error occurred. Please try again.'); // Use optional chaining here too
    }
  }

  const handleCancel = () => {
    // Go back or to dashboard? For edit mode, back might be better.
    if (isEditMode) {
        router.back();
    } else {
        router.push('/dashboard');
    }
  }

  // Helper function for tab button classes
  const getTabClass = (tabName: ActiveTab) => {
    // Match target styling: Purple background for active, slightly lighter gray for inactive
    return `px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${activeTab === tabName 
        ? 'bg-purple-600 text-white' 
        : 'text-gray-300 bg-gray-800 hover:bg-gray-700'}`;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation - ADD Settings and Actions buttons */}
      <div className="border-b border-gray-200 pb-3">
        <div className="flex space-x-3 flex-wrap gap-y-2"> {/* Added flex-wrap and gap-y-2 for responsiveness */}
            <button type="button" className={getTabClass('settings')} onClick={() => setActiveTab('settings')}>Settings</button>
            <button type="button" className={getTabClass('dataSources')} onClick={() => setActiveTab('dataSources')}>Data Sources</button>
            <button type="button" className={getTabClass('appearance')} onClick={() => setActiveTab('appearance')}>Appearance</button>
            <button type="button" className={getTabClass('embed')} onClick={() => setActiveTab('embed')}>Embed Code</button>
            <button type="button" className={getTabClass('actions')} onClick={() => setActiveTab('actions')}>Actions</button>
            <button type="button" className={getTabClass('integrations')} onClick={() => setActiveTab('integrations')}>Integrations</button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="pt-4 min-h-[300px]"> {/* Increased min-height slightly */}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Name Input - MOVED HERE */}
            <div>
              <label htmlFor="chatbot-name" className="block text-sm font-medium text-gray-300 mb-1">
                Chatbot Name
              </label>
              <input
                type="text"
                id="chatbot-name"
                value={name}
                onChange={(e) => { const v=e.target.value; setName(v); }}
                placeholder="e.g., Product Support Assistant"
                required
                className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                disabled={isPending}
              />
            </div>

            {/* System Prompt Input - MOVED HERE */}
            <PromptInput
              value={systemPrompt}
              onChange={(v) => { setSystemPrompt(v); }}
              disabled={isPending}
            />
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
                        rows={8} // Give it a decent height
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
                    <p className="text-xs text-gray-500 mb-2">Enter a URL to scrape text content from the website.</p>
                    <input
                        type="url" // Use URL type for basic validation
                        id="website-url"
                        value={websiteUrl}
                        onChange={(e) => { const v=e.target.value; setWebsiteUrl(v); }}
                        placeholder="https://example.com"
                        className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        disabled={isPending}
                    />
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
                         {/* We might want to show the list here ONLY in edit mode */}
                         <DocumentList documents={documents ?? []} /> 
                       </>
                     ) : (
                        // Placeholder for create mode
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                            <svg className="mx-auto h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>
                            <h3 className="mt-2 text-sm font-medium text-white">Upload Files</h3>
                            <p className="mt-1 text-sm text-gray-500">Save the chatbot first to enable file uploads.</p>
                        </div>
                     )}
                </div>
             </div>
         )}

         {/* Appearance Tab Content */}
         {activeTab === 'appearance' && (
            <div className="space-y-6">
                {/* Color Pickers */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Primary Color</label>
                  <input type="color" value={primaryColor} onChange={(e) => { const v=e.target.value; setPrimaryColor(v); setAppearance({primaryColor: v}); }} className="w-12 h-8 p-0 border-none bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Secondary Color</label>
                  <input type="color" value={secondaryColor} onChange={(e) => { const v=e.target.value; setSecondaryColor(v); setAppearance({secondaryColor: v}); }} className="w-12 h-8 p-0 border-none bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Background Color</label>
                  <input type="color" value={backgroundColor} onChange={(e) => { const v=e.target.value; setBackgroundColor(v); setAppearance({backgroundColor: v}); }} className="w-12 h-8 p-0 border-none bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Text Color</label>
                  <input type="color" value={textColor} onChange={(e) => { const v=e.target.value; setTextColor(v); setAppearance({textColor: v}); }} className="w-12 h-8 p-0 border-none bg-transparent" />
                </div>
                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Font Family</label>
                  <input type="text" value={fontFamily} onChange={(e) => { const v=e.target.value; setFontFamily(v); setAppearance({fontFamily: v}); }} placeholder="e.g. Inter, Arial, sans-serif" className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
                {/* Welcome Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Welcome Message</label>
                  <input type="text" value={welcomeMessage} onChange={(e) => { const v=e.target.value; setWelcomeMessage(v); setAppearance({welcomeMessage: v}); }} placeholder="e.g. Hi! How can I help you today?" className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
                {/* Bot Avatar URL & Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bot Avatar</label>
                  <input
                      type="url"
                      value={botAvatarUrl}
                      onChange={(e) => { const v=e.target.value; setBotAvatarUrl(v); setAppearance({botAvatarUrl: v}); }}
                      placeholder="https://..."
                      className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                  {/* Upload input (only in edit mode) */}
                  {isEditMode && chatbotId && (
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // Validate file size (<=2MB)
                        if (file.size > 2 * 1024 * 1024) {
                          setError('Avatar file is too large (max 2MB).');
                          return;
                        }
                        // Upload to Supabase Storage
                        const fileExt = file.name.split('.').pop();
                        const filePath = `${chatbotId}/launcher-icon.${fileExt}`;
                        const { error: uploadError } = await supabase.storage.from('chatbot-avatars').upload(filePath, file, {
                          cacheControl: '3600',
                          upsert: true,
                          contentType: file.type,
                        });
                        if (uploadError) {
                          console.error('Avatar upload error', uploadError);
                          setError('Failed to upload avatar.');
                          return;
                        }
                        const { data: publicData } = supabase.storage.from('chatbot-avatars').getPublicUrl(filePath);
                        if (publicData?.publicUrl) {
                          setBotAvatarUrl(publicData.publicUrl);
                          setAppearance({ botAvatarUrl: publicData.publicUrl });
                        }
                      }}
                      className="block w-full text-sm text-gray-300 file:bg-gray-700 file:border-0 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-200 hover:file:bg-gray-600"
                    />
                  )}
                  {!isEditMode && (
                    <p className="text-xs text-gray-500">Save the chatbot first to enable avatar uploads.</p>
                  )}
                </div>
                {/* User Avatar URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">User Avatar URL</label>
                  <input type="url" value={userAvatarUrl} onChange={(e) => { const v=e.target.value; setUserAvatarUrl(v); setAppearance({userAvatarUrl: v}); }} placeholder="https://..." className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
                {/* Chat Bubble Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Chat Bubble Style</label>
                  <select value={chatBubbleStyle} onChange={(e) => { const v=e.target.value; setChatBubbleStyle(v); setAppearance({chatBubbleStyle: v}); }} className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                {/* Header Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Header Text</label>
                  <input type="text" value={headerText} onChange={(e) => { const v=e.target.value; setHeaderText(v); setAppearance({headerText: v}); }} placeholder="e.g. Chat with us!" className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
                {/* Input Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Input Placeholder</label>
                  <input type="text" value={inputPlaceholder} onChange={(e) => { const v=e.target.value; setInputPlaceholder(v); setAppearance({inputPlaceholder: v}); }} placeholder="Type your message..." className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
                {/* Show Branding Toggle */}
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-branding" checked={showBranding} onChange={(e) => { const checked=e.target.checked; setShowBranding(checked); setAppearance({showBranding: checked}); }} className="form-checkbox h-5 w-5 text-purple-600" />
                  <label htmlFor="show-branding" className="text-sm text-gray-300">Show Branding</label>
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
            </div>
         )}
       </div>

      {/* Error Display (Keep as is for now) */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Action Buttons - Match target style */}
       <div className="flex justify-end gap-3 pt-5 border-t border-gray-700">
          {/* Cancel Button: Lighter gray */}
          <button
             type="button"
             onClick={handleCancel}
             disabled={isPending}
             className="inline-flex justify-center py-2 px-4 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50"
          >
             Cancel
          </button>
          {/* Save Button: Purple */}
          <button
             type="button" 
             onClick={handleSave} 
             disabled={isPending}
             className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isPending ? 'bg-purple-800 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500`}
          >
             {isPending ? 'Saving...' : (isEditMode ? 'Update Chatbot' : 'Save Chatbot')}
          </button>
       </div>
    </div>
  )
} 
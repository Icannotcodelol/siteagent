'use client'

import { useState, useEffect } from 'react'
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

  // Update state if props change (e.g., navigating between chatbots)
  useEffect(() => {
    setName(initialName);
    setSystemPrompt(initialSystemPrompt);
    setPastedText('');
    setWebsiteUrls([]);
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

    let result;
    if (isEditMode) {
      // Call update action - Pass all relevant fields from dataToSave
      result = await updateChatbotAction(chatbotId, { 
          name: dataToSave.name, 
          system_prompt: dataToSave.system_prompt,
          pasted_text: dataToSave.pasted_text, // Pass pasted text
          website_urls: dataToSave.website_urls,  // Pass website URLs array
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
    return `w-full text-left px-4 py-3 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-150 ${activeTab === tabName 
        ? 'bg-purple-600 text-white shadow-md' 
        : 'text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white'}`;
  };

  return (
    // Main container: flex row, form card styling
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700">
      {/* Left Column: Vertical Tab Navigation */}
      <div className="md:w-1/4 lg:w-1/5 border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6">
        <div className="flex flex-row md:flex-col md:space-y-2 overflow-x-auto md:overflow-x-visible">
            {/* Horizontal scroll for mobile, vertical stack for md+ */}
            <button type="button" className={`${getTabClass('settings')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('settings')}>Settings</button>
            <button type="button" className={`${getTabClass('dataSources')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('dataSources')}>Data Sources</button>
            <button type="button" className={`${getTabClass('appearance')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('appearance')}>Appearance</button>
            <button type="button" className={`${getTabClass('embed')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('embed')}>Embed Code</button>
            <button type="button" className={`${getTabClass('actions')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('actions')}>Actions</button>
            <button type="button" className={`${getTabClass('integrations')} md:w-full whitespace-nowrap mr-2 md:mr-0`} onClick={() => setActiveTab('integrations')}>Integrations</button>
        </div>
      </div>

      {/* Right Column: Tab Content Area */}
      <div className="flex-1 min-h-[400px]"> {/* Increased min-height */}

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
            {/* Action Buttons for this tab */}
            <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
              <button type="button" onClick={handleCancel} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                {isPending ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Chatbot' : 'Save Chatbot')}
              </button>
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
                    <p className="text-xs text-gray-500 mb-2">Enter URLs to scrape text content from websites.</p>
                    <MultipleDomainInput
                        domains={websiteUrls}
                        onChange={setWebsiteUrls}
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
                {/* Action Buttons for this tab */}
                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
                  <button type="button" onClick={handleCancel} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                    {isPending ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Chatbot' : 'Save Chatbot')}
                  </button>
                </div>
             </div>
         )}

         {/* Appearance Tab Content */}
         {activeTab === 'appearance' && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Chatbot Appearance</h3>
                {/* Color Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-300 mb-1">Primary Color</label>
                    <input type="color" id="primaryColor" value={primaryColor || '#9333ea'} onChange={(e) => { const v = e.target.value; setPrimaryColor(v); setAppearance({ primaryColor: v }); }} className="w-full h-10 px-1 py-1 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-300 mb-1">Secondary Color</label>
                    <input type="color" id="secondaryColor" value={secondaryColor || '#f3f4f6'} onChange={(e) => { const v = e.target.value; setSecondaryColor(v); setAppearance({ secondaryColor: v }); }} className="w-full h-10 px-1 py-1 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-300 mb-1">Background Color</label>
                    <input type="color" id="backgroundColor" value={backgroundColor || '#ffffff'} onChange={(e) => { const v = e.target.value; setBackgroundColor(v); setAppearance({ backgroundColor: v }); }} className="w-full h-10 px-1 py-1 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="textColor" className="block text-sm font-medium text-gray-300 mb-1">Text Color</label>
                    <input type="color" id="textColor" value={textColor || '#222222'} onChange={(e) => { const v = e.target.value; setTextColor(v); setAppearance({ textColor: v }); }} className="w-full h-10 px-1 py-1 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                </div>

                {/* Font Family Dropdown */}
                <div>
                  <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-300 mb-1">Font Family</label>
                  <select
                    id="fontFamily"
                    value={fontFamily}
                    onChange={(e) => { const v = e.target.value; setFontFamily(v); setAppearance({ fontFamily: v }); }}
                    className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  >
                    <option value="">Select a font (default)</option>
                    {popularFontFamilies.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Ensure the selected font is loaded on your website for the widget to display it correctly.
                  </p>
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
                {/* Action Buttons for this tab */}
                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end space-x-3">
                  <button type="button" onClick={handleCancel} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                    {isPending ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Chatbot' : 'Save Chatbot')}
                  </button>
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
                      <button type="button" onClick={handleCancel} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                        Cancel
                      </button>
                      <button type="button" onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                        {isPending ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Chatbot' : 'Save Chatbot')}
                      </button>
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
                      <button type="button" onClick={handleCancel} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                        Cancel
                      </button>
                      <button type="button" onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                        {isPending ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Chatbot' : 'Save Chatbot')}
                      </button>
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
                      <button type="button" onClick={handleCancel} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                        Cancel
                      </button>
                      <button type="button" onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors">
                        {isPending ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Chatbot' : 'Save Chatbot')}
                      </button>
                    </div>
                 )}
            </div>
         )}
       </div>

      {/* Action Buttons (Save/Cancel) - REMOVED FROM HERE */}
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  )
} 
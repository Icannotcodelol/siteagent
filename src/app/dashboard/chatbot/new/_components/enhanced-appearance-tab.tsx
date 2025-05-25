'use client'

import { useState, useEffect, useTransition } from 'react'
import { SwatchIcon, EyeIcon, SparklesIcon, PaintBrushIcon, ChatBubbleLeftRightIcon, PhotoIcon, BellIcon } from '@heroicons/react/24/outline'
import { useChatbotAppearance } from './chatbot-appearance-context'
import ChatPreview from './chat-preview'
import { 
  ProactiveMessage,
  upsertProactiveMessage,
  deleteProactiveMessage,
  getProactiveMessageForChatbot
} from '@/app/actions/proactive-messages'
import { ErrorType } from './error-handling'

interface EnhancedAppearanceTabProps {
  chatbotId?: string
  isEditMode: boolean
  primaryColor: string
  setPrimaryColor: (color: string) => void
  secondaryColor: string
  setSecondaryColor: (color: string) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  textColor: string
  setTextColor: (color: string) => void
  fontFamily: string
  setFontFamily: (font: string) => void
  welcomeMessage: string
  setWelcomeMessage: (message: string) => void
  botAvatarUrl: string
  setBotAvatarUrl: (url: string) => void
  userAvatarUrl: string
  setUserAvatarUrl: (url: string) => void
  chatBubbleStyle: string
  setChatBubbleStyle: (style: string) => void
  headerText: string
  setHeaderText: (text: string) => void
  inputPlaceholder: string
  setInputPlaceholder: (placeholder: string) => void
  showBranding: boolean
  setShowBranding: (show: boolean) => void
  supabase: any
  setError: (error: any) => void
  createError: (type: ErrorType, message: string, options?: any) => any
}

// Color palette presets
const colorPresets = [
  { name: 'Purple', primary: '#9333ea', secondary: '#f3f4f6', background: '#ffffff', text: '#222222' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#eff6ff', background: '#ffffff', text: '#1e293b' },
  { name: 'Green', primary: '#10b981', secondary: '#f0fdf4', background: '#ffffff', text: '#064e3b' },
  { name: 'Orange', primary: '#f97316', secondary: '#fff7ed', background: '#ffffff', text: '#9a3412' },
  { name: 'Pink', primary: '#ec4899', secondary: '#fdf2f8', background: '#ffffff', text: '#831843' },
  { name: 'Dark', primary: '#6366f1', secondary: '#374151', background: '#111827', text: '#f9fafb' },
]

// Font families with better categorization
const fontCategories = {
  'Modern Sans-Serif': [
    { name: "Inter", value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    { name: "Roboto", value: "'Roboto', sans-serif" },
    { name: "Open Sans", value: "'Open Sans', sans-serif" },
    { name: "Lato", value: "'Lato', sans-serif" },
    { name: "Montserrat", value: "'Montserrat', sans-serif" },
    { name: "Nunito", value: "'Nunito', sans-serif" },
  ],
  'Classic': [
    { name: "Arial", value: "Arial, Helvetica, sans-serif" },
    { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  ],
  'Monospace': [
    { name: "Courier New", value: "'Courier New', Courier, monospace" },
    { name: "Monaco", value: "Monaco, 'Lucida Console', monospace" },
  ]
}

// Chat bubble style options
const bubbleStyles = [
  { name: 'Rounded', value: 'rounded', preview: 'rounded-lg' },
  { name: 'Square', value: 'square', preview: 'rounded-md' },
  { name: 'Pill', value: 'pill', preview: 'rounded-full' },
  { name: 'Minimal', value: 'minimal', preview: 'rounded-sm' },
]

export default function EnhancedAppearanceTab(props: EnhancedAppearanceTabProps) {
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'layout' | 'content' | 'proactive' | 'preview'>('colors')
  const [showPreview, setShowPreview] = useState(false)
  const { setAppearance } = useChatbotAppearance()
  
  // Proactive message state
  const [isPending, startTransition] = useTransition()
  const [proactiveMessage, setProactiveMessage] = useState<ProactiveMessage | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [delaySeconds, setDelaySeconds] = useState(5)
  const [isProactiveEnabled, setIsProactiveEnabled] = useState(true)
  const [proactiveColor, setProactiveColor] = useState('#111827')

  const sections = [
    { id: 'colors', name: 'Colors & Theme', icon: SwatchIcon },
    { id: 'typography', name: 'Typography', icon: PaintBrushIcon },
    { id: 'layout', name: 'Layout & Style', icon: ChatBubbleLeftRightIcon },
    { id: 'content', name: 'Content & Media', icon: PhotoIcon },
    { id: 'proactive', name: 'Proactive Messages', icon: BellIcon },
    { id: 'preview', name: 'Live Preview', icon: EyeIcon },
  ]

  // Load proactive message data when in edit mode
  useEffect(() => {
    if (props.isEditMode && props.chatbotId) {
      const loadProactiveMessage = async () => {
        try {
          const data = await getProactiveMessageForChatbot(props.chatbotId!)
          if (data) {
            setProactiveMessage(data)
            setMessageContent(data.message_content)
            setDelaySeconds(data.delay_seconds)
            setIsProactiveEnabled(data.is_enabled)
            setProactiveColor(data.color || '#111827')
          }
        } catch (error) {
          console.error('Failed to load proactive message:', error)
        }
      }
      loadProactiveMessage()
    }
  }, [props.isEditMode, props.chatbotId])

  // Proactive message handlers
  const handleSaveProactiveMessage = async () => {
    if (!props.chatbotId) return
    
    startTransition(async () => {
      try {
        const result = await upsertProactiveMessage(
          props.chatbotId!,
          {
            message_content: messageContent,
            delay_seconds: delaySeconds,
            is_enabled: isProactiveEnabled,
            color: proactiveColor,
          },
          proactiveMessage?.id
        )
        
        if (result.error) {
          props.setError(props.createError('server', result.error))
        } else if (result.data) {
          setProactiveMessage(result.data)
        }
      } catch (error) {
        props.setError(props.createError('server', 'Failed to save proactive message'))
      }
    })
  }

  const handleDeleteProactiveMessage = async () => {
    if (!proactiveMessage?.id || !props.chatbotId) return
    
    startTransition(async () => {
      try {
        const result = await deleteProactiveMessage(proactiveMessage.id, props.chatbotId!)
        
        if (result.error) {
          props.setError(props.createError('server', result.error))
        } else {
          setProactiveMessage(null)
          setMessageContent('')
          setDelaySeconds(5)
          setIsProactiveEnabled(true)
          setProactiveColor('#111827')
        }
      } catch (error) {
        props.setError(props.createError('server', 'Failed to delete proactive message'))
      }
    })
  }

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    props.setPrimaryColor(preset.primary)
    props.setSecondaryColor(preset.secondary)
    props.setBackgroundColor(preset.background)
    props.setTextColor(preset.text)
    setAppearance({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.background,
      textColor: preset.text,
    })
  }

  const handleColorChange = (colorType: string, value: string) => {
    switch (colorType) {
      case 'primary':
        props.setPrimaryColor(value)
        setAppearance({ primaryColor: value })
        break
      case 'secondary':
        props.setSecondaryColor(value)
        setAppearance({ secondaryColor: value })
        break
      case 'background':
        props.setBackgroundColor(value)
        setAppearance({ backgroundColor: value })
        break
      case 'text':
        props.setTextColor(value)
        setAppearance({ textColor: value })
        break
    }
  }

  const ColorPicker = ({ label, value, onChange, description }: { 
    label: string
    value: string
    onChange: (value: string) => void
    description?: string
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value || '#9333ea'}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={value || '#9333ea'}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-purple-400" />
          <span>Chatbot Appearance</span>
        </h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Section Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{section.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right: Section Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Colors & Theme Section */}
          {activeSection === 'colors' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Color Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      className="p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                          {preset.name}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: preset.primary }} />
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: preset.secondary }} />
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: preset.background }} />
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: preset.text }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={props.primaryColor}
                  onChange={(value) => handleColorChange('primary', value)}
                  description="Main brand color for buttons and highlights"
                />
                <ColorPicker
                  label="Secondary Color"
                  value={props.secondaryColor}
                  onChange={(value) => handleColorChange('secondary', value)}
                  description="Background color for header and input areas"
                />
                <ColorPicker
                  label="Background Color"
                  value={props.backgroundColor}
                  onChange={(value) => handleColorChange('background', value)}
                  description="Main chat area background"
                />
                <ColorPicker
                  label="Text Color"
                  value={props.textColor}
                  onChange={(value) => handleColorChange('text', value)}
                  description="Primary text color"
                />
              </div>
            </div>
          )}

          {/* Typography Section */}
          {activeSection === 'typography' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Font Family</h4>
                {Object.entries(fontCategories).map(([category, fonts]) => (
                  <div key={category} className="mb-6">
                    <h5 className="text-sm font-medium text-gray-400 mb-3">{category}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {fonts.map((font) => (
                        <button
                          key={font.value}
                          onClick={() => {
                            props.setFontFamily(font.value)
                            setAppearance({ fontFamily: font.value })
                          }}
                          className={`p-3 text-left rounded-lg border transition-colors ${
                            props.fontFamily === font.value
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                          style={{ fontFamily: font.value }}
                        >
                          <span className="text-white text-sm">{font.name}</span>
                          <p className="text-xs text-gray-400 mt-1">The quick brown fox</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layout & Style Section */}
          {activeSection === 'layout' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Chat Bubble Style</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {bubbleStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => {
                        props.setChatBubbleStyle(style.value)
                        setAppearance({ chatBubbleStyle: style.value })
                      }}
                      className={`p-4 rounded-lg border transition-colors ${
                        props.chatBubbleStyle === style.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className={`w-full h-8 bg-purple-600 mb-2 ${style.preview}`} />
                      <span className="text-sm text-gray-300">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h5 className="text-sm font-medium text-white">Show Branding</h5>
                  <p className="text-xs text-gray-400">Display "Powered by SiteAgent" footer</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={props.showBranding}
                    onChange={(e) => {
                      props.setShowBranding(e.target.checked)
                      setAppearance({ showBranding: e.target.checked })
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Content & Media Section */}
          {activeSection === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Welcome Message</label>
                <textarea
                  value={props.welcomeMessage}
                  onChange={(e) => {
                    props.setWelcomeMessage(e.target.value)
                    setAppearance({ welcomeMessage: e.target.value })
                  }}
                  placeholder="Hi! How can I help you today?"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Header Text</label>
                <input
                  type="text"
                  value={props.headerText}
                  onChange={(e) => {
                    props.setHeaderText(e.target.value)
                    setAppearance({ headerText: e.target.value })
                  }}
                  placeholder="Chat with us!"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Input Placeholder</label>
                <input
                  type="text"
                  value={props.inputPlaceholder}
                  onChange={(e) => {
                    props.setInputPlaceholder(e.target.value)
                    setAppearance({ inputPlaceholder: e.target.value })
                  }}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bot Avatar URL</label>
                  <input
                    type="url"
                    value={props.botAvatarUrl}
                    onChange={(e) => {
                      props.setBotAvatarUrl(e.target.value)
                      setAppearance({ botAvatarUrl: e.target.value })
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                  {props.isEditMode && props.chatbotId && (
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 2 * 1024 * 1024) {
                          props.setError(props.createError('validation', 'Avatar file is too large (max 2MB).'))
                          return
                        }
                        const fileExt = file.name.split('.').pop()
                        const filePath = `${props.chatbotId}/launcher-icon.${fileExt}`
                        const { error: uploadError } = await props.supabase.storage
                          .from('chatbot-avatars')
                          .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: true,
                            contentType: file.type,
                          })
                        if (uploadError) {
                          props.setError(props.createError('server', 'Failed to upload avatar.'))
                          return
                        }
                        const { data: publicData } = props.supabase.storage
                          .from('chatbot-avatars')
                          .getPublicUrl(filePath)
                        if (publicData?.publicUrl) {
                          props.setBotAvatarUrl(publicData.publicUrl)
                          setAppearance({ botAvatarUrl: publicData.publicUrl })
                        }
                      }}
                      className="mt-2 block w-full text-sm text-gray-300 file:bg-gray-700 file:border-0 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-200 hover:file:bg-gray-600 file:rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User Avatar URL</label>
                  <input
                    type="url"
                    value={props.userAvatarUrl}
                    onChange={(e) => {
                      props.setUserAvatarUrl(e.target.value)
                      setAppearance({ userAvatarUrl: e.target.value })
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Proactive Messages Section */}
          {activeSection === 'proactive' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Proactive Messages</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Configure a message that appears automatically to engage visitors after a specified delay.
                </p>
              </div>

              {props.isEditMode && props.chatbotId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h5 className="text-sm font-medium text-white">Enable Proactive Messages</h5>
                      <p className="text-xs text-gray-400">Show automatic messages to engage visitors</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isProactiveEnabled}
                        onChange={(e) => setIsProactiveEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message Content</label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="👋 Hi! How can I help you today?"
                      maxLength={255}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {255 - messageContent.length} characters remaining
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Delay (seconds)</label>
                      <input
                        type="number"
                        value={delaySeconds}
                        onChange={(e) => setDelaySeconds(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        min="0"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        How long to wait before showing the message
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bubble Color</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={proactiveColor}
                          onChange={(e) => setProactiveColor(e.target.value)}
                          className="w-12 h-12 rounded-lg border border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={proactiveColor}
                          onChange={(e) => setProactiveColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm font-mono"
                          placeholder="#111827"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSaveProactiveMessage}
                      disabled={isPending || !messageContent.trim()}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
                    >
                      {isPending ? 'Saving...' : (proactiveMessage ? 'Update Message' : 'Create Message')}
                    </button>
                    {proactiveMessage && (
                      <button
                        type="button"
                        onClick={handleDeleteProactiveMessage}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
                      >
                        {isPending ? 'Deleting...' : 'Delete Message'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Proactive messages can be configured after saving the chatbot</p>
                </div>
              )}
            </div>
          )}

          {/* Live Preview Section */}
          {activeSection === 'preview' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Live Preview</h4>
              <div className="h-96 border border-gray-700 rounded-lg overflow-hidden">
                {props.chatbotId ? (
                  <ChatPreview
                    chatbotId={props.chatbotId}
                    primaryColor={props.primaryColor}
                    secondaryColor={props.secondaryColor}
                    backgroundColor={props.backgroundColor}
                    textColor={props.textColor}
                    fontFamily={props.fontFamily}
                    welcomeMessage={props.welcomeMessage}
                    botAvatarUrl={props.botAvatarUrl}
                    userAvatarUrl={props.userAvatarUrl}
                    chatBubbleStyle={props.chatBubbleStyle}
                    headerText={props.headerText}
                    inputPlaceholder={props.inputPlaceholder}
                    showBranding={props.showBranding}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <EyeIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <p>Preview will be available after saving the chatbot</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Preview Panel */}
      {showPreview && props.chatbotId && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h5 className="text-sm font-medium text-white">Live Preview</h5>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="h-[calc(100%-48px)]">
            <ChatPreview
              chatbotId={props.chatbotId}
              primaryColor={props.primaryColor}
              secondaryColor={props.secondaryColor}
              backgroundColor={props.backgroundColor}
              textColor={props.textColor}
              fontFamily={props.fontFamily}
              welcomeMessage={props.welcomeMessage}
              botAvatarUrl={props.botAvatarUrl}
              userAvatarUrl={props.userAvatarUrl}
              chatBubbleStyle={props.chatBubbleStyle}
              headerText={props.headerText}
              inputPlaceholder={props.inputPlaceholder}
              showBranding={props.showBranding}
            />
          </div>
        </div>
      )}
    </div>
  )
} 
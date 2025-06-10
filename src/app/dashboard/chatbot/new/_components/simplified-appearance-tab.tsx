"use client";

import { useState, useEffect, useTransition } from "react";
import { SwatchIcon, EyeIcon, SparklesIcon, BellIcon } from "@heroicons/react/24/outline";
import ColorPicker from "./color-picker";
import FontDropdown from "./font-dropdown";
import {
  ProactiveMessage,
  getProactiveMessageForChatbot,
  upsertProactiveMessage,
  deleteProactiveMessage,
} from '@/app/actions/proactive-messages';

interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  welcomeMessage: string;
  headerText: string;
  inputPlaceholder: string;
  botAvatarUrl: string;
  userAvatarUrl: string;
  chatBubbleStyle: string;
  showBranding: boolean;
}

interface SimplifiedAppearanceTabProps {
  settings: AppearanceSettings;
  onChange: (updates: Partial<AppearanceSettings>) => void;
  chatbotId?: string;
}

const colorPresets = [
  { name: "Purple", colors: { primaryColor: "#9333ea", secondaryColor: "#f3f4f6", backgroundColor: "#ffffff", textColor: "#222222" } },
  { name: "Blue", colors: { primaryColor: "#3b82f6", secondaryColor: "#eff6ff", backgroundColor: "#ffffff", textColor: "#1e293b" } },
  { name: "Green", colors: { primaryColor: "#10b981", secondaryColor: "#f0fdf4", backgroundColor: "#ffffff", textColor: "#064e3b" } },
  { name: "Orange", colors: { primaryColor: "#f97316", secondaryColor: "#fff7ed", backgroundColor: "#ffffff", textColor: "#9a3412" } },
  { name: "Pink", colors: { primaryColor: "#ec4899", secondaryColor: "#fdf2f8", backgroundColor: "#ffffff", textColor: "#831843" } },
  { name: "Dark", colors: { primaryColor: "#6366f1", secondaryColor: "#374151", backgroundColor: "#111827", textColor: "#f9fafb" } },
];

const bubbleStyles = [
  { name: "Rounded", value: "rounded", className: "rounded-lg" },
  { name: "Square", value: "square", className: "rounded-sm" },
  { name: "Pill", value: "pill", className: "rounded-full" },
];

export default function SimplifiedAppearanceTab({ settings, onChange, chatbotId }: SimplifiedAppearanceTabProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Proactive message state
  const [isPending, startTransition] = useTransition();
  const [proactiveMessage, setProactiveMessage] = useState<ProactiveMessage | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [isProactiveEnabled, setIsProactiveEnabled] = useState(true);
  const [proactiveColor, setProactiveColor] = useState('#111827');

  // Load existing proactive message when editing an existing chatbot
  useEffect(() => {
    if (!chatbotId) return;
    const load = async () => {
      try {
        const data = await getProactiveMessageForChatbot(chatbotId);
        if (data) {
          setProactiveMessage(data);
          setMessageContent(data.message_content);
          setDelaySeconds(data.delay_seconds);
          setIsProactiveEnabled(data.is_enabled);
          setProactiveColor(data.color || '#111827');
        }
      } catch (err) {
        console.error('Failed to load proactive message:', err);
      }
    };
    load();
  }, [chatbotId]);

  const handleSaveProactive = async () => {
    if (!chatbotId) return;
    startTransition(async () => {
      const result = await upsertProactiveMessage(
        chatbotId,
        {
          message_content: messageContent,
          delay_seconds: delaySeconds,
          is_enabled: isProactiveEnabled,
          color: proactiveColor,
        },
        proactiveMessage?.id,
      );
      if (result.error) {
        console.error('Failed to save proactive message:', result.error);
      } else if (result.data) {
        setProactiveMessage(result.data);
      }
    });
  };

  const handleDeleteProactive = async () => {
    if (!chatbotId || !proactiveMessage?.id) return;
    startTransition(async () => {
      const res = await deleteProactiveMessage(proactiveMessage.id, chatbotId);
      if (res.error) {
        console.error('Failed to delete proactive message:', res.error);
      } else {
        setProactiveMessage(null);
        setMessageContent('');
        setDelaySeconds(5);
        setIsProactiveEnabled(true);
        setProactiveColor('#111827');
      }
    });
  };

  const updateSetting = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    onChange({ [key]: value });
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    onChange(preset.colors);
  };

  const getCurrentPreset = () => {
    return colorPresets.find(preset => 
      preset.colors.primaryColor === settings.primaryColor &&
      preset.colors.secondaryColor === settings.secondaryColor &&
      preset.colors.backgroundColor === settings.backgroundColor &&
      preset.colors.textColor === settings.textColor
    );
  };

  const currentPreset = getCurrentPreset();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="h-6 w-6 text-purple-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">Chatbot Appearance</h3>
            <p className="text-sm text-gray-400">Customize your chatbot's look and feel</p>
          </div>
        </div>
        {chatbotId && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            <span>{showPreview ? "Hide" : "Show"} Preview</span>
          </button>
        )}
      </div>

      {/* Color Theme Section */}
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-white mb-2">Color Theme</h4>
          <p className="text-sm text-gray-400 mb-4">
            Choose a preset or customize individual colors. 
            {currentPreset && <span className="text-purple-400"> Currently using: {currentPreset.name}</span>}
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <h5 className="text-sm font-medium text-gray-300 mb-3">Quick Presets</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyColorPreset(preset)}
                className={`p-3 rounded-lg border transition-all group relative ${
                  currentPreset?.name === preset.name
                    ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-600"
                    style={{ backgroundColor: preset.colors.primaryColor }}
                  />
                  <span className={`text-sm font-medium ${
                    currentPreset?.name === preset.name ? "text-white" : "text-gray-300 group-hover:text-white"
                  }`}>
                    {preset.name}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded border border-gray-700" style={{ backgroundColor: preset.colors.primaryColor }} />
                  <div className="w-3 h-3 rounded border border-gray-700" style={{ backgroundColor: preset.colors.secondaryColor }} />
                  <div className="w-3 h-3 rounded border border-gray-700" style={{ backgroundColor: preset.colors.backgroundColor }} />
                  <div className="w-3 h-3 rounded border border-gray-700" style={{ backgroundColor: preset.colors.textColor }} />
                </div>
                {currentPreset?.name === preset.name && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div>
          <h5 className="text-sm font-medium text-gray-300 mb-3">Custom Colors</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorPicker
              label="Primary Color"
              value={settings.primaryColor}
              onChange={(value) => updateSetting("primaryColor", value)}
              description="Main brand color for buttons and highlights"
            />
            <ColorPicker
              label="Secondary Color"
              value={settings.secondaryColor}
              onChange={(value) => updateSetting("secondaryColor", value)}
              description="Border color for input field and accent elements"
            />
            <ColorPicker
              label="Background Color"
              value={settings.backgroundColor}
              onChange={(value) => updateSetting("backgroundColor", value)}
              description="Main chat area background"
            />
            <ColorPicker
              label="Text Color"
              value={settings.textColor}
              onChange={(value) => updateSetting("textColor", value)}
              description="Primary text color"
            />
          </div>
        </div>
      </div>

      {/* Style & Layout Section */}
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-white mb-2">Style & Layout</h4>
          <p className="text-sm text-gray-400">Customize fonts, chat bubbles, and layout elements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Font Family */}
          <FontDropdown
            label="Font Family"
            value={settings.fontFamily}
            onChange={(value) => updateSetting("fontFamily", value)}
            description="Choose the typography for your chatbot"
          />

          {/* Chat Bubble Style */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Chat Bubble Style</label>
            <div className="space-y-2">
              {bubbleStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateSetting("chatBubbleStyle", style.value)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center space-x-3 ${
                    settings.chatBubbleStyle === style.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className={`w-8 h-6 bg-purple-600 ${style.className}`} />
                  <span className="text-white text-sm">{style.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-white mb-2">Content & Messages</h4>
          <p className="text-sm text-gray-400">Configure the text content and messages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Welcome Message</label>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => updateSetting("welcomeMessage", e.target.value)}
                placeholder="Hi! How can I help you today?"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Header Text</label>
              <input
                type="text"
                value={settings.headerText}
                onChange={(e) => updateSetting("headerText", e.target.value)}
                placeholder="Chat with us!"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Input Placeholder</label>
              <input
                type="text"
                value={settings.inputPlaceholder}
                onChange={(e) => updateSetting("inputPlaceholder", e.target.value)}
                placeholder="Type your message..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bot Avatar URL</label>
              <input
                type="url"
                value={settings.botAvatarUrl}
                onChange={(e) => updateSetting("botAvatarUrl", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">User Avatar URL</label>
              <input
                type="url"
                value={settings.userAvatarUrl}
                onChange={(e) => updateSetting("userAvatarUrl", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h5 className="text-sm font-medium text-white">Show Branding</h5>
                <p className="text-xs text-gray-400">Display "Powered by SiteAgent" footer</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showBranding}
                  onChange={(e) => updateSetting("showBranding", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Proactive Message Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BellIcon className="h-6 w-6 text-purple-400" />
          <h4 className="text-lg font-medium text-white">Proactive Message</h4>
        </div>
        <p className="text-sm text-gray-400 max-w-2xl">
          Configure an automatic message that appears after a delay to engage visitors.
        </p>

        {chatbotId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h5 className="text-sm font-medium text-white">Enable Proactive Message</h5>
                <p className="text-xs text-gray-400">Show automatic message to engage visitors</p>
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message Content</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="👋 Hi! How can I help you today?"
                  maxLength={255}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-400">{255 - messageContent.length} characters remaining.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Delay (seconds)</label>
                  <input
                    type="number"
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    min={0}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bubble Color</label>
                  <input
                    type="color"
                    value={proactiveColor}
                    onChange={(e) => setProactiveColor(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-700 p-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                {proactiveMessage && (
                  <button
                    type="button"
                    onClick={handleDeleteProactive}
                    disabled={isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
                  >
                    {isPending ? 'Deleting...' : 'Delete'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveProactive}
                  disabled={isPending || !messageContent.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
                >
                  {isPending ? 'Saving...' : (proactiveMessage ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Save your chatbot to enable proactive messages.</p>
        )}
      </div>
    </div>
  );
} 
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface AppearanceSettings {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  fontFamily?: string | null;
  welcomeMessage?: string | null;
  botAvatarUrl?: string | null;
  userAvatarUrl?: string | null;
  chatBubbleStyle?: string | null;
  headerText?: string | null;
  inputPlaceholder?: string | null;
  showBranding?: boolean | null;
}

interface ChatbotAppearanceContextValue {
  appearance: AppearanceSettings;
  setAppearance: (updates: Partial<AppearanceSettings>) => void;
}

const ChatbotAppearanceContext = createContext<ChatbotAppearanceContextValue | undefined>(
  undefined
);

export function ChatbotAppearanceProvider({
  initialAppearance,
  children,
}: {
  initialAppearance: AppearanceSettings;
  children: ReactNode;
}) {
  const [appearance, setAppearanceState] = useState<AppearanceSettings>(
    initialAppearance
  );

  const setAppearance = (updates: Partial<AppearanceSettings>) => {
    setAppearanceState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ChatbotAppearanceContext.Provider value={{ appearance, setAppearance }}>
      {children}
    </ChatbotAppearanceContext.Provider>
  );
}

export function useChatbotAppearance() {
  const ctx = useContext(ChatbotAppearanceContext);
  if (!ctx) {
    throw new Error(
      "useChatbotAppearance must be used within ChatbotAppearanceProvider"
    );
  }
  return ctx;
} 
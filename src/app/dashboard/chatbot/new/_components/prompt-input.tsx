'use client'

import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  return (
    <div className="glass rounded-xl p-6">
      <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-300 mb-2">
        <span className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          System Prompt
        </span>
      </label>
      <p className="text-xs text-gray-500 mb-4">
        Define your chatbot's personality, knowledge, and behavior. Be specific about tone, expertise, and any limitations.
      </p>
      <textarea
        id="system-prompt"
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="You are a helpful AI assistant specialized in customer support. You should be friendly, professional, and knowledgeable about our products..."
        className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono text-sm"
        disabled={disabled}
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-4 text-xs text-gray-500">
          <span>{value.length} characters</span>
          <span>•</span>
          <span>~{Math.ceil(value.length / 4)} tokens</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            onClick={() => onChange("You are a helpful and friendly AI assistant. Be concise, accurate, and professional in your responses.")}
          >
            Use Basic Template
          </button>
        </div>
      </div>
    </div>
  );
} 
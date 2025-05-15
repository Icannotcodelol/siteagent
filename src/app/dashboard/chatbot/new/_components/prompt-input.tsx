'use client'

import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ value, onChange, disabled = false }: PromptInputProps) {
  return (
    <div>
      <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 mb-1">
        System Prompt
      </label>
      <textarea
        id="system-prompt"
        rows={6}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-700 disabled:opacity-70"
        placeholder={`Define the chatbot's personality, instructions, and rules (e.g., "You are a friendly assistant focusing on product X."). Leave blank to use a default prompt.`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        disabled={disabled}
      />
      <p className="mt-2 text-sm text-gray-500">
        This prompt guides how your chatbot responds to questions.
      </p>
    </div>
  );
} 
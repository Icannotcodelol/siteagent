'use client'

import { useState, useTransition, useEffect } from 'react';
import { updateSystemPrompt } from '@/app/actions'; // Import the server action

interface PromptEditorProps {
  chatbotId: string;
  initialPrompt: string | null; // The prompt value fetched by the server component
}

export default function PromptEditor({ chatbotId, initialPrompt }: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt ?? '');
  const [isPending, startTransition] = useTransition(); // For loading state during action
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update local state if the initialPrompt prop changes (e.g., after revalidation)
  useEffect(() => {
    setPrompt(initialPrompt ?? '');
  }, [initialPrompt]);

  const handleSave = () => {
    setSaveStatus('idle'); // Reset status
    setErrorMsg(null);
    startTransition(async () => {
      const result = await updateSystemPrompt(chatbotId, prompt);
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000); // Show success briefly
      } else {
        setSaveStatus('error');
        setErrorMsg(result.error || 'An unknown error occurred.');
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded shadow-md space-y-4">
      <div>
        <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
          System Prompt
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Define the chatbot's personality, instructions, and rules (e.g., "You are a friendly assistant focusing on product X."). Leave blank to use a default prompt.
        </p>
        <textarea
          id="systemPrompt"
          rows={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="Enter system prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={isPending || prompt === (initialPrompt ?? '')} // Disable if pending or unchanged
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Prompt'}
          </button>
          {saveStatus === 'success' && <p className="text-sm text-green-600">Saved successfully!</p>}
          {saveStatus === 'error' && <p className="text-sm text-red-600">Error: {errorMsg}</p>}
      </div>
    </div>
  );
} 
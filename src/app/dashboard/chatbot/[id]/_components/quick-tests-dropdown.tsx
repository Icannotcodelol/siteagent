'use client'

export default function QuickTestsDropdown() {
  const fillInput = (text: string) => {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
      input.value = text;
      input.focus();
    }
  }

  return (
    <div className="relative group">
      <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Tests
      </button>
      <div className="absolute right-0 z-10 hidden group-hover:block w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
        <div className="py-2">
          <button 
            onClick={() => fillInput("What are your main services?")}
            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            📋 "What are your main services?"
          </button>
          <button 
            onClick={() => fillInput("How do I get started?")}
            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            🚀 "How do I get started?"
          </button>
          <button 
            onClick={() => fillInput("What is your pricing?")}
            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            💰 "What is your pricing?"
          </button>
          <button 
            onClick={() => fillInput("Can you help me with something completely unrelated?")}
            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            🔍 "Can you help me with something completely unrelated?"
          </button>
        </div>
      </div>
    </div>
  )
} 
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BuilderHeaderProps {
  title?: string; // Optional title, defaults to "Create New Chatbot"
}

// Basic header component for the builder layout
export default function BuilderHeader({ title = "Create New Chatbot" }: BuilderHeaderProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    // Force full navigation in case client-side routing is obstructed
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header className="relative mb-8">
      {/* Decorative gradient layer. Placed behind content and made non-interactive */}
      <div className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-3xl" />
      
      <div className="relative glass rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-800/50 group-hover:bg-gray-700/50 flex items-center justify-center transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
            </button>
            
            {/* Title and breadcrumb */}
            <div className="border-l border-gray-700 pl-6">
              <nav className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <button onClick={handleBack} className="hover:text-gray-300 transition-colors text-left">
                  Dashboard
                </button>
                <span>/</span>
                <span className="text-gray-400">Chatbots</span>
                <span>/</span>
                <span className="text-gray-300 font-medium">
                  {title === "Create New Chatbot" ? "New" : "Edit"}
                </span>
              </nav>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">{title}</span>
              </h1>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Auto-saving</span>
            </div>
          </div>
        </div>
        
        {/* Progress indicator for new chatbots */}
        {title === "Create New Chatbot" && (
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-shimmer" />
            </div>
            <span className="text-xs text-gray-400">Step 1 of 3</span>
          </div>
        )}
      </div>
    </header>
  );
} 
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BuilderHeaderProps {
  // Add title prop if needed for edit page
  title?: string; 
}

// Basic header component for the builder layout
export default function BuilderHeader({ title = "Create New Chatbot" }: BuilderHeaderProps) {
  const router = useRouter()

  // Use router.back() for a potentially better UX than always going to dashboard
  // const handleBack = () => router.back(); 
  
  return (
    <header className="mb-6 flex items-center gap-4 pb-4 border-b border-gray-200">
       {/* Back Button/Link */}
       <button 
          onClick={() => router.back()} 
          className="text-gray-500 hover:text-gray-700"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
       </button>
       
       {/* Title */}
       <h1 className="text-xl font-semibold text-gray-900 whitespace-nowrap">
           {title} {/* Use prop for title */} 
       </h1>
       
       {/* Spacer */}
       <div className="flex-grow"></div>
       
       {/* Placeholder Links - Use NavLink component if active styling needed */} 
       <div className="hidden md:flex items-center space-x-4">
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Templates</Link>
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Documentation</Link>
       </div>

       {/* Placeholder Icons */}
       <div className="flex items-center space-x-3">
         <button className="text-gray-500 hover:text-gray-700">
            {/* Bell Icon */} 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
         </button>
         <button className="text-gray-500 hover:text-gray-700">
           {/* User Icon - replace with avatar later */} 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 rounded-full"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
         </button>
       </div>
    </header>
  );
} 
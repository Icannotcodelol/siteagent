// Removed 'use client' directive if present

// Import necessary functions
// import { createServerClient, type CookieOptions } from '@supabase/ssr' // Remove direct import
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server' // Import shared client function
import Link from 'next/link'
import Image from 'next/image'
import UserMenu from './_components/user-menu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Call createClient without arguments
  // const cookieStore = await cookies() // No longer needed here
  const supabase = createClient() // No argument

  // Remove old direct client creation code
  /*
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
      },
    }
  )
  */

  // Fetch user session
  const { data, error } = await supabase.auth.getUser()

  // If error fetching user or no user, redirect to login
  if (error || !data?.user) {
    console.log('Auth error or no user found in layout, redirecting to /login')
    redirect('/login')
  }

  // User is authenticated, render the layout
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <header className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - fallback to native anchor for rock-solid navigation */}
            <a href="/dashboard" className="flex items-center space-x-3 group">
              <Image 
                src="/sitelogo.svg" 
                alt="SiteAgent Logo" 
                width={32} 
                height={32}
                className="transition-opacity group-hover:opacity-80"
                priority
              />
              <span className="text-xl font-semibold group-hover:text-indigo-400 transition-colors">
                SiteAgent
              </span>
            </a>

            {/* User Menu - Single, proper dropdown */}
            <UserMenu user={data.user} />
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-900 text-center p-4 text-sm text-gray-400 border-t border-gray-800">
        &copy; {new Date().getFullYear()} SiteAgent
      </footer>
    </div>
  )
} 
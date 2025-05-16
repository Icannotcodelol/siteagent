// Removed 'use client' directive if present

// Import necessary functions
// import { createServerClient, type CookieOptions } from '@supabase/ssr' // Remove direct import
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from './_components/LogoutButton'
import { createClient } from '@/lib/supabase/server' // Import shared client function
import Image from 'next/image'; // Import Next.js Image component

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
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md border-b border-gray-800">
        <div className="flex items-center gap-2">
          {/* Replace existing logo with Next.js Image component */}
          <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={150} height={32} priority /> 
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <h1 className="text-xl font-semibold">SiteAgent Chatbots</h1> */}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">{data.user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-grow p-6 bg-gray-950">
        {children}
      </main>
      <footer className="bg-gray-900 text-center p-2 text-sm text-gray-400 border-t border-gray-800">
        &copy; {new Date().getFullYear()} SiteAgent
      </footer>
    </div>
  )
} 
// Removed 'use client' directive if present

// Import necessary functions
// import { createServerClient, type CookieOptions } from '@supabase/ssr' // Remove direct import
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from './_components/LogoutButton'
import { createClient } from '@/lib/supabase/server' // Import shared client function

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
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">SiteAgent Chatbots</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">{data.user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-grow p-6 bg-gray-100">
        {children}
      </main>
      <footer className="bg-gray-200 text-center p-2 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} SiteAgent
      </footer>
    </div>
  )
} 
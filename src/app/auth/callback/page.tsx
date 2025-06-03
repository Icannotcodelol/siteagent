// Server Component that finalises the Supabase OAuth flow and sets the
// authentication cookies before redirecting the user to the dashboard.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface CallbackPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function AuthCallback({ searchParams }: CallbackPageProps) {
  const supabase = createClient()

  // The OAuth provider redirects back with a `code` query parameter.
  const code = typeof searchParams.code === 'string' ? searchParams.code : undefined

  if (!code) {
    console.error('Auth callback invoked without code parameter')
    redirect('/login')
  }

  // 1. Exchange the auth code for a session. This will set the
  //    "sb-access-token" and related cookies on the response so that
  //    subsequent Server Components can access the authenticated user.
  const { error } = await supabase.auth.exchangeCodeForSession(code!)

  // 2. If the exchange fails, send the user back to the login page.
  if (error) {
    console.error('Auth callback error:', error.message)
    redirect('/login')
  }

  // 3. On success, redirect the user to their dashboard.
  redirect('/dashboard')
} 
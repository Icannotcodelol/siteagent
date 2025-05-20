'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionExists, setSessionExists] = useState(false)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionExists(true)
      } else if (session) {
        // If there's a session but it's not from password recovery,
        // it implies the user might have navigated here directly or is already logged in.
        // For password update, we strictly need the PASSWORD_RECOVERY event.
        // However, if Supabase handles the token in the URL automatically and establishes a session,
        // we can proceed if a session exists.
        setSessionExists(true)
      } else {
        // Check for access_token in URL hash, typical for Supabase recovery links
        const hash = window.location.hash
        const params = new URLSearchParams(hash.substring(1)) // remove #
        const accessToken = params.get('access_token')
        const type = params.get('type')

        if (type === 'recovery' && accessToken) {
          // Supabase client JS library should automatically handle this and trigger PASSWORD_RECOVERY event.
          // If it doesn't, manual handling might be complex and less secure.
          // For now, we rely on onAuthStateChange.
          console.log('Recovery token found in URL, waiting for onAuthStateChange.')
        } else if (!session) {
          // No session and no recovery token in URL after a short delay could mean invalid/expired link
          // or user navigated here without a token.
          // We give a little time for onAuthStateChange to fire.
          setTimeout(() => {
            if (!sessionExists) {
              setError(
                'No valid session found for password recovery. Please try the recovery link again or request a new one.'
              )
            }
          }, 2000)
        }
      }
    })

    // Check if session already exists on mount (e.g. if Supabase client already processed the token)
    const checkInitialSession = async () => {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
            setSessionExists(true)
        }
    }
    checkInitialSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router, sessionExists])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!sessionExists) {
      setError('Cannot update password. Session not established. Please ensure you have accessed this page via the password recovery link.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Password updated successfully! Redirecting to login...')
      // Clear the hash from the URL
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Update Your Password</h1>
        
        {!sessionExists && !error && (
          <p className="text-center text-gray-600">Verifying recovery link... Please wait.</p>
        )}

        {sessionExists && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button
              type="submit"
              disabled={loading || !sessionExists}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
        {error && !sessionExists && (
            <p className="text-sm text-red-600 text-center">{error}</p>
        )}
        {sessionExists && !success && (
             <button
                onClick={() => router.push('/login')}
                className="w-full px-4 py-2 mt-4 text-sm font-medium text-indigo-600 bg-transparent border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Cancel and go to Login
            </button>
        )}
      </div>
    </div>
  )
} 
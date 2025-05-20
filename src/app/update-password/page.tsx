'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionVerified, setSessionVerified] = useState(false)

  useEffect(() => {
    // This effect should run once on mount to check if the user landed here
    // from a password recovery link. Supabase client handles the URL hash.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // This event means the user has successfully clicked the recovery link
          // and Supabase has verified the token.
          // The session object here is a temporary session that allows password update.
          console.log('Password recovery event detected, session:', session)
          if (session) {
            setSessionVerified(true)
            setMessage('Recovery token verified. Please set your new password.')
          } else {
            setError('Invalid or expired recovery session. Please request a new password reset.')
            // Consider redirecting to request-password-reset page or login
          }
        } else if (event === 'USER_UPDATED') {
            // This event is triggered after a successful password update.
            // However, we set the message directly in handleUpdatePassword for more immediate feedback.
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!sessionVerified) {
      setError('Password recovery session not verified. Please use a valid recovery link.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      setError(`Failed to update password: ${updateError.message}`)
    } else {
      setMessage('Password updated successfully! You can now log in with your new password.')
      // Optionally clear form and redirect to login after a delay
      setNewPassword('')
      setConfirmPassword('')
      setSessionVerified(false) // Prevent re-submission
      // router.push('/login');
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
            className="mx-auto h-12 w-auto"
            src="/logo.png" // Replace with your logo
            alt="SiteAgent"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set a new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!sessionVerified && !error && (
            <p className="text-center text-gray-600">
              Verifying recovery link... If you did not click a password recovery link, please
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500"> sign in </Link>
              or
              <Link href="/request-password-reset" className="font-medium text-indigo-600 hover:text-indigo-500"> request a new reset link</Link>.
            </p>
          )}

          {sessionVerified && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password (min. 6 characters)
                </label>
                <div className="mt-1">
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">Error: {error}</p>}
              {message && !error && <p className="text-sm text-green-600">{message}</p>}

              <div>
                <button
                  type="submit"
                  disabled={loading || !sessionVerified}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
           {/* Show error message if session verification failed immediately */}
          {error && !sessionVerified && (
             <p className="mt-4 text-center text-sm text-red-600">Error: {error}</p>
          )}
          
          {/* Link to login if password was successfully updated */}
          {message && !error && !loading && !sessionVerified && (
             <div className="mt-4 text-center text-sm">
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Proceed to Login
                </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/app/_components/ui/button'
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
]

export default function SignupForm() {
  const router = useRouter()
  const supabase = createClient()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // UI state
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Check if user is already logged in and redirect if they are
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (user && !error) {
          router.push('/dashboard')
        }
      } catch (error) {
        // Ignore auth errors on signup page - user is not logged in
        console.debug('No active session on signup page, continuing with signup flow')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  // Validation helpers
  const isEmailValid = email.includes('@') && email.includes('.')
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const isPasswordStrong = passwordRequirements.every(req => req.test(password))
  const isFormValid = isEmailValid && isPasswordStrong && passwordsMatch

  const handleGoogleSignUp = async () => {
    setError(null)
    setGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
        }
      })

      if (error) {
        console.error('Google sign-up error:', error.message)
        setError('Failed to sign up with Google. Please try again.')
      }
      // Note: If successful, user will be redirected, so no need to handle success here
    } catch (error) {
      console.error('Unexpected Google sign-up error:', error)
      setError('An unexpected error occurred with Google sign-up. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!isFormValid) {
      setError('Please fix the validation errors above')
      return
    }

    setLoading(true)

    try {
      // Clear any existing session/auth state before signup
      await supabase.auth.signOut({ scope: 'local' })
      
      // Also clear cookies via API to ensure clean state
      try {
        await fetch('/api/auth/clear-session', { method: 'POST' })
      } catch (e) {
        console.debug('Cookie clearing failed, continuing with signup')
      }
      
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        }
      })

      if (signUpError) {
        console.error('Signup error:', signUpError)
        console.error('Signup error details:', {
          message: signUpError.message,
          status: signUpError.status,
          code: signUpError.status ? 'AuthError' : 'UnknownError'
        })
        
        // Provide more specific error messages for common issues
        if (signUpError.message.includes('refresh_token_not_found')) {
          setError('Authentication session error. Please try refreshing the page and signing up again.')
        } else if (signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please try logging in instead.')
        } else {
          setError(signUpError.message)
        }
      } else {
        setSuccess(true)
        // Clear form
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred. Please refresh the page and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to SiteAgent!</h3>
        <p className="text-sm text-gray-600 mb-6">
          We've sent a verification link to <strong>{email}</strong>. 
          Click the link to activate your SiteAgent account and start building intelligent chatbots.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• Check your spam folder if you don't see the email</p>
          <p>• The link will expire in 24 hours</p>
        </div>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setSuccess(false)}
        >
          Back to signup
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Google Sign-Up Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
        disabled={loading || googleLoading}
        className="w-full h-11 text-base font-medium border-gray-300 hover:bg-gray-50"
      >
        {googleLoading ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Signing up with Google...
          </>
        ) : (
          <>
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up to SiteAgent with Google
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSignup} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors sm:text-sm ${
                emailFocused || email
                  ? isEmailValid
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="you@example.com"
              disabled={loading || googleLoading}
            />
            {email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isEmailValid ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors sm:text-sm ${
                passwordFocused || password
                  ? isPasswordStrong
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="Create a strong password"
              disabled={loading || googleLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          
          {/* Password Requirements */}
          {(passwordFocused || password) && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center text-sm">
                  {req.test(password) ? (
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={req.test(password) ? 'text-green-700' : 'text-red-700'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors sm:text-sm ${
                confirmPassword
                  ? passwordsMatch
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="Confirm your password"
              disabled={loading || googleLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {confirmPassword && (
            <div className="mt-1 flex items-center text-sm">
              {passwordsMatch ? (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-green-700">Passwords match</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700">Passwords don't match</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <X className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || googleLoading || !isFormValid}
          className="w-full h-11 text-base font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating your account...
            </>
          ) : (
            'Create SiteAgent account'
          )}
        </Button>

        {/* Login link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">Already have a SiteAgent account? </span>
          <Link
            href="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
} 
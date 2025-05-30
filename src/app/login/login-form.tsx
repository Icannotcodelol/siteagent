'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/app/_components/ui/button'
import { Eye, EyeOff, Check, X, Loader2, Mail } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // UI state
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)

  // Validation helpers
  const isEmailValid = email.includes('@') && email.includes('.')
  const isFormValid = isEmailValid && password.length > 0

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!isFormValid) {
      setError('Please enter a valid email and password')
      return
    }

    setLoading(true)

    try {
      // Clear any existing session/auth state before login
      await supabase.auth.signOut({ scope: 'local' })
      
      // Also clear cookies via API to ensure clean state
      try {
        await fetch('/api/auth/clear-session', { method: 'POST' })
      } catch (e) {
        console.debug('Cookie clearing failed, continuing with login')
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Login error:', signInError.message)
        
        // Provide more user-friendly error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else {
          setError(signInError.message)
        }
      } else {
        // Login successful, redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
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
            className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors sm:text-sm ${
              emailFocused || email
                ? isEmailValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
            placeholder="you@example.com"
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {email ? (
              isEmailValid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )
            ) : (
              <Mail className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-indigo-500 focus:ring-indigo-500 transition-colors sm:text-sm"
            placeholder="Enter your password"
            disabled={loading}
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
        disabled={loading || !isFormValid}
        className="w-full h-11 text-base font-semibold"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in to your account'
        )}
      </Button>

      {/* Sign up link */}
      <div className="text-center">
        <span className="text-sm text-gray-600">Don't have an account? </span>
        <Link
          href="/signup"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          Sign up for free
        </Link>
      </div>
    </form>
  )
} 
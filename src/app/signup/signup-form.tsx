'use client'

import { useState } from 'react'
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
  const [success, setSuccess] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Validation helpers
  const isEmailValid = email.includes('@') && email.includes('.')
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const isPasswordStrong = passwordRequirements.every(req => req.test(password))
  const isFormValid = isEmailValid && isPasswordStrong && passwordsMatch

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!isFormValid) {
      setError('Please fix the validation errors above')
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/dashboard`,
        }
      })

      if (signUpError) {
        console.error('Signup error:', signUpError.message)
        setError(signUpError.message)
      } else {
        setSuccess(true)
        // Clear form
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred. Please try again.')
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
        <p className="text-sm text-gray-600 mb-6">
          We've sent a verification link to <strong>{email}</strong>. 
          Click the link to activate your account and start using SiteAgent.
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
            disabled={loading}
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
        
        {/* Password Requirements */}
        {(passwordFocused || password) && (
          <div className="mt-2 space-y-1">
            {passwordRequirements.map((req, index) => (
              <div key={index} className="flex items-center text-xs">
                {req.test(password) ? (
                  <Check className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <X className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={req.test(password) ? 'text-green-600' : 'text-red-600'}>
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
          Confirm Password
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
            disabled={loading}
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
        
        {confirmPassword && !passwordsMatch && (
          <p className="mt-1 text-xs text-red-600">Passwords don't match</p>
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
        disabled={loading || !isFormValid}
        className="w-full h-11 text-base font-semibold"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating your account...
          </>
        ) : (
          'Create your account'
        )}
      </Button>

      {/* Terms and Privacy */}
      <p className="text-xs text-gray-500 text-center">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 underline">
          Privacy Policy
        </Link>
      </p>

      {/* Login Link */}
      <div className="text-center">
        <span className="text-sm text-gray-600">Already have an account? </span>
        <Link
          href="/login"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          Sign in instead
        </Link>
      </div>
    </form>
  )
} 
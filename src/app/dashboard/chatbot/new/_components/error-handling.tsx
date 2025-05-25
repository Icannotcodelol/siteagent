'use client'

import { ExclamationTriangleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

// Error types for better categorization
export type ErrorType = 'validation' | 'network' | 'server' | 'permission' | 'quota' | 'unknown'

export interface AppError {
  type: ErrorType
  message: string
  field?: string
  code?: string
  retryable?: boolean
  details?: string
}

// Field-level error component
interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null

  return (
    <div className={`flex items-center space-x-1 text-red-400 text-xs mt-1 ${className}`}>
      <ExclamationTriangleIcon className="h-3 w-3 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )
}

// Toast notification for errors
interface ErrorToastProps {
  error: AppError
  onDismiss: () => void
  onRetry?: () => void
}

export function ErrorToast({ error, onDismiss, onRetry }: ErrorToastProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return '🌐'
      case 'server':
        return '⚠️'
      case 'permission':
        return '🔒'
      case 'quota':
        return '📊'
      default:
        return '❌'
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case 'validation':
        return 'border-yellow-500 bg-yellow-900/20'
      case 'network':
        return 'border-blue-500 bg-blue-900/20'
      case 'quota':
        return 'border-orange-500 bg-orange-900/20'
      default:
        return 'border-red-500 bg-red-900/20'
    }
  }

  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 rounded-lg border ${getErrorColor()} shadow-lg z-50 animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getErrorIcon()}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white">{error.message}</h4>
          {error.details && (
            <p className="text-xs text-gray-400 mt-1">{error.details}</p>
          )}
          {error.code && (
            <p className="text-xs text-gray-500 mt-1">Error code: {error.code}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="text-gray-400 hover:text-white transition-colors"
              title="Retry"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white transition-colors"
            title="Dismiss"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Error boundary fallback
interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Something went wrong</h3>
        <p className="text-gray-400 text-sm mb-4">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        <details className="text-left mb-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
            Technical details
          </summary>
          <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-800 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

// Validation error summary
interface ValidationErrorSummaryProps {
  errors: Record<string, string>
  onFieldFocus?: (field: string) => void
}

export function ValidationErrorSummary({ errors, onFieldFocus }: ValidationErrorSummaryProps) {
  const errorEntries = Object.entries(errors)
  
  if (errorEntries.length === 0) return null

  return (
    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        <h3 className="text-sm font-medium text-red-300">
          Please fix the following errors:
        </h3>
      </div>
      <ul className="space-y-1">
        {errorEntries.map(([field, error]) => (
          <li key={field} className="text-sm text-red-400">
            <button
              type="button"
              onClick={() => onFieldFocus?.(field)}
              className="hover:underline text-left"
            >
              • {error}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Network status indicator
interface NetworkStatusProps {
  isOnline: boolean
  isConnecting?: boolean
}

export function NetworkStatus({ isOnline, isConnecting }: NetworkStatusProps) {
  if (isOnline && !isConnecting) return null

  return (
    <div className={`fixed bottom-4 left-4 px-3 py-2 rounded-lg text-sm font-medium ${
      isConnecting ? 'bg-yellow-900/20 border border-yellow-700 text-yellow-300' :
      !isOnline ? 'bg-red-900/20 border border-red-700 text-red-300' :
      'bg-green-900/20 border border-green-700 text-green-300'
    }`}>
      <div className="flex items-center space-x-2">
        {isConnecting ? (
          <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
        ) : !isOnline ? (
          <div className="w-3 h-3 bg-red-400 rounded-full" />
        ) : (
          <div className="w-3 h-3 bg-green-400 rounded-full" />
        )}
        <span>
          {isConnecting ? 'Reconnecting...' :
           !isOnline ? 'No internet connection' :
           'Connected'}
        </span>
      </div>
    </div>
  )
}

// Retry mechanism hook
export function useRetry() {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = async (fn: () => Promise<void>, maxRetries = 3) => {
    if (retryCount >= maxRetries) {
      throw new Error(`Max retries (${maxRetries}) exceeded`)
    }

    setIsRetrying(true)
    try {
      await fn()
      setRetryCount(0) // Reset on success
    } catch (error) {
      setRetryCount(prev => prev + 1)
      throw error
    } finally {
      setIsRetrying(false)
    }
  }

  return { retry, retryCount, isRetrying, canRetry: retryCount < 3 }
}

// Error helper functions
export function createError(
  type: ErrorType,
  message: string,
  options?: Partial<AppError>
): AppError {
  return {
    type,
    message,
    retryable: type === 'network' || type === 'server',
    ...options
  }
}

export function isRetryableError(error: AppError): boolean {
  return error.retryable === true
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
} 
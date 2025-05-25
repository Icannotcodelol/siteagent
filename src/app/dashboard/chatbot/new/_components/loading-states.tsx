'use client'

import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline'

// Skeleton loader for form fields
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/4"></div>
      <div className="h-10 bg-gray-700 rounded"></div>
    </div>
  )
}

// Skeleton loader for the entire form
export function FormSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700">
      {/* Left Column: Tab Navigation Skeleton */}
      <div className="md:w-1/4 lg:w-1/5 border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Right Column: Content Skeleton */}
      <div className="flex-1 space-y-6">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
          <div className="h-10 w-20 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

// Progress indicator for multi-step operations
interface ProgressStepProps {
  step: number
  totalSteps: number
  currentStep: number
  title: string
  description?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

export function ProgressStep({ step, totalSteps, currentStep, title, description, status, error }: ProgressStepProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'processing':
        return (
          <div className="h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        )
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepColor = () => {
    if (status === 'completed') return 'bg-green-500'
    if (status === 'failed') return 'bg-red-500'
    if (status === 'processing') return 'bg-purple-500'
    if (step <= currentStep) return 'bg-purple-500'
    return 'bg-gray-600'
  }

  return (
    <div className="flex items-start space-x-3">
      {/* Step indicator */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getStepColor()}`}>
          {status === 'processing' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : status === 'completed' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : status === 'failed' ? (
            <ExclamationTriangleIcon className="h-5 w-5" />
          ) : (
            step
          )}
        </div>
        {step < totalSteps && (
          <div className={`w-0.5 h-8 mt-1 ${step < currentStep ? 'bg-purple-500' : 'bg-gray-600'}`} />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium ${
          status === 'completed' ? 'text-green-400' :
          status === 'failed' ? 'text-red-400' :
          status === 'processing' ? 'text-purple-400' :
          'text-gray-300'
        }`}>
          {title}
        </h4>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>
    </div>
  )
}

// Overall progress indicator
interface OverallProgressProps {
  steps: Array<{
    title: string
    description?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    error?: string
  }>
  currentStep: number
  isVisible: boolean
}

export function OverallProgress({ steps, currentStep, isVisible }: OverallProgressProps) {
  if (!isVisible) return null

  const completedSteps = steps.filter(step => step.status === 'completed').length
  const failedSteps = steps.filter(step => step.status === 'failed').length
  const progressPercentage = (completedSteps / steps.length) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-white mb-2">Creating Your Chatbot</h3>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {completedSteps}/{steps.length} steps completed
          </p>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto">
          {steps.map((step, index) => (
            <ProgressStep
              key={index}
              step={index + 1}
              totalSteps={steps.length}
              currentStep={currentStep}
              title={step.title}
              description={step.description}
              status={step.status}
              error={step.error}
            />
          ))}
        </div>

        {failedSteps > 0 && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded text-sm">
            <p className="text-red-300 font-medium">
              {failedSteps} step{failedSteps !== 1 ? 's' : ''} failed
            </p>
            <p className="text-red-400 text-xs mt-1">
              Some operations failed but your chatbot was still created. You can retry failed operations later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading button component
interface LoadingButtonProps {
  isLoading: boolean
  loadingText: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}

export function LoadingButton({ 
  isLoading, 
  loadingText, 
  children, 
  onClick, 
  disabled, 
  variant = 'primary',
  className = ''
}: LoadingButtonProps) {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors flex items-center space-x-2"
  
  const variantClasses = variant === 'primary' 
    ? "text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
    : "text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  )
}

// Auto-save indicator
interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: Date
  error?: string
}

export function AutoSaveIndicator({ status, lastSaved, error }: AutoSaveIndicatorProps) {
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Saved'
      case 'error':
        return 'Save failed'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'text-purple-400'
      case 'saved':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-500'
    }
  }

  if (status === 'idle') return null

  return (
    <div className="flex items-center space-x-2 text-xs">
      {status === 'saving' && (
        <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
      )}
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      {error && status === 'error' && (
        <span className="text-red-400" title={error}>⚠️</span>
      )}
    </div>
  )
} 
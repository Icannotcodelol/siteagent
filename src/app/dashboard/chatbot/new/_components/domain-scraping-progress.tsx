'use client'

import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface DomainScrapingStatus {
  url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

interface DomainScrapingProgressProps {
  domains: DomainScrapingStatus[]
  isVisible: boolean
}

export default function DomainScrapingProgress({ domains, isVisible }: DomainScrapingProgressProps) {
  if (!isVisible || domains.length === 0) {
    return null
  }

  const completedCount = domains.filter(d => d.status === 'completed').length
  const failedCount = domains.filter(d => d.status === 'failed').length
  const processingCount = domains.filter(d => d.status === 'processing').length
  const pendingCount = domains.filter(d => d.status === 'pending').length

  const getStatusIcon = (status: DomainScrapingStatus['status']) => {
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
      default:
        return null
    }
  }

  const getStatusText = (status: DomainScrapingStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      case 'processing':
        return 'Processing...'
      case 'pending':
        return 'Pending'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Domain Scraping Progress</h3>
        <div className="text-xs text-gray-500">
          {completedCount}/{domains.length} completed
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${(completedCount / domains.length) * 100}%` }}
        />
      </div>

      {/* Status summary */}
      <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4">
        {completedCount > 0 && (
          <span className="flex items-center space-x-1">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span>{completedCount} completed</span>
          </span>
        )}
        {processingCount > 0 && (
          <span className="flex items-center space-x-1">
            <div className="h-3 w-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span>{processingCount} processing</span>
          </span>
        )}
        {pendingCount > 0 && (
          <span className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span>{pendingCount} pending</span>
          </span>
        )}
        {failedCount > 0 && (
          <span className="flex items-center space-x-1">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <span>{failedCount} failed</span>
          </span>
        )}
      </div>

      {/* Domain list */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {domains.map((domain, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getStatusIcon(domain.status)}
              <span className="text-gray-300 truncate" title={domain.url}>
                {domain.url}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${
                domain.status === 'completed' ? 'text-green-400' :
                domain.status === 'failed' ? 'text-red-400' :
                domain.status === 'processing' ? 'text-purple-400' :
                'text-gray-400'
              }`}>
                {getStatusText(domain.status)}
              </span>
            </div>
            {domain.error && (
              <div className="ml-2">
                <span 
                  className="text-red-400 cursor-help" 
                  title={domain.error}
                >
                  ⚠️
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {failedCount > 0 && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded text-sm">
          <p className="text-red-300 font-medium">
            {failedCount} domain{failedCount !== 1 ? 's' : ''} failed to scrape
          </p>
          <p className="text-red-400 text-xs mt-1">
            Failed domains will not be included in the chatbot's knowledge base. You can retry by re-adding them.
          </p>
        </div>
      )}
    </div>
  )
} 
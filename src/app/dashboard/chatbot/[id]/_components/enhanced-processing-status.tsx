'use client'

import { useProcessingStatus } from '@/lib/hooks/use-documents'
import { cn } from '@/app/_components/ui/button'

interface EnhancedProcessingStatusProps {
  chatbotId: string
}

interface ProcessingStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
  averageProcessingTimeSeconds: number
  recentErrors: string[]
}

export default function EnhancedProcessingStatus({ chatbotId }: EnhancedProcessingStatusProps) {
  const { data: stats, isLoading, error } = useProcessingStatus(chatbotId)

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4" />
          <div className="grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
        <p className="text-red-400 text-sm">Error loading processing stats: {error.message}</p>
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return null // Don't show anything if no documents
  }

  const hasActiveProcessing = stats.pending > 0 || stats.processing > 0
  const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0'

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <span className="text-xl">⚡</span>
          Processing Status
        </h3>
        {hasActiveProcessing && (
          <div className="flex items-center text-yellow-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent mr-2" />
            <span className="text-sm font-medium">Active Processing</span>
          </div>
        )}
      </div>

      {/* Progress overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Overall Progress</span>
          <span className="text-sm text-gray-400">{completionRate}% complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-700/30 rounded-lg">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total</div>
        </div>
        
        <div className="text-center p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-2xl font-bold text-blue-400 flex items-center justify-center gap-1">
            {stats.pending}
            {stats.pending > 0 && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="text-xs text-blue-300 uppercase tracking-wide">Pending</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
            {stats.processing}
            {stats.processing > 0 && (
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="text-xs text-yellow-300 uppercase tracking-wide">Processing</div>
        </div>
        
        <div className="text-center p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
            {stats.completed}
            {stats.completed > 0 && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="text-xs text-green-300 uppercase tracking-wide">Completed</div>
        </div>
        
        <div className="text-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
            {stats.failed}
            {stats.failed > 0 && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="text-xs text-red-300 uppercase tracking-wide">Failed</div>
        </div>
      </div>

      {/* Additional info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {stats.completed > 0 && (
            <span className="text-gray-400">
              <span className="text-gray-300 font-medium">Avg time:</span> {stats.averageProcessingTimeSeconds}s
            </span>
          )}
          {hasActiveProcessing && (
            <span className="text-gray-400">
              <span className="text-gray-300 font-medium">Updates:</span> Every 5 seconds
            </span>
          )}
        </div>
        
        {stats.failed > 0 && (
          <span className="text-red-400 font-medium">
            {stats.failed} document{stats.failed !== 1 ? 's' : ''} failed
          </span>
        )}
      </div>

      {/* Recent errors */}
      {stats.recentErrors && stats.recentErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-900/10 border border-red-500/20 rounded-lg">
          <details className="text-sm">
            <summary className="text-red-400 cursor-pointer hover:text-red-300 font-medium mb-2">
              Recent Errors ({stats.recentErrors.length})
            </summary>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {stats.recentErrors.map((error: string, index: number) => (
                <div key={index} className="text-red-300 bg-red-900/20 p-3 rounded border-l-2 border-red-500">
                  <pre className="whitespace-pre-wrap text-xs font-mono">{error}</pre>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Status indicator */}
      {!hasActiveProcessing && stats.completed === stats.total && stats.total > 0 && (
        <div className="mt-4 p-4 bg-green-900/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center text-green-400">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">All documents processed successfully!</span>
          </div>
        </div>
      )}
    </div>
  )
} 
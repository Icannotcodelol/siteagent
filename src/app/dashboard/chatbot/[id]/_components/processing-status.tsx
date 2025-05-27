'use client'

import { useState, useEffect } from 'react'

interface ProcessingStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
  averageProcessingTimeSeconds: number
  recentErrors: string[]
}

interface ProcessingStatusProps {
  chatbotId: string
}

export default function ProcessingStatus({ chatbotId }: ProcessingStatusProps) {
  const [stats, setStats] = useState<ProcessingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/document-processing?action=stats&chatbotId=${chatbotId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` // Use appropriate auth
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }

      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch processing stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Refresh stats every 10 seconds if there are processing documents
    const interval = setInterval(() => {
      if (stats && (stats.pending > 0 || stats.processing > 0)) {
        fetchStats()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [chatbotId, stats?.pending, stats?.processing])

  if (loading) {
    return (
      <div className="bg-white rounded shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800 text-sm">Error loading processing stats: {error}</p>
        <button 
          onClick={fetchStats}
          className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return null // Don't show anything if no documents
  }

  const hasActiveProcessing = stats.pending > 0 || stats.processing > 0

  return (
    <div className="bg-white rounded shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Document Processing Status</h3>
        {hasActiveProcessing && (
          <div className="flex items-center text-yellow-600">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-2"></div>
            <span className="text-xs">Processing...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{stats.processing}</div>
          <div className="text-xs text-gray-500">Processing</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{stats.failed}</div>
          <div className="text-xs text-gray-500">Failed</div>
        </div>
      </div>

      {stats.completed > 0 && (
        <div className="text-xs text-gray-600 mb-3">
          Average processing time: {stats.averageProcessingTimeSeconds}s
        </div>
      )}

      {stats.recentErrors.length > 0 && (
        <div className="mt-3">
          <details className="text-xs">
            <summary className="text-red-600 cursor-pointer hover:text-red-800">
              Recent Errors ({stats.recentErrors.length})
            </summary>
            <div className="mt-2 space-y-1">
              {stats.recentErrors.map((error, index) => (
                <div key={index} className="text-red-700 bg-red-50 p-2 rounded text-xs">
                  {error}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {hasActiveProcessing && (
        <div className="mt-3 text-xs text-gray-600">
          Status updates automatically every 10 seconds
        </div>
      )}
    </div>
  )
} 
import { useState, useEffect, useCallback } from 'react'

export interface DocumentStatus {
  id: string
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed'
  file_name: string
  created_at: string
}

export function useDocumentStatus(documentId: string | null, enabled: boolean = true) {
  const [status, setStatus] = useState<DocumentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    if (!documentId || !enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/documents/${documentId}/status`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`)
      }

      const data = await response.json()
      setStatus(data)
    } catch (err: any) {
      console.error('Error fetching document status:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [documentId, enabled])

  useEffect(() => {
    if (!documentId || !enabled) return

    // Initial fetch
    fetchStatus()

    // Set up polling for pending/processing documents
    const interval = setInterval(async () => {
      await fetchStatus()
      
      // Stop polling if completed or failed
      if (status && ['completed', 'failed'].includes(status.embedding_status)) {
        clearInterval(interval)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [documentId, enabled, fetchStatus, status])

  // Stop polling when status is final
  useEffect(() => {
    if (status && ['completed', 'failed'].includes(status.embedding_status)) {
      setIsLoading(false)
    }
  }, [status])

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus
  }
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Type definition for a document (matching the one in page.tsx)
type Document = {
  id: string
  file_name: string
  created_at: string
  embedding_status: string
  // Add storage_path if needed directly here, though API fetches it
}

interface DocumentListProps {
  documents: Document[]
}

export default function DocumentList({ documents }: DocumentListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-refresh when documents are processing
  useEffect(() => {
    const hasProcessingDocs = documents.some(doc => doc.embedding_status === 'processing')
    if (hasProcessingDocs) {
      const intervalId = setInterval(() => {
        router.refresh()
      }, 3000) // Refresh every 3 seconds
      
      return () => clearInterval(intervalId)
    }
  }, [documents, router])

  const handleDelete = async (documentId: string, fileName: string) => {
    // Simple confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(documentId)
    setError(null)

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
          let errorMsg = `Failed to delete document (Status: ${response.status}).`;
          try {
              const errorData = await response.json();
              errorMsg = errorData.error || errorMsg;
          } catch (e) {
              // Ignore if response is not JSON
          }
          throw new Error(errorMsg);
      }

      // Success (status 204 No Content usually has no body)
      setError(null)
      router.refresh() // Refresh Server Component data

    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message || 'An unexpected error occurred during deletion.')
    } finally {
      setDeletingId(null) // Reset loading state regardless of outcome
    }
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="px-6 py-4 text-center text-gray-500 bg-gray-800/30 rounded-xl border border-gray-700/50">
        No documents uploaded for this chatbot yet.
      </div>
    )
  }

  // Determine which documents to show
  const COLLAPSE_THRESHOLD = 4
  const shouldShowCollapseToggle = documents.length > COLLAPSE_THRESHOLD
  const visibleDocuments = shouldShowCollapseToggle && !isExpanded 
    ? documents.slice(0, COLLAPSE_THRESHOLD)
    : documents

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
       {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 m-4 rounded-xl" role="alert">
            <p className="font-bold">Deletion Error</p>
            <p>{error}</p>
          </div>
        )}
      <ul className="divide-y divide-gray-700/50">
        {visibleDocuments.map((doc) => (
          <li key={doc.id} className="px-6 py-4 flex justify-between items-center">
            <div>
              <p className="text-base font-medium text-white">{doc.file_name}</p>
              <p className="text-sm text-gray-400">
                Uploaded: {new Date(doc.created_at).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                 doc.embedding_status === 'completed' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                 doc.embedding_status === 'pending' || doc.embedding_status === 'processing' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                 'bg-red-900/30 text-red-400 border border-red-500/30'
               }`}>
                 {doc.embedding_status}
               </span>
               <button
                  onClick={() => handleDelete(doc.id, doc.file_name)}
                  disabled={deletingId === doc.id || doc.embedding_status === 'processing'}
                  className={`text-sm font-medium transition duration-150 ease-in-out ${
                    doc.embedding_status === 'processing' 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                  title={doc.embedding_status === 'processing' ? 'Cannot delete while processing' : 'Delete document'}
                >
                  {deletingId === doc.id ? 'Deleting...' : 
                   doc.embedding_status === 'processing' ? 'Processing...' : 'Delete'}
               </button>
            </div>
          </li>
        ))}
      </ul>
      
      {/* Collapse/Expand toggle button */}
      {shouldShowCollapseToggle && (
        <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show less ({documents.length - COLLAPSE_THRESHOLD} hidden)
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show {documents.length - COLLAPSE_THRESHOLD} more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
} 
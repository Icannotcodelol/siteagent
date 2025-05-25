'use client'

import { useState, useEffect } from 'react'
import { useOptimisticUpdate } from '@/lib/hooks/use-optimistic-update'
import { useDocumentStatus } from '@/lib/hooks/use-document-status'

// Type definition for a document
type Document = {
  id: string
  file_name: string
  created_at: string
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed'
}

interface DocumentListProps {
  documents: Document[]
  onDocumentDeleted?: (documentId: string) => void
}

function DocumentStatusBadge({ document }: { document: Document }) {
  const { status } = useDocumentStatus(
    document.embedding_status === 'pending' || document.embedding_status === 'processing' 
      ? document.id 
      : null,
    true
  )

  const currentStatus = status?.embedding_status || document.embedding_status

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentStatus)}`}>
      {currentStatus === 'processing' && (
        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {currentStatus}
    </span>
  )
}

export default function DocumentList({ documents: initialDocuments, onDocumentDeleted }: DocumentListProps) {
  const [error, setError] = useState<string | null>(null)

  const {
    data: documents,
    pendingUpdates,
    optimisticRemove,
    setData
  } = useOptimisticUpdate<Document>(initialDocuments, {
    onError: (error, item) => {
      console.error('Optimistic update failed:', error)
      setError(`Failed to delete "${item.file_name}": ${error.message}`)
    },
    onSuccess: (result, originalItem) => {
      setError(null)
      onDocumentDeleted?.(originalItem.id)
    }
  })

  // Update documents when props change
  useEffect(() => {
    setData(initialDocuments)
  }, [initialDocuments, setData])

  const handleDelete = async (documentId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }

    setError(null)

    try {
      await optimisticRemove(documentId, async (id) => {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          let errorMsg = `Failed to delete document (Status: ${response.status}).`
          try {
            const errorData = await response.json()
            errorMsg = errorData.error || errorMsg
          } catch (e) {
            // Ignore if response is not JSON
          }
          throw new Error(errorMsg)
        }
      })
    } catch (err: any) {
      // Error is already handled by the optimistic update hook
      console.error('Delete error:', err)
    }
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="px-6 py-4 text-center text-gray-500 bg-white rounded shadow-md">
        No documents uploaded for this chatbot yet.
      </div>
    )
  }

  return (
    <div className="bg-white rounded shadow-md overflow-hidden">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => {
          const isPending = pendingUpdates.has(doc.id)
          
          return (
            <li 
              key={doc.id} 
              className={`px-6 py-4 flex justify-between items-center transition-opacity ${
                isPending ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 truncate">{doc.file_name}</p>
                <p className="text-sm text-gray-500">
                  Uploaded: {new Date(doc.created_at).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center space-x-3 ml-4">
                <DocumentStatusBadge document={doc} />
                
                <button
                  onClick={() => handleDelete(doc.id, doc.file_name)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  title="Delete document"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
} 
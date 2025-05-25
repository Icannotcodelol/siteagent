'use client'

import { useState } from 'react'
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
      <div className="px-6 py-4 text-center text-gray-500 bg-white rounded shadow-md">
        No documents uploaded for this chatbot yet.
      </div>
    )
  }

  return (
    <div className="bg-white rounded shadow-md overflow-hidden">
       {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
            <p className="font-bold">Deletion Error</p>
            <p>{error}</p>
          </div>
        )}
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <li key={doc.id} className="px-6 py-4 flex justify-between items-center">
            <div>
              <p className="text-base font-medium text-gray-900">{doc.file_name}</p>
              <p className="text-sm text-gray-500">
                Uploaded: {new Date(doc.created_at).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                 doc.embedding_status === 'completed' ? 'bg-green-100 text-green-800' :
                 doc.embedding_status === 'pending' || doc.embedding_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                 'bg-red-100 text-red-800'
               }`}>
                 {doc.embedding_status}
               </span>
               <button
                  onClick={() => handleDelete(doc.id, doc.file_name)}
                  disabled={deletingId === doc.id}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  title="Delete document"
                >
                  {deletingId === doc.id ? 'Deleting...' : 'Delete'}
               </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 
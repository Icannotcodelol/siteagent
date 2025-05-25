'use client'

import { useState, type FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface DocumentUploadFormProps {
  chatbotId: string
  onDocumentAdded?: (document: any) => void
}

export default function DocumentUploadForm({ chatbotId, onDocumentAdded }: DocumentUploadFormProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
      setError(null)
      setSuccessMessage(null)
    } else {
      setFile(null)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFile(event.dataTransfer.files[0])
      setError(null)
      setSuccessMessage(null)
      event.dataTransfer.clearData()
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('chatbotId', chatbotId)

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }))
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
      }

      const newDocument = await response.json()

      // Immediately trigger embedding processing
      try {
        await fetch(`/api/documents/${newDocument.id}/process-embedding`, {
          method: 'POST',
        })
      } catch (embeddingError) {
        console.warn('Failed to trigger embedding processing:', embeddingError)
        // Don't fail the upload for this
      }

      setSuccessMessage(`File "${file.name}" uploaded successfully! Processing embeddings...`)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify parent component immediately (optimistic update)
      onDocumentAdded?.(newDocument)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'An unexpected error occurred during upload.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        id="documentUploadHidden"
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
        accept=".pdf,.txt,.md,.docx"
      />

      {/* Drag and Drop Area */}
      <div 
        className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 cursor-pointer transition-colors"
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        aria-hidden="true"
      >
        <svg className="mx-auto h-10 w-10 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-2 text-sm text-gray-400">
          <span className="font-medium text-purple-400 hover:text-purple-300">Click to upload</span> or drag & drop
        </p>
        <p className="mt-1 text-xs text-gray-500">PDF, DOCX, TXT, MD (Max 10MB)</p>
        
        {/* Display selected file name */}
        {file && <p className="text-sm text-green-500 mt-3">Selected: {file.name}</p>}
      </div>
      
      {/* Upload button - only show if file is selected */}
      {file && (
        <div className="text-right">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !file}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              'Upload File'
            )}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-2 rounded text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-2 rounded text-sm">
          {successMessage}
        </div>
      )}
    </div>
  )
}

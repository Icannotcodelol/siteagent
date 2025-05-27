'use client'

import { useState, type FormEvent, useRef } from 'react' // Add useRef
import { useRouter } from 'next/navigation'

interface DocumentUploadFormProps {
  chatbotId: string;
}

export default function DocumentUploadForm({ chatbotId }: DocumentUploadFormProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden input

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
      fileInputRef.current?.click();
  };

  // Drag and Drop Handlers (Basic structure)
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault(); // Necessary to allow drop
      // Optional: Add visual feedback (e.g., change border style)
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          setFile(event.dataTransfer.files[0]);
          setError(null);
          setSuccessMessage(null);
          event.dataTransfer.clearData();
      }
      // Optional: Reset visual feedback
  };

  // Submit logic remains largely the same
  const handleSubmit = async () => {
    // No event needed as it's triggered by button click now
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

      setSuccessMessage(`File "${file.name}" uploaded successfully!`)
      setFile(null)
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear hidden input value
      }
      router.refresh()

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'An unexpected error occurred during upload.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Remove form tag if triggering upload manually, or keep if needed for structure
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        id="documentUploadHidden"
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
        accept=".pdf,.txt,.md,.docx,.csv" // Added CSV support
      />

      {/* Drag and Drop Area / Select Button Area */}
      <div 
         className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 cursor-pointer"
         onClick={triggerFileInput} // Trigger file input on click
         onDragOver={handleDragOver}
         onDrop={handleDrop}
         aria-hidden="true" // Might need better accessibility handling
      >
        <svg className="mx-auto h-10 w-10 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
           <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-2 text-sm text-gray-400">
           <span className="font-medium text-purple-400 hover:text-purple-300">Click to upload</span> or drag & drop
        </p>
        <p className="mt-1 text-xs text-gray-500">PDF, DOCX, TXT, MD, CSV (Max 10MB)</p> {/* Added CSV to size limit */}
        
        {/* Display selected file name */}
        {file && <p className="text-sm text-green-500 mt-3">Selected: {file.name}</p>}
      </div>
      
      {/* Conditionally render Upload button only if a file is selected */}
      {file && (
          <div className="text-right">
             <button
                type="button" // Changed from submit
                onClick={handleSubmit} // Trigger manual submission
                disabled={loading || !file}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50"
             >
                 {loading ? 'Uploading...' : 'Upload File'}
             </button>
          </div>
      )}

      {/* Status Messages */}
      {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
      {successMessage && <p className="text-sm text-green-500 mt-2">{successMessage}</p>}

    </div>
  );
}

'use client'

import { useState, useCallback, useRef } from 'react'
import { useUploadDocument, type DocumentUploadProgress } from '@/lib/hooks/use-documents'
import { cn } from '@/app/_components/ui/button'
import toast from 'react-hot-toast'

interface EnhancedDocumentUploadProps {
  chatbotId: string
  disabled?: boolean
}

interface UploadItem extends DocumentUploadProgress {
  id: string
}

export default function EnhancedDocumentUpload({ 
  chatbotId, 
  disabled = false 
}: EnhancedDocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadDocument(chatbotId)

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      
      const validTypes = ['.pdf', '.txt', '.md', '.docx', '.csv']
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!validTypes.includes(fileExt)) {
        toast.error(`${file.name} is not a supported file type`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    // Create upload items
    const newUploads: UploadItem[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const,
    }))

    setUploads(prev => [...prev, ...newUploads])

    // Process uploads sequentially to avoid overwhelming the server
    for (const uploadItem of newUploads) {
      try {
        // Update status to uploading
        setUploads(prev => prev.map(u => 
          u.id === uploadItem.id 
            ? { ...u, status: 'uploading', progress: 10 }
            : u
        ))

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map(u => 
            u.id === uploadItem.id && u.progress < 90
              ? { ...u, progress: u.progress + 10 }
              : u
          ))
        }, 200)

        // Perform actual upload
        const result = await uploadMutation.mutateAsync(uploadItem.file)

        clearInterval(progressInterval)

        // Update to processing status
        setUploads(prev => prev.map(u => 
          u.id === uploadItem.id 
            ? { 
                ...u, 
                status: 'processing', 
                progress: 100,
                documentId: result.id 
              }
            : u
        ))

        // Remove from upload list after a delay
        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== uploadItem.id))
        }, 3000)

      } catch (error: any) {
        setUploads(prev => prev.map(u => 
          u.id === uploadItem.id 
            ? { 
                ...u, 
                status: 'error', 
                progress: 0,
                error: error.message 
              }
            : u
        ))
      }
    }
  }, [uploadMutation])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [disabled, processFiles])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  const triggerFileSelect = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  const removeUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id))
  }, [])

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        accept=".pdf,.txt,.md,.docx,.csv"
      />

      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          isDragOver && !disabled
            ? "border-purple-400 bg-purple-500/10 scale-105"
            : "border-gray-700 hover:border-gray-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileSelect}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-2">
              {isDragOver ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-sm text-gray-400 mb-1">
              <span className="font-medium text-purple-400 hover:text-purple-300">
                Click to browse
              </span>
              {' '}or drag & drop files
            </p>
            <p className="text-xs text-gray-500">
              Supports PDF, DOCX, TXT, MD, CSV (Max 10MB each)
            </p>
          </div>
        </div>
      </div>

      {/* Upload progress list */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Upload Progress</h4>
          <div className="space-y-2">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {upload.status === 'uploading' && (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {upload.status === 'processing' && (
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {upload.status === 'completed' && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {upload.status === 'error' && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {upload.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(upload.file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 capitalize">
                      {upload.status === 'uploading' && 'Uploading...'}
                      {upload.status === 'processing' && 'Processing...'}
                      {upload.status === 'completed' && 'Completed'}
                      {upload.status === 'error' && 'Failed'}
                    </span>
                    
                    {upload.status === 'error' && (
                      <button
                        onClick={() => removeUpload(upload.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {upload.status !== 'error' && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        upload.status === 'uploading' && "bg-blue-500",
                        upload.status === 'processing' && "bg-yellow-500",
                        upload.status === 'completed' && "bg-green-500"
                      )}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {upload.error && (
                  <p className="text-xs text-red-400 mt-2">
                    {upload.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
'use client'

import { useState, useMemo } from 'react'
import { useDocuments, useDeleteDocument, type Document } from '@/lib/hooks/use-documents'
import { cn } from '@/app/_components/ui/button'
import toast from 'react-hot-toast'

interface EnhancedDocumentListProps {
  chatbotId: string
}

export default function EnhancedDocumentList({ chatbotId }: EnhancedDocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const { data: documents = [], isLoading, error } = useDocuments(chatbotId)
  const deleteMutation = useDeleteDocument(chatbotId)

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.embedding_status === statusFilter)
    }

    // Search by filename
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [documents, statusFilter, searchQuery])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return documents.reduce((acc, doc) => {
      acc[doc.embedding_status] = (acc[doc.embedding_status] || 0) + 1
      acc.total = documents.length
      return acc
    }, {} as Record<string, number>)
  }, [documents])

  const handleDelete = async (document: Document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.file_name}"? This action cannot be undone.`)) {
      return
    }

    setDeletingIds(prev => new Set(prev).add(document.id))

    try {
      await deleteMutation.mutateAsync(document.id)
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(document.id)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: string, isProcessing: boolean = false) => {
    const baseClasses = "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border"
    
    if (isProcessing) {
      return (
        <span className={cn(baseClasses, "bg-yellow-900/30 text-yellow-400 border-yellow-500/30")}>
          <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin mr-1" />
          Processing...
        </span>
      )
    }

    switch (status) {
      case 'completed':
        return (
          <span className={cn(baseClasses, "bg-green-900/30 text-green-400 border-green-500/30")}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Completed
          </span>
        )
      case 'pending':
        return (
          <span className={cn(baseClasses, "bg-blue-900/30 text-blue-400 border-blue-500/30")}>
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pending
          </span>
        )
      case 'processing':
        return getStatusBadge(status, true)
      case 'failed':
        return (
          <span className={cn(baseClasses, "bg-red-900/30 text-red-400 border-red-500/30")}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Failed
          </span>
        )
      default:
        return (
          <span className={cn(baseClasses, "bg-gray-900/30 text-gray-400 border-gray-500/30")}>
            {status}
          </span>
        )
    }
  }

  const formatFileSize = (sizeInMB?: number) => {
    if (!sizeInMB) return 'Unknown size'
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`
    }
    return `${sizeInMB.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-48" />
                <div className="h-3 bg-gray-700 rounded w-32" />
              </div>
              <div className="h-6 bg-gray-700 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl" role="alert">
        <p className="font-bold">Error loading documents</p>
        <p>{error.message}</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-gray-500 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-white mb-2">No documents yet</p>
        <p className="text-sm">Upload your first document to get started.</p>
      </div>
    )
  }

  const COLLAPSE_THRESHOLD = 5
  const shouldShowCollapseToggle = filteredDocuments.length > COLLAPSE_THRESHOLD
  const visibleDocuments = shouldShowCollapseToggle && !isExpanded 
    ? filteredDocuments.slice(0, COLLAPSE_THRESHOLD)
    : filteredDocuments

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header with search and filters */}
      <div className="px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Documents ({documents.length})
          </h3>
          
          {/* Status summary */}
          <div className="flex items-center space-x-4 text-xs">
            {statusCounts.completed > 0 && (
              <span className="text-green-400">
                {statusCounts.completed} completed
              </span>
            )}
            {statusCounts.processing > 0 && (
              <span className="text-yellow-400">
                {statusCounts.processing} processing
              </span>
            )}
            {statusCounts.pending > 0 && (
              <span className="text-blue-400">
                {statusCounts.pending} pending
              </span>
            )}
            {statusCounts.failed > 0 && (
              <span className="text-red-400">
                {statusCounts.failed} failed
              </span>
            )}
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Document list */}
      {filteredDocuments.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          <p>No documents match your search criteria.</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-700/50">
            {visibleDocuments.map((doc) => (
              <li key={doc.id} className="px-6 py-4 hover:bg-gray-700/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="text-base font-medium text-white truncate">
                        {doc.file_name}
                      </p>
                      {getStatusBadge(doc.embedding_status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Uploaded: {formatDate(doc.created_at)}</span>
                      {doc.size_mb && (
                        <span>Size: {formatFileSize(doc.size_mb)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={
                        deletingIds.has(doc.id) || 
                        doc.embedding_status === 'processing' ||
                        deleteMutation.isPending
                      }
                      className={cn(
                        "text-sm font-medium transition duration-150 ease-in-out px-3 py-1 rounded-md",
                        doc.embedding_status === 'processing' 
                          ? 'text-gray-500 cursor-not-allowed bg-gray-800/50' 
                          : 'text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                      title={doc.embedding_status === 'processing' ? 'Cannot delete while processing' : 'Delete document'}
                    >
                      {deletingIds.has(doc.id) ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          <span>Deleting...</span>
                        </div>
                      ) : doc.embedding_status === 'processing' ? (
                        'Processing...'
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Collapse/Expand toggle */}
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
                    Show less ({filteredDocuments.length - COLLAPSE_THRESHOLD} hidden)
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show {filteredDocuments.length - COLLAPSE_THRESHOLD} more
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 
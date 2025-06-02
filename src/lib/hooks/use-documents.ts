'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export type Document = {
  id: string
  file_name: string
  created_at: string
  embedding_status: string
  size_mb?: number
  content?: string
  storage_path?: string
  chatbot_id: string
  user_id: string
}

export type DocumentUploadProgress = {
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  documentId?: string
}

// Fetch documents for a specific chatbot
export function useDocuments(chatbotId: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['documents', chatbotId],
    queryFn: async (): Promise<Document[]> => {
      console.log('Fetching documents for chatbot:', chatbotId)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        throw new Error(error.message)
      }

      console.log('Documents fetched:', data?.length || 0)
      return data || []
    },
    enabled: !!chatbotId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: (data) => {
      // If any document is pending or processing, poll every 3 seconds
      if (Array.isArray(data)) {
        const hasActive = data.some(
          (d) => d.embedding_status === 'pending' || d.embedding_status === 'processing'
        )
        return hasActive ? 3000 : false
      }
      // If no data yet, poll every 3 seconds until first data arrives
      return 3000
    },
  })

  // Set up real-time subscription
  useEffect(() => {
    if (!chatbotId) return

    console.log('Setting up real-time subscription for chatbot:', chatbotId)

    const channel = supabase
      .channel(`documents-${chatbotId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: 'user' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `chatbot_id=eq.${chatbotId}`,
        },
        (payload) => {
          console.log('Real-time document update:', payload)
          
          // Small delay to ensure the database is consistent
          setTimeout(() => {
            // Invalidate and refetch documents
            queryClient.invalidateQueries({ queryKey: ['documents', chatbotId] })
            // Also invalidate processing status to update counts
            queryClient.invalidateQueries({ queryKey: ['processing-status', chatbotId] })
          }, 100)
          
          // Show toast notifications for status changes
          if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
            const newDoc = payload.new as Document
            const oldDoc = payload.old as Document
            
            if (oldDoc.embedding_status !== newDoc.embedding_status) {
              // Dismiss any existing loading toast for this document
              toast.dismiss(newDoc.id)
              
              switch (newDoc.embedding_status) {
                case 'completed':
                  toast.success(`${newDoc.file_name} processing completed!`)
                  break
                case 'failed':
                  toast.error(`${newDoc.file_name} processing failed`)
                  break
                case 'processing':
                  toast.loading(`Processing ${newDoc.file_name}...`, { id: newDoc.id })
                  break
                case 'pending':
                  toast.loading(`${newDoc.file_name} queued for processing...`, { id: newDoc.id })
                  break
              }
            }
          }
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newDoc = payload.new as Document
            console.log('New document inserted:', newDoc)
          }
          
          if (payload.eventType === 'DELETE' && payload.old) {
            const deletedDoc = payload.old as Document
            toast.dismiss(deletedDoc.id) // Dismiss any pending toasts for deleted document
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Subscription status:', status, err)
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to document changes')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error:', err)
        }
      })

    return () => {
      console.log('Cleaning up subscription for chatbot:', chatbotId)
      supabase.removeChannel(channel)
    }
  }, [chatbotId, queryClient, supabase])

  return query
}

// Upload document mutation
export function useUploadDocument(chatbotId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File): Promise<Document> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('chatbotId', chatbotId)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: (newDocument) => {
      // Optimistically update the cache
      queryClient.setQueryData(['documents', chatbotId], (old: Document[] = []) => [
        newDocument,
        ...old,
      ])
      
      // Show initial toast for upload completion
      toast.success(`${newDocument.file_name} uploaded successfully!`)
      
      // If document is pending, show processing toast
      if (newDocument.embedding_status === 'pending') {
        setTimeout(() => {
          toast.loading(`${newDocument.file_name} queued for processing...`, { id: newDocument.id })
        }, 1000)
      }
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`)
    },
  })
}

// Delete document mutation
export function useDeleteDocument(chatbotId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: string): Promise<void> => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Delete failed' }))
        throw new Error(errorData.error || `Delete failed with status: ${response.status}`)
      }
    },
    onMutate: async (documentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['documents', chatbotId] })

      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData(['documents', chatbotId])

      // Optimistically update to remove the document
      queryClient.setQueryData(['documents', chatbotId], (old: Document[] = []) =>
        old.filter((doc) => doc.id !== documentId)
      )

      // Return a context object with the snapshotted value
      return { previousDocuments }
    },
    onError: (error, documentId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousDocuments) {
        queryClient.setQueryData(['documents', chatbotId], context.previousDocuments)
      }
      toast.error(`Delete failed: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Document deleted successfully')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['documents', chatbotId] })
    },
  })
}

// Processing status hook
export function useProcessingStatus(chatbotId: string) {
  return useQuery({
    queryKey: ['processing-status', chatbotId],
    queryFn: async () => {
      const response = await fetch(`/api/chatbots/${chatbotId}/processing-status`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch processing status: ${response.status}`)
      }
      
      return response.json()
    },
    enabled: !!chatbotId,
    refetchInterval: (data) => {
      // Only poll if there are pending or processing documents
      if (data && typeof data === 'object' && 'pending' in data && 'processing' in data) {
        if ((data.pending as number) > 0 || (data.processing as number) > 0) {
          return 5000 // 5 seconds
        }
      }
      return false // Don't poll
    },
  })
} 
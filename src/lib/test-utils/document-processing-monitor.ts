import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface DocumentProcessingInfo {
  id: string
  file_name: string
  embedding_status: string
  created_at: string
  updated_at: string
  error_message?: string
  chunk_count: number
  processing_duration_seconds?: number
}

export async function getDocumentProcessingInfo(documentId: string): Promise<DocumentProcessingInfo | null> {
  try {
    // Get document info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      console.error('Document not found:', docError)
      return null
    }

    // Get chunk count
    const { count: chunkCount, error: chunkError } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId)

    if (chunkError) {
      console.error('Error getting chunk count:', chunkError)
    }

    // Calculate processing duration if completed or failed
    let processingDuration: number | undefined
    if (document.embedding_status !== 'pending' && document.updated_at !== document.created_at) {
      const createdAt = new Date(document.created_at)
      const updatedAt = new Date(document.updated_at)
      processingDuration = Math.round((updatedAt.getTime() - createdAt.getTime()) / 1000)
    }

    return {
      id: document.id,
      file_name: document.file_name,
      embedding_status: document.embedding_status,
      created_at: document.created_at,
      updated_at: document.updated_at,
      error_message: document.error_message,
      chunk_count: chunkCount || 0,
      processing_duration_seconds: processingDuration
    }
  } catch (error) {
    console.error('Error getting document processing info:', error)
    return null
  }
}

export async function monitorDocumentProcessing(documentId: string, timeoutMinutes = 5): Promise<DocumentProcessingInfo> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const timeoutMs = timeoutMinutes * 60 * 1000

    const checkStatus = async () => {
      try {
        const info = await getDocumentProcessingInfo(documentId)
        
        if (!info) {
          reject(new Error('Document not found'))
          return
        }

        console.log(`Document ${documentId} status: ${info.embedding_status}, chunks: ${info.chunk_count}`)

        // Check if processing is complete
        if (info.embedding_status === 'completed' || info.embedding_status === 'failed') {
          resolve(info)
          return
        }

        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error(`Monitoring timeout after ${timeoutMinutes} minutes`))
          return
        }

        // Continue monitoring
        setTimeout(checkStatus, 2000) // Check every 2 seconds
      } catch (error) {
        reject(error)
      }
    }

    checkStatus()
  })
}

export async function getProcessingStats(chatbotId?: string) {
  try {
    let query = supabase
      .from('documents')
      .select('embedding_status, created_at, updated_at, error_message')

    if (chatbotId) {
      query = query.eq('chatbot_id', chatbotId)
    }

    const { data: documents, error } = await query

    if (error) {
      throw error
    }

    const stats = {
      total: documents.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      averageProcessingTimeSeconds: 0,
      recentErrors: [] as string[]
    }

    let totalProcessingTime = 0
    let completedCount = 0

    documents.forEach(doc => {
      stats[doc.embedding_status as keyof typeof stats]++

      if (doc.embedding_status === 'completed' && doc.updated_at !== doc.created_at) {
        const duration = new Date(doc.updated_at).getTime() - new Date(doc.created_at).getTime()
        totalProcessingTime += duration
        completedCount++
      }

      if (doc.embedding_status === 'failed' && doc.error_message) {
        stats.recentErrors.push(doc.error_message)
      }
    })

    if (completedCount > 0) {
      stats.averageProcessingTimeSeconds = Math.round(totalProcessingTime / completedCount / 1000)
    }

    // Keep only recent errors (last 5)
    stats.recentErrors = stats.recentErrors.slice(-5)

    return stats
  } catch (error) {
    console.error('Error getting processing stats:', error)
    throw error
  }
}

export async function testDocumentUploadFlow(chatbotId: string, testContent: string, fileName = 'test-document.txt') {
  console.log('Starting document upload flow test...')
  
  try {
    // 1. Create a test document
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        chatbot_id: chatbotId,
        file_name: fileName,
        content: testContent,
        embedding_status: 'pending',
        size_mb: testContent.length / (1024 * 1024)
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create test document: ${insertError.message}`)
    }

    console.log(`Created test document: ${document.id}`)

    // 2. Trigger processing by calling the generate-embeddings function directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        invoker: 'test',
        documentId: document.id,
        scrapedContent: testContent
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to trigger processing: ${response.status} ${response.statusText}`)
    }

    console.log('Processing triggered, monitoring...')

    // 3. Monitor processing
    const result = await monitorDocumentProcessing(document.id, 2) // 2 minute timeout

    // 4. Cleanup - delete the test document
    await supabase.from('documents').delete().eq('id', document.id)

    return {
      success: result.embedding_status === 'completed',
      processingTime: result.processing_duration_seconds,
      chunkCount: result.chunk_count,
      error: result.error_message
    }
  } catch (error) {
    console.error('Test failed:', error)
    throw error
  }
} 
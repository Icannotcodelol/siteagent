import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  const supabase = createClient()
  
  // Check user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { chatbotId } = params

  try {
    // Verify user owns this chatbot
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found or access denied' }, { status: 404 })
    }

    // Get processing statistics for this chatbot
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('embedding_status, created_at')
      .eq('chatbot_id', chatbotId)

    if (documentsError) {
      console.error('Error fetching documents:', documentsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Calculate statistics
    const stats = {
      total: documents.length,
      pending: documents.filter(doc => doc.embedding_status === 'pending').length,
      processing: documents.filter(doc => doc.embedding_status === 'processing').length,
      completed: documents.filter(doc => doc.embedding_status === 'completed').length,
      failed: documents.filter(doc => doc.embedding_status === 'failed').length,
      averageProcessingTimeSeconds: 0, // Could be calculated if we track processing start/end times
      recentErrors: [] // Could be fetched from error logs if available
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in processing status route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
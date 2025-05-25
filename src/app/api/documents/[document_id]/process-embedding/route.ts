import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { document_id: string } }
) {
  const supabase = createClient()
  const documentId = params.document_id

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  try {
    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify document ownership and get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, chatbot_id, user_id, embedding_status')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if already processing or completed
    if (document.embedding_status === 'processing') {
      return NextResponse.json({ message: 'Already processing' }, { status: 200 })
    }

    if (document.embedding_status === 'completed') {
      return NextResponse.json({ message: 'Already completed' }, { status: 200 })
    }

    // Update status to processing
    const { error: updateError } = await supabase
      .from('documents')
      .update({ embedding_status: 'processing' })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating document status:', updateError)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // Trigger the embedding generation function
    try {
      const { error: invokeError } = await supabase.functions.invoke(
        'generate-embeddings',
        { body: { documentId } }
      )

      if (invokeError) {
        console.error('Error invoking embedding function:', invokeError)
        
        // Revert status on error
        await supabase
          .from('documents')
          .update({ embedding_status: 'failed' })
          .eq('id', documentId)

        return NextResponse.json({ error: 'Failed to start embedding processing' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Embedding processing started',
        documentId,
        status: 'processing'
      })

    } catch (functionError: any) {
      console.error('Exception invoking embedding function:', functionError)
      
      // Revert status on error
      await supabase
        .from('documents')
        .update({ embedding_status: 'failed' })
        .eq('id', documentId)

      return NextResponse.json({ error: 'Failed to start embedding processing' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error processing embedding request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
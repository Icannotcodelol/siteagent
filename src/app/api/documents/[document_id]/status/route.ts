import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
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

    // Fetch document status with ownership check
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, embedding_status, file_name, created_at')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: document.id,
      embedding_status: document.embedding_status,
      file_name: document.file_name,
      created_at: document.created_at
    })

  } catch (error: any) {
    console.error('Error fetching document status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
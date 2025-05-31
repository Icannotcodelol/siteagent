import { NextRequest, NextResponse } from 'next/server'
import { getProcessingStats, getDocumentProcessingInfo } from '@/lib/test-utils/document-processing-monitor'

// This route uses request.headers so it needs to be dynamic
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Simple auth check - you should implement proper admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const chatbotId = searchParams.get('chatbotId')
    const documentId = searchParams.get('documentId')

    switch (action) {
      case 'stats':
        const stats = await getProcessingStats(chatbotId || undefined)
        return NextResponse.json(stats)

      case 'document-info':
        if (!documentId) {
          return NextResponse.json({ error: 'documentId required' }, { status: 400 })
        }
        const info = await getDocumentProcessingInfo(documentId)
        if (!info) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }
        return NextResponse.json(info)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in document processing admin route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbotId } = params
    
    // Verify user owns the chatbot
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id, user_id, hybrid_mode_enabled')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()
    
    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    if (!chatbot.hybrid_mode_enabled) {
      return NextResponse.json({ error: 'Hybrid mode not enabled' }, { status: 400 })
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('conversation_details')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (assignedTo) {
      query = query.eq('assigned_agent_id', assignedTo)
    }

    const { data: conversations, error: conversationsError } = await query

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('chatbot_id', chatbotId)

    return NextResponse.json({
      conversations: conversations || [],
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Error in conversations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a new conversation or update existing one
export async function POST(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbotId } = params
    const body = await request.json()
    const { sessionId, status, priority, tags, customerInfo } = body

    // Verify user owns the chatbot
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id, user_id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()
    
    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    // Create or update conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .upsert({
        chatbot_id: chatbotId,
        session_id: sessionId,
        status: status || 'active',
        priority: priority || 'normal',
        tags: tags || [],
        customer_info: customerInfo || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'chatbot_id,session_id'
      })
      .select()
      .single()

    if (conversationError) {
      console.error('Error creating conversation:', conversationError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json({ conversation })

  } catch (error) {
    console.error('Error in conversations POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
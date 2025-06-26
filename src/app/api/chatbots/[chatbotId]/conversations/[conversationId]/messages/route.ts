import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotId: string; conversationId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbotId, conversationId } = params

    // Get conversation to verify access and get session_id
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('session_id, chatbot_id')
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user has access (owner or assigned agent)
    const { data: access } = await supabase
      .from('conversation_details')
      .select('owner_id, assigned_agent_id')
      .eq('id', conversationId)
      .single()

    if (!access || (access.owner_id !== user.id && access.assigned_agent_id !== user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*, agent:agent_id(email)')
      .eq('chatbot_id', chatbotId)
      .eq('session_id', conversation.session_id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })

  } catch (error) {
    console.error('Error in messages GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Send a message as a human agent
export async function POST(
  request: NextRequest,
  { params }: { params: { chatbotId: string; conversationId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbotId, conversationId } = params
    const { content, metadata } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Get conversation details
    const { data: conversation, error: conversationError } = await supabase
      .from('conversation_details')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user has access (owner or assigned agent)
    if (conversation.owner_id !== user.id && conversation.assigned_agent_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        chatbot_id: chatbotId,
        session_id: conversation.session_id,
        is_user_message: false, // Agent messages are treated as bot messages
        content: content.trim(),
        metadata: {
          ...metadata,
          sent_by: 'agent',
          agent_email: user.email
        },
        agent_id: user.id // Mark that this was sent by an agent
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update conversation status if needed
    if (conversation.status === 'waiting_for_agent') {
      await supabase
        .from('conversations')
        .update({ 
          status: 'agent_responding',
          assigned_agent_id: conversation.assigned_agent_id || user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
    }

    // Mark session as having human agent interaction
    await supabase
      .from('session_handoffs')
      .upsert({
        session_id: conversation.session_id,
        chatbot_id: chatbotId,
        agent_id: user.id,
        conversation_id: conversationId,
        status: 'active',
        handoff_reason: 'agent_message'
      }, {
        onConflict: 'session_id'
      })

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error sending agent message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
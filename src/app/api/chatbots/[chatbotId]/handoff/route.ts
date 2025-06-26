import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const { chatbotId } = params
    const body = await request.json()
    const { sessionId, reason, priority } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Create Supabase client with service role for public endpoint
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify chatbot exists and has hybrid mode enabled
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id, user_id, hybrid_mode_enabled, auto_handoff_triggers')
      .eq('id', chatbotId)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    if (!chatbot.hybrid_mode_enabled) {
      return NextResponse.json({ error: 'Human handoff is not available for this chatbot' }, { status: 400 })
    }

    // Create or update conversation with handoff request
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .upsert({
        chatbot_id: chatbotId,
        session_id: sessionId,
        status: 'waiting_for_agent',
        priority: priority || 'normal',
        handoff_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'chatbot_id,session_id'
      })
      .select()
      .single()

    if (conversationError) {
      console.error('Error creating handoff request:', conversationError)
      return NextResponse.json({ error: 'Failed to request handoff' }, { status: 500 })
    }

    // Create handoff record
    await supabase
      .from('session_handoffs')
      .insert({
        session_id: sessionId,
        chatbot_id: chatbotId,
        conversation_id: conversation.id,
        status: 'active',
        handoff_reason: reason || 'manual',
        handoff_type: 'manual'
      })

    // Create notification for chatbot owner
    await supabase
      .from('agent_notifications')
      .insert({
        agent_id: chatbot.user_id,
        chatbot_id: chatbotId,
        conversation_id: conversation.id,
        type: 'handoff_request',
        message: `Customer requested to speak with a human agent${reason ? `: ${reason}` : ''}`
      })

    // Auto-assign if agent is available
    const { data: assigned } = await supabase
      .rpc('auto_assign_conversation', { p_conversation_id: conversation.id })

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      status: 'waiting_for_agent',
      assigned: !!assigned,
      message: assigned 
        ? 'You have been connected with an agent. They will respond shortly.'
        : 'Your request has been received. An agent will be with you as soon as possible.'
    })

  } catch (error) {
    console.error('Error in handoff request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
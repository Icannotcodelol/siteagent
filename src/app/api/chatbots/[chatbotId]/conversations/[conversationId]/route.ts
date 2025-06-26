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

    // Get conversation with details
    const { data: conversation, error: conversationError } = await supabase
      .from('conversation_details')
      .select('*')
      .eq('id', conversationId)
      .eq('chatbot_id', chatbotId)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify access (owner or assigned agent)
    if (conversation.owner_id !== user.id && conversation.assigned_agent_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ conversation })

  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
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
    const body = await request.json()

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

    // Update conversation
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Handle status updates
    if (body.status) {
      updateData.status = body.status
      
      // Set timestamps based on status
      if (body.status === 'waiting_for_agent') {
        updateData.handoff_requested_at = new Date().toISOString()
      } else if (body.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString()
      }
    }

    // Handle other updates
    if (body.priority) updateData.priority = body.priority
    if (body.tags) updateData.tags = body.tags
    if (body.assigned_agent_id !== undefined) updateData.assigned_agent_id = body.assigned_agent_id
    if (body.customer_info) updateData.customer_info = body.customer_info

    const { data: conversation, error: updateError } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId)
      .eq('chatbot_id', chatbotId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating conversation:', updateError)
      return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
    }

    // Create notification if assigning to agent
    if (body.assigned_agent_id && body.assigned_agent_id !== user.id) {
      await supabase
        .from('agent_notifications')
        .insert({
          agent_id: body.assigned_agent_id,
          chatbot_id: chatbotId,
          conversation_id: conversationId,
          type: 'assignment',
          message: `You have been assigned to a conversation`
        })
    }

    return NextResponse.json({ conversation })

  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: Request, { params }: { params: { chatbotId: string } }) {
  const chatbotId = params.chatbotId
  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbotId missing' }, { status: 400 })
  }

  try {
    const supabase = createClient()
    
    const { data: alerts, error } = await supabase
      .from('chatbot_alerts')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: alerts })
  } catch (e: any) {
    console.error('Get alerts error', e)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { chatbotId: string } }) {
  const chatbotId = params.chatbotId
  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbotId missing' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { alert_type, threshold_value, is_enabled = true } = body

    if (!alert_type) {
      return NextResponse.json({ error: 'alert_type is required' }, { status: 400 })
    }

    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('chatbot_alerts')
      .insert({
        chatbot_id: chatbotId,
        alert_type,
        threshold_value,
        is_enabled
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('Create alert error', e)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { chatbotId: string } }) {
  const chatbotId = params.chatbotId
  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbotId missing' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { alert_id, ...updates } = body

    if (!alert_id) {
      return NextResponse.json({ error: 'alert_id is required' }, { status: 400 })
    }

    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('chatbot_alerts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', alert_id)
      .eq('chatbot_id', chatbotId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('Update alert error', e)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
} 
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request, { params }: { params: { chatbotId: string } }) {
  const chatbotId = params.chatbotId
  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbotId missing' }, { status: 400 })
  }

  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'daily'

  try {
    const supabase = createClient()

    if (type === 'daily') {
      const { data: dailyMetrics, error: metricsErr } = await supabase
        .from('chatbot_daily_metrics')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('date', { ascending: false })
        .limit(30)

      if (metricsErr) throw metricsErr

      const { data: feedback, error: fbErr } = await supabase
        .from('chatbot_feedback_summary')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('date', { ascending: false })
        .limit(30)

      if (fbErr) throw fbErr

      // Merge feedback into metrics by date
      const feedbackMap = new Map<string, { thumbs_up: number; thumbs_down: number }>()
      feedback.forEach((f) => feedbackMap.set(f.date as string, { thumbs_up: f.thumbs_up as number, thumbs_down: f.thumbs_down as number }))

      const merged = dailyMetrics.map((m) => {
        const fb = feedbackMap.get(m.date as string) || { thumbs_up: 0, thumbs_down: 0 }
        const satisfaction = fb.thumbs_up + fb.thumbs_down > 0 ? (fb.thumbs_up / (fb.thumbs_up + fb.thumbs_down)) * 100 : null
        return { ...m, ...fb, satisfaction }
      })

      return NextResponse.json({ data: merged })
    }

    if (type === 'hourly') {
      const { data: hourlyData, error } = await supabase
        .from('hourly_usage_patterns')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('hour_of_day', { ascending: true })

      if (error) throw error
      return NextResponse.json({ data: hourlyData })
    }

    if (type === 'questions') {
      const { data: questionsData, error } = await supabase
        .from('top_user_questions')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .limit(20)

      if (error) throw error
      return NextResponse.json({ data: questionsData })
    }

    if (type === 'conversations') {
      const { data: conversationsData, error } = await supabase
        .from('conversation_analytics')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('conversation_start', { ascending: false })
        .limit(100)

      if (error) throw error
      return NextResponse.json({ data: conversationsData })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (e: any) {
    console.error('Analytics route error', e)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
} 
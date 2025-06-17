import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const ANALYSIS_PROMPT = `
Analyze the following customer support chatbot conversations and provide insights.

Total messages: {totalCount}
Unique sessions: {uniqueSessions}
Date range: {dateRange}

MESSAGES:
{messages}

Please provide a comprehensive analysis with the following:
1. Executive Summary (2-3 sentences describing the overall pattern and key insights)
2. Top 5 Common Topics with frequency percentages and example messages
3. User Intent Categories (support, sales, feature requests, complaints, etc.) with percentages
4. Overall Sentiment Analysis (positive, neutral, negative percentages)
5. 10 Most Representative Questions that capture what users are asking
6. 3-5 Specific Improvement Suggestions for the chatbot based on gaps or issues found
7. Any unusual patterns, anomalies, or spikes in activity

Format your response as JSON with this exact structure:
{
  "executiveSummary": "string",
  "commonTopics": [
    {
      "topic": "string",
      "frequency": number (0-1),
      "examples": ["string", "string"]
    }
  ],
  "intentCategories": {
    "support": number (0-1),
    "sales": number (0-1),
    "features": number (0-1),
    "complaints": number (0-1),
    "other": number (0-1)
  },
  "sentiment": {
    "positive": number (0-1),
    "neutral": number (0-1),
    "negative": number (0-1)
  },
  "keyQuestions": ["string", ...],
  "improvements": "string",
  "anomalies": "string"
}
`

// GET - Retrieve existing summaries
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

    const chatbotId = params.chatbotId
    const searchParams = request.nextUrl.searchParams
    const summaryType = searchParams.get('type') || 'daily'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Verify user owns the chatbot
    const { data: chatbot } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    // Fetch summaries
    const { data: summaries, error } = await supabase
      .from('chatbot_message_summaries')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .eq('summary_type', summaryType)
      .order('date_start', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching summaries:', error)
      return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 })
    }

    return NextResponse.json({ summaries })
  } catch (error) {
    console.error('Error in summaries GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Generate new summary
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

    const chatbotId = params.chatbotId
    const body = await request.json()
    const { type = 'daily', startDate, endDate } = body

    // Verify user owns the chatbot
    const { data: chatbot } = await supabase
      .from('chatbots')
      .select('id, name')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    let dateStart: Date
    let dateEnd: Date

    if (type === 'custom' && startDate && endDate) {
      dateStart = new Date(startDate)
      dateEnd = new Date(endDate)
    } else if (type === 'daily') {
      dateStart = new Date(now.setHours(0, 0, 0, 0))
      dateEnd = new Date(now.setHours(23, 59, 59, 999))
    } else if (type === 'weekly') {
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      dateStart = new Date(now.setDate(now.getDate() - daysToMonday))
      dateStart.setHours(0, 0, 0, 0)
      dateEnd = new Date(dateStart)
      dateEnd.setDate(dateEnd.getDate() + 6)
      dateEnd.setHours(23, 59, 59, 999)
    } else if (type === 'monthly') {
      dateStart = new Date(now.getFullYear(), now.getMonth(), 1)
      dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else {
      return NextResponse.json({ error: 'Invalid summary type' }, { status: 400 })
    }

    // Check if summary already exists
    const { data: existingSummary } = await supabase
      .from('chatbot_message_summaries')
      .select('id')
      .eq('chatbot_id', chatbotId)
      .eq('summary_type', type)
      .eq('date_start', dateStart.toISOString())
      .eq('date_end', dateEnd.toISOString())
      .single()

    if (existingSummary) {
      return NextResponse.json({ 
        error: 'Summary already exists for this period',
        summaryId: existingSummary.id 
      }, { status: 409 })
    }

    // Use service role client to fetch messages
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch messages for the period
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('content, session_id, created_at')
      .eq('chatbot_id', chatbotId)
      .eq('is_user_message', true)
      .gte('created_at', dateStart.toISOString())
      .lte('created_at', dateEnd.toISOString())
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ 
        error: 'No messages found for the specified period' 
      }, { status: 404 })
    }

    // Count unique sessions
    const uniqueSessions = new Set(messages.map(m => m.session_id)).size

    // Prepare messages for analysis (limit to prevent token overflow)
    const messageSample = messages.length > 500 
      ? messages.sort(() => Math.random() - 0.5).slice(0, 500)
      : messages

    const messagesText = messageSample
      .map(m => `[${new Date(m.created_at).toLocaleString()}] ${m.content}`)
      .join('\n')

    // Generate analysis with OpenAI
    const startTime = Date.now()
    
    const prompt = ANALYSIS_PROMPT
      .replace('{totalCount}', messages.length.toString())
      .replace('{uniqueSessions}', uniqueSessions.toString())
      .replace('{dateRange}', `${dateStart.toLocaleDateString()} - ${dateEnd.toLocaleDateString()}`)
      .replace('{messages}', messagesText)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert chatbot analyst. Analyze user messages to provide actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const processingTime = Date.now() - startTime
    const analysis = JSON.parse(completion.choices[0].message.content || '{}')

    // Store the summary
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from('chatbot_message_summaries')
      .insert({
        chatbot_id: chatbotId,
        summary_type: type,
        date_start: dateStart.toISOString(),
        date_end: dateEnd.toISOString(),
        total_messages: messages.length,
        unique_sessions: uniqueSessions,
        executive_summary: analysis.executiveSummary || '',
        common_topics: analysis.commonTopics || [],
        user_intent_categories: analysis.intentCategories || {},
        sentiment_analysis: analysis.sentiment || {},
        key_questions: analysis.keyQuestions || [],
        improvement_suggestions: analysis.improvements || '',
        anomalies: analysis.anomalies || '',
        llm_model: 'gpt-4o-mini',
        processing_time_ms: processingTime
      })
      .select()
      .single()

    if (summaryError) {
      console.error('Error storing summary:', summaryError)
      return NextResponse.json({ error: 'Failed to store summary' }, { status: 500 })
    }

    return NextResponse.json({ 
      summary,
      message: 'Summary generated successfully'
    })

  } catch (error) {
    console.error('Error in summaries POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
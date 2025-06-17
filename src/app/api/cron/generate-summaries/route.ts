import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

async function generateSummaryForChatbot(
  chatbotId: string,
  type: 'daily' | 'weekly' | 'monthly',
  dateStart: Date,
  dateEnd: Date
) {
  try {
    // Check if summary already exists
    const { data: existingSummary } = await supabaseAdmin
      .from('chatbot_message_summaries')
      .select('id')
      .eq('chatbot_id', chatbotId)
      .eq('summary_type', type)
      .eq('date_start', dateStart.toISOString())
      .eq('date_end', dateEnd.toISOString())
      .single()

    if (existingSummary) {
      console.log(`Summary already exists for chatbot ${chatbotId} (${type})`)
      return
    }

    // Fetch messages for the period
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('content, session_id, created_at')
      .eq('chatbot_id', chatbotId)
      .eq('is_user_message', true)
      .gte('created_at', dateStart.toISOString())
      .lte('created_at', dateEnd.toISOString())
      .order('created_at', { ascending: true })

    if (messagesError || !messages || messages.length === 0) {
      console.log(`No messages found for chatbot ${chatbotId} (${type})`)
      return
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
    const { error: summaryError } = await supabaseAdmin
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

    if (summaryError) {
      console.error(`Error storing summary for chatbot ${chatbotId}:`, summaryError)
    } else {
      console.log(`Generated ${type} summary for chatbot ${chatbotId}`)
    }
  } catch (error) {
    console.error(`Error generating summary for chatbot ${chatbotId}:`, error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel Cron or similar)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const summaryType = searchParams.get('type') || 'daily'

    // Calculate date ranges based on type
    const now = new Date()
    let dateStart: Date
    let dateEnd: Date

    if (summaryType === 'daily') {
      // Yesterday's data
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      dateStart = new Date(yesterday.setHours(0, 0, 0, 0))
      dateEnd = new Date(yesterday.setHours(23, 59, 59, 999))
    } else if (summaryType === 'weekly') {
      // Last week's data (Monday to Sunday)
      const lastMonday = new Date(now)
      lastMonday.setDate(lastMonday.getDate() - 7 - (now.getDay() || 7) + 1)
      dateStart = new Date(lastMonday.setHours(0, 0, 0, 0))
      dateEnd = new Date(dateStart)
      dateEnd.setDate(dateEnd.getDate() + 6)
      dateEnd.setHours(23, 59, 59, 999)
    } else if (summaryType === 'monthly') {
      // Last month's data
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      dateStart = lastMonth
      dateEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    } else {
      return NextResponse.json({ error: 'Invalid summary type' }, { status: 400 })
    }

    // Get all active chatbots
    const { data: chatbots, error: chatbotsError } = await supabaseAdmin
      .from('chatbots')
      .select('id, user_id')

    if (chatbotsError || !chatbots) {
      console.error('Error fetching chatbots:', chatbotsError)
      return NextResponse.json({ error: 'Failed to fetch chatbots' }, { status: 500 })
    }

    console.log(`Starting ${summaryType} summary generation for ${chatbots.length} chatbots`)

    // Process chatbots in batches to avoid overwhelming the system
    const batchSize = 10
    for (let i = 0; i < chatbots.length; i += batchSize) {
      const batch = chatbots.slice(i, i + batchSize)
      await Promise.all(
        batch.map(chatbot => 
          generateSummaryForChatbot(chatbot.id, summaryType as any, dateStart, dateEnd)
        )
      )
    }

    return NextResponse.json({ 
      message: `Generated ${summaryType} summaries for ${chatbots.length} chatbots`,
      dateRange: { start: dateStart, end: dateEnd }
    })

  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
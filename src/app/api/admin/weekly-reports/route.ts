import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWeeklyReport } from '@/lib/services/email-service'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // Get all chatbots with their owners
    const { data: chatbots, error: chatbotsError } = await supabase
      .from('chatbots')
      .select(`
        id,
        name,
        profiles (
          id,
          email,
          full_name
        )
      `)
    
    if (chatbotsError) throw chatbotsError

    const reports = []
    const emailResults = []
    
    for (const chatbot of chatbots) {
      // Get weekly metrics for this chatbot
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { data: metrics, error: metricsError } = await supabase
        .from('chatbot_daily_metrics')
        .select('*')
        .eq('chatbot_id', chatbot.id)
        .gte('date', oneWeekAgo.toISOString().split('T')[0])
      
      if (metricsError) continue

      const { data: feedback, error: feedbackError } = await supabase
        .from('chatbot_feedback_summary')
        .select('*')
        .eq('chatbot_id', chatbot.id)
        .gte('date', oneWeekAgo.toISOString().split('T')[0])
      
      if (feedbackError) continue

      // Calculate totals
      const totalMessages = metrics.reduce((sum, m) => sum + (m.total_messages || 0), 0)
      const totalSessions = metrics.reduce((sum, m) => sum + (m.unique_sessions || 0), 0)
      const totalFeedback = feedback.reduce((sum, f) => sum + (f.thumbs_up || 0) + (f.thumbs_down || 0), 0)
      const totalPositive = feedback.reduce((sum, f) => sum + (f.thumbs_up || 0), 0)
      const satisfaction = totalFeedback > 0 ? Math.round((totalPositive / totalFeedback) * 100) : null

      const report = {
        chatbotId: chatbot.id,
        chatbotName: chatbot.name,
        ownerEmail: (chatbot.profiles as any)?.email,
        ownerName: (chatbot.profiles as any)?.full_name,
        weeklyStats: {
          totalMessages,
          totalSessions,
          satisfaction: satisfaction || 0,
          avgMessagesPerSession: totalSessions > 0 ? Math.round((totalMessages / totalSessions) * 10) / 10 : 0
        }
      }
      
      reports.push(report)

      // Send email if owner has an email address
      if (report.ownerEmail && report.ownerName) {
        try {
          const emailResult = await sendWeeklyReport(report)
          emailResults.push({
            chatbotId: chatbot.id,
            email: report.ownerEmail,
            success: true,
            messageId: emailResult.data?.id
          })
        } catch (emailError: any) {
          console.error(`Failed to send weekly report for ${chatbot.name}:`, emailError)
          emailResults.push({
            chatbotId: chatbot.id,
            email: report.ownerEmail,
            success: false,
            error: emailError.message
          })
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      reportsGenerated: reports.length,
      emailsSent: emailResults.filter(r => r.success).length,
      emailsFailed: emailResults.filter(r => !r.success).length,
      emailResults,
      reports: reports.slice(0, 5) // Return first 5 for preview
    })
    
  } catch (error: any) {
    console.error('Weekly reports error:', error)
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 })
  }
} 
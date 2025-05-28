import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
          satisfaction,
          avgMessagesPerSession: totalSessions > 0 ? Math.round((totalMessages / totalSessions) * 10) / 10 : 0
        }
      }
      
      reports.push(report)
    }

    // Here you would typically send emails using a service like SendGrid, Resend, etc.
    // For now, we'll just return the report data
    
    // EMAIL INTEGRATION OPTIONS:
    // 
    // Option 1: Resend (recommended)
    // const { Resend } = require('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // 
    // for (const report of reports) {
    //   if (report.ownerEmail) {
    //     await resend.emails.send({
    //       from: 'analytics@siteagent.eu',
    //       to: report.ownerEmail,
    //       subject: `Weekly Analytics for ${report.chatbotName}`,
    //       html: generateEmailHTML(report)
    //     })
    //   }
    // }
    //
    // Option 2: SendGrid
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // 
    // Option 3: Nodemailer (SMTP)
    // const nodemailer = require('nodemailer')
    // const transporter = nodemailer.createTransporter({...})
    
    return NextResponse.json({ 
      success: true, 
      reportsGenerated: reports.length,
      reports: reports.slice(0, 5) // Return first 5 for preview
    })
    
  } catch (error: any) {
    console.error('Weekly reports error:', error)
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 })
  }
} 
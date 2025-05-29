import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/services/email-service'

interface ContactFormData {
  name: string
  email: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message }: ContactFormData = await request.json()

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Send email notification to admin
    const adminHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Submitted at: ${new Date().toLocaleString()}
      </p>
    `

    // Send confirmation email to user
    const userHtml = `
      <h2>Thank you for contacting SiteAgent!</h2>
      <p>Hi ${name},</p>
      <p>We've received your message and will get back to you within 24 hours.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Your message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
      
      <p>Best regards,<br>The SiteAgent Team</p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        If you didn't submit this form, please ignore this email.
      </p>
    `

    // Send to admin
    await sendEmail({
      to: 'henkes2max@gmail.com', // Replace with your admin email
      subject: `New Contact Form: ${name}`,
      html: adminHtml,
      from: 'SiteAgent Contact <contact@siteagent.eu>'
    })

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting SiteAgent',
      html: userHtml,
      from: 'SiteAgent <noreply@siteagent.eu>'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully' 
    })

  } catch (error: any) {
    console.error('Contact form error:', error)
    
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
} 
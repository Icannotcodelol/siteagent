import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

/**
 * Send a generic email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  // Ensure at least one of html or text is provided
  if (!options.html && !options.text) {
    throw new Error('Either html or text content must be provided')
  }

  try {
    const emailData: any = {
      from: options.from || 'SiteAgent <noreply@siteagent.eu>',
      to: options.to,
      subject: options.subject,
    }

    // Add html or text content based on what's provided
    if (options.html) {
      emailData.html = options.html
    }
    if (options.text) {
      emailData.text = options.text
    }

    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}

/**
 * Send payment failure notification
 */
export async function sendPaymentFailureNotification(userEmail: string, userName: string) {
  const html = generatePaymentFailureHTML(userName)
  
  return sendEmail({
    to: userEmail,
    subject: 'Payment Failed - Action Required',
    html,
    from: 'SiteAgent Billing <billing@siteagent.eu>'
  })
}

/**
 * Send usage overage warning
 */
export async function sendUsageOverageWarning(
  userEmail: string, 
  userName: string, 
  currentUsage: number, 
  limit: number
) {
  const html = generateUsageOverageHTML(userName, currentUsage, limit)
  
  return sendEmail({
    to: userEmail,
    subject: 'Usage Limit Warning - SiteAgent',
    html,
    from: 'SiteAgent Notifications <notifications@siteagent.eu>'
  })
}

/**
 * Generate HTML for payment failure notification
 */
function generatePaymentFailureHTML(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Failed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        
        <div class="content">
          <p>Hello ${userName},</p>
          <p>We were unable to process your payment for your SiteAgent subscription. Your service may be interrupted if this isn't resolved soon.</p>
          
          <p><strong>What you need to do:</strong></p>
          <ul>
            <li>Update your payment method</li>
            <li>Ensure your card has sufficient funds</li>
            <li>Contact your bank if the issue persists</li>
          </ul>
          
          <p><a href="https://www.siteagent.eu/dashboard/billing" class="button">Update Payment Method</a></p>
          
          <p>If you have any questions, please contact our support team.</p>
        </div>
        
        <div class="footer">
          <p>SiteAgent - AI Chatbot Platform</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for usage overage warning
 */
function generateUsageOverageHTML(userName: string, currentUsage: number, limit: number): string {
  const percentage = Math.round((currentUsage / limit) * 100)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Usage Warning</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .usage-bar { background: #f3f4f6; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
        .usage-fill { background: #F59E0B; height: 100%; width: ${percentage}%; }
        .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Usage Warning</h1>
        </div>
        
        <div class="content">
          <p>Hello ${userName},</p>
          <p>You've used <strong>${currentUsage}</strong> out of <strong>${limit}</strong> messages this billing cycle (${percentage}%).</p>
          
          <div class="usage-bar">
            <div class="usage-fill"></div>
          </div>
          
          <p>You're approaching your plan limit. Consider upgrading to avoid service interruption.</p>
          
          <p><a href="https://www.siteagent.eu/dashboard/billing" class="button">Upgrade Plan</a></p>
        </div>
        
        <div class="footer">
          <p>SiteAgent - AI Chatbot Platform</p>
        </div>
      </div>
    </body>
    </html>
  `
} 
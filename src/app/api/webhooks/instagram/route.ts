import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/encryption';
import crypto from 'crypto';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const appSecret = process.env.META_APP_SECRET!;
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Handle webhook verification (GET request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Check if it's a subscribe request
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('Instagram webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Handle webhook events (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = JSON.parse(body);

    // Process each entry
    for (const entry of data.entry) {
      const pageId = entry.id;
      const messaging = entry.messaging || [];

      for (const event of messaging) {
        // Check if it's a message event
        if (event.message && !event.message.is_echo) {
          await handleIncomingMessage(pageId, event);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Instagram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleIncomingMessage(pageId: string, event: any) {
  const senderId = event.sender.id;
  const recipientId = event.recipient.id;
  const message = event.message;
  const messageText = message.text;
  const messageId = message.mid;
  const timestamp = event.timestamp;

  console.log(`Received message from ${senderId}: ${messageText}`);

  try {
    // Find chatbot connected to this Instagram account
    const { data: connections } = await supabaseAdmin
      .from('instagram_page_connections')
      .select('user_id, instagram_business_account_id, page_access_token')
      .eq('page_id', pageId)
      .limit(1);

    if (!connections || connections.length === 0) {
      console.log('No connection found for page:', pageId);
      return;
    }

    const connection = connections[0];
    const userId = connection.user_id;

    // Find active chatbot with Instagram integration enabled
    const { data: chatbots } = await supabaseAdmin
      .from('chatbots')
      .select('id, name')
      .eq('user_id', userId)
      .eq('integration_instagram', true)
      .limit(1);

    if (!chatbots || chatbots.length === 0) {
      console.log('No active chatbot with Instagram integration for user:', userId);
      return;
    }

    const chatbotId = chatbots[0].id;

    // Store the webhook event
    await supabaseAdmin
      .from('instagram_webhook_events')
      .insert({
        chatbot_id: chatbotId,
        event_id: messageId,
        event_type: 'message',
        sender_id: senderId,
        recipient_id: recipientId,
        message_text: messageText,
        message_id: messageId,
        timestamp: timestamp,
        processed: false,
      });

    // Process the message and send response
    await processMessageAndRespond(chatbotId, senderId, messageText, connection.page_access_token);

  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

async function processMessageAndRespond(
  chatbotId: string,
  senderId: string,
  messageText: string,
  encryptedPageToken: string
) {
  try {
    // Get chatbot response using the public chat API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatbotId,
        message: messageText,
        conversationId: `instagram_${senderId}`, // Use sender ID as conversation ID
      }),
    });

    if (!response.ok) {
      console.error('Failed to get chatbot response');
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    let fullResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullResponse += data.content;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }

    // Send response back to Instagram
    if (fullResponse) {
      const pageAccessToken = decrypt(encryptedPageToken);
      if (!pageAccessToken) {
        console.error('Failed to decrypt page access token');
        return;
      }

      await sendInstagramMessage(senderId, fullResponse, pageAccessToken);
    }

  } catch (error) {
    console.error('Error processing message:', error);
  }
}

async function sendInstagramMessage(recipientId: string, message: string, pageAccessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send Instagram message:', error);
    } else {
      console.log('Successfully sent Instagram message');
    }
  } catch (error) {
    console.error('Error sending Instagram message:', error);
  }
} 
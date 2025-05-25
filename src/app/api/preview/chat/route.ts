import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Constants
const SIMILARITY_THRESHOLD = 0.75;
const MATCH_COUNT = 5;

// Global base prompt for preview chatbots
const PREVIEW_BASE_PROMPT = `You are a helpful AI assistant created by SiteAgent. You have been given access to specific content that was uploaded by a user who is testing our chatbot preview feature.

Your role is to:
1. Answer questions based ONLY on the provided content
2. Be helpful, accurate, and concise
3. If asked about something not in the content, politely explain that you can only answer questions about the uploaded content
4. Encourage the user to try SiteAgent for their own website if they seem interested

Always maintain a friendly and professional tone. If the user asks about SiteAgent itself, you can mention that this is a preview of our AI chatbot platform that can be embedded on any website.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Function to find relevant content using vector similarity
async function findRelevantContent(sessionToken: string, query: string): Promise<string[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    // Search for similar chunks using pgvector
    const { data: chunks, error } = await supabase.rpc('match_preview_documents', {
      session_token: sessionToken,
      query_embedding: queryEmbedding.data[0].embedding,
      match_threshold: SIMILARITY_THRESHOLD,
      match_count: MATCH_COUNT,
    });

    if (error) {
      console.error('Error searching for relevant content:', error);
      return [];
    }

    return chunks?.map((chunk: any) => chunk.chunk_text) || [];
  } catch (error) {
    console.error('Error in findRelevantContent:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { sessionToken, message, conversationHistory = [] } = body;

    if (!sessionToken || !message) {
      return NextResponse.json(
        { error: 'Session token and message are required' },
        { status: 400 }
      );
    }

    // Get session info
    const { data: session, error: sessionError } = await supabase
      .from('preview_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 404 }
      );
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 410 }
      );
    }

    // Check message limit
    if (session.message_count >= session.max_messages) {
      return NextResponse.json(
        { 
          error: 'Message limit reached',
          upgradePrompt: 'You\'ve reached the 10 message limit for this preview. Sign up for SiteAgent to get unlimited conversations!'
        },
        { status: 429 }
      );
    }

    // Check if embeddings are ready
    if (session.embedding_status !== 'completed') {
      return NextResponse.json(
        { error: 'Content is still being processed. Please wait a moment and try again.' },
        { status: 202 }
      );
    }

    // Find relevant content
    const relevantContent = await findRelevantContent(sessionToken, message);

    // Build context for the AI
    let context = '';
    if (relevantContent.length > 0) {
      context = `Based on the following content:\n\n${relevantContent.join('\n\n')}\n\n`;
    }

    // Build conversation history
    const messages: ChatMessage[] = [
      { role: 'user', content: `${PREVIEW_BASE_PROMPT}\n\n${context}Please answer the following question: ${message}` }
    ];

    // Add conversation history if provided
    if (conversationHistory.length > 0) {
      // Take last 6 messages to keep context manageable
      const recentHistory = conversationHistory.slice(-6);
      messages.unshift(...recentHistory);
    }

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

    // Store the conversation
    await supabase
      .from('preview_chat_messages')
      .insert([
        {
          session_token: sessionToken,
          is_user_message: true,
          content: message,
        },
        {
          session_token: sessionToken,
          is_user_message: false,
          content: aiResponse,
        }
      ]);

    // Update message count
    await supabase
      .from('preview_sessions')
      .update({ 
        message_count: session.message_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('session_token', sessionToken);

    // Check if approaching limit
    const remainingMessages = session.max_messages - (session.message_count + 1);
    let upgradePrompt = null;
    
    if (remainingMessages <= 2) {
      upgradePrompt = `You have ${remainingMessages} messages remaining in this preview. Sign up for SiteAgent to get unlimited conversations!`;
    }

    return NextResponse.json({
      response: aiResponse,
      remainingMessages,
      upgradePrompt
    });

  } catch (error) {
    console.error('Error in preview chat route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
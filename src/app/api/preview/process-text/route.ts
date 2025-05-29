import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Initialize clients
// Use service role key when available. Fallback to anon key for local
// development to avoid runtime crashes when the secret is undefined.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Rate limiting function
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxRequests = 10; // Increased from 3 to 10 for testing

  const userLimit = rateLimitStore.get(clientIP);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Simple text sanitization function
function sanitizeText(text: string): string {
  return text
    .replace(/\u0000/g, '') // Remove null characters
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Remove other control characters
    .replace(/\uFFFD/g, '') // Remove replacement characters
    .replace(/[\uD800-\uDFFF]/g, '') // Remove lone surrogate characters that cause JSON issues
    .replace(/[^\x09\x0A\x0D\x20-\x7E\x80-\xFF]/g, '') // Keep only printable ASCII and extended ASCII
    .trim();
}

// Simple text splitter function
function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  // Validate inputs
  if (!text || text.length === 0) {
    return [];
  }
  
  if (chunkSize <= 0) {
    chunkSize = 1000;
  }
  
  if (overlap >= chunkSize) {
    overlap = Math.floor(chunkSize / 2);
  }
  
  // Limit text size to prevent memory issues (max 500KB)
  const maxTextSize = 500000;
  if (text.length > maxTextSize) {
    text = text.substring(0, maxTextSize);
  }
  
  // Prevent infinite loops with a maximum chunk count
  const maxChunks = 1000;
  let chunkCount = 0;
  
  while (start < text.length && chunkCount < maxChunks) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
      chunkCount++;
    }
    
    // Move start position, ensuring we make progress
    const nextStart = end - overlap;
    if (nextStart <= start) {
      start = end; // Ensure we always move forward
    } else {
      start = nextStart;
    }
    
    // Break if we've reached the end
    if (end >= text.length) {
      break;
    }
  }
  
  return chunks;
}

// Generate suggested questions based on content
async function generateSuggestedQuestions(content: string): Promise<string[]> {
  try {
    const prompt = `Based on the following text content, generate 3-4 relevant questions that someone might ask about this information. Return only the questions, one per line, without numbering or bullet points:

${content.substring(0, 2000)}...`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const questions = response.choices[0]?.message?.content
      ?.split('\n')
      .filter(q => q.trim().length > 0)
      .map(q => q.trim().replace(/^[0-9.-]+\s*/, ''))
      .slice(0, 4) || [];

    return questions;
  } catch (error) {
    console.error('Error generating suggested questions:', error);
    return [
      'What is this content about?',
      'Can you summarize the main points?',
      'What are the key details mentioned?'
    ];
  }
}

// Process text and create embeddings
async function processText(sessionToken: string, content: string) {
  try {
    // Update status to processing
    await supabase
      .from('preview_sessions')
      .update({ embedding_status: 'processing' })
      .eq('session_token', sessionToken);

    // Sanitize content to remove problematic characters
    const sanitizedContent = sanitizeText(content);
    
    if (!sanitizedContent.trim()) {
      throw new Error('No valid text content after sanitization');
    }

    // Split text into chunks
    const chunks = splitTextIntoChunks(sanitizedContent);
    
    // Generate embeddings for each chunk
    const embeddings = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: chunks,
    });

    // Store chunks with embeddings
    const chunkData = chunks.map((chunk: string, index: number) => ({
      session_token: sessionToken,
      chunk_text: sanitizeText(chunk),
      embedding: embeddings.data[index].embedding,
      token_count: Math.ceil(chunk.length / 4), // Rough token estimate
    }));

    const { error: insertError } = await supabase
      .from('preview_document_chunks')
      .insert(chunkData);

    if (insertError) {
      console.error('Error inserting chunks:', insertError);
      throw new Error(`Failed to insert chunks: ${insertError.message}`);
    }

    // Generate suggested questions
    const suggestedQuestions = await generateSuggestedQuestions(sanitizedContent);

    // Update session with completion status and suggested questions
    await supabase
      .from('preview_sessions')
      .update({ 
        embedding_status: 'completed',
        suggested_questions: suggestedQuestions,
        content_text: sanitizedContent.substring(0, 10000) // Store first 10k chars for reference
      })
      .eq('session_token', sessionToken);

  } catch (error) {
    console.error('Error processing text:', error);
    await supabase
      .from('preview_sessions')
      .update({ 
        embedding_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('session_token', sessionToken);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You can only create 10 previews per day.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Validate text length (max 5000 characters)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text content must be less than 5000 characters' },
        { status: 400 }
      );
    }

    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text content must be at least 50 characters long' },
        { status: 400 }
      );
    }

    // Generate session token
    const sessionToken = uuidv4();

    // Create preview session
    const { data: session, error: sessionError } = await supabase
      .from('preview_sessions')
      .insert({
        session_token: sessionToken,
        content_type: 'text',
        content_data: {
          textLength: text.length,
        },
        client_ip: clientIP,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating preview session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create preview session' },
        { status: 500 }
      );
    }

    // Process text asynchronously
    processText(sessionToken, text).catch(console.error);

    return NextResponse.json({
      sessionToken,
      status: 'processing',
      message: 'Text content received. Processing embeddings...'
    });

  } catch (error) {
    console.error('Error in process-text route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
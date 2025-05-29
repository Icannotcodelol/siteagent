import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Initialize clients
// Prefer the service-role key for unrestricted DB access. When running the
// application locally or in preview environments the key might be missing.
// In that case we gracefully fall back to the public anon key so that the
// endpoint still works instead of throwing at runtime. Make sure the anon
// key has the correct RLS policies for the preview tables when using this
// fallback.
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
    const prompt = `Based on the following website content, generate 3-4 relevant questions that someone might ask about this information. Return only the questions, one per line, without numbering or bullet points:

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
      'What is this website about?',
      'Can you summarize the main information?',
      'What services or products are offered?'
    ];
  }
}

// Simple web scraping function
async function scrapeWebsite(url: string): Promise<string> {
  try {
    // Some sites block generic or bot-like user-agents ( e.g. Cloudflare '403').
    // We first try with a modern Chrome UA string. If we still receive a status
    // in the 4xx range we make a second attempt with Safari, falling back only
    // then to an error.

    const uaStrings = [
      // Latest Chrome on Mac
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      // Safari on iPhone
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    ];

    let response: Response | null = null;

    for (const ua of uaStrings) {
      response = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // Break early if the site lets us in
      if (response.status < 400) break;
    }

    if (!response || !response.ok) {
      throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
    }

    const html = await response.text();
    
    // Limit HTML size to prevent memory issues (max 2MB)
    const maxHtmlSize = 2 * 1024 * 1024;
    const limitedHtml = html.length > maxHtmlSize ? html.substring(0, maxHtmlSize) : html;
    
    // Simple HTML to text conversion (remove tags and clean up)
    let textContent = limitedHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '') // Remove navigation
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '') // Remove headers
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '') // Remove footers
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '') // Remove sidebars
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Limit final text content (max 200KB)
    const maxTextSize = 200000;
    if (textContent.length > maxTextSize) {
      textContent = textContent.substring(0, maxTextSize);
    }

    if (textContent.length < 100) {
      throw new Error('Website content too short or empty');
    }

    return textContent;
  } catch (error) {
    console.error('Error scraping website:', error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validate URL
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Process website and create embeddings
async function processWebsite(sessionToken: string, content: string) {
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
    let chunks = splitTextIntoChunks(sanitizedContent);

    // Limit number of chunks for the preview environment. We must keep the
    // total token count under ~8k (OpenAI embedding limit). 32 × 1k-char
    // chunks ≈ 8 000 tokens so that is a safe upper-bound.
    if (chunks.length > 32) {
      chunks = chunks.slice(0, 32);
    }
    
    // Generate embeddings – call the API in batches of ≤32 inputs to stay
    // comfortably under request limits and reduce latency spikes.
    const embeddingsData: { embedding: number[] }[] = [];
    const batchSize = 32;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const resp = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: batch,
      });
      embeddingsData.push(...resp.data);
    }

    // Store chunks with embeddings
    const chunkData = chunks.map((chunk: string, index: number) => ({
      session_token: sessionToken,
      chunk_text: sanitizeText(chunk),
      embedding: embeddingsData[index].embedding,
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
    console.error('Error processing website:', error);
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
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
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
        content_type: 'website',
        content_data: {
          url: url,
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

    // Scrape website content
    let content = '';
    try {
      content = await scrapeWebsite(url);
    } catch (error) {
      console.error('Error scraping website:', error);
      await supabase
        .from('preview_sessions')
        .update({ 
          embedding_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Failed to scrape website'
        })
        .eq('session_token', sessionToken);
      
      return NextResponse.json(
        { error: 'Failed to scrape website content' },
        { status: 500 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'No content found on the website' },
        { status: 400 }
      );
    }

    // Offload heavy embedding work to Supabase Edge Function to keep the Next.js route fast
    const { error: invokeError } = await supabase.functions.invoke('preview-embeddings', {
      body: { sessionToken, content },
    });

    if (invokeError) {
      console.error('Failed to invoke preview-embeddings function:', invokeError);
      // We do NOT fail the request; the session will eventually timeout and surface the error in the UI.
    }

    return NextResponse.json({
      sessionToken,
      status: 'processing',
      message: 'Website scraped successfully. Processing embeddings...'
    });

  } catch (error) {
    console.error('Error in scrape-website route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { processCsvToText, detectCsvDelimiter, isValidCsv } from '@/lib/services/csv-processor';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    const prompt = `Based on the following content, generate 3-4 relevant questions that someone might ask about this information. Return only the questions, one per line, without numbering or bullet points:

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
      'What is this document about?',
      'Can you summarize the main points?',
      'What are the key details I should know?'
    ];
  }
}

// Simple fallback PDF text extraction for problematic files
function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    // Convert buffer to string and look for readable text patterns
    const pdfString = buffer.toString('binary');
    const textParts: string[] = [];
    
    // Look for text between parentheses (common PDF text encoding)
    const textMatches = pdfString.match(/\(([^)]{2,})\)/g);
    if (textMatches) {
      for (const match of textMatches) {
        const text = match.slice(1, -1); // Remove parentheses
        // Only include text that looks readable
        if (/[a-zA-Z0-9\s]{3,}/.test(text) && !text.includes('\\') && text.length > 2) {
          textParts.push(text);
        }
      }
    }
    
    // Look for hex-encoded text
    const hexMatches = pdfString.match(/<([0-9A-Fa-f]{4,})>/g);
    if (hexMatches) {
      for (const match of hexMatches) {
        const hex = match.slice(1, -1);
        if (hex.length % 2 === 0) {
          try {
            let text = '';
            for (let i = 0; i < hex.length; i += 2) {
              const charCode = parseInt(hex.substr(i, 2), 16);
              if (charCode >= 32 && charCode <= 126) {
                text += String.fromCharCode(charCode);
              }
            }
            if (text.length > 2 && /[a-zA-Z]/.test(text)) {
              textParts.push(text);
            }
          } catch (e) {
            // Ignore invalid hex
          }
        }
      }
    }
    
    const extractedText = textParts.join(' ').replace(/\s+/g, ' ').trim();
    return extractedText;
  } catch (error) {
    console.error('Fallback PDF extraction failed:', error);
    return '';
  }
}

// Extract text from PDF using pdf-parse library (same as dashboard background job)
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    console.log('Extracting PDF text using pdf-parse library...');
    
    // Use the same specific import path as the dashboard to avoid test file loading
    // @ts-ignore - pdf-parse doesn't have TypeScript definitions
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    
    // Try parsing with different options for better compatibility
    const options = {
      // Normalize whitespace and handle encoding issues
      normalizeWhitespace: true,
      // Don't stop on first error
      stopAtFirstError: false,
      // Maximum pages to process (prevent hanging on large files)
      max: 50
    };
    
    const data = await pdfParse(buffer, options);
    
    if (!data.text || data.text.trim().length < 10) {
      throw new Error('PDF contains insufficient readable text content');
    }
    
    // Clean up the extracted text
    const cleanText = data.text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable characters except newlines and tabs
      .trim();
    
    if (cleanText.length < 10) {
      throw new Error('PDF text extraction resulted in insufficient readable content');
    }
    
    console.log(`Successfully extracted ${cleanText.length} characters from PDF`);
    return cleanText;
  } catch (error) {
    console.error('PDF parsing failed:', error);
    
    // Try fallback method for problematic PDFs
    console.log('Attempting fallback PDF text extraction...');
    const fallbackText = extractTextFromPdfBuffer(buffer);
    
    if (fallbackText && fallbackText.length >= 10) {
      console.log(`Fallback extraction successful: ${fallbackText.length} characters`);
      return fallbackText;
    }
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('bad XRef entry') || error.message.includes('FormatError')) {
        throw new Error('This PDF file appears to be corrupted or uses an unsupported format. Please try:\n1. Re-saving the PDF from the original application\n2. Converting it to a TXT file\n3. Using the "Paste Text" option instead');
      }
      if (error.message.includes('Invalid PDF structure') || error.message.includes('PDF header')) {
        throw new Error('This file does not appear to be a valid PDF. Please ensure you are uploading a proper PDF file.');
      }
      if (error.message.includes('encrypted') || error.message.includes('password')) {
        throw new Error('This PDF is password-protected or encrypted. Please remove the password protection and try again.');
      }
    }
    
    throw new Error('Failed to extract text from PDF. This PDF might be image-based, encrypted, or in an unsupported format. Please try converting it to a TXT file or use the "Paste Text" option.');
  }
}

// Process document and create embeddings
async function processDocument(sessionToken: string, content: string) {
  try {
    console.log('processDocument called with content length:', content.length);
    console.log('processDocument content preview:', content.substring(0, 100));
    
    // Update status to processing
    await supabase
      .from('preview_sessions')
      .update({ embedding_status: 'processing' })
      .eq('session_token', sessionToken);

    // Sanitize content to remove problematic characters
    // const sanitizedContent = sanitizeText(content);
    const sanitizedContent = content; // Temporarily bypass sanitization to test
    console.log('After sanitization, content length:', sanitizedContent.length);
    console.log('Sanitized content preview:', sanitizedContent.substring(0, 100));
    
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
    console.error('Error processing document:', error);
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/csv'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, TXT, and CSV files are supported' },
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
        content_type: 'document',
        content_data: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
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

    // Process file content using the same system as dashboard
    let content = '';
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      if (file.type === 'application/pdf') {
        content = await extractPdfText(buffer);
        console.log('PDF content extracted, first 200 chars:', content.substring(0, 200));
      } else if (file.type === 'text/plain') {
        content = buffer.toString('utf-8');
      } else if (file.type === 'text/csv' || file.type === 'application/csv') {
        const csvContent = buffer.toString('utf-8');
        
        // Validate CSV format
        if (!isValidCsv(csvContent)) {
          return NextResponse.json(
            { error: 'Invalid CSV format. Please ensure your file is properly formatted.' },
            { status: 400 }
          );
        }

        // Detect delimiter and process CSV
        const delimiter = detectCsvDelimiter(csvContent);
        const csvResult = processCsvToText(csvContent, { 
          delimiter,
          includeHeaders: true,
          maxRows: 5000 // Limit for preview
        });

        if (csvResult.errors.length > 0) {
          console.warn('CSV processing warnings:', csvResult.errors);
        }

        content = csvResult.text;
        console.log(`CSV processed: ${csvResult.rowCount} rows, ${csvResult.columnCount} columns`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      return NextResponse.json(
        { error: 'Failed to process file content' },
        { status: 500 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'No text content found in the file' },
        { status: 400 }
      );
    }

    console.log('About to process document with content length:', content.length);
    console.log('Content preview:', content.substring(0, 100));

    // Process document asynchronously
    processDocument(sessionToken, content).catch(console.error);

    return NextResponse.json({
      sessionToken,
      status: 'processing',
      message: 'Document uploaded successfully. Processing embeddings...'
    });

  } catch (error) {
    console.error('Error in upload-document route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
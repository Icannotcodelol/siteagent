import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface PdfParseRequest {
  fileData: string; // base64 encoded PDF
  fileName: string;
}

interface PdfParseResponse {
  success: boolean;
  text?: string;
  error?: string;
}

// Simple zlib decompression for FlateDecode streams
function decompressFlateDecode(compressedData: Uint8Array): string {
  try {
    // For now, we'll skip decompression and focus on uncompressed content
    // In a full implementation, we'd use a zlib library here
    return '';
  } catch (error) {
    return '';
  }
}

// Enhanced PDF text extraction using multiple methods
async function extractTextFromPdf(pdfBuffer: Uint8Array): Promise<string> {
  try {
    // Convert buffer to string for pattern matching
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    
    let extractedText = '';
    const textParts: string[] = [];
    
    console.log(`Processing PDF buffer of ${pdfBuffer.length} bytes`);
    
    // Method 1: Extract text from uncompressed stream objects
    const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
    let streamMatch;
    while ((streamMatch = streamPattern.exec(pdfString)) !== null) {
      const streamContent = streamMatch[1];
      
      // Check if this stream is compressed
      const isCompressed = pdfString.substring(Math.max(0, streamMatch.index - 200), streamMatch.index)
        .includes('/Filter') && 
        (pdfString.substring(Math.max(0, streamMatch.index - 200), streamMatch.index).includes('/FlateDecode') ||
         pdfString.substring(Math.max(0, streamMatch.index - 200), streamMatch.index).includes('/DCTDecode'));
      
      if (!isCompressed) {
        // Look for text patterns in uncompressed streams
        const textInStream = extractTextFromStream(streamContent);
        if (textInStream) {
          textParts.push(textInStream);
        }
      }
    }
    
    // Method 2: Look for text between parentheses in text objects
    const textObjectPattern = /BT\s*([\s\S]*?)\s*ET/g;
    let textObjectMatch;
    while ((textObjectMatch = textObjectPattern.exec(pdfString)) !== null) {
      const textContent = textObjectMatch[1];
      
      // Extract text from parentheses within text objects
      const parenthesesMatches = textContent.match(/\(([^)]*)\)/g);
      if (parenthesesMatches) {
        for (const match of parenthesesMatches) {
          let text = match.slice(1, -1); // Remove parentheses
          
          // Skip if it's clearly metadata or binary
          if (isValidText(text)) {
            text = decodeTextEscapes(text);
            textParts.push(text);
          }
        }
      }
    }
    
    // Method 3: Look for Tj commands (show text)
    const tjPattern = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjPattern.exec(pdfString)) !== null) {
      let text = tjMatch[1];
      
      if (isValidText(text)) {
        text = decodeTextEscapes(text);
        textParts.push(text);
      }
    }
    
    // Method 4: Look for TJ array commands (show text with positioning)
    const tjArrayPattern = /\[([^\]]*)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayPattern.exec(pdfString)) !== null) {
      const arrayContent = tjArrayMatch[1];
      
      // Extract strings from the array
      const stringMatches = arrayContent.match(/\(([^)]*)\)/g);
      if (stringMatches) {
        for (const stringMatch of stringMatches) {
          let text = stringMatch.slice(1, -1);
          
          if (isValidText(text)) {
            text = decodeTextEscapes(text);
            textParts.push(text);
          }
        }
      }
    }
    
    // Method 5: Look for hex-encoded text
    const hexPattern = /<([0-9A-Fa-f]+)>/g;
    let hexMatch;
    while ((hexMatch = hexPattern.exec(pdfString)) !== null) {
      const hex = hexMatch[1];
      if (hex.length % 2 === 0) {
        try {
          let text = '';
          for (let i = 0; i < hex.length; i += 2) {
            const charCode = parseInt(hex.substr(i, 2), 16);
            if (charCode >= 32 && charCode <= 126) {
              text += String.fromCharCode(charCode);
            }
          }
          if (isValidText(text)) {
            textParts.push(text);
          }
        } catch (e) {
          // Ignore invalid hex
        }
      }
    }
    
    // Method 6: Extract text from object definitions
    const objPattern = /(\d+)\s+\d+\s+obj\s*([\s\S]*?)\s*endobj/g;
    let objMatch;
    while ((objMatch = objPattern.exec(pdfString)) !== null) {
      const objContent = objMatch[2];
      
      // Look for text in object content
      const textMatches = objContent.match(/\(([^)]*)\)/g);
      if (textMatches) {
        for (const match of textMatches) {
          let text = match.slice(1, -1);
          if (isValidText(text)) {
            text = decodeTextEscapes(text);
            textParts.push(text);
          }
        }
      }
    }
    
    // Method 7: Look for plain text patterns (fallback)
    if (textParts.length === 0) {
      console.log('No text found with standard methods, trying fallback extraction');
      
      // Try to find readable text sequences
      const readableTextPattern = /[A-Za-z][A-Za-z0-9\s.,!?;:'"()-]{5,}/g;
      const plainTextMatches = pdfString.match(readableTextPattern);
      if (plainTextMatches) {
        for (const match of plainTextMatches) {
          // Filter out obvious PDF structure elements
          if (!match.includes('obj') && 
              !match.includes('endobj') && 
              !match.includes('stream') &&
              !match.includes('endstream') &&
              !match.includes('Filter') &&
              !match.includes('Length') &&
              !match.includes('Type') &&
              !match.includes('Font') &&
              !match.includes('Page') &&
              !match.includes('MediaBox') &&
              !match.includes('Resources') &&
              !match.includes('startxref') &&
              !match.includes('xref') &&
              !match.includes('trailer') &&
              isValidText(match)) {
            textParts.push(match.trim());
          }
        }
      }
    }
    
    // Combine and clean up extracted text
    extractedText = textParts.join(' ');
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Remove duplicate words that often occur in PDF extraction
    const words = extractedText.split(/\s+/);
    const uniqueWords: string[] = [];
    const seen = new Set<string>();
    
    for (const word of words) {
      const cleanWord = word.toLowerCase().trim();
      if (cleanWord.length > 0 && !seen.has(cleanWord)) {
        uniqueWords.push(word);
        seen.add(cleanWord);
        
        // Limit to prevent excessive duplication
        if (seen.size > 1000) break;
      }
    }
    
    extractedText = uniqueWords.join(' ');
    
    if (extractedText.length < 10) {
      throw new Error('Insufficient readable text content extracted from PDF. This PDF may be image-based, heavily compressed, or encrypted.');
    }
    
    console.log(`Successfully extracted ${extractedText.length} characters of text`);
    return extractedText;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('Could not extract readable text from PDF');
  }
}

// Helper function to extract text from stream content
function extractTextFromStream(streamContent: string): string {
  const textParts: string[] = [];
  
  // Look for text patterns in the stream
  const textMatches = streamContent.match(/\(([^)]*)\)/g);
  if (textMatches) {
    for (const match of textMatches) {
      let text = match.slice(1, -1);
      if (isValidText(text)) {
        text = decodeTextEscapes(text);
        textParts.push(text);
      }
    }
  }
  
  return textParts.join(' ');
}

// Helper function to check if text is valid (not metadata or binary)
function isValidText(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  // Skip if it's clearly metadata or binary
  if (/^[^a-zA-Z0-9\s.,!?;:'"()-]*$/.test(text) ||
      text.includes('obj') ||
      text.includes('endobj') ||
      text.includes('stream') ||
      text.includes('endstream') ||
      text.includes('/Type') ||
      text.includes('/Filter') ||
      text.includes('/Length') ||
      text.includes('/Width') ||
      text.includes('/Height') ||
      text.includes('ColorSpace') ||
      text.includes('Scanner') ||
      text.includes('Profile') ||
      text.includes('BitsPerComponent') ||
      text.includes('DCTDecode') ||
      text.includes('FlateDecode') ||
      text.includes('Photoshop') ||
      text.includes('MediaBox') ||
      text.includes('Resources') ||
      text.includes('Parent') ||
      text.includes('Contents') ||
      text.includes('startxref') ||
      text.includes('xref') ||
      text.includes('trailer') ||
      text.includes('%%EOF') ||
      /^[0-9]+\s+[0-9]+\s+R$/.test(text) ||
      /^[0-9]+\s+[0-9]+\s+obj/.test(text) ||
      /^<<.*>>$/.test(text)) {
    return false;
  }
  
  // Must contain at least some alphabetic characters
  return /[a-zA-Z]/.test(text);
}

// Helper function to decode PDF text escape sequences
function decodeTextEscapes(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"');
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const { fileData, fileName }: PdfParseRequest = await req.json();

    if (!fileData || !fileName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing fileData or fileName' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log(`Processing PDF: ${fileName}`);

    // Decode base64 PDF data
    const pdfBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Extract text from PDF
    const extractedText = await extractTextFromPdf(pdfBuffer);

    const response: PdfParseResponse = {
      success: true,
      text: extractedText,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    
    const response: PdfParseResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}); 
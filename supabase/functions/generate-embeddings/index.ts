// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

/// <reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" />

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { OpenAI } from 'npm:openai@4' // Use OpenAI SDK v4+
import pdfParse from 'npm:pdf-parse/lib/pdf-parse.js';
import { Pinecone } from 'npm:@pinecone-database/pinecone@2.0.1'; // Ensure this is your desired version
import { processCsvToText, detectCsvDelimiter, isValidCsv } from './csv-processor.ts';

// Constants
const EMBEDDING_MODEL = 'text-embedding-ada-002'
// const EMBEDDING_DIMENSIONS = 1536; // Not directly used in this version of code, but good for reference
const TEXT_CHUNK_SIZE = 800 
const TEXT_CHUNK_OVERLAP = 200
const BATCH_SIZE_OPENAI = 50; // Batch size for OpenAI and Supabase operations

console.log('generate-embeddings function booting up (PDF, Direct Text, Pinecone support).')

// Initialize OpenAI client (remains global)
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// REMOVED global Pinecone client initialization
// let pinecone: Pinecone | null = null;
// ... removed associated checks and console logs ...

Deno.serve(async (req: Request) => {
  console.log('Received request');
  let documentIdFromPayload: string | null = null;
  let supabaseAdminClient: SupabaseClient | null = null;
  let pinecone: Pinecone | null = null; // Define pinecone variable within handler scope
  let pineconeIndex: any | null = null; // Define pineconeIndex within handler scope

  // Document details to be populated
  let docIdToProcess: string | null = null;
  let chatbotId: string | null = null;
  let storagePath: string | null = null;
  let rawContent: string | null = null;
  let contentType: string | null = null; // Renamed from fileTypeFromRecord to avoid confusion
  let initialStatus: string | null = null;
  let fileName: string | null = null;

  try {
    const rawBody = await req.text();
    console.log('Raw request body text:', rawBody);
    const payload = JSON.parse(rawBody);
    console.log('Payload:', payload);

    supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if invoked directly by scrape-website (or other direct invoker)
    if (payload.invoker === 'scrape-website' && payload.documentId && typeof payload.scrapedContent === 'string') {
      console.log(`Direct invocation from scrape-website detected for documentId: ${payload.documentId}`);
      docIdToProcess = payload.documentId;
      rawContent = payload.scrapedContent; // Use content directly from payload

      // Fetch other necessary details from Supabase (excluding content)
      const { data: docData, error: fetchError } = await supabaseAdminClient
        .from('documents')
        .select('id, chatbot_id, storage_path, file_type, embedding_status, file_name') // No longer selecting 'content'
        .eq('id', docIdToProcess)
        .single();

      if (fetchError) {
        console.error(`Error fetching auxiliary document details for direct invoke ${docIdToProcess}:`, fetchError);
        throw new Error(`Failed to fetch auxiliary document details for direct invoke ${docIdToProcess}: ${fetchError.message}`);
      }
      if (!docData) {
        throw new Error(`Document ${docIdToProcess} not found (auxiliary details query).`);
      }
      
      console.log(`Successfully fetched auxiliary document details for direct invoke ${docIdToProcess}: ${JSON.stringify(docData)}`);
      chatbotId = docData.chatbot_id;
      storagePath = docData.storage_path; // Should be null if coming from scrape-website
      contentType = docData.file_type;
      initialStatus = docData.embedding_status;
      fileName = docData.file_name;

    } else if (payload.type === 'INSERT' && payload.table === 'documents' && payload.record && payload.record.id) {
      // This path is now primarily for non-website (e.g., PDF) uploads if they still use a webhook.
      // If webhooks are disabled entirely, this path might become obsolete or repurposed.
      console.log('Webhook invocation detected (likely for non-website source).');
      docIdToProcess = payload.record.id as string;
      chatbotId = payload.record.chatbot_id as string;
      storagePath = payload.record.storage_path as string | null;
      rawContent = payload.record.content as string | null;
      contentType = payload.record.file_type as string | null; // Ensure this uses file_type from webhook too
      initialStatus = payload.record.embedding_status as string;
      fileName = payload.record.file_name as string;

      // --- Start of defensive code for phantom webhook ---
      if (!rawContent && !storagePath) {
        // Check if fileName looks like a URL and if file_type indicates it's not a pre-processed file type yet
        const isLikelyWebsiteUrl = fileName && (fileName.startsWith('http://') || fileName.startsWith('https://'));
        // Assuming contentType (derived from file_type) would be null or a generic type for new website scrapes
        const isLikelyPreScrape = !contentType || contentType === 'website' || contentType === 'url'; 

        if (isLikelyWebsiteUrl && isLikelyPreScrape) {
          console.warn(`[${docIdToProcess}] Webhook-style invocation for a URL with no content/storage. Likely a pre-scrape trigger. Exiting gracefully without status change.`);
          return new Response(JSON.stringify({ message: 'Webhook pre-scrape call, exiting gracefully.' }), {
            status: 200, // Important to return 200 so the (phantom) webhook doesn't retry if it's designed to
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          // For other cases (e.g., actual file uploads that should have content/storagePath or unexpected scenarios)
          console.error(`[${docIdToProcess}] Document (non-website or unexpected) has neither direct content nor a storage path in webhook payload.`);
          await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', 'Document has neither content nor a storage path in webhook payload.');
          return new Response(JSON.stringify({ message: `Document ${docIdToProcess} has neither content nor storage path.` }), {
            status: 200, 
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      // --- End of defensive code for phantom webhook ---

    } else {
      console.warn('Invalid payload structure. Neither direct invoke with documentId nor DB webhook format recognized:', payload);
      return new Response(JSON.stringify({ error: 'Invalid payload structure.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!docIdToProcess) { // Changed from documentId to docIdToProcess
      throw new Error('Missing document_id after payload processing.');
    }

    if (!rawContent && !storagePath) {
      console.error(`Document ${docIdToProcess} has neither direct content nor a storage path.`);
      await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', 'Document has neither content nor a storage path.');
      return new Response(JSON.stringify({ message: `Document ${docIdToProcess} has neither content nor storage path.` }), {
        status: 200, // Return 200 as the function itself didn't crash, but processing failed for this doc
        headers: { 'Content-Type': 'application/json' },
      });
    }



    console.log(`Processing document ID: ${docIdToProcess}, Source: ${rawContent ? 'Direct Content' : `Storage (${storagePath})`}, File hint: ${fileName ?? 'N/A'}`);

    // --- Pinecone Client Initialization ---
    console.log('[DEBUG] Retrieving Pinecone ENV vars...');
    const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');
    const pineconeEnvironment = Deno.env.get('PINECONE_ENVIRONMENT');
    const pineconeIndexName = Deno.env.get('PINECONE_INDEX_NAME'); // This is the string for the index name

    console.log(`[DEBUG] Retrieved PINECONE_API_KEY: ${pineconeApiKey ? 'exists (length ' + pineconeApiKey.length + ')' : 'MISSING or undefined'}`);
    console.log(`[DEBUG] Retrieved PINECONE_ENVIRONMENT: ${pineconeEnvironment}`);
    console.log(`[DEBUG] Retrieved PINECONE_INDEX_NAME: ${pineconeIndexName}`);

    if (pineconeApiKey && pineconeEnvironment && pineconeIndexName) {
      try {
        console.log("Attempting to initialize Pinecone client with auto-configuration...");
        // pinecone = new Pinecone({ // If specific config needed
        //   apiKey: pineconeApiKey,
        //   environment: pineconeEnvironment,
        // });
        pinecone = new Pinecone(); // Attempt auto-configuration
        pineconeIndex = pinecone.Index(pineconeIndexName); // Use the variable holding the index name
        console.log('Pinecone client and index initialized successfully.');
      } catch (initError: any) {
        console.error('Error initializing Pinecone client:', initError);
        // Update status and throw or return, as this is critical if Pinecone is required
        if (supabaseAdminClient && docIdToProcess) {
            await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', `Pinecone init error: ${initError.message}`);
        }
        throw new Error(`Pinecone initialization failed: ${initError.message}`);
      }
    } else {
      console.warn('Pinecone environment variables not fully set. Pinecone integration will be disabled.');
      // Optional: throw error if Pinecone is strictly required
      // if (supabaseAdminClient && docIdToProcess) {
      //     await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', 'Pinecone config missing');
      // }
      // throw new Error('Pinecone configuration is missing.');
    }
    // --- End Pinecone Client Initialization ---

    // Check if document is already being processed by another function instance
    const { data: currentDoc, error: statusCheckError } = await supabaseAdminClient
      .from('documents')
      .select('embedding_status')
      .eq('id', docIdToProcess)
      .single();
    
    if (statusCheckError) {
      throw new Error(`Failed to check document status: ${statusCheckError.message}`);
    }
    
    if (currentDoc.embedding_status === 'processing') {
      console.log(`Document ${docIdToProcess} is already being processed by another instance. Exiting.`);
      return new Response(JSON.stringify({ message: 'Document is already being processed.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (currentDoc.embedding_status !== 'pending') {
      console.log(`Document ${docIdToProcess} status is '${currentDoc.embedding_status}', skipping embedding.`);
      return new Response(JSON.stringify({ message: 'Document not in pending state.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'processing');
    
    let textContent = '';
    if (rawContent) {
        console.log('Using direct content from database.');
        textContent = rawContent;
    } else if (storagePath) {
        console.log(`Downloading from storage path: ${storagePath}`);
        const { data: fileDataBuffer, error: downloadError } = await supabaseAdminClient.storage
            .from('documents') 
            .download(storagePath);

        if (downloadError) {
            throw new Error(`Storage download error: ${downloadError.message}`);
        }
        if (!fileDataBuffer) {
            throw new Error('Downloaded data is null.');
        }

        const fileExtension = fileName?.split('.').pop()?.toLowerCase();
        console.log(`Detected file extension from name: ${fileExtension}`);

        if (fileExtension === 'pdf' || contentType === 'application/pdf') {
            console.log("Attempting to parse PDF from storage...");
            try {
                const buffer = await fileDataBuffer.arrayBuffer(); 
                const nodeBuffer = buffer as unknown as Buffer; 
                const data = await pdfParse(nodeBuffer);
                textContent = data.text;
                console.log(`Successfully parsed PDF. Text length: ${textContent.length}`);
            } catch (parseError: any) {
                console.error(`Failed to parse PDF ${fileName}:`, parseError);
                const detailedError = parseError.message || 'PDF parsing failed.';
                await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', `Failed to parse PDF: ${detailedError}`);
                return new Response(JSON.stringify({ message: `Failed to parse PDF: ${detailedError}` }), {
                    status: 200, 
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        } else if (fileExtension === 'txt' || fileExtension === 'md' || contentType === 'text/plain' || contentType === 'text/markdown') {
            console.log("Reading text file from storage...");
            textContent = await fileDataBuffer.text();
            console.log(`Read text file. Length: ${textContent.length}`);
        } else if (fileExtension === 'csv' || contentType === 'text/csv' || contentType === 'application/csv') {
            console.log("Processing CSV file from storage...");
            const csvContent = await fileDataBuffer.text();
            
            // Validate CSV format
            if (!isValidCsv(csvContent)) {
                console.error(`Invalid CSV format for document ${docIdToProcess}`);
                await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', 'Invalid CSV format');
                return new Response(JSON.stringify({ message: 'Invalid CSV format' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Detect delimiter and process CSV
            const delimiter = detectCsvDelimiter(csvContent);
            const csvResult = processCsvToText(csvContent, { 
                delimiter,
                includeHeaders: true,
                maxRows: 10000 // Reasonable limit for processing
            });

            if (csvResult.errors.length > 0) {
                console.warn(`CSV processing warnings for document ${docIdToProcess}:`, csvResult.errors);
            }

            textContent = csvResult.text;
            console.log(`CSV processed successfully. Rows: ${csvResult.rowCount}, Columns: ${csvResult.columnCount}, Text length: ${textContent.length}`);
        } else {
            console.warn(`Unsupported file type from storage: Extension=${fileExtension}, ContentType=${contentType}`);
            await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', `Unsupported file type: ${fileExtension ?? contentType}`);
            return new Response(JSON.stringify({ message: `Unsupported file type: ${fileExtension ?? contentType}` }), {
                status: 200, 
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } else {
         throw new Error('No content source found (direct content or storage path was expected).');
    }

    console.log(`Total extracted text content length: ${textContent.length}`);

    if (!textContent.trim()) {
      console.log(`Document ${docIdToProcess} has no text content after extraction/parsing. Skipping embedding.`);
      await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'completed', 'No text content found.'); // Or 'failed' if this is an error
      return new Response(JSON.stringify({ message: 'No text content to embed.' }), {
         status: 200, 
         headers: { 'Content-Type': 'application/json' },
       });
    }

    // Chunk the text
    const textChunks = chunkText(textContent, TEXT_CHUNK_SIZE, TEXT_CHUNK_OVERLAP);
    console.log(`Created ${textChunks.length} chunks for document ${docIdToProcess}.`);

    if (textChunks.length === 0) {
      console.log(`No text chunks generated for document ${docIdToProcess}. Marking as completed.`);
      await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'completed', 'No text chunks generated.');
      return new Response(JSON.stringify({ message: 'No text chunks to process.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const allVectorsForPinecone: any[] = []; // Keep this to collect all vectors for final Pinecone upsert

    for (let i = 0; i < textChunks.length; i += BATCH_SIZE_OPENAI) {
      const batchOfTextChunks = textChunks.slice(i, i + BATCH_SIZE_OPENAI);
      console.log(`[${docIdToProcess}] Processing batch of ${batchOfTextChunks.length} chunks for OpenAI (starting at index ${i})`);

      // 1. Get Embeddings for the Batch from OpenAI
      let embeddingsForBatch: number[][] = [];
          try {
              const embeddingResponse = await openai.embeddings.create({
                model: EMBEDDING_MODEL,
          input: batchOfTextChunks,
              });
        embeddingsForBatch = embeddingResponse.data.map((data: { embedding: number[] }) => data.embedding);
        if (embeddingsForBatch.length !== batchOfTextChunks.length) {
          console.warn(`[${docIdToProcess}] OpenAI returned ${embeddingsForBatch.length} embeddings for ${batchOfTextChunks.length} chunks. Some chunks might not have been embedded.`);
          // Potentially handle this by filling with nulls or skipping, but for now, we'll rely on the loop below to match lengths
        }
        console.log(`[${docIdToProcess}] Successfully received ${embeddingsForBatch.length} embeddings for batch starting at index ${i}`);
          } catch (openaiError: any) {
        console.error(`[${docIdToProcess}] OpenAI API error for batch starting at index ${i}:`, openaiError);
                    await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', `OpenAI API error: ${openaiError.message}`);
        throw new Error(`OpenAI API request failed for batch: ${openaiError.message}`);
              }

      const documentChunkBatchForSupabase: any[] = [];
      const vectorsBatchForPinecone: any[] = [];

      for (let j = 0; j < batchOfTextChunks.length; j++) {
        const originalChunkText = batchOfTextChunks[j];
        const embedding = embeddingsForBatch[j]; // Assumes embeddings are in the same order and count as input chunks
        const chunkGlobalIndex = i + j;

        if (!embedding) {
          console.warn(`[${docIdToProcess}] Missing embedding for chunk index ${chunkGlobalIndex} in batch. Skipping this chunk.`);
          // This could happen if OpenAI didn't return an embedding for a specific chunk in the batch
          continue; 
        }

        documentChunkBatchForSupabase.push({
          document_id: docIdToProcess,
          chatbot_id: chatbotId, // Make sure chatbotId is available here
          chunk_text: originalChunkText,
          embedding: embedding, // Supabase will store this as a vector type
          token_count: originalChunkText.length, // Approximate token count, consider a proper tokenizer if precision is needed
        });

        if (pineconeIndex) {
          vectorsBatchForPinecone.push({
            id: `${docIdToProcess}-${chunkGlobalIndex}`, 
            values: embedding,
          metadata: {
              chunk_text: originalChunkText,
            document_id: docIdToProcess,
            chatbot_id: chatbotId,
            file_name: fileName || 'unknown',
            chunk_index: chunkGlobalIndex,
            content_type: contentType || 'unknown',
            chunk_length: originalChunkText.length,
          },
        });
      }
      }

      // 2. Batch Insert to Supabase document_chunks
      if (documentChunkBatchForSupabase.length > 0) {
        console.log(`[${docIdToProcess}] Inserting ${documentChunkBatchForSupabase.length} chunks to Supabase for batch starting at index ${i}.`);
        
        // Check if document still exists before inserting chunks
        const { data: docExists, error: checkError } = await supabaseAdminClient
          .from('documents')
          .select('id')
          .eq('id', docIdToProcess)
          .single();
        
        if (checkError || !docExists) {
          console.warn(`[${docIdToProcess}] Document no longer exists before chunk insertion. Document may have been deleted during processing.`);
          return new Response(JSON.stringify({ 
            message: `Document ${docIdToProcess} was deleted during processing.`,
            status: 'aborted'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        // Use regular insert - upsert requires unique constraints that don't exist
        const { error: insertChunkError } = await supabaseAdminClient
          .from('document_chunks')
          .insert(documentChunkBatchForSupabase);
        
        if (insertChunkError) {
          console.error(`[${docIdToProcess}] Supabase batch insert error for batch starting at index ${i}:`, insertChunkError);
          
          // Check if this is a foreign key constraint error (document was deleted)
          if (insertChunkError.code === '23503' && insertChunkError.message.includes('document_chunks_document_id_fkey')) {
            console.warn(`[${docIdToProcess}] Document was deleted during processing - foreign key constraint violation.`);
            return new Response(JSON.stringify({ 
              message: `Document ${docIdToProcess} was deleted during processing.`,
              status: 'aborted'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          
          // For other errors, still fail as before
          await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', `Supabase batch insert error: ${insertChunkError.message}`);
          throw new Error(`Supabase batch insert failed: ${insertChunkError.message}`);
        }
        console.log(`[${docIdToProcess}] Successfully inserted ${documentChunkBatchForSupabase.length} chunks to Supabase for batch.`);
      }

      // Add successfully processed batch to overall Pinecone list
      if (vectorsBatchForPinecone.length > 0) {
        allVectorsForPinecone.push(...vectorsBatchForPinecone);
      }
    } // End of batch processing loop

    // 3. Batch Upsert to Pinecone (after all text chunks are processed and inserted to Supabase)
    if (pineconeIndex && allVectorsForPinecone.length > 0) {
      console.log(`[${docIdToProcess}] Upserting ${allVectorsForPinecone.length} total vectors to Pinecone.`);
      try {
        // Pinecone client itself handles batching for large arrays, but there are limits per request (e.g., 100 vectors or 2MB).
        // For very large `allVectorsForPinecone`, we might need to further segment here.
        // Max vectors per upsert: https://docs.pinecone.io/reference/upsert
        // Let's assume Pinecone's SDK handles reasonable batching for now, but be mindful of absolute limits.
        // A common pattern is to loop and send chunks of e.g. 100 vectors if `allVectorsForPinecone` is huge.
        // For now, sending all at once, as per original logic.
        const PINECONE_UPSERT_BATCH_SIZE = 100; // Or another sensible default
        for (let k = 0; k < allVectorsForPinecone.length; k += PINECONE_UPSERT_BATCH_SIZE) {
            const pineconeBatch = allVectorsForPinecone.slice(k, k + PINECONE_UPSERT_BATCH_SIZE);
            console.log(`[${docIdToProcess}] Upserting batch of ${pineconeBatch.length} vectors to Pinecone (total processed: ${k + pineconeBatch.length}/${allVectorsForPinecone.length})`);
            await pineconeIndex.upsert(pineconeBatch);
        }
        console.log(`[${docIdToProcess}] Successfully upserted all ${allVectorsForPinecone.length} vectors to Pinecone.`);
      } catch (pineconeError: any) {
        console.error(`[${docIdToProcess}] Pinecone upsert error:`, pineconeError);
        // Even if Pinecone fails, the data is in Supabase. Mark as completed but log error.
        // Or, decide if this should be a 'failed' status. For now, let's stick to 'completed' if Supabase part was fine.
        await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', `Pinecone upsert error: ${pineconeError.message}`);
        // Return a success response but mention Pinecone issue, or rethrow to indicate partial failure
        return new Response(JSON.stringify({ 
            message: `Document ${docIdToProcess} processed and embeddings stored in Supabase, but Pinecone upsert failed.`,
            error: pineconeError.message 
        }), {
            status: 207, // Multi-Status, as some operations succeeded
            headers: { 'Content-Type': 'application/json' },
        });
      }
    } else if (pineconeIndex && allVectorsForPinecone.length === 0 && textChunks.length > 0) {
      console.warn(`[${docIdToProcess}] Pinecone index was available, but no vectors were prepared to upsert, despite having ${textChunks.length} text chunks. This might indicate an issue with embedding generation or collection.`);
      }

    console.log(`Document ${docIdToProcess} processed successfully.`);
    await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'completed');

    return new Response(JSON.stringify({ message: `Document ${docIdToProcess} processed and embedded successfully.` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-embeddings:', error);
    if (supabaseAdminClient && docIdToProcess) { // docIdToProcess might be null if initial payload parsing failed
      try {
        await updateDocumentStatus(supabaseAdminClient, docIdToProcess, 'failed', error.message || 'Unknown error during embedding');
      } catch (statusUpdateError) {
        console.error(`Failed to update document ${docIdToProcess} to failed status after general error:`, statusUpdateError);
      }
    }
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Helper function for chunking text
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    if (!text) return chunks;

    const cleanedText = text.replace(/\s+/g, ' ').trim();
    let i = 0;

    while (i < cleanedText.length) {
        const end = Math.min(i + chunkSize, cleanedText.length);
        chunks.push(cleanedText.slice(i, end));
        const nextStart = i + chunkSize - overlap;
        if (nextStart >= cleanedText.length || nextStart <= i) { // Prevent infinite loop
            break; 
        }
        i = nextStart;
    }
    return chunks;
}

// Helper function to update document status
async function updateDocumentStatus(
    supabase: SupabaseClient, // Use SupabaseClient type
    docId: string,
    status: 'processing' | 'completed' | 'failed',
    errorMessage?: string 
) {
    console.log(`Updating document ${docId} status to ${status}` + (errorMessage ? ` (Error: ${errorMessage.substring(0,100)}...)` : ''));
    const updateData: { embedding_status: string; error_message?: string; updated_at: string } = { 
        embedding_status: status, 
        updated_at: new Date().toISOString()
    };
    if (status === 'failed' && errorMessage) {
        updateData.error_message = errorMessage.substring(0, 255); // Truncate for DB column limit
    }

    const { error: updateError } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', docId);

    if (updateError) {
        console.error(`Failed to update document ${docId} status to ${status}:`, updateError);
    }
}

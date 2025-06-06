// supabase/functions/scrape-website/index.ts

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from 'npm:@supabase/supabase-js@2'
import { load as loadHtml } from 'npm:cheerio@1'
// import { Database } from '../../../types/supabase.d.ts' // Removed for now - path issue

console.log('scrape-website function booting up.')

// Define the expected structure of the webhook payload record
interface DocumentRecord {
  id: string;
  file_name: string | null; // URL should be here
  status: string | null;
  // Add other relevant fields if needed
}

// Helper function to update document status and content
async function updateDocument(
    supabase: ReturnType<typeof createClient>,
    docId: string,
    status: 'pending' | 'scrape_failed',
    content: string | null,
    errorMessage?: string
) {
    const updateData: { [key: string]: any } = {
        embedding_status: status,
    };

    // Only include content in the update if it's not null.
    if (content !== null) {
        updateData.content = content;
    }
    
    // If an error message is provided, let's try to store it.
    // Assumes a column like 'error_message' text NULLABLE exists in 'documents' table.
    // If this column doesn't exist, this part of the update might cause a new error,
    // but the logs for that error would then be very specific.
    if (errorMessage) {
        // Truncate error message to prevent exceeding potential column length limits
        updateData.error_message = errorMessage.substring(0, 499); 
    }

    console.log(`[${docId}] Attempting to update document with data: ${JSON.stringify(updateData)}`);

    const { data: updatedData, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', docId)
        .select(); // Ask for the updated row(s) back

    // Log the raw results
    console.log(`[${docId}] Update raw result - data: ${JSON.stringify(updatedData)}`);
    console.log(`[${docId}] Update raw result - error: ${JSON.stringify(error)}`);

    if (error) {
        // This means the database itself returned an error (e.g., constraint violation)
        console.error(`[${docId}] Database error during document update to ${status}:`, JSON.stringify(error));
        throw new Error(`Failed to update document ${docId} (target status: ${status}). DB Error: ${error.message} (Code: ${error.code})`);
    } else if (!updatedData || updatedData.length === 0) {
        // This case often corresponds to PGRST204: Update query was fine, but no rows matched or were changed.
        // For our case, if the docId is correct (which it should be), this is unexpected.
        console.warn(`[${docId}] Update to ${status} completed (no DB error), but no rows were returned/affected. This might indicate the document ID was not found at the time of update or an RLS issue if not using service_role.`);
        throw new Error(`Failed to update document ${docId} (target status: ${status}). Update query succeeded but no rows were affected or returned.`);
    } else {
        // Success: DB error is null, and we got data back.
        console.log(`[${docId}] Successfully updated document. Target status: ${status}. Returned data: ${JSON.stringify(updatedData)}`);
    }
}

Deno.serve(async (req: Request) => {
  console.log('Received scrape request via direct invoke');
  let documentId: string | null = null;
  let supabaseAdmin: ReturnType<typeof createClient> | null = null;

  try {
    // --- Get documentId from the INVOKE payload --- 
    const { documentId: receivedDocumentId } = await req.json();
    documentId = receivedDocumentId; // Assign to outer scope var for error handling

    if (!documentId) {
      throw new Error('Missing documentId in request body.');
    }
    console.log(`[${documentId}] Processing scrape request for document ID: ${documentId}`);

    // --- Setup Supabase Admin Client (using function env vars) ---
    supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Fetch Document Details (URL) --- 
    let urlToScrape: string | null = null;
    const { data: documentData, error: fetchDocError } = await supabaseAdmin
        .from('documents')
        .select('file_name, embedding_status') // Select URL and status
        .eq('id', documentId)
        .single();

    if (fetchDocError) {
        console.error(`[${documentId}] Error fetching document details:`, fetchDocError);
        throw new Error(`Failed to fetch document details for ${documentId}: ${fetchDocError.message}`);
    }
    if (!documentData) {
         throw new Error(`Document with ID ${documentId} not found.`);
    }
    // Optional: Check if status is still relevant (e.g., already processed?)
    // if (documentData.embedding_status !== 'pending_scrape') { ... }

    urlToScrape = documentData.file_name; // Get URL from file_name
    
    if (!urlToScrape || (!urlToScrape.startsWith('http://') && !urlToScrape.startsWith('https://'))) {
        // Update status directly here if URL is invalid
        await updateDocument(supabaseAdmin, documentId, 'scrape_failed', null, `Invalid URL in file_name: ${urlToScrape}`);
        console.error(`[${documentId}] Invalid or missing URL in file_name: ${urlToScrape}`);
        // Return 200 to prevent server action from thinking invoke failed
        return new Response(JSON.stringify({ message: `Scraping failed: Invalid URL format.` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    console.log(`[${documentId}] Found URL to scrape: ${urlToScrape}`);

    // --- Scrape Website Content (logic remains the same) ---
    let scrapedText: string | null = null;
    try {
        const response = await fetch(urlToScrape, { 
            headers: { 
                // Add a basic user-agent, some sites block default fetch/deno agent
                'User-Agent': 'Mozilla/5.0 (compatible; SiteAgentBot/1.0; +https://yourdomain.com/bot)' 
            }
        });
        
        if (!response.ok) {
            throw new Error(`Fetch failed with status ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
             const rawHtml = await response.text();
             console.log(`[${documentId}] Successfully fetched raw HTML. Length: ${rawHtml.length}`);

             // --- Clean HTML to plain visible text using Cheerio ---
             try {
               const $ = loadHtml(rawHtml);
               // Remove non-visible elements
               $('script, style, noscript, iframe, svg, canvas, img, picture, video').remove();
               const text = $('body').text();
               scrapedText = text.replace(/\s+/g, ' ').trim();
               console.log(`[${documentId}] Extracted visible text length: ${scrapedText.length}`);
             } catch (parseErr) {
               console.warn(`[${documentId}] Cheerio parse failed, falling back to raw HTML text. Error: ${parseErr}`);
               scrapedText = rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
             }
        } else {
             throw new Error(`Unsupported content type: ${contentType ?? 'unknown'}`);
        }

    } catch (fetchError: any) {
        console.error(`[${documentId}] Failed to fetch or process URL ${urlToScrape}:`, fetchError);
        await updateDocument(supabaseAdmin, documentId, 'scrape_failed', null, fetchError.message);
        return new Response(JSON.stringify({ message: `Scraping failed: ${fetchError.message}` }), {
            status: 200, 
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // --- Update Document with Scraped Content (logic remains the same) ---
    if (scrapedText !== null) {
        // We update with scrapedText here, and then pass it directly to generate-embeddings
        await updateDocument(supabaseAdmin, documentId, 'pending', scrapedText);
        console.log(`[${documentId}] Scrape successful. Set status to 'pending' for embedding.`);

        // --- Invoke generate-embeddings function ---
        if (supabaseAdmin) { // Ensure supabaseAdmin is available
            console.log(`[${documentId}] PREPARING_DIRECT_INVOKE_NOW for generate-embeddings`);
            const { error: invokeError } = await supabaseAdmin.functions.invoke(
                'generate-embeddings', // Name of the function to invoke
                { body: { 
                    invoker: "scrape-website", // Add invoker field
                    documentId: documentId, 
                    scrapedContent: scrapedText // Pass the scraped content directly
                  } 
                }
            );

            if (invokeError) {
                console.error(`[${documentId}] Error invoking generate-embeddings function:`, invokeError);
                console.log(`[${documentId}] DIRECT_INVOKE_FAILED for generate-embeddings. Error: ${invokeError.message}`);
            } else {
                console.log(`[${documentId}] Successfully invoked generate-embeddings function.`);
                console.log(`[${documentId}] DIRECT_INVOKE_SUCCESSFUL for generate-embeddings`);
            }
        } else {
            console.warn(`[${documentId}] supabaseAdmin client not available, cannot invoke generate-embeddings.`);
        }

    } else {
        await updateDocument(supabaseAdmin, documentId, 'scrape_failed', null, 'No text content scraped.');
        console.warn(`[${documentId}] No text content was scraped despite fetch success.`);
    }

    // --- Return Success Response --- 
    return new Response(JSON.stringify({ success: true, documentId: documentId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[${documentId ?? 'unknown'}] General error processing scrape request:`, error);
    if (documentId && supabaseAdmin) {
      try {
         await updateDocument(supabaseAdmin, documentId, 'scrape_failed', null, error.message || 'Unknown scraping error');
      } catch (updateErr) {
        console.error(`[${documentId}] Failed to update document status to failed after general error:`, updateErr);
      }
    }
    // Return 500 for unexpected internal function errors
    return new Response(JSON.stringify({ error: error.message || 'An unknown server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}) 
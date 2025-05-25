import { createClient } from '@/lib/supabase/server' // Use shared server client
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Create Supabase Admin client for elevated privileges (like storage deletion)
// IMPORTANT: Ensure SERVICE_ROLE_KEY is set in environment variables
import { createClient as createAdminClient } from '@supabase/supabase-js'
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

// Helper function to get chatbot ID from the request path
function getChatbotId(request: NextRequest): string | null {
  const urlParts = request.nextUrl.pathname.split('/');
  const chatbotIdIndex = urlParts.indexOf('chatbots') + 1;
  return urlParts[chatbotIdIndex] || null;
}

// DELETE handler for deleting a chatbot and its associated data
export async function DELETE(request: NextRequest) {
  // const cookieStore = await cookies() // No longer needed for this createClient version
  const supabase = createClient() // Client for user auth (no argument needed)

  // 1. Get Chatbot ID from path
  const chatbotId = getChatbotId(request);
  if (!chatbotId) {
    return NextResponse.json({ error: 'Missing chatbot ID in request path' }, { status: 400 });
  }

  console.log(`Attempting to delete chatbot: ${chatbotId}`);

  // 2. Authenticate User
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Auth error during delete:', userError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 3. Verify Ownership (using user client with RLS)
    const { data: chatbotData, error: fetchError } = await supabase
        .from('chatbots')
        .select('id') // Select minimal data
        .eq('id', chatbotId)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !chatbotData) {
      console.error(`Ownership check failed or chatbot not found for user ${user.id}, chatbot ${chatbotId}:`, fetchError);
      // Return 404 whether it doesn't exist or user doesn't own it
      return NextResponse.json({ error: 'Chatbot not found or access denied' }, { status: 404 });
    }

    // --- Deletion Cascade (using Admin Client) ---
    console.log(`User ${user.id} confirmed owner. Proceeding with deletion cascade for chatbot ${chatbotId}...`);

    // 4. Fetch associated documents
    const { data: documents, error: docFetchError } = await supabaseAdmin
        .from('documents')
        .select('id, storage_path')
        .eq('chatbot_id', chatbotId);

    if (docFetchError) {
       throw new Error(`Failed to fetch associated documents: ${docFetchError.message}`);
    }

    // 5. Queue vector cleanup for all documents BEFORE deleting them
    let documentIdsToDelete: string[] = [];
    if (documents && documents.length > 0) {
        documentIdsToDelete = documents.map(doc => doc.id);
        
        console.log(`Queueing vector cleanup for ${documentIdsToDelete.length} documents...`);
        
        // Queue cleanup jobs for each document
        for (const docId of documentIdsToDelete) {
            await supabaseAdmin
                .from('vector_cleanup_queue')
                .insert({
                    document_id: docId,
                    chatbot_id: chatbotId,
                    created_at: new Date().toISOString()
                });
        }

        // Trigger immediate cleanup for all documents
        try {
            const cleanupUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/internal/cleanup-vectors`;
            const response = await fetch(cleanupUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET}`,
                },
                body: JSON.stringify({
                    chatbotId,
                    documentIds: documentIdsToDelete
                })
            });

            if (response.ok) {
                console.log(`Successfully triggered immediate vector cleanup for chatbot ${chatbotId}`);
            } else {
                console.warn(`Failed to trigger immediate vector cleanup: ${response.status}`);
            }
        } catch (cleanupError) {
            console.error('Failed to trigger immediate vector cleanup:', cleanupError);
            // Continue with deletion - background job will handle cleanup
        }

        // Delete documents from Storage
        const storagePaths = documents.map(doc => doc.storage_path).filter(path => !!path);
        if (storagePaths.length > 0) {
            console.log(`Deleting ${storagePaths.length} files from storage...`);
            const { error: storageError } = await supabaseAdmin.storage
                .from('documents')
                .remove(storagePaths);
            if (storageError) {
                console.error(`Error deleting files from storage (continuing deletion):`, storageError);
            }
        }
    }

    // 6. Delete associated document_chunks (using fetched document IDs)
    // Note: This will also be handled by CASCADE DELETE when documents are deleted
    if (documentIdsToDelete.length > 0) {
        console.log(`Deleting document chunks for ${documentIdsToDelete.length} documents...`);
        const { error: chunkDeleteError } = await supabaseAdmin
            .from('document_chunks')
            .delete()
            .in('document_id', documentIdsToDelete); 
        
        if (chunkDeleteError) {
            throw new Error(`Failed to delete associated document chunks for documents [${documentIdsToDelete.join(', ')}]: ${chunkDeleteError.message}`);
        }
        console.log(`Deleted document chunks for chatbot ${chatbotId}`);
    } else {
         console.log(`No documents found for chatbot ${chatbotId}, skipping chunk deletion.`);
    }

    // 7. Delete associated documents from DB (if any)
    if (documentIdsToDelete.length > 0) {
        console.log(`Deleting document records for chatbot ${chatbotId}...`);
        const { error: docDeleteError } = await supabaseAdmin
            .from('documents')
            .delete()
            .in('id', documentIdsToDelete);
         if (docDeleteError) {
            throw new Error(`Failed to delete associated documents: ${docDeleteError.message}`);
        }
         console.log(`Deleted document records for chatbot ${chatbotId}`);
     }

    // 8. Delete the chatbot itself
    const { error: chatbotDeleteError } = await supabaseAdmin
      .from('chatbots')
      .delete()
      .eq('id', chatbotId);

    if (chatbotDeleteError) {
      throw new Error(`Failed to delete chatbot record: ${chatbotDeleteError.message}`);
    }
    console.log(`Successfully deleted chatbot ${chatbotId} and queued vector cleanup`);

    // Return success (No Content)
    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error(`Error during chatbot deletion process for ${chatbotId}:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 
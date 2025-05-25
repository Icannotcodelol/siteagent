import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Admin client for operations that need to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Supabase client setup (using the async/await pattern for cookies)
async function initializeSupabaseClient() {
    const cookieStore = cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                async get(name: string) {
                    const cookie = await cookieStore.get(name)
                    return cookie?.value
                },
                async set(name: string, value: string, options: any) {
                    try { await cookieStore.set({ name, value, ...options }) } catch (e) { console.error('Route Handler set cookie failed', e) }
                },
                async remove(name: string, options: any) {
                    try { await cookieStore.set({ name, value: '', ...options }) } catch (e) { console.error('Route Handler remove cookie failed', e) }
                },
            },
        }
    )
}

// Define the expected shape of the context params
interface RouteContext {
    params: {
        document_id: string;
    };
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const supabase = await initializeSupabaseClient()
    const documentId = context.params.document_id;

    if (!documentId) {
        return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
    }

    // 1. Check user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch document details and verify ownership (via RLS)
    const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('id, storage_path, user_id, chatbot_id')
        .eq('id', documentId)
        .single();

    if (fetchError) {
        console.error('Error fetching document for deletion:', fetchError);
        if (fetchError.code === 'PGRST116') {
            return NextResponse.json({ error: 'Forbidden or Not Found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to fetch document details.' }, { status: 500 });
    }

    if (!document) {
        return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    if (document.user_id !== user.id) {
         console.warn(`User ${user.id} attempted to delete document ${documentId} owned by ${document.user_id}`)
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // 3. Get all chunk IDs for Pinecone cleanup BEFORE deletion
        const { data: chunks, error: chunksError } = await supabaseAdmin
            .from('document_chunks')
            .select('id')
            .eq('document_id', documentId);

        if (chunksError) {
            console.error('Error fetching chunks for cleanup:', chunksError);
            // Continue with deletion even if chunk fetch fails
        }

        const chunkIds = chunks?.map((chunk, index) => `${documentId}-${index}`) || [];
        console.log(`Found ${chunks?.length || 0} chunks to clean up for document ${documentId}`);

        // 4. Delete the file from Supabase Storage
        if (document.storage_path) {
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([document.storage_path]);

            if (storageError) {
                console.error(`Storage deletion error for path ${document.storage_path}:`, storageError);
                // Continue with database deletion
            } else {
                console.log(`Successfully deleted file from storage: ${document.storage_path}`);
            }
        }

        // 5. Delete document record (this will cascade delete chunks due to FK constraint)
        // and trigger the vector cleanup queue via database trigger
        const { error: dbError } = await supabaseAdmin
            .from('documents')
            .delete()
            .eq('id', documentId);

        if (dbError) {
            console.error('Database deletion error:', dbError);
            return NextResponse.json({ error: `Failed to delete document record: ${dbError.message}` }, { status: 500 });
        }

        // 6. Trigger immediate Pinecone cleanup (async) if we have chunk IDs
        if (chunkIds.length > 0) {
            try {
                const cleanupUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/internal/cleanup-vectors`;
                const response = await fetch(cleanupUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET}`,
                    },
                    body: JSON.stringify({
                        documentId,
                        chatbotId: document.chatbot_id,
                        vectorIds: chunkIds
                    })
                });

                if (response.ok) {
                    console.log(`Successfully triggered immediate vector cleanup for document ${documentId}`);
                } else {
                    console.warn(`Failed to trigger immediate vector cleanup: ${response.status}`);
                }
            } catch (cleanupError) {
                console.error('Failed to trigger vector cleanup:', cleanupError);
                // Don't fail the request - cleanup will be handled by background job
            }
        }

        console.log(`Successfully deleted document ${documentId} and queued vector cleanup`);
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error(`Error during document deletion process for ${documentId}:`, error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
} 
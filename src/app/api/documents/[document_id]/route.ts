import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
                async set(name: string, value: string, options: CookieOptions) {
                    try { await cookieStore.set({ name, value, ...options }) } catch (e) { console.error('Route Handler set cookie failed', e) }
                },
                async remove(name: string, options: CookieOptions) {
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

    // 2. Fetch document to get storage_path and verify ownership (via RLS)
    const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('id, storage_path, user_id') // Select necessary fields
        .eq('id', documentId)
        .single(); // Expecting one document or null/error

    if (fetchError) {
        // If RLS prevents access, Supabase might return an error or just null data
        console.error('Error fetching document for deletion:', fetchError);
        // Check if error indicates forbidden access or not found
        if (fetchError.code === 'PGRST116') { // PostgREST code for 'Row level security violation' or similar
            return NextResponse.json({ error: 'Forbidden or Not Found' }, { status: 404 }); // Treat as not found for security
        }
        return NextResponse.json({ error: 'Failed to fetch document details.' }, { status: 500 });
    }

    if (!document) {
        // Document not found, or RLS prevented access (handled as not found)
        return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    // Optional explicit check (defense-in-depth) - RLS should handle this
    if (document.user_id !== user.id) {
         console.warn(`User ${user.id} attempted to delete document ${documentId} owned by ${document.user_id}`)
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }


    // 3. Delete the file from Supabase Storage
    const { error: storageError } = await supabase.storage
        .from('documents') // Ensure this is the correct bucket name
        .remove([document.storage_path]); // Pass storage_path in an array

    if (storageError) {
        // Log the error but proceed to delete DB record anyway? Or stop?
        // If the file wasn't found, it might not be critical. If permissions failed, maybe stop.
        // For now, log and continue, but might need refinement.
        console.error(`Storage deletion error for path ${document.storage_path}:`, storageError);
        // Consider not failing the whole request if file delete fails but DB delete works.
        // return NextResponse.json({ error: `Failed to delete file from storage: ${storageError.message}` }, { status: 500 });
    }

    // 4. Delete the document record from the database
    const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId); // Match the document ID

    if (dbError) {
        console.error('Database deletion error:', dbError);
        return NextResponse.json({ error: `Failed to delete document record: ${dbError.message}` }, { status: 500 });
    }

    // 5. Return success response (204 No Content is suitable for DELETE)
    return new NextResponse(null, { status: 204 });
} 
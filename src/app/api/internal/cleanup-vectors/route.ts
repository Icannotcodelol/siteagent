import { NextRequest, NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let pineconeClient: Pinecone | null = null;

async function initializePinecone() {
    if (!pineconeClient) {
        const apiKey = process.env.PINECONE_API_KEY;
        if (!apiKey) {
            throw new Error('Pinecone API key not configured');
        }
        pineconeClient = new Pinecone({ apiKey });
    }
    return pineconeClient;
}

export async function POST(request: NextRequest) {
    // Verify internal API call
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { documentId, chatbotId, vectorIds, documentIds } = body;

        if (!documentId && !documentIds) {
            return NextResponse.json({ error: 'Missing documentId or documentIds parameter' }, { status: 400 });
        }

        if (!chatbotId) {
            return NextResponse.json({ error: 'Missing chatbotId parameter' }, { status: 400 });
        }

        console.log(`Starting vector cleanup for chatbot ${chatbotId}`, {
            documentId,
            documentIds: documentIds?.length,
            vectorIds: vectorIds?.length
        });

        // Initialize Pinecone
        const pinecone = await initializePinecone();
        const indexName = process.env.PINECONE_INDEX_NAME;
        
        if (!indexName) {
            throw new Error('Pinecone index name not configured');
        }

        const index = pinecone.Index(indexName);

        // Handle single document deletion
        if (documentId) {
            // Method 1: Delete by specific vector IDs if provided
            if (vectorIds && vectorIds.length > 0) {
                console.log(`Deleting ${vectorIds.length} specific vectors from Pinecone for document ${documentId}`);
                
                // Delete in batches to avoid API limits
                const batchSize = 100;
                for (let i = 0; i < vectorIds.length; i += batchSize) {
                    const batch = vectorIds.slice(i, i + batchSize);
                    await index.deleteMany(batch);
                    console.log(`Deleted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vectorIds.length/batchSize)} for document ${documentId}`);
                }
            } else {
                // Method 2: Delete by metadata filter (fallback)
                console.log(`Deleting vectors by document_id filter: ${documentId}`);
                await index.deleteMany({
                    filter: {
                        document_id: { '$eq': documentId }
                    }
                });
            }

            // Update cleanup queue status for single document
            await supabaseAdmin
                .from('vector_cleanup_queue')
                .update({ 
                    status: 'completed', 
                    processed_at: new Date().toISOString() 
                })
                .eq('document_id', documentId)
                .eq('status', 'pending');
        }

        // Handle multiple document deletion (for chatbot deletion)
        if (documentIds && documentIds.length > 0) {
            console.log(`Deleting vectors for ${documentIds.length} documents in chatbot ${chatbotId}`);
            
            for (const docId of documentIds) {
                try {
                    // Delete by metadata filter for each document
                    await index.deleteMany({
                        filter: {
                            document_id: { '$eq': docId }
                        }
                    });
                    console.log(`Deleted vectors for document ${docId}`);

                    // Update cleanup queue status
                    await supabaseAdmin
                        .from('vector_cleanup_queue')
                        .update({ 
                            status: 'completed', 
                            processed_at: new Date().toISOString() 
                        })
                        .eq('document_id', docId)
                        .eq('status', 'pending');

                } catch (docError: any) {
                    console.error(`Failed to delete vectors for document ${docId}:`, docError);
                    
                    // Mark this specific document as failed
                    await supabaseAdmin
                        .from('vector_cleanup_queue')
                        .update({ 
                            status: 'failed', 
                            processed_at: new Date().toISOString(),
                            error_message: docError.message 
                        })
                        .eq('document_id', docId)
                        .eq('status', 'pending');
                }
            }
        }

        console.log(`Successfully completed vector cleanup for chatbot ${chatbotId}`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Vector cleanup error:', error);

        // Update cleanup queue with error for single document
        if (request.body) {
            try {
                const body = await request.json();
                if (body.documentId) {
                    await supabaseAdmin
                        .from('vector_cleanup_queue')
                        .update({ 
                            status: 'failed', 
                            processed_at: new Date().toISOString(),
                            error_message: error.message 
                        })
                        .eq('document_id', body.documentId)
                        .eq('status', 'pending');
                }
            } catch (updateError) {
                console.error('Failed to update cleanup queue:', updateError);
            }
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 
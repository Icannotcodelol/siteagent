import { createClient } from '@supabase/supabase-js'
import { Pinecone } from '@pinecone-database/pinecone'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface DeletionTestResult {
    documentExists: boolean;
    chunksExist: boolean;
    vectorsExist: boolean;
    chunkCount: number;
    cleanupQueueStatus?: string;
}

export async function testDocumentDeletion(documentId: string): Promise<DeletionTestResult> {
    try {
        // Check if document still exists
        const { data: document } = await supabaseAdmin
            .from('documents')
            .select('id')
            .eq('id', documentId)
            .single();

        // Check if document chunks exist
        const { data: chunks } = await supabaseAdmin
            .from('document_chunks')
            .select('id')
            .eq('document_id', documentId);

        // Check cleanup queue status
        const { data: cleanupJob } = await supabaseAdmin
            .from('vector_cleanup_queue')
            .select('status')
            .eq('document_id', documentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Check if vectors exist in Pinecone
        let vectorsExist = false;
        try {
            const pineconeApiKey = process.env.PINECONE_API_KEY;
            const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
            
            if (pineconeApiKey && pineconeIndexName) {
                const pinecone = new Pinecone({ apiKey: pineconeApiKey });
                const index = pinecone.Index(pineconeIndexName);
                
                // Try to query for vectors with this document_id
                const queryResult = await index.query({
                    vector: new Array(1536).fill(0), // Dummy vector for testing
                    topK: 1,
                    includeMetadata: true,
                    filter: {
                        document_id: { '$eq': documentId }
                    }
                });
                
                vectorsExist = (queryResult.matches?.length || 0) > 0;
            }
        } catch (pineconeError) {
            console.warn('Could not check Pinecone vectors:', pineconeError);
            // If we can't check Pinecone, assume vectors might still exist
            vectorsExist = true;
        }

        return {
            documentExists: !!document,
            chunksExist: (chunks?.length || 0) > 0,
            vectorsExist,
            chunkCount: chunks?.length || 0,
            cleanupQueueStatus: cleanupJob?.status
        };

    } catch (error) {
        console.error('Error testing document deletion:', error);
        throw error;
    }
}

export async function testChatbotDeletion(chatbotId: string): Promise<{
    chatbotExists: boolean;
    documentsExist: boolean;
    chunksExist: boolean;
    vectorsExist: boolean;
    documentCount: number;
    chunkCount: number;
}> {
    try {
        // Check if chatbot still exists
        const { data: chatbot } = await supabaseAdmin
            .from('chatbots')
            .select('id')
            .eq('id', chatbotId)
            .single();

        // Check if any documents for this chatbot exist
        const { data: documents } = await supabaseAdmin
            .from('documents')
            .select('id')
            .eq('chatbot_id', chatbotId);

        // Check if any chunks for this chatbot exist
        const { data: chunks } = await supabaseAdmin
            .from('document_chunks')
            .select('id')
            .eq('chatbot_id', chatbotId);

        // Check if vectors exist in Pinecone for this chatbot
        let vectorsExist = false;
        try {
            const pineconeApiKey = process.env.PINECONE_API_KEY;
            const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
            
            if (pineconeApiKey && pineconeIndexName) {
                const pinecone = new Pinecone({ apiKey: pineconeApiKey });
                const index = pinecone.Index(pineconeIndexName);
                
                // Try to query for vectors with this chatbot_id
                const queryResult = await index.query({
                    vector: new Array(1536).fill(0), // Dummy vector for testing
                    topK: 1,
                    includeMetadata: true,
                    filter: {
                        chatbot_id: { '$eq': chatbotId }
                    }
                });
                
                vectorsExist = (queryResult.matches?.length || 0) > 0;
            }
        } catch (pineconeError) {
            console.warn('Could not check Pinecone vectors:', pineconeError);
            vectorsExist = true;
        }

        return {
            chatbotExists: !!chatbot,
            documentsExist: (documents?.length || 0) > 0,
            chunksExist: (chunks?.length || 0) > 0,
            vectorsExist,
            documentCount: documents?.length || 0,
            chunkCount: chunks?.length || 0
        };

    } catch (error) {
        console.error('Error testing chatbot deletion:', error);
        throw error;
    }
}

export async function getCleanupQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
}> {
    try {
        const { data: jobs } = await supabaseAdmin
            .from('vector_cleanup_queue')
            .select('status')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const stats = jobs?.reduce((acc, job) => {
            const status = job.status as 'pending' | 'processing' | 'completed' | 'failed';
            if (status in acc) {
                acc[status] = (acc[status] || 0) + 1;
            }
            acc.total++;
            return acc;
        }, { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 }) || 
        { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 };

        return stats;
    } catch (error) {
        console.error('Error getting cleanup queue stats:', error);
        throw error;
    }
} 
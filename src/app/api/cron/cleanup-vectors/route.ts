import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route uses request.headers so it needs to be dynamic
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        // Verify this is a legitimate cron request
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting cleanup process...');

        // Clean up expired preview sessions
        console.log('Cleaning up expired preview sessions...');
        const { error: previewCleanupError } = await supabase.rpc('cleanup_expired_preview_sessions');
        
        if (previewCleanupError) {
            console.error('Error cleaning up preview sessions:', previewCleanupError);
        } else {
            console.log('Preview sessions cleanup completed');
        }

        // Process pending vector cleanup queue
        console.log('Processing vector cleanup queue...');
        
        const { data: pendingCleanups, error: fetchError } = await supabase
            .from('vector_cleanup_queue')
            .select('*')
            .eq('status', 'pending')
            .limit(10);

        if (fetchError) {
            console.error('Error fetching pending cleanups:', fetchError);
            return NextResponse.json({ error: 'Failed to fetch pending cleanups' }, { status: 500 });
        }

        let processedCount = 0;
        let errorCount = 0;

        for (const cleanup of pendingCleanups || []) {
            try {
                // Mark as processing
                await supabase
                    .from('vector_cleanup_queue')
                    .update({ status: 'processing' })
                    .eq('id', cleanup.id);

                // Delete document chunks for this document
                const { error: deleteError } = await supabase
                    .from('document_chunks')
                    .delete()
                    .eq('document_id', cleanup.document_id);

                if (deleteError) {
                    throw deleteError;
                }

                // Mark as completed
                await supabase
                    .from('vector_cleanup_queue')
                    .update({ 
                        status: 'completed',
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', cleanup.id);

                processedCount++;
                console.log(`Cleaned up vectors for document ${cleanup.document_id}`);

            } catch (error) {
                console.error(`Error processing cleanup for document ${cleanup.document_id}:`, error);
                
                // Mark as failed
                await supabase
                    .from('vector_cleanup_queue')
                    .update({ 
                        status: 'failed',
                        error_message: error instanceof Error ? error.message : 'Unknown error',
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', cleanup.id);

                errorCount++;
            }
        }

        // Clean up old completed/failed records (older than 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { error: oldRecordsError } = await supabase
            .from('vector_cleanup_queue')
            .delete()
            .in('status', ['completed', 'failed'])
            .lt('processed_at', sevenDaysAgo.toISOString());

        if (oldRecordsError) {
            console.error('Error cleaning up old records:', oldRecordsError);
        }

        console.log(`Cleanup process completed. Processed: ${processedCount}, Errors: ${errorCount}`);

        return NextResponse.json({
            success: true,
            processed: processedCount,
            errors: errorCount,
            message: 'Cleanup process completed successfully'
        });

    } catch (error) {
        console.error('Cleanup process failed:', error);
        return NextResponse.json(
            { error: 'Cleanup process failed' },
            { status: 500 }
        );
    }
} 
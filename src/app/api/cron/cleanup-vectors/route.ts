import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get pending cleanup jobs (older than 5 minutes to avoid race conditions)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        const { data: pendingJobs, error } = await supabaseAdmin
            .from('vector_cleanup_queue')
            .select('*')
            .eq('status', 'pending')
            .lt('created_at', fiveMinutesAgo)
            .limit(10); // Process in batches

        if (error) {
            throw error;
        }

        if (!pendingJobs || pendingJobs.length === 0) {
            return NextResponse.json({ message: 'No pending cleanup jobs' });
        }

        console.log(`Processing ${pendingJobs.length} pending vector cleanup jobs`);

        const results = [];
        for (const job of pendingJobs) {
            try {
                // Mark as processing
                await supabaseAdmin
                    .from('vector_cleanup_queue')
                    .update({ status: 'processing' })
                    .eq('id', job.id);

                // Call internal cleanup API
                const cleanupUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/internal/cleanup-vectors`;
                const response = await fetch(cleanupUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET}`,
                    },
                    body: JSON.stringify({
                        documentId: job.document_id,
                        chatbotId: job.chatbot_id
                    })
                });

                if (response.ok) {
                    results.push({ jobId: job.id, status: 'success' });
                    console.log(`Successfully processed cleanup job ${job.id} for document ${job.document_id}`);
                } else {
                    const errorText = await response.text();
                    throw new Error(`Cleanup API returned ${response.status}: ${errorText}`);
                }

            } catch (jobError: any) {
                console.error(`Failed to process cleanup job ${job.id}:`, jobError);
                
                // Mark job as failed
                await supabaseAdmin
                    .from('vector_cleanup_queue')
                    .update({ 
                        status: 'failed', 
                        processed_at: new Date().toISOString(),
                        error_message: jobError.message 
                    })
                    .eq('id', job.id);

                results.push({ jobId: job.id, status: 'failed', error: jobError.message });
            }
        }

        return NextResponse.json({ 
            message: `Processed ${pendingJobs.length} cleanup jobs`,
            results 
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 
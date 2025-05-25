import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    // Verify admin access (you might want to add proper admin authentication here)
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get stats for the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data: stats, error } = await supabaseAdmin
            .from('vector_cleanup_queue')
            .select('status, created_at, processed_at, error_message')
            .gte('created_at', twentyFourHoursAgo)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Calculate status counts
        const statusCounts = stats?.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        // Get recent failed jobs for debugging
        const recentFailures = stats?.filter(job => job.status === 'failed').slice(0, 5) || [];

        // Calculate average processing time for completed jobs
        const completedJobs = stats?.filter(job => job.status === 'completed' && job.processed_at) || [];
        const avgProcessingTime = completedJobs.length > 0 
            ? completedJobs.reduce((sum, job) => {
                const created = new Date(job.created_at).getTime();
                const processed = new Date(job.processed_at!).getTime();
                return sum + (processed - created);
            }, 0) / completedJobs.length / 1000 // Convert to seconds
            : 0;

        return NextResponse.json({
            last24Hours: {
                totalJobs: stats?.length || 0,
                statusCounts,
                avgProcessingTimeSeconds: Math.round(avgProcessingTime),
                recentFailures: recentFailures.map(job => ({
                    id: job.status,
                    createdAt: job.created_at,
                    errorMessage: job.error_message
                }))
            }
        });

    } catch (error: any) {
        console.error('Error fetching cleanup status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 
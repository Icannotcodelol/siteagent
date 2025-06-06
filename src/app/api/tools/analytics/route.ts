import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsData {
  tool: string;
  action: string;
  source?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const data: AnalyticsData = await request.json();
    
    // Basic validation
    if (!data.tool || !data.action) {
      return NextResponse.json(
        { error: 'Tool and action are required' },
        { status: 400 }
      );
    }

    // Log analytics data (in production, you'd send this to your analytics service)
    console.log('[TOOL_ANALYTICS]', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
      ...data,
    });

    // You can integrate with PostHog, Google Analytics, or your preferred analytics service here
    // Example:
    // await sendToAnalyticsService(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TOOL_ANALYTICS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
} 
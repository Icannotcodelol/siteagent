import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    // Get session info
    const { data: session, error: sessionError } = await supabase
      .from('preview_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      status: session.embedding_status,
      suggestedQuestions: session.suggested_questions || [],
      messageCount: session.message_count,
      maxMessages: session.max_messages,
      remainingMessages: session.max_messages - session.message_count,
      contentType: session.content_type,
      errorMessage: session.error_message,
      expiresAt: session.expires_at
    });

  } catch (error) {
    console.error('Error in preview status route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
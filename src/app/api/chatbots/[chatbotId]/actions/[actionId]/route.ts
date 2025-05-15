import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the expected shape for updating actions (similar to POST, maybe partial)
interface ActionUpdatePayload {
  name?: string;
  description?: string | null;
  trigger_keywords?: string[]; 
  http_method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: object | null; 
  request_body_template?: object | null; 
  success_message?: string | null;
  is_active?: boolean;
}

// Helper function to verify ownership (could be shared)
// Ensures the action belongs to the specified chatbot AND the user owns the chatbot
async function verifyActionOwnership(
    supabase: ReturnType<typeof createServerClient>,
    userId: string,
    chatbotId: string,
    actionId: string
): Promise<boolean> {
    const { data: action, error } = await supabase
        .from('chatbot_actions')
        .select(`
            id,
            chatbot:chatbots ( id, user_id )
        `)
        .eq('id', actionId)
        .eq('chatbot_id', chatbotId)
        .single();
    
    if (error) {
        console.error('Error verifying action ownership:', error);
        return false;
    }
    // Check if the action exists, belongs to the correct chatbot,
    // and if the associated chatbot belongs to the current user.
    // Need to handle potential nulls if chatbot relation doesn't exist (shouldn't happen with FK)
    return !!action && !!action.chatbot && action.chatbot.user_id === userId;
}

// PUT /api/chatbots/[chatbotId]/actions/[actionId] - Update a specific action
export async function PUT(request: NextRequest, { params }: { params: { chatbotId: string, actionId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
    const { chatbotId, actionId } = params;

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
      console.error('PUT /actions/[actionId] - Auth Error:', userError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    // Verify user owns the action (implicitly checks chatbot ownership)
    const isOwner = await verifyActionOwnership(supabase, user.id, chatbotId, actionId);
        if (!isOwner) {
      return NextResponse.json({ error: 'Action not found or not authorized' }, { status: 404 });
        }

    // Parse the request body for update data
    const updateData: ActionUpdatePayload = await request.json();

    // Don't allow changing chatbot_id
    const { chatbot_id, id, created_at, updated_at, ...validUpdateData } = updateData as any;
    
    if (Object.keys(validUpdateData).length === 0) {
        return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
        }

    // Perform the update
        const { data: updatedAction, error: updateError } = await supabase
            .from('chatbot_actions')
      .update(validUpdateData) // Pass only the fields allowed for update
            .eq('id', actionId)
      .eq('chatbot_id', chatbotId) // Ensure it matches the chatbot route param
      .select()
            .single();

        if (updateError) {
      console.error(`PUT /actions/[actionId] - Error updating action ${actionId}:`, updateError);
      throw updateError;
        }

    return NextResponse.json(updatedAction);

    } catch (error: any) {
    console.error('PUT /actions/[actionId] - Generic Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update action' }, { status: 500 });
    }
}

// DELETE /api/chatbots/[chatbotId]/actions/[actionId] - Delete a specific action
export async function DELETE(request: NextRequest, { params }: { params: { chatbotId: string, actionId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
    const { chatbotId, actionId } = params;

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
      console.error('DELETE /actions/[actionId] - Auth Error:', userError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    // Verify user owns the action (implicitly checks chatbot ownership)
    const isOwner = await verifyActionOwnership(supabase, user.id, chatbotId, actionId);
        if (!isOwner) {
        return NextResponse.json({ error: 'Action not found or not authorized' }, { status: 404 });
        }

    // Perform the delete
    const { error: deleteError } = await supabase
            .from('chatbot_actions')
      .delete()
            .eq('id', actionId)
      .eq('chatbot_id', chatbotId); // Extra safety check

        if (deleteError) {
      console.error(`DELETE /actions/[actionId] - Error deleting action ${actionId}:`, deleteError);
      throw deleteError;
        }

    return NextResponse.json({ message: 'Action deleted successfully' }, { status: 200 }); // Or 204 No Content

    } catch (error: any) {
    console.error('DELETE /actions/[actionId] - Generic Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete action' }, { status: 500 });
    }
} 
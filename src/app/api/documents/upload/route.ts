import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names
import { canUploadData } from '@/lib/services/subscriptionService';

// Adjusted Supabase client creation for Route Handlers
// No need for a separate helper if used only here
// Focus on reading cookies for auth

export async function POST(request: NextRequest) {
    const cookieStore = cookies()

    // Initialize client for Route Handler context
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await cookieStore.get(name)
            return cookie?.value
          },
          // Set and Remove are more complex in Route Handlers
          // and often involve modifying the response object.
          // For this specific POST route (upload), we primarily need `get` for auth.
          // If token refresh happens and needs to set cookies,
          // Supabase SSR client might handle it, or manual response modification is needed.
          async set(name: string, value: string, options: CookieOptions) {
            // Setting cookies in Route Handler requires manipulating the response
            // For now, assuming Supabase handles session refresh internally or we handle it on client redirects
             try { await cookieStore.set({ name, value, ...options }) } catch (e) { console.error('Route Handler set cookie failed', e)}
          },
          async remove(name: string, options: CookieOptions) {
             try { await cookieStore.set({ name, value: '', ...options }) } catch(e) { console.error('Route Handler remove cookie failed', e)}
          },
        },
      }
    )

  // 1. Check user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse FormData
  let file: File | null = null
  let chatbotId: string | null = null
  try {
    const formData = await request.formData()
    const fileData = formData.get('file')
    const chatbotIdData = formData.get('chatbotId')

    if (!(fileData instanceof File)) {
        throw new Error('File is required and must be a file.')
    }
    file = fileData

    if (typeof chatbotIdData !== 'string' || !chatbotIdData) {
        throw new Error('Chatbot ID is required.')
    }
    chatbotId = chatbotIdData

  } catch (e: any) {
    console.error("Form parsing error:", e)
    return NextResponse.json({ error: `Invalid request body: ${e.message}` }, { status: 400 })
  }

  // <-- INTEGRATION POINT: Check upload permission BEFORE uploading to storage -->
  const fileSizeMb = file.size / (1024 * 1024);
  const userCanUpload = await canUploadData(user.id, fileSizeMb, supabase);

  if (!userCanUpload) {
    return NextResponse.json({
      error: 'Data upload limit reached. Your current plan does not allow uploading this file due to size or total storage limits. Please upgrade your plan or manage your existing data.',
      // You could add more details here, e.g., currentUsage, planLimit, if needed for client display
    }, { status: 403 }); // 403 Forbidden or 402 Payment Required
  }
  // <-- END INTEGRATION POINT -->

  // 3. Upload file to Supabase Storage
  const bucketName = 'documents' // Ensure this bucket exists and has policies set
  const fileExt = file.name.split('.').pop();
  // Create a unique path to avoid overwrites and organize files
  const uniqueFileName = `${uuidv4()}.${fileExt}`;
  const storagePath = `${user.id}/${chatbotId}/${uniqueFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, file)

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    // TODO: Map common storage errors (policy violation, bucket not found) to user-friendly messages
    return NextResponse.json({ error: `Failed to upload file: ${uploadError.message}` }, { status: 500 })
  }

  // 4. Insert metadata into the public.documents table
  const { data: newDocument, error: insertError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      chatbot_id: chatbotId,
      file_name: file.name, // Store the original file name
      storage_path: storagePath,
      embedding_status: 'pending', // Initial status
      size_mb: fileSizeMb, // <-- ADDED: Store the file size in MB
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error inserting document metadata:', insertError)
    // Attempt to clean up the uploaded file if DB insert fails? (More complex)
    return NextResponse.json({ error: `Failed to save document metadata: ${insertError.message}` }, { status: 500 })
  }

  // 5. Return success response
  return NextResponse.json(newDocument, { status: 201 })
} 
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { canCreateChatbot, canScrapeWebsite } from '@/lib/services/subscriptionService'

interface ActionResult {
  success: boolean;
  chatbotId?: string;
  error?: string;
}

// Update the input data type to include optional system_prompt,
// pasted_text, and website_urls (array)
interface CreateChatbotData {
    name: string;
    system_prompt?: string; // Optional: allow empty/null prompt
    pasted_text?: string;   // Optional: text pasted by user
    website_urls?: string[];   // Optional: URLs to scrape (changed to array)
    primary_color?: string | null;
    secondary_color?: string | null;
    background_color?: string | null;
    text_color?: string | null;
    font_family?: string | null;
    welcome_message?: string | null;
    bot_avatar_url?: string | null;
    user_avatar_url?: string | null;
    chat_bubble_style?: string | null;
    header_text?: string | null;
    input_placeholder?: string | null;
    show_branding?: boolean | null;
}

// Interface for Update - ADD optional data sources (array)
interface UpdateChatbotData {
    name: string;
    system_prompt?: string;
    pasted_text?: string;   // Optional: text pasted by user
    website_urls?: string[];   // Optional: URLs to scrape (changed to array)
    primary_color?: string | null;
    secondary_color?: string | null;
    background_color?: string | null;
    text_color?: string | null;
    font_family?: string | null;
    welcome_message?: string | null;
    bot_avatar_url?: string | null;
    user_avatar_url?: string | null;
    chat_bubble_style?: string | null;
    header_text?: string | null;
    input_placeholder?: string | null;
    show_branding?: boolean | null;
}

// Action for CREATING a new chatbot
export async function createChatbotAction(
  data: CreateChatbotData // Use the updated interface
): Promise<ActionResult> {
  const supabase = createClient() // No argument

  // 1. Get user session
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Authentication error during chatbot creation:', userError)
    return { success: false, error: 'You must be logged in to create a chatbot.' };
  }

  // 2. Check if user can create another chatbot based on their plan
  const userCanCreate = await canCreateChatbot(user.id, supabase)
  if (!userCanCreate) {
    return { 
      success: false, 
      error: 'Chatbot limit reached. You have reached the maximum number of chatbots allowed for your current plan. Please upgrade your plan or delete an existing chatbot to create a new one.' 
    };
  }

  // 3. Validate and prepare data
  const chatbotName = data.name.trim()
  const systemPrompt = data.system_prompt?.trim() || null;
  const pastedText = data.pasted_text?.trim() || null; // Get pasted text
  const websiteUrls = data.website_urls || []; // Get website URLs

  // 3a. Check website scraping limit (if any URLs provided)
  if (websiteUrls.length > 0) {
    const canScrape = await canScrapeWebsite(user.id, websiteUrls.length, supabase);
    if (!canScrape) {
      return {
        success: false,
        error: 'Website scraping limit reached for your current plan. Please upgrade your plan or remove some scraped websites before adding new ones.'
      };
    }
  }

  if (!chatbotName) {
      return { success: false, error: 'Chatbot name cannot be empty.' };
  }

  let newChatbotId: string | null = null;

  try {
    // 4. Insert new chatbot basic info (name, prompt)
    const { data: newChatbot, error: insertError } = await supabase
      .from('chatbots')
      .insert({ 
          name: chatbotName, 
          user_id: user.id,
          system_prompt: systemPrompt,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          background_color: data.background_color,
          text_color: data.text_color,
          font_family: data.font_family,
          welcome_message: data.welcome_message,
          bot_avatar_url: data.bot_avatar_url,
          user_avatar_url: data.user_avatar_url,
          chat_bubble_style: data.chat_bubble_style,
          header_text: data.header_text,
          input_placeholder: data.input_placeholder,
          show_branding: data.show_branding,
      })
      .select('id') // Select only the ID
      .single() // Expect a single row

    if (insertError) {
      console.error('Error inserting chatbot:', insertError)
      return { success: false, error: `Failed to create chatbot: ${insertError.message}` };
    }

    if (!newChatbot || !newChatbot.id) {
        console.error('Chatbot created but ID not returned.');
        return { success: false, error: 'Failed to retrieve chatbot ID after creation.' };
    }

    newChatbotId = newChatbot.id; // Store the ID (now definitely a string)

    // --- Handle additional data sources (asynchronously is ideal, but start simple) ---
    
    // 5. Handle Pasted Text (Insert into documents table)
    if (pastedText && newChatbotId) {
        const { error: textDocError } = await supabase.from('documents').insert({
            chatbot_id: newChatbotId,
            user_id: user.id,
            file_name: 'Pasted Content',
            embedding_status: 'pending',
            content: pastedText
        });
        if (textDocError) {
            console.error('Error inserting minimal pasted text document:', textDocError);
            return { success: false, error: `Failed to save pasted text (minimal): ${textDocError.message}` };
        }
    }

    // 6. Handle Website URLs (Insert into documents table)
    if (websiteUrls.length > 0 && newChatbotId) {
        for (const websiteUrl of websiteUrls) {
            const trimmedUrl = websiteUrl.trim();
            if (!trimmedUrl) continue; // Skip empty URLs
            
            if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
                 return { success: false, error: `Invalid website URL format: ${trimmedUrl}. Please include http:// or https://` };
            } else {
                let insertedDocId: string | null = null;
                const { data: urlDocData, error: urlDocError } = await supabase
                    .from('documents')
                    .insert({
                        chatbot_id: newChatbotId,
                        user_id: user.id,
                        file_name: trimmedUrl,
                        embedding_status: 'pending'
                    })
                    .select('id')
                    .single();

                if (urlDocError || !urlDocData?.id) {
                    console.error('Error inserting website URL document:', urlDocError);
                    return { success: false, error: `Failed to save website URL for scraping: ${trimmedUrl} - ${urlDocError?.message ?? 'Unknown error'}` };
                }
                insertedDocId = urlDocData.id;
                console.log(`Successfully inserted document ${insertedDocId} for URL scraping: ${trimmedUrl}`);
                
                // Directly invoke the scrape function
                try {
                    const { error: invokeError } = await supabase.functions.invoke(
                        'scrape-website',
                        { body: { documentId: insertedDocId } } 
                    );
                    if (invokeError) throw invokeError;
                    console.log(`Invoked scrape-website function for doc ${insertedDocId} (URL: ${trimmedUrl})`);
                } catch (invokeError: any) {
                    console.error(`Error invoking scrape-website for doc ${insertedDocId} (URL: ${trimmedUrl}):`, invokeError);
                    return { success: false, error: `Chatbot created, but failed to start scraping for ${trimmedUrl}: ${invokeError.message}` };
                }
            }
        }
    }
    
    // --- End Handle additional data sources ---

    // 7. Revalidate paths
    revalidatePath('/') 
    revalidatePath('/chatbot/[id]', 'page')

    // 8. Final check and return success
    if (newChatbotId) { // Explicitly check if ID is not null
        return { success: true, chatbotId: newChatbotId };
    } else {
        // This case *shouldn't* be reachable if logic is correct, but handles the type error
        console.error("Error: Reached end of successful chatbot creation but ID was null.");
        return { success: false, error: "Failed to finalize chatbot creation." };
    }

  } catch (e: any) {
    // Log and return failure for any unexpected errors
    console.error('Unexpected error during chatbot creation:', e)
    // If an error occurred before return but after chatbot creation, 
    // the chatbot might be left without its data sources processed.
    // Consider cleanup logic or a retry mechanism in a real-world scenario.
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

// --- ACTION for UPDATING ---
export async function updateChatbotAction(
    chatbotId: string,
    data: UpdateChatbotData // Use the updated interface
): Promise<ActionResult> {
    const supabase = createClient(); 

    // 1. Get user session and validate basic inputs (name, chatbotId)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log(`[updateChatbotAction] Attempting update for chatbotId: ${chatbotId} by userId: ${user?.id}`);
    
    if (userError || !user) {
        console.error('Authentication error during chatbot update:', userError)
        return { success: false, error: 'You must be logged in to update a chatbot.' }
    }

    const chatbotName = data.name.trim()
    const systemPrompt = data.system_prompt?.trim() || null
    const pastedText = data.pasted_text?.trim() || null; // Get pasted text
    const websiteUrls = data.website_urls || []; // Get website URLs

    // 3a. Check website scraping limit (if URLs provided)
    if (websiteUrls.length > 0) {
        const canScrape = await canScrapeWebsite(user.id, websiteUrls.length, supabase);
        if (!canScrape) {
            return {
                success: false,
                error: 'Website scraping limit reached for your current plan. Please upgrade your plan or remove some scraped websites before adding new ones.'
            };
        }
    }

    if (!chatbotName) {
        return { success: false, error: 'Chatbot name cannot be empty.' }
    }
    if (!chatbotId) {
        // This check might be redundant if called from typed code, but good safeguard
        return { success: false, error: 'Chatbot ID is missing for update.' }
    }

    try {
        // 2. Update the core chatbot details (name, prompt)
        const { error: updateError } = await supabase
            .from('chatbots')
            .update({
                name: chatbotName,
                system_prompt: systemPrompt,
                primary_color: data.primary_color,
                secondary_color: data.secondary_color,
                background_color: data.background_color,
                text_color: data.text_color,
                font_family: data.font_family,
                welcome_message: data.welcome_message,
                bot_avatar_url: data.bot_avatar_url,
                user_avatar_url: data.user_avatar_url,
                chat_bubble_style: data.chat_bubble_style,
                header_text: data.header_text,
                input_placeholder: data.input_placeholder,
                show_branding: data.show_branding,
            })
            .eq('id', chatbotId)
            .eq('user_id', user.id) // Ensure user owns the chatbot
            .select('id') // Select ID to confirm update happened
            .single(); // Expect one row updated

        if (updateError) {
            console.error(`Error updating chatbot core details ${chatbotId}:`, updateError)
            // Handle specific errors like RLS violation or not found
            if (updateError.code === 'PGRST116') { // Resource not found / RLS failed
                 return { success: false, error: 'Failed to update chatbot. Check permissions or ID.' };
            }
            return { success: false, error: `Failed to update chatbot: ${updateError.message}` };
        }
        
        console.log(`Successfully updated core details for chatbot ${chatbotId}`);

        // --- Handle additional data sources (NEW FOR UPDATE) ---
    
        // 3. Handle Pasted Text (Insert NEW document)
        if (pastedText) { 
            const { error: textDocError } = await supabase.from('documents').insert({
                chatbot_id: chatbotId, 
                user_id: user.id,
                file_name: 'Pasted Content',
                embedding_status: 'pending',
                content: pastedText
            });
            if (textDocError) {
                console.error(`Error inserting minimal pasted text during update for chatbot ${chatbotId}:`, textDocError);
                return { success: false, error: `Chatbot updated, but failed to save pasted text (minimal): ${textDocError.message}` };
            }
            console.log(`Successfully added minimal pasted text for chatbot ${chatbotId}`);
        }
    
        // 4. Handle Website URLs (Insert NEW documents)
        if (websiteUrls.length > 0) {
            for (const websiteUrl of websiteUrls) {
                const trimmedUrl = websiteUrl.trim();
                if (!trimmedUrl) continue; // Skip empty URLs
                
                if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
                     return { success: false, error: `Chatbot updated, but invalid website URL format: ${trimmedUrl}. Please include http:// or https://` };
                } else {
                    let insertedDocId: string | null = null;
                    const { data: urlDocData, error: urlDocError } = await supabase
                        .from('documents')
                        .insert({
                            chatbot_id: chatbotId,
                            user_id: user.id,
                            file_name: trimmedUrl,
                            embedding_status: 'pending'
                        })
                        .select('id')
                        .single();

                    if (urlDocError || !urlDocData?.id) {
                        console.error(`Error inserting website URL doc during update for chatbot ${chatbotId}:`, urlDocError);
                        return { success: false, error: `Chatbot updated, but failed to save website URL: ${trimmedUrl} - ${urlDocError?.message ?? 'Unknown error'}` };
                    }
                    insertedDocId = urlDocData.id;
                    console.log(`Successfully added website URL doc ${insertedDocId} for chatbot ${chatbotId} (URL: ${trimmedUrl})`);
                    
                    // Invoke scrape function
                    try {
                        const { error: invokeError } = await supabase.functions.invoke(
                            'scrape-website',
                            { body: { documentId: insertedDocId } } 
                        );
                        if (invokeError) throw invokeError;
                        console.log(`Invoked scrape-website function for doc ${insertedDocId} (URL: ${trimmedUrl})`);
                    } catch (invokeError: any) {
                        console.error(`Error invoking scrape-website for doc ${insertedDocId} (URL: ${trimmedUrl}) during update:`, invokeError);
                        return { success: false, error: `Chatbot updated, but failed to start scraping for ${trimmedUrl}: ${invokeError.message}` };
                    }
                }
            }
        }
        
        // --- End Handle additional data sources ---

        // 5. Revalidate paths (Important after updates and adding data)
        revalidatePath('/') 
        revalidatePath(`/chatbot/${chatbotId}`) // Revalidate the specific chatbot page
        revalidatePath('/chatbot/[id]', 'page') 

        // 6. Return success
        return { success: true }

    } catch (e: any) {
        console.error(`Unexpected error updating chatbot ${chatbotId}:`, e)
        return { success: false, error: 'An unexpected error occurred during the update.' }
    }
} 
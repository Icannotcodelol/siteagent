#!/usr/bin/env node

/**
 * Test script to verify PDF upload functionality and race condition fixes
 * Usage: node scripts/test-pdf-upload.js <chatbot-id>
 */

const fs = require('fs');
const path = require('path');

// You can modify these variables based on your environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || (!SUPABASE_SERVICE_KEY && !SUPABASE_ANON_KEY)) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const chatbotId = process.argv[2];
if (!chatbotId) {
  console.error('Please provide a chatbot ID as argument');
  console.error('Usage: node scripts/test-pdf-upload.js <chatbot-id>');
  process.exit(1);
}

// Create a simple test PDF content (this is just text, not actual PDF)
const testContent = `
Test Document Content

This is a test document to verify the PDF upload and processing functionality.

It contains multiple paragraphs and should be processed into chunks.

The embedding generation function should:
1. Check for race conditions
2. Validate foreign key constraints
3. Process the content into text chunks
4. Generate embeddings
5. Store everything in Supabase
6. Update the document status

Testing completed at: ${new Date().toISOString()}
`;

async function testDocumentUpload() {
  try {
    console.log('🧪 Starting PDF upload test...');
    console.log(`📋 Chatbot ID: ${chatbotId}`);
    
    // Step 1: Create a test document record
    console.log('\n📝 Step 1: Creating test document record...');
    
    const createDocumentResponse = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        chatbot_id: chatbotId,
        file_name: 'test-document.txt',
        content: testContent,
        file_type: 'text/plain',
        embedding_status: 'pending',
        size_mb: testContent.length / (1024 * 1024)
      })
    });

    if (!createDocumentResponse.ok) {
      const errorText = await createDocumentResponse.text();
      throw new Error(`Failed to create document: ${createDocumentResponse.status} ${errorText}`);
    }

    const [document] = await createDocumentResponse.json();
    console.log(`✅ Document created with ID: ${document.id}`);

    // Step 2: Trigger the generate-embeddings function
    console.log('\n🔄 Step 2: Triggering embedding generation...');
    
    const generateResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        invoker: 'test-script',
        documentId: document.id,
        scrapedContent: testContent
      })
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error(`❌ Failed to trigger processing: ${generateResponse.status} ${errorText}`);
      
      // Cleanup: Delete the test document
      await cleanup(document.id);
      return;
    }

    const generateResult = await generateResponse.json();
    console.log('✅ Processing triggered successfully');
    console.log(`📊 Result: ${generateResult.message}`);

    // Step 3: Monitor the processing status
    console.log('\n👀 Step 3: Monitoring processing status...');
    
    const startTime = Date.now();
    const timeout = 120000; // 2 minutes timeout
    let finalStatus = null;

    while (Date.now() - startTime < timeout) {
      const statusResponse = await fetch(`${SUPABASE_URL}/rest/v1/documents?id=eq.${document.id}&select=embedding_status,error_message,updated_at`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
        }
      });

      if (statusResponse.ok) {
        const [status] = await statusResponse.json();
        if (status) {
          process.stdout.write(`\r⏳ Status: ${status.embedding_status.padEnd(12)} | Updated: ${new Date(status.updated_at).toLocaleTimeString()}`);
          
          if (status.embedding_status === 'completed' || status.embedding_status === 'failed') {
            finalStatus = status;
            break;
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }

    console.log(''); // New line after the status updates

    // Step 4: Check final results
    console.log('\n📊 Step 4: Checking final results...');
    
    if (finalStatus) {
      if (finalStatus.embedding_status === 'completed') {
        console.log('✅ Processing completed successfully!');
        
        // Check if chunks were created
        const chunksResponse = await fetch(`${SUPABASE_URL}/rest/v1/document_chunks?document_id=eq.${document.id}&select=id`, {
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
          }
        });

        if (chunksResponse.ok) {
          const chunks = await chunksResponse.json();
          console.log(`📋 Created ${chunks.length} document chunks`);
        }

      } else {
        console.log('❌ Processing failed');
        if (finalStatus.error_message) {
          console.log(`💬 Error: ${finalStatus.error_message}`);
        }
      }
    } else {
      console.log('⏰ Processing timed out or status check failed');
    }

    // Step 5: Cleanup
    await cleanup(document.id);
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function cleanup(documentId) {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete document chunks first (foreign key constraint)
    await fetch(`${SUPABASE_URL}/rest/v1/document_chunks?document_id=eq.${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
      }
    });

    // Delete the document
    await fetch(`${SUPABASE_URL}/rest/v1/documents?id=eq.${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
      }
    });

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.warn('⚠️  Cleanup warning:', error.message);
  }
}

// Run the test
testDocumentUpload().catch(console.error); 
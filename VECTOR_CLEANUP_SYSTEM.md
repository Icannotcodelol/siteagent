# Vector Cleanup System Documentation

## Overview

This document describes the comprehensive vector cleanup system implemented to fix the RAG data deletion bug. The system ensures that when documents or chatbots are deleted, all associated data is properly removed from both the database and Pinecone vector store.

## Problem Solved

Previously, when users deleted documents or chatbots:
- Document chunks were deleted from the database
- BUT vectors remained in Pinecone
- This caused data leakage and potential privacy issues
- Deleted content could still appear in chat responses

## Solution Architecture

### 1. Database Schema Improvements

- **CASCADE DELETE**: Updated foreign key constraint between `documents` and `document_chunks` to automatically delete chunks when documents are deleted
- **Cleanup Queue**: New `vector_cleanup_queue` table tracks pending vector deletions
- **Database Trigger**: Automatically queues vector cleanup when documents are deleted

### 2. API Enhancements

#### Document Deletion (`/api/documents/[document_id]/route.ts`)
- Fetches chunk IDs before deletion
- Deletes document (triggers cascade deletion of chunks)
- Queues vector cleanup job
- Triggers immediate cleanup attempt

#### Chatbot Deletion (`/api/chatbots/[chatbotId]/route.ts`)
- Fetches all document IDs for the chatbot
- Queues cleanup jobs for all documents
- Triggers immediate bulk cleanup
- Deletes all database records

#### Internal Vector Cleanup (`/api/internal/cleanup-vectors/route.ts`)
- Handles actual Pinecone vector deletion
- Supports both single document and bulk deletion
- Updates cleanup queue status
- Implements proper error handling and retry logic

### 3. Background Processing

#### Cron Job (`/api/cron/cleanup-vectors/route.ts`)
- Runs every 10 minutes via Vercel cron
- Processes failed or stuck cleanup jobs
- Provides resilience against temporary failures

#### Monitoring (`/api/admin/cleanup-status/route.ts`)
- Provides cleanup queue statistics
- Tracks success/failure rates
- Helps identify system health issues

## Environment Variables Required

Add these to your `.env.local`:

```bash
# Internal API Security
INTERNAL_API_SECRET=your_secure_random_string_for_internal_apis
CRON_SECRET=your_secure_random_string_for_cron_jobs

# Site Configuration (for internal API calls)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Existing Pinecone variables (ensure these are set)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
```

## Database Migration Applied

The system automatically applied this migration:

```sql
-- Update foreign key to CASCADE DELETE
ALTER TABLE document_chunks 
DROP CONSTRAINT IF EXISTS document_chunks_document_id_fkey;

ALTER TABLE document_chunks 
ADD CONSTRAINT document_chunks_document_id_fkey 
FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;

-- Create cleanup queue table
CREATE TABLE vector_cleanup_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    chatbot_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT NULL
);

-- Create trigger for automatic cleanup queueing
CREATE OR REPLACE FUNCTION cleanup_document_vectors()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO vector_cleanup_queue (document_id, chatbot_id, created_at)
    VALUES (OLD.id, OLD.chatbot_id, NOW());
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_vectors
    BEFORE DELETE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_document_vectors();
```

## How It Works

### Document Deletion Flow
1. User deletes document via API
2. System fetches chunk IDs for Pinecone cleanup
3. Document deleted from database (chunks auto-deleted via CASCADE)
4. Database trigger queues cleanup job
5. Immediate cleanup attempt via internal API
6. If immediate cleanup fails, cron job retries later

### Chatbot Deletion Flow
1. User deletes chatbot via API
2. System fetches all document IDs for the chatbot
3. Cleanup jobs queued for all documents
4. Bulk cleanup triggered immediately
5. All database records deleted
6. Background job handles any failed cleanups

### Vector Cleanup Process
1. Connects to Pinecone using configured credentials
2. Deletes vectors by specific IDs (preferred) or metadata filter
3. Updates cleanup queue status
4. Handles errors gracefully with retry logic

## Monitoring and Testing

### Check Cleanup Status
```bash
curl -H "Authorization: Bearer $INTERNAL_API_SECRET" \
  https://your-domain.com/api/admin/cleanup-status
```

### Test Document Deletion
```typescript
import { testDocumentDeletion } from '@/lib/test-utils/deletion-tests'

const result = await testDocumentDeletion('document-id')
console.log({
  documentExists: result.documentExists,      // Should be false
  chunksExist: result.chunksExist,           // Should be false  
  vectorsExist: result.vectorsExist,         // Should be false
  cleanupStatus: result.cleanupQueueStatus   // Should be 'completed'
})
```

### Test Chatbot Deletion
```typescript
import { testChatbotDeletion } from '@/lib/test-utils/deletion-tests'

const result = await testChatbotDeletion('chatbot-id')
console.log({
  chatbotExists: result.chatbotExists,       // Should be false
  documentsExist: result.documentsExist,     // Should be false
  chunksExist: result.chunksExist,           // Should be false
  vectorsExist: result.vectorsExist          // Should be false
})
```

## Vercel Cron Configuration

The system includes a `vercel.json` file that configures automatic cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-vectors",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

This runs the cleanup job every 10 minutes to handle any failed immediate cleanups.

## Error Handling

The system includes comprehensive error handling:

- **Graceful Degradation**: If immediate cleanup fails, background job will retry
- **Status Tracking**: All cleanup attempts are logged with status and error messages
- **Monitoring**: Admin API provides visibility into system health
- **Retry Logic**: Failed jobs are automatically retried by the cron job

## Security Considerations

- **Internal API Protection**: All internal APIs require secret authentication
- **RLS Compliance**: User-facing APIs still respect Row Level Security
- **Admin Access**: Monitoring APIs require admin-level authentication
- **Error Logging**: Sensitive information is not exposed in error messages

## Performance Considerations

- **Batch Processing**: Vectors are deleted in batches to avoid API limits
- **Async Processing**: Cleanup happens asynchronously to avoid blocking user requests
- **Rate Limiting**: Cron job processes limited batches to avoid overwhelming Pinecone
- **Efficient Queries**: Database queries are optimized with proper indexing

## Troubleshooting

### Common Issues

1. **Cleanup Jobs Stuck in 'pending'**
   - Check if `INTERNAL_API_SECRET` is set correctly
   - Verify Pinecone credentials are valid
   - Check cron job logs in Vercel dashboard

2. **Vectors Still Exist After Deletion**
   - Check cleanup queue status via monitoring API
   - Verify Pinecone index name is correct
   - Check for failed cleanup jobs and error messages

3. **High Number of Failed Jobs**
   - Check Pinecone API limits and quotas
   - Verify network connectivity to Pinecone
   - Review error messages in cleanup queue

### Manual Cleanup

If needed, you can manually trigger cleanup for specific documents:

```bash
curl -X POST \
  -H "Authorization: Bearer $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "doc-id", "chatbotId": "bot-id"}' \
  https://your-domain.com/api/internal/cleanup-vectors
```

## Conclusion

This comprehensive vector cleanup system ensures complete data deletion when users remove documents or chatbots from their RAG systems. The multi-layered approach with immediate cleanup, background processing, and monitoring provides both reliability and visibility into the deletion process. 
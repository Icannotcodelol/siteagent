# Document Processing Monitoring & Testing Tools

This document describes the monitoring and testing tools added to help diagnose and prevent PDF upload issues.

## 🔧 Tools Added

### 1. **Document Processing Monitor** (`src/lib/test-utils/document-processing-monitor.ts`)

A utility library for monitoring document processing status:

- **`getDocumentProcessingInfo(documentId)`** - Get detailed processing info for a document
- **`monitorDocumentProcessing(documentId, timeoutMinutes)`** - Monitor processing until completion
- **`getProcessingStats(chatbotId?)`** - Get aggregated statistics for all documents
- **`testDocumentUploadFlow(chatbotId, testContent)`** - End-to-end test of upload flow

### 2. **Admin API Endpoint** (`src/app/api/admin/document-processing/route.ts`)

REST API for accessing processing information:

```bash
# Get processing stats for all documents
GET /api/admin/document-processing?action=stats

# Get processing stats for specific chatbot
GET /api/admin/document-processing?action=stats&chatbotId=<id>

# Get detailed info for specific document
GET /api/admin/document-processing?action=document-info&documentId=<id>
```

### 3. **Processing Status Component** (`src/app/dashboard/chatbot/[id]/_components/processing-status.tsx`)

Real-time UI component showing:
- Document counts by status (pending, processing, completed, failed)
- Average processing time
- Recent errors
- Auto-refresh when documents are processing

### 4. **Test Script** (`scripts/test-pdf-upload.js`)

Command-line tool to test the complete upload flow:

```bash
node scripts/test-pdf-upload.js <chatbot-id>
```

## 🚀 Usage Examples

### Testing Document Upload

```bash
# Run the test script with a chatbot ID
node scripts/test-pdf-upload.js abc123

# The script will:
# 1. Create a test document
# 2. Trigger processing
# 3. Monitor status in real-time
# 4. Report results
# 5. Clean up test data
```

### Monitoring in Dashboard

1. Navigate to your chatbot's "Data Sources" tab
2. The processing status will appear above the upload form
3. Real-time updates every 10 seconds when documents are processing
4. Click on "Recent Errors" to see detailed error messages

### Using the Admin API

```javascript
// Get processing statistics
const response = await fetch('/api/admin/document-processing?action=stats&chatbotId=abc123', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
const stats = await response.json();

console.log(`${stats.processing} documents currently processing`);
console.log(`Average processing time: ${stats.averageProcessingTimeSeconds}s`);
```

### Using the Monitor Library

```typescript
import { monitorDocumentProcessing, getProcessingStats } from '@/lib/test-utils/document-processing-monitor';

// Monitor a specific document
const result = await monitorDocumentProcessing('doc-123', 5); // 5 minute timeout
console.log(`Document processed in ${result.processing_duration_seconds}s`);

// Get statistics for a chatbot
const stats = await getProcessingStats('chatbot-123');
console.log(`${stats.failed} documents failed processing`);
```

## 🐛 Troubleshooting

### Common Issues

1. **Race Conditions**: Fixed with duplicate processing checks in the embedding function
2. **Foreign Key Violations**: Enhanced error handling gracefully handles deleted documents
3. **UI Not Updating**: Auto-refresh ensures status updates are shown in real-time

### Error Monitoring

The processing status component automatically displays recent errors. Common errors include:

- **"Document was deleted during processing"** - Document removed while being processed
- **"Foreign key constraint violation"** - Database integrity issue (should be rare now)
- **"OpenAI API error"** - API rate limits or quota issues
- **"Pinecone upsert error"** - Vector database connectivity issues

### Performance Monitoring

- **Average Processing Time** - Baseline for detecting performance issues
- **Queue Length** - Number of pending documents indicates backlog
- **Success Rate** - Ratio of completed vs failed documents

## 🔍 What the Fixes Address

1. **Race Condition Prevention**:
   - Added status checks before processing
   - Used upsert instead of insert for chunks
   - Graceful handling of concurrent processing attempts

2. **Foreign Key Constraint Handling**:
   - Check document existence before chunk insertion
   - Proper error handling for deleted documents
   - Cleanup mechanisms for orphaned data

3. **User Experience Improvements**:
   - Real-time status updates
   - Disabled actions during processing
   - Clear error messages and resolution steps

4. **Debugging & Monitoring**:
   - Comprehensive logging and metrics
   - Admin tools for issue diagnosis
   - Automated testing capabilities

## 📊 Metrics & Alerts

Consider setting up alerts for:
- Processing failure rate > 5%
- Average processing time > 60 seconds
- Queue length > 10 documents
- Error rate increasing over time

The tools provide all the data needed to implement these alerts in your monitoring system. 
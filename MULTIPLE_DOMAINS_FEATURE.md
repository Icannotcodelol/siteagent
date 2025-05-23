# Multiple Domain Scraping Feature

## Overview

The Multiple Domain Scraping feature allows users to add and scrape content from multiple website domains simultaneously when creating or updating a chatbot. This enhancement improves efficiency and provides a better user experience for comprehensive chatbot training.

## Features

### 🌐 Multiple Domain Input
- **Dynamic List Management**: Add/remove multiple domains with a user-friendly interface
- **Real-time Validation**: Instant URL format validation and duplicate detection
- **Keyboard Navigation**: Press Enter to quickly add domains
- **Visual Feedback**: Clear status indicators and error messages

### 🔄 Batch Processing
- **Parallel Scraping**: Each domain is processed as a separate document
- **Individual Error Handling**: Failed domains don't affect successful ones
- **Progress Tracking**: Visual progress indicators for scraping operations

### 📊 Enhanced User Experience
- **Example Domains**: Helpful examples to guide users
- **Drag & Drop Ready**: Foundation for future drag-and-drop reordering
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technical Implementation

### Frontend Components

#### MultipleDomainInput Component
```typescript
interface MultipleDomainInputProps {
  domains: string[]
  onChange: (domains: string[]) => void
  disabled?: boolean
}
```

**Features:**
- Add/remove domains functionality
- URL validation (http/https required)
- Duplicate detection
- Error state management
- Keyboard shortcuts (Enter to add)

#### DomainScrapingProgress Component
```typescript
interface DomainScrapingStatus {
  url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}
```

**Features:**
- Real-time progress tracking
- Status indicators with icons
- Error reporting with details
- Progress bar visualization

### Backend Changes

#### Updated Interfaces
```typescript
interface CreateChatbotData {
  // ... existing fields
  website_urls?: string[]  // Changed from website_url
}

interface UpdateChatbotData {
  // ... existing fields  
  website_urls?: string[]  // Changed from website_url
}
```

#### Processing Logic
- **Batch Document Creation**: Each URL creates a separate document entry
- **Individual Error Handling**: Failed URLs don't prevent successful ones
- **Enhanced Logging**: Detailed logging for each domain processing
- **Backward Compatibility**: Existing single-domain workflows continue to work

## Usage

### Adding Multiple Domains

1. **Navigate** to the chatbot builder (create new or edit existing)
2. **Click** on the "Data Sources" tab
3. **Enter URLs** in the "Website Domains to Scrape" section
4. **Add domains** by:
   - Typing a URL and pressing Enter
   - Typing a URL and clicking the + button
5. **Remove domains** by clicking the X button next to any domain
6. **Save** the chatbot to start scraping

### URL Requirements
- Must start with `http://` or `https://`
- No duplicate domains allowed
- Empty/whitespace-only URLs are filtered out

### Examples of Valid Domains
```
https://example.com
https://docs.example.com
https://blog.example.com/help
https://support.example.com/faq
https://api.example.com/docs
```

## Database Schema

The feature maintains the existing database structure:

### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  chatbot_id UUID REFERENCES chatbots(id),
  user_id UUID REFERENCES users(id),
  file_name TEXT,  -- Stores the URL for scraped websites
  embedding_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  -- ... other columns
);
```

Each domain creates a separate document record, maintaining data integrity and enabling individual tracking.

## Error Handling

### Validation Errors
- **Invalid URL Format**: "Please include http:// or https://"
- **Duplicate Domain**: "This domain is already added"
- **Empty Domain**: Silently filtered out during processing

### Processing Errors
- **Network Issues**: Detailed error messages for connection failures
- **Invalid Content**: Errors for unsupported content types
- **Server Errors**: Graceful handling of scraping function failures

### User Feedback
- Clear error messages with specific domain names
- Visual indicators for failed vs successful domains
- Retry guidance for failed operations

## Performance Considerations

### Scalability
- **Concurrent Processing**: Each domain is scraped independently
- **Database Efficiency**: Batch operations where possible
- **Memory Management**: Proper cleanup of resources

### Rate Limiting
- **Individual Domain Limits**: Each domain respects rate limiting
- **User Plan Restrictions**: Existing plan limits apply per domain
- **Error Recovery**: Graceful handling of rate limit responses

## Migration Notes

### Backward Compatibility
- Existing single-domain chatbots continue to work unchanged
- Old `website_url` field handling maintained in legacy code paths
- No database migration required

### Upgrade Path
- Existing chatbots can be updated to use multiple domains
- Previous single domain can be re-added using the new interface
- No data loss during feature adoption

## Future Enhancements

### Planned Features
- **Drag & Drop Reordering**: Visual domain list management
- **Bulk Import**: CSV/text file import for large domain lists
- **Domain Grouping**: Organize domains by categories
- **Scheduled Re-scraping**: Automatic content updates
- **Advanced Filtering**: Content filtering rules per domain

### API Improvements
- **Batch Status Endpoints**: Real-time scraping status updates
- **Webhook Integration**: Status change notifications
- **Domain Management API**: Programmatic domain management

## Troubleshooting

### Common Issues

#### Domains Not Being Scraped
1. Check URL format (must include http/https)
2. Verify domain is accessible publicly
3. Check for rate limiting or blocking
4. Review error messages in the progress tracker

#### Performance Issues
1. Limit concurrent domains (recommended: <10 at once)
2. Check internet connection stability
3. Monitor server resources during bulk operations

#### UI Issues
1. Clear browser cache if components don't load
2. Check for JavaScript errors in browser console
3. Verify component imports are correct

### Support
For additional support or bug reports, please check the application logs and include:
- List of domains attempted
- Error messages received
- Browser/device information
- Steps to reproduce the issue

---

*This feature enhances the chatbot creation workflow by enabling efficient multi-domain content ingestion while maintaining system reliability and user experience.* 
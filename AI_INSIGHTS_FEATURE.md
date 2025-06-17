# AI-Powered Chatbot Insights Feature

## Overview

The AI-Powered Chatbot Insights feature uses OpenAI's GPT-4o-mini to automatically analyze chatbot conversations and provide actionable insights. This feature helps you understand what your users are asking, their sentiment, common topics, and areas for improvement.

## Features

### 1. Automated Summaries
- **Daily Summaries**: Generated automatically at 2 AM for the previous day's conversations
- **Weekly Summaries**: Generated every Monday at 3 AM for the previous week
- **Monthly Summaries**: Generated on the 1st of each month at 4 AM for the previous month
- **Custom Date Range**: Generate summaries for any custom date range

### 2. Comprehensive Analysis
Each summary includes:
- **Executive Summary**: 2-3 sentence overview of key patterns and insights
- **Common Topics**: Top 5 topics with frequency percentages and example messages
- **User Intent Categories**: Breakdown of support, sales, features, complaints, etc.
- **Sentiment Analysis**: Positive, neutral, and negative sentiment percentages
- **Key Questions**: 10 most representative questions users are asking
- **Improvement Suggestions**: 3-5 specific recommendations for chatbot improvements
- **Anomalies**: Unusual patterns or activity spikes

### 3. UI Components

#### Analytics Panel Integration
- New "AI Insights" tab in the chatbot analytics panel
- View historical summaries
- Generate new summaries on-demand
- Filter by summary type (daily, weekly, monthly)

#### Overview Page Integration
- AI Insights summary card showing latest insights across all chatbots
- Trending topics aggregated from all chatbots
- Overall sentiment indicator

## Implementation Details

### Database Schema

```sql
-- Stores LLM-generated summaries
chatbot_message_summaries:
  - id: UUID primary key
  - chatbot_id: UUID foreign key
  - summary_type: TEXT (daily, weekly, monthly, custom)
  - date_start: TIMESTAMP
  - date_end: TIMESTAMP
  - total_messages: INTEGER
  - unique_sessions: INTEGER
  - executive_summary: TEXT
  - common_topics: JSONB
  - user_intent_categories: JSONB
  - sentiment_analysis: JSONB
  - key_questions: JSONB
  - improvement_suggestions: TEXT
  - anomalies: TEXT
  - llm_model: TEXT
  - processing_time_ms: INTEGER
  - created_at: TIMESTAMP

-- Optional: Individual message analysis
message_analysis:
  - id: UUID primary key
  - message_id: UUID foreign key
  - chatbot_id: UUID foreign key
  - intent_category: TEXT
  - sentiment: TEXT
  - topics: TEXT[]
  - is_actionable: BOOLEAN
  - requires_improvement: BOOLEAN
  - created_at: TIMESTAMP
```

### API Endpoints

#### Generate Summary
```
POST /api/chatbots/{chatbotId}/analytics/summaries
Body: {
  type: "daily" | "weekly" | "monthly" | "custom",
  startDate?: "YYYY-MM-DD", // for custom
  endDate?: "YYYY-MM-DD"    // for custom
}
```

#### Get Summaries
```
GET /api/chatbots/{chatbotId}/analytics/summaries
Query params:
  - type: "daily" | "weekly" | "monthly"
  - limit: number (default: 10)
```

### Cron Jobs

Configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-summaries?type=daily",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/generate-summaries?type=weekly", 
      "schedule": "0 3 * * 1"
    },
    {
      "path": "/api/cron/generate-summaries?type=monthly",
      "schedule": "0 4 1 * *"
    }
  ]
}
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local`:
```
CRON_SECRET=your-secure-cron-secret
```

### 2. Database Migration
The migration has already been applied to create the necessary tables with proper RLS policies.

### 3. Vercel Cron Configuration
The cron jobs are configured in `vercel.json`. Ensure your Vercel project has:
- The `CRON_SECRET` environment variable set
- Cron jobs enabled (may require Pro plan)

## Usage

### Manual Summary Generation
1. Navigate to your chatbot's analytics page
2. Click on the "AI Insights" tab
3. Select the summary type (daily, weekly, monthly)
4. Click "Generate New" to create a summary

### Viewing Summaries
1. In the AI Insights tab, summaries are listed on the left
2. Click on any summary to view detailed insights
3. The most recent summary is selected by default

### Cost Optimization

The system implements several cost-saving measures:
- **Message Sampling**: For high-volume chatbots (>500 messages), a random sample is analyzed
- **Caching**: Summaries are stored and reused
- **Batch Processing**: Cron jobs process chatbots in batches of 10
- **Model Selection**: Uses GPT-4o-mini for cost efficiency

## Best Practices

1. **Regular Review**: Check AI insights weekly to stay on top of user needs
2. **Action Items**: Create tasks from improvement suggestions
3. **Trend Monitoring**: Compare summaries over time to identify trends
4. **Topic Evolution**: Watch how common topics change over time
5. **Sentiment Tracking**: Monitor sentiment trends as an indicator of chatbot performance

## Troubleshooting

### No Summaries Generated
- Check if there are messages in the specified time period
- Verify the chatbot has user messages (not just bot messages)
- Ensure OpenAI API key is valid

### Cron Jobs Not Running
- Verify `CRON_SECRET` is set in Vercel environment variables
- Check Vercel dashboard for cron job execution logs
- Ensure your plan supports cron jobs

### Missing Data
- Summaries require at least one user message in the period
- Empty periods will return a 404 error
- Check date ranges for custom summaries

## Future Enhancements

1. **Export Functionality**: Download summaries as PDF/CSV
2. **Comparison Features**: Compare summaries across time periods
3. **Alert System**: Email notifications for significant changes
4. **Custom Analysis**: User-defined analysis parameters
5. **Multi-language Support**: Analyze conversations in different languages 
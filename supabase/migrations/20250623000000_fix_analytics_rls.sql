-- Allow authenticated users to read analytics views
GRANT SELECT ON chatbot_daily_metrics TO authenticated;
GRANT SELECT ON chatbot_feedback_summary TO authenticated; 
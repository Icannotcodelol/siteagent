-- Fix preview document chunks table to support 3072-dimensional embeddings
-- This ensures the demo/preview system works with the new embedding model

-- 1. Update preview_document_chunks table to use vector(3072)
ALTER TABLE preview_document_chunks 
ALTER COLUMN embedding TYPE vector(3072);

-- 2. Clear any existing preview chunks with wrong dimensions
DELETE FROM preview_document_chunks WHERE TRUE;

-- 3. Update/recreate the match_preview_documents function to handle 3072 dimensions
CREATE OR REPLACE FUNCTION match_preview_documents(
  session_token text,
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
RETURNS TABLE(
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    preview_document_chunks.chunk_text,
    (1 - (preview_document_chunks.embedding <=> query_embedding)) AS similarity
  FROM preview_document_chunks
  WHERE preview_document_chunks.session_token = match_preview_documents.session_token
    AND (1 - (preview_document_chunks.embedding <=> query_embedding)) >= match_threshold
  ORDER BY preview_document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Also update the main match_document_chunks function to ensure it's using 3072 dimensions
CREATE OR REPLACE FUNCTION match_document_chunks(
  p_query_embedding vector(3072),
  p_chatbot_id uuid,
  p_match_threshold float,
  p_match_count int
)
RETURNS TABLE(
  chunk_text text,
  similarity float,
  document_id uuid,
  file_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.chunk_text,
    (1 - (dc.embedding <=> p_query_embedding)) AS similarity,
    dc.document_id,
    d.file_name
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE dc.chatbot_id = p_chatbot_id
    AND dc.embedding IS NOT NULL
    AND (1 - (dc.embedding <=> p_query_embedding)) >= p_match_threshold
  ORDER BY dc.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$; 
/**
 * RAG System Configuration
 * Centralized configuration for optimal retrieval and generation quality
 */

export const RAG_CONFIG = {
  // === EMBEDDING SETTINGS ===
  EMBEDDING_MODEL: 'text-embedding-3-large', // 3072-dimension model
  EMBEDDING_DIMENSIONS: 3072, // text-embedding-3-large dimensions
  
  // === CHUNKING SETTINGS ===
  CHUNK_SIZE: 800, // Optimal for coherent context
  CHUNK_OVERLAP: 200, // 25% overlap for continuity
  
  // === RETRIEVAL SETTINGS ===
  SIMILARITY_THRESHOLD: 0.65, // Lowered for better recall
  MATCH_COUNT: 8, // Increased context window
  MAX_CONTEXT_LENGTH: 16000, // Max characters in combined context
  
  // === PINECONE OPTIMIZATION ===
  PINECONE_BATCH_SIZE: 100, // Vectors per upsert batch
  RETRIEVAL_MULTIPLIER: 3, // Retrieve 3x more for re-ranking
  
  // === ADVANCED RETRIEVAL ===
  USE_RERANKING: true, // Enable semantic re-ranking
  DIVERSITY_PENALTY: 0.2, // Prevent over-sampling from same document
  
  // === CHAT MODEL SETTINGS ===
  CHAT_MODEL: 'gpt-4o', // Best reasoning model
  MAX_TOKENS: 4000, // Response length limit
  TEMPERATURE: 0.1, // Low temperature for factual responses
  
  // === SYSTEM PROMPT OPTIMIZATION ===
  ENABLE_DOCUMENT_CONTEXT_HEADERS: true, // Show source documents
  ENABLE_CONFIDENCE_INDICATORS: true, // Include confidence in responses
  
  // === QUALITY FEATURES ===
  FEATURES: {
    HYBRID_SEARCH: true, // Combine semantic + keyword search
    CONTEXT_COMPRESSION: true, // Compress context for efficiency
    ANSWER_CITATION: true, // Include source citations
    MULTI_DOCUMENT_SYNTHESIS: true, // Synthesize across documents
  }
} as const;

/**
 * Environment-specific overrides
 */
export function getRAGConfig(environment: 'development' | 'production' = 'production') {
  if (environment === 'development') {
    // More aggressive settings for testing
    return {
      ...RAG_CONFIG,
      SIMILARITY_THRESHOLD: 0.6,
      MATCH_COUNT: 10,
      USE_RERANKING: true,
      DIVERSITY_PENALTY: 0.3,
    };
  }
  
  return RAG_CONFIG;
}

/**
 * Quality optimization presets
 */
export const QUALITY_PRESETS = {
  // Maximum quality - use for critical applications
  MAXIMUM_QUALITY: {
    ...RAG_CONFIG,
    MATCH_COUNT: 12,
    SIMILARITY_THRESHOLD: 0.6,
    USE_RERANKING: true,
    DIVERSITY_PENALTY: 0.25,
    RETRIEVAL_MULTIPLIER: 4,
  },
  
  // Balanced - good quality with reasonable performance
  BALANCED: {
    ...RAG_CONFIG,
    MATCH_COUNT: 8,
    SIMILARITY_THRESHOLD: 0.65,
    USE_RERANKING: true,
    DIVERSITY_PENALTY: 0.2,
  },
  
  // Fast - optimized for speed
  FAST: {
    ...RAG_CONFIG,
    MATCH_COUNT: 5,
    SIMILARITY_THRESHOLD: 0.7,
    USE_RERANKING: false,
    DIVERSITY_PENALTY: 0.1,
    RETRIEVAL_MULTIPLIER: 1,
  }
} as const;

/**
 * Document type specific optimizations
 */
export const DOCUMENT_TYPE_CONFIG = {
  CSV: {
    CHUNK_SIZE: 600, // Smaller chunks for structured data
    CHUNK_OVERLAP: 100,
    SIMILARITY_THRESHOLD: 0.6, // More lenient for tabular data
  },
  
  PDF: {
    CHUNK_SIZE: 1000, // Larger chunks for documents
    CHUNK_OVERLAP: 250,
    SIMILARITY_THRESHOLD: 0.65,
  },
  
  TEXT: {
    CHUNK_SIZE: 800, // Standard for plain text
    CHUNK_OVERLAP: 200,
    SIMILARITY_THRESHOLD: 0.65,
  }
} as const; 
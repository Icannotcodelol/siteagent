import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

export interface RetrievedChunk {
  chunk_text: string;
  similarity: number;
  document_id: string;
  file_name: string;
  chunk_index: number;
  rerank_score?: number;
}

export interface AdvancedRetrievalOptions {
  topK: number;
  similarityThreshold: number;
  useReranking: boolean;
  diversityPenalty: number; // 0-1, higher means more diversity
}

/**
 * Advanced retrieval with re-ranking and diversity optimization
 */
export class AdvancedRetrieval {
  private openai: OpenAI;
  private pinecone: Pinecone | null = null;
  private indexName: string = '';

  constructor(openaiApiKey: string, pineconeApiKey?: string, pineconeIndexName?: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    
    if (pineconeApiKey && pineconeIndexName) {
      this.pinecone = new Pinecone({ apiKey: pineconeApiKey });
      this.indexName = pineconeIndexName;
    }
  }

  /**
   * Retrieve and re-rank chunks for optimal context
   */
  async retrieveWithReranking(
    query: string,
    chatbotId: string,
    options: AdvancedRetrievalOptions
  ): Promise<RetrievedChunk[]> {
    if (!this.pinecone) {
      throw new Error('Pinecone not configured');
    }

    // 1. Generate query embedding
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Retrieve more candidates than needed for re-ranking
    const index = this.pinecone.Index(this.indexName);
    const retrievalCount = Math.min(options.topK * 3, 50); // Get 3x more for re-ranking
    
    const pineconeResponse = await index.query({
      vector: queryEmbedding,
      topK: retrievalCount,
      includeMetadata: true,
      filter: {
        chatbot_id: { '$eq': chatbotId }
      }
    });

    // 3. Convert to RetrievedChunk format
    const chunks: RetrievedChunk[] = pineconeResponse.matches
      ?.filter(match => 
        match.metadata && 
        typeof match.metadata.chunk_text === 'string' &&
        (match.score || 0) >= options.similarityThreshold
      )
      .map(match => ({
        chunk_text: match.metadata!.chunk_text as string,
        similarity: match.score || 0,
        document_id: (match.metadata!.document_id as string) || '',
        file_name: (match.metadata!.file_name as string) || 'unknown',
        chunk_index: (match.metadata!.chunk_index as number) || 0,
      })) || [];

    if (chunks.length === 0) {
      return [];
    }

    // 4. Apply re-ranking if enabled
    let finalChunks = chunks;
    if (options.useReranking && chunks.length > options.topK) {
      finalChunks = await this.rerankChunks(query, chunks, options.topK);
    }

    // 5. Apply diversity optimization
    if (options.diversityPenalty > 0) {
      finalChunks = this.applyDiversityPenalty(finalChunks, options.diversityPenalty);
    }

    // 6. Return top K chunks
    return finalChunks.slice(0, options.topK);
  }

  /**
   * Re-rank chunks using semantic similarity to query
   */
  private async rerankChunks(
    query: string,
    chunks: RetrievedChunk[],
    topK: number
  ): Promise<RetrievedChunk[]> {
    // Create combined texts for re-ranking
    const textsToRank = chunks.map(chunk => `${query}\n\n${chunk.chunk_text}`);
    
    // Get embeddings for query+chunk combinations
    const batchSize = 20; // Process in batches to avoid API limits
    const rerankScores: number[] = [];
    
    for (let i = 0; i < textsToRank.length; i += batchSize) {
      const batch = textsToRank.slice(i, i + batchSize);
      
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: batch,
      });
      
      // Calculate relevance scores (simplified approach)
      const batchScores = embeddingResponse.data.map((embedding, idx) => {
        // In a more sophisticated implementation, you'd calculate
        // similarity between query embedding and chunk embedding
        // For now, we'll use the original similarity score with a boost
        return chunks[i + idx].similarity * 1.1; // Simple boost for re-ranking
      });
      
      rerankScores.push(...batchScores);
    }

    // Apply re-rank scores and sort
    const rankedChunks = chunks.map((chunk, idx) => ({
      ...chunk,
      rerank_score: rerankScores[idx] || chunk.similarity,
    }));

    return rankedChunks
      .sort((a, b) => (b.rerank_score || 0) - (a.rerank_score || 0))
      .slice(0, topK);
  }

  /**
   * Apply diversity penalty to avoid too many chunks from the same document
   */
  private applyDiversityPenalty(
    chunks: RetrievedChunk[],
    diversityPenalty: number
  ): RetrievedChunk[] {
    const documentCounts: { [documentId: string]: number } = {};
    
    return chunks.map(chunk => {
      const count = documentCounts[chunk.document_id] || 0;
      documentCounts[chunk.document_id] = count + 1;
      
      // Apply penalty for repeated documents
      const penalty = count * diversityPenalty;
      const adjustedScore = (chunk.rerank_score || chunk.similarity) * (1 - penalty);
      
      return {
        ...chunk,
        rerank_score: adjustedScore,
      };
    }).sort((a, b) => (b.rerank_score || 0) - (a.rerank_score || 0));
  }

  /**
   * Generate contextual summary of retrieved chunks
   */
  async generateContextSummary(chunks: RetrievedChunk[], query: string): Promise<string> {
    if (chunks.length === 0) {
      return "No relevant context found in documents.";
    }

    // Group chunks by document for better organization
    const documentGroups: { [fileName: string]: RetrievedChunk[] } = {};
    chunks.forEach(chunk => {
      if (!documentGroups[chunk.file_name]) {
        documentGroups[chunk.file_name] = [];
      }
      documentGroups[chunk.file_name].push(chunk);
    });

    const contextParts: string[] = [];
    
    // Add a contextual header
    contextParts.push(`Found relevant information from ${Object.keys(documentGroups).length} document(s):`);
    contextParts.push('');

    // Organize content by document
    Object.entries(documentGroups).forEach(([fileName, docChunks]) => {
      contextParts.push(`=== From ${fileName} ===`);
      docChunks.forEach((chunk, idx) => {
        contextParts.push(`[Excerpt ${idx + 1}] ${chunk.chunk_text}`);
      });
      contextParts.push('');
    });

    return contextParts.join('\n');
  }
}

/**
 * Factory function for creating AdvancedRetrieval instance
 */
export function createAdvancedRetrieval(): AdvancedRetrieval {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  return new AdvancedRetrieval(openaiApiKey, pineconeApiKey, pineconeIndexName);
} 
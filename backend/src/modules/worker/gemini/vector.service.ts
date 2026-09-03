import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export interface IVectorDocument {
  id: string;          // Product ID
  content: string;     // e.g. "Special Kulhad Chai - ₹30 - Category: Beverages"
  metadata?: Record<string, any>;
}

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);
  private readonly embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    // 1. Google Embeddings Model Init
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'text-embedding-004',
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  // 2. Kisi bhi Text ya Product Name ka Vector Number array generate karna
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await this.embeddings.embedQuery(text);
    } catch (error: any) {
      this.logger.error('Failed to generate embedding:', error.message);
      throw error;
    }
  }

  // 3. Multiple Products ko ek sath Vectorize karna (Batch Embedding)
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      return await this.embeddings.embedDocuments(texts);
    } catch (error: any) {
      this.logger.error('Failed to generate batch embeddings:', error.message);
      throw error;
    }
  }
}
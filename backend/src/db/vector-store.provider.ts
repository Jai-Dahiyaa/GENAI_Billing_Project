import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';

export const PG_VECTOR_STORE = 'PG_VECTOR_STORE';

export const VectorStoreProvider: Provider = {
  provide: PG_VECTOR_STORE,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<PGVectorStore> => {
    const logger = new Logger('VectorStoreProvider');
    const dbUrl = configService.get<string>('DATABASE_URL');
    const apiKey = configService.get<string>('GEMINI_API_KEY');

    const pool = new Pool({ connectionString: dbUrl });
    const genAI = new GoogleGenerativeAI(apiKey);

    const customEmbeddings = {
      embedQuery: async (text: string): Promise<number[]> => {
        const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
      },
      embedDocuments: async (documents: string[]): Promise<number[][]> => {
        const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        const results = await Promise.all(
          documents.map((doc) => embeddingModel.embedContent(doc)),
        );
        return results.map((res) => res.embedding.values);
      },
    };

    const vectorStore = await PGVectorStore.initialize(
      customEmbeddings as any,
      {
        pool: pool,
        tableName: 'knowledge_base',
        columns: {
          idColumnName: 'id',
          vectorColumnName: 'embedding',
          contentColumnName: 'content',
        },
      },
    );

    logger.log('PGVector Store connected & initialized successfully!');
    return vectorStore;
  },
};
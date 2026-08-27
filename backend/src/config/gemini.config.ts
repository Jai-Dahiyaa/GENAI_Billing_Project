import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_API_KEY,
  chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash',
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
  temperature: 0.2,
  maxOutputTokens: 2048,
}));
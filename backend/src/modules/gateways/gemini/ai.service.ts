import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../../common/cache/cache.service';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { PG_VECTOR_STORE } from '../../../db/vector-store.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private model: ChatGoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly cache: CacheService,
    @Inject(PG_VECTOR_STORE) private readonly vectorStore: PGVectorStore,
  ) {
    // 1. Centralized Config se values read karo
    const apiKey = this.configService.get<string>('gemini.apiKey') || this.configService.get<string>('GEMINI_API_KEY');
    const chatModel = this.configService.get<string>('gemini.chatModel') || 'gemini-3.6-flash';
    const temperature = this.configService.get<number>('gemini.temperature') ?? 0.2;
    const maxOutputTokens = this.configService.get<number>('gemini.maxOutputTokens') ?? 2048;

    // 2. Chat Model Initialization
    this.model = new ChatGoogleGenerativeAI({
      model: chatModel,
      apiKey: apiKey,
      temperature: temperature,
      maxOutputTokens: maxOutputTokens,
    });
  }

  async generateChatReply(userId: string, role: string, prompt: string, sessionId: string): Promise<string> {
    try {
      const memoryKey = `chat:${userId}:${sessionId}`;

      // A. Cache se history nikaalna aur safely parse karna
      const rawData = await this.cache.get(memoryKey);
      let rawHistory: any[] = [];

      if (rawData) {
        if (typeof rawData === 'string') {
          try {
            rawHistory = JSON.parse(rawData);
          } catch {
            rawHistory = [];
          }
        } else if (Array.isArray(rawData)) {
          rawHistory = rawData;
        }
      }

      // B. LangChain Messages Format Mapping
      const chatHistory = rawHistory.map((entry: any) => {
        const textContent =
          entry?.parts?.[0]?.text || entry?.text || (typeof entry === 'string' ? entry : '');
        return entry?.role === 'user' ? new HumanMessage(textContent) : new AIMessage(textContent);
      });

      // C. Quota Optimization: Casual greeting par Vector DB call skip karo
      const isCasualGreeting = /^(hi|hello|hey|namaste|thanks|thank you|bye|ok|theek hai|kya hal hai)$/i.test(
        prompt.trim(),
      );

      let contextText = '';
      if (!isCasualGreeting) {
        const allowedTables = role === 'ADMIN'
          ? ['invoices', 'subscriptions', 'policies']
          : ['invoices', 'policies'];

        // Vector Search Top-3 context retrieval
        const retriever = this.vectorStore.asRetriever({
          k: 3,
          filter: {
            user_id: userId,
            source_table: { in: allowedTables },
          },
        });

        const relevantDocs = await retriever.invoke(prompt);
        contextText = relevantDocs.map((doc) => doc.pageContent).join('\n');
      }

      // D. System Prompt Template
      const promptTemplate = ChatPromptTemplate.fromMessages([
        [
          'system',
          `Tu NexCorp ka core AI assistant Hari hai.
Neeche diye gaye verified database context aur pichli chat history ko padh kar user ka short, complete aur accurate reply de.
Agar context mein data na mile toh politely mana kar de, mann se mat bana.

Database Context:
{context}`,
        ],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
      ]);

      // E. Prompt Format (Context + History + Input)
      const formattedMessages = await promptTemplate.formatMessages({
        context: contextText || 'No specific internal database records found.',
        chat_history: chatHistory,
        input: prompt,
      });

      // F. Gemini Inference
      const aiResponse = await this.model.invoke(formattedMessages);
      const replyText = aiResponse.content as string;

      // G. Cache History Update
      await this.cache.saveChatHistory(userId, sessionId, rawHistory, prompt, replyText);

      return replyText;
    } catch (error: any) {
      this.logger.error('Gemini Execution Error:', error?.message || error);
      throw error;
    }
  }
}
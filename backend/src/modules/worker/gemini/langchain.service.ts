import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

@Injectable()
export class LangChainAiService {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    // 1. Model init (modelName ki jagah 'model' aayega)
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.2,
    });
  }

  // 2. Chat method skeleton
  async askAi(userQuery: string, chatHistory: any[] = []) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a billing assistant.'],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);

    // Chain execution
    const chain = prompt.pipe(this.model);
    const response = await chain.invoke({
      history: chatHistory,
      input: userQuery,
    });

    return response.content.toString();
  }
}
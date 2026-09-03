import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WhatsappUtil } from '../../../utils/whatsapp.utils';

@Injectable()
export class AiWorkerService {

  private readonly logger = new Logger(AiWorkerService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async processAiTask(data: any) {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(data.prompt);
    return result.response.text();
  }

  async processWhatsAppTask(phone: string, userMessage: string): Promise<void> {
    this.logger.log(`Processing AI Task for ${phone} with prompt: "${userMessage}"`);

    // 1. Verification OTP check logic
    if (userMessage.toLowerCase().includes('hi') || userMessage.toLowerCase().includes('verify')) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpText = `*NexCorp Assistant*\n\nYour OTP is: *${otp}*\nValid for 5 minutes.`;

      await WhatsappUtil.sendCustomTextMessage(phone, otpText);
      return;
    }

    // 2. Billing / Invoice AI Assistant response (Gemini LLM Call)
    // const aiReply = await this.geminiService.generateResponse(userMessage);
    const mockAiReply = `*NexCorp AI Billing Assistant*\n\nI received your query: "${userMessage}".\nProcessing your invoice request...`;

    // 3. User ko wapas WhatsApp par message send karo
    await WhatsappUtil.sendCustomTextMessage(phone, mockAiReply);
  }
}
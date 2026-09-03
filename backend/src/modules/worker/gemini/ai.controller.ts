import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AiWorkerService } from './ai.service';
import { RABBITMQ_PATTERNS } from "../../../common/rabbitmq/rabbitmq.constants";


@Controller()
export class AiWorkerController {
  constructor(private readonly aiWorkerService: AiWorkerService) { }

  @EventPattern(RABBITMQ_PATTERNS.AI_PARSE_WHATSAPP_INVOICE)
  async handleWhatsAppInvoice(@Payload() data: any) {
    try {
      const senderPhone = data?.payload?.senderPhone;
      const messageText = data?.message;

      // Skip dummy Meta sandbox test number
      if (senderPhone === '16315551181') {
        console.log('Skipping dummy test number from Meta Dashboard');
        return;
      }

      console.log(`Processing WhatsApp AI message for: ${senderPhone}`);
      await this.aiWorkerService.processWhatsAppTask(senderPhone, messageText);
    } catch (error) {
      console.error('Worker task error:', error);
    }
  }
}

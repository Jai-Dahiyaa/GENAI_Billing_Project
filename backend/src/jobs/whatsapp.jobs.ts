import { Injectable, Inject, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { RABBITMQ_CLIENTS, RABBITMQ_PATTERNS } from "../common/rabbitmq/rabbitmq.constants";

@Injectable()
export class WhatsAppJobs {

    private readonly logger = new Logger(WhatsAppJobs.name);

    constructor(
        @Inject(RABBITMQ_CLIENTS.MAIN_SERVICE)
        private readonly rabbitClient: ClientProxy,
    ) { }

    async whatsAppMessage(message: string, payload: any): Promise<void> {
        this.logger.log(`Emitting event to RabbitMQ for phone: ${payload.senderPhone}`);

        this.rabbitClient.emit(RABBITMQ_PATTERNS.AI_PARSE_WHATSAPP_INVOICE, {
            message,
            payload,
        });
    }
}
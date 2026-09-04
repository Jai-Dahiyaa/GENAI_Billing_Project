import { Module, Global } from "@nestjs/common";
import { WhatsappController } from "./whatsapp.controller";
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppRepo } from "./repositories/whatsapp.repository";
import { WhatsAppJobs } from "../../../jobs/whatsapp.jobs";

@Global()
@Module({
    controllers: [WhatsappController],
    providers: [WhatsAppService, WhatsAppRepo, WhatsAppJobs],
    exports: [WhatsAppService, WhatsAppRepo, WhatsAppJobs]
})
export class WhatsappModule { }
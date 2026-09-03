import { Module } from "@nestjs/common";
import { EmailModule } from "./worker/email/email.module";
import { AiWorkerModule } from "./worker/gemini/ai.module";

@Module({
    imports: [
        EmailModule,
        AiWorkerModule
    ]
})

export class AppWorkerModule { }
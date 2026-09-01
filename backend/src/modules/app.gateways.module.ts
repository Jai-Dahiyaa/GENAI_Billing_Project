import { Module } from "@nestjs/common";
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../common/guards/auth.guard';
import { JwtService } from '../utils/jwt.utils';
import { AuthModules } from "./gateways/auth/auth.module";
import { RabbitMQModule } from "../common/rabbitmq/rabbitmq.module";
import { AiGatewaysModule } from "./gateways/gemini/ai.module";
import { WhatsappModule } from "./gateways/whatsapp/whatsapp.module";
import { CompanyModule } from "./gateways/company/company.module";
import { BranchModule } from "./gateways/branches/branch.module";

@Module({
    imports: [
        RabbitMQModule,
        AuthModules,
        WhatsappModule,
        AiGatewaysModule,
        CompanyModule,
        BranchModule
    ],
    providers: [
        JwtService,
        {
            provide: APP_GUARD, useClass: AuthGuard
        }
    ]
})

export class AppGatewaysModule { }
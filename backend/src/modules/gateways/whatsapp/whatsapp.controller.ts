import {
    Controller, Body, Post, Get, HttpCode, Logger, Query,
    ForbiddenException, HttpStatus, Req, Res
} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { WebhookVerifyQueryDto } from './dto/whatsapp.dto';
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppJobs } from "../../../jobs/whatsapp.jobs";
import { IAuthorizedRequest } from "../../../common/interfaces/request.interface";
import { Public } from "../../../common/decorators/public.decorator";
import * as whatsappDto from './dto/whatsapp.dto'
import { OtpUtil } from "../../../utils/otp.utils";
import axios from 'axios';
import { env } from "process";

@Controller('whatsapp')
export class WhatsappController {

    private readonly logger = new Logger(WhatsappController.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly whatsAppService: WhatsAppService,
        private readonly whatsAppJobs: WhatsAppJobs
    ) { }

    @Public()
    @Get('webhook')
    verifyWebhook(@Query() query: Record<string, any>, @Res() res: Response) {
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];

        const expectedToken =
            this.configService?.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN') ||
            process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
            'my_super_secret_webhook_token_999';

        console.log('--- Webhook Debug ---');
        console.log('Incoming Query:', query);
        console.log('Received Token:', token);
        console.log('Expected Token:', expectedToken);
        console.log('---------------------');

        if (mode === 'subscribe' && token === expectedToken) {
            this.logger.log('WhatsApp Webhook Handshake Verified Successfully!');
            return res.status(HttpStatus.OK).send(challenge);
        }

        return res.status(HttpStatus.FORBIDDEN).send('Invalid verification token');
    }

    @Public()
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleIncomingMessage(@Body() payload: any) {
        const messageObj = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (!messageObj) {
            return { status: 'EVENT_RECEIVED' };
        }

        const senderPhone = messageObj.from;
        const messageText = messageObj.text?.body?.trim();
        const messageType = messageObj.type;

        console.log(`WhatsApp message from ${senderPhone}: "${messageText}"`);

        if (messageType === 'text' && messageText) {
            console.log(`WhatsApp message from ${senderPhone}: "${messageText}"`);

            await this.whatsAppJobs.whatsAppMessage(messageText, {
                senderPhone,
                messageText,
                rawPayload: payload,
            });
        }

        return { status: 'EVENT_RECEIVED' };
    }

    @Post('verify-number')
    @HttpCode(HttpStatus.OK)
    async phoneNumberVerify(
        @Body() body: whatsappDto.NumberVerify,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string }> {

        const { userId } = req.user;
        const number = body.phone;

        await this.whatsAppService.phoneNumberVerify(userId, number);

        return {
            status: true,
            message: 'OTP Send on your whats app no.'
        }
    }
}
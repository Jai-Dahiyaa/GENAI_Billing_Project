import { Controller } from "@nestjs/common";
import { EmailService } from "./email.service";
import { EventPattern, Payload } from '@nestjs/microservices';
import * as EmailInterface from "../../../common/interfaces/email.interface"
import { RABBITMQ_PATTERNS } from "../../../common/rabbitmq/rabbitmq.constants";
import { winstonLogger } from "../../../config/logger.config";

@Controller()
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @EventPattern(RABBITMQ_PATTERNS.USER_REGISTER_OTP_SEND)
    async handleSingUpOtp(@Payload() data: EmailInterface.SingupOtpPyaload): Promise<void> {
        await this.emailService.sendSignUpOtpEmail(data.email, data.otp)
    }

    @EventPattern(RABBITMQ_PATTERNS.USER_REGISTER_SUCCESSFULLY_EMAIL)
    async userRegsiterSuccessFully(@Payload() data: EmailInterface.UserRegisterThanksEmail): Promise<void> {
        await this.emailService.successFullUserRegister(data.email, data.name)
    }

    @EventPattern(RABBITMQ_PATTERNS.FORGORT_PASSWORD_OTP_SEND)
    async forgotOtpSend(@Payload() data: EmailInterface.SingupOtpPyaload): Promise<void> {
        await this.emailService.sendForgotPasswordOtpEmail(data.email, data.otp)
    }

    @EventPattern(RABBITMQ_PATTERNS.PASSWORD_RESET_EMAIL_SEND)
    async passwordReset(@Payload() data: { email: string }): Promise<void> {
        const { email } = data;

        if (!email) {
            winstonLogger.error("RabbitMQ Payload Error: email field missing in data", data);
            return;
        }

        await this.emailService.sendPasswordResetSuccessEmail(email);
    }
}
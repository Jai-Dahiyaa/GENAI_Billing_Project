import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { RABBITMQ_CLIENTS, RABBITMQ_PATTERNS } from "../common/rabbitmq/rabbitmq.constants";

@Injectable()
export class EmailJobs {
    constructor(
        @Inject(RABBITMQ_CLIENTS.MAIN_SERVICE)
        private readonly rabbitClient: ClientProxy,) { }

    async userRegisterOtpSend(email: string, otp: string): Promise<void> {
        this.rabbitClient.emit(RABBITMQ_PATTERNS.USER_REGISTER_OTP_SEND, {
            email,
            otp
        })
    }

    async userRegisterSuccessFullEmail(email: string, name: string): Promise<void> {
        this.rabbitClient.emit(RABBITMQ_PATTERNS.USER_REGISTER_SUCCESSFULLY_EMAIL, { email, name })
    }

    async forgotOtpSend(email: string, otp: string): Promise<void> {
        this.rabbitClient.emit(RABBITMQ_PATTERNS.FORGORT_PASSWORD_OTP_SEND, {
            email,
            otp
        })
    }

    async passwordResetEmail (email: string): Promise<void> {
        this.rabbitClient.emit(RABBITMQ_PATTERNS.PASSWORD_RESET_EMAIL_SEND, {
            email
        })
    }
}
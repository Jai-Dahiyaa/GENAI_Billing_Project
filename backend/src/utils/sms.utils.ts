import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

export type SmsVerificationType = 'USER' | 'COMPANY' | 'BRANCH';

export class SmsUtil {

    static formatMessage(type: SmsVerificationType, phone: string, otp: string, entityName?: string): string {
        switch (type) {
            case 'USER':
                return `NexCorp: Your user verification code is ${otp}. Valid for 5 minutes. Do not share.`;

            case 'COMPANY':
                const comp = entityName ? ` for ${entityName}` : '';
                return `NexCorp: Company phone verification code${comp} is ${otp}. Valid for 5 minutes.`;

            case 'BRANCH':
                const branch = entityName ? ` for branch (${entityName})` : '';
                return `NexCorp: Branch verification code${branch} is ${otp}. Valid for 5 minutes.`;

            default:
                return `NexCorp: Your verification OTP is ${otp}. Valid for 5 minutes.`;
        }
    }


    static async sendVerificationSms(
        type: SmsVerificationType,
        phone: string,
        otp: string,
        entityName?: string,
    ): Promise<boolean> {
        const apiKey = process.env.FAST2SMS_API_KEY;

        if (!apiKey) {
            throw new InternalServerErrorException('FAST2SMS_API_KEY missing in .env');
        }

        const cleanNumber = phone.replace(/\D/g, '').slice(-10);

        const messageText = this.formatMessage(type, phone, otp, entityName);

        if (process.env.NODE_ENV !== 'production' && process.env.SKIP_SMS === 'true') {
            console.log(`\n============================`);
            console.log(`[MOCK SMS] To: ${cleanNumber}`);
            console.log(`[MOCK SMS] Message: ${messageText}`);
            console.log(`[MOCK SMS] OTP: ${otp}`);
            console.log(`============================\n`);
            return true;
        }

        try {
            const response = await axios.post(
                'https://www.fast2sms.com/dev/bulkV2',
                {
                    route: 'q',
                    message: messageText,
                    language: 'english',
                    flash: 0,
                    numbers: cleanNumber,
                },
                {
                    headers: {
                        authorization: apiKey,
                        'Content-Type': 'application/json',
                    },
                },
            );

            return response.data?.return === true;
        } catch (error: any) {
            console.error('Fast2SMS Dispatch Error:', error?.response?.data || error.message);
            throw new InternalServerErrorException('Failed to deliver SMS OTP.');
        }
    }
}
import axios from 'axios';
import { BadRequestException } from '@nestjs/common';

export interface IWhatsappMetaConfig {
  apiUrl?: string;
  phoneNumberId?: string;
  token?: string;
  botNumber?: string;
}

export type VerificationType = 'USER' | 'COMPANY' | 'BRANCH';

export class WhatsappUtil {
  private static resolveConfig(config?: IWhatsappMetaConfig) {
    const apiUrl =
      config?.apiUrl ||
      process.env.WHATSAPP_API_URL ||
      'https://graph.facebook.com/v22.0';
    const phoneNumberId =
      config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = config?.token || process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const botNumber =
      config?.botNumber || process.env.WHATSAPP_BOT_PHONE_NUMBER;

    return { apiUrl, phoneNumberId, token, botNumber };
  }

  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }
    return cleaned;
  }

  // =================================================================
  // SECTION 1: Deep Link & Text Formatters (Zero Cost / Click-to-Chat)
  // =================================================================

  static generateDeepLink(message: string, customBotNumber?: string): string {
    const { botNumber } = this.resolveConfig({ botNumber: customBotNumber });

    if (!botNumber) {
      throw new BadRequestException(
        'WhatsApp bot phone number is not configured in server environment.',
      );
    }

    const cleanNumber = botNumber.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }

  static formatVerifyMessage(
    type: VerificationType,
    phone: string,
    otp: string,
    customContext?: string,
  ): string {
    switch (type) {
      case 'USER':
        return `Verification Request: User Phone (${phone}). Your OTP is: ${otp}`;

      case 'COMPANY': {
        const companyLabel = customContext ? ` - ${customContext}` : '';
        return `Verification Request: Company Business Number (${phone}${companyLabel}). Your OTP is: ${otp}`;
      }

      case 'BRANCH': {
        const branchLabel = customContext ? ` - ${customContext}` : '';
        return `Verification Request: Branch Contact (${phone}${branchLabel}). Your OTP is: ${otp}`;
      }

      default:
        return `Verification Code for ${phone} is: ${otp}`;
    }
  }

  static createVerificationLink(
    type: VerificationType,
    phone: string,
    otp: string,
    customContext?: string,
  ): string {
    const message = this.formatVerifyMessage(type, phone, otp, customContext);
    return this.generateDeepLink(message);
  }

  // =================================================================
  // SECTION 2: Meta Cloud API Dispatchers (Background Direct Messaging)
  // =================================================================

  static async sendTemplateOtp(
    toPhone: string,
    otp: string,
    config?: IWhatsappMetaConfig,
  ) {
    const activeConfig = this.resolveConfig(config);
    if (!activeConfig.phoneNumberId || !activeConfig.token) {
      throw new Error('WhatsApp phoneNumberId or token is missing in environment variables');
    }

    const recipient = this.formatPhoneNumber(toPhone);
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: 'hello_world',
        language: { code: 'en_US' },
      },
    };

    try {
      const response = await axios.post(
        `${activeConfig.apiUrl}/${activeConfig.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${activeConfig.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'WhatsApp Template Error:',
        JSON.stringify(error?.response?.data || error.message, null, 2),
      );
      throw error;
    }
  }

  static async sendDirectOtp(
    toPhone: string,
    otp: string,
    config?: IWhatsappMetaConfig,
  ) {
    const activeConfig = this.resolveConfig(config);
    if (!activeConfig.phoneNumberId || !activeConfig.token) {
      throw new Error('WhatsApp phoneNumberId or token is missing in environment variables');
    }

    const recipient = this.formatPhoneNumber(toPhone);
    const formattedText = `NexCorp Verification\nYour one-time verification code is: *${otp}*\n\n• Valid for 5 minutes\n• For security, do not share this code`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: { body: formattedText },
    };

    try {
      const response = await axios.post(
        `${activeConfig.apiUrl}/${activeConfig.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${activeConfig.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'WhatsApp Direct Text Error:',
        JSON.stringify(error?.response?.data || error.message, null, 2),
      );
      throw error;
    }
  }

  static async sendCustomTextMessage(
    toPhone: string,
    messageText: string,
    config?: IWhatsappMetaConfig,
  ) {
    const activeConfig = this.resolveConfig(config);
    if (!activeConfig.phoneNumberId || !activeConfig.token) {
      throw new Error('WhatsApp phoneNumberId or token is missing in environment variables');
    }

    const recipient = this.formatPhoneNumber(toPhone);
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: { body: messageText },
    };

    try {
      const response = await axios.post(
        `${activeConfig.apiUrl}/${activeConfig.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${activeConfig.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'WhatsApp Custom Text Error:',
        JSON.stringify(error?.response?.data || error.message, null, 2),
      );
      throw error;
    }
  }
}
import { registerAs } from '@nestjs/config';

export const whatsappConfig = registerAs('whatsapp', () => ({
  apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v20.0',
  token: process.env.WHATSAPP_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'otp_verification',
}));
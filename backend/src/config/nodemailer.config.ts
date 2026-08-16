import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export const createNodemailerTransporter = (configService: ConfigService) => {
  const email = configService.get<string>('EMAIL');
  const rawPass = configService.get<string>('EMAIL_PASS') || '';
  
  const pass = rawPass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: email, pass: pass },
  });
};

export const getMailSenderDetails = (configService: ConfigService) => {
  const email = configService.get<string>('EMAIL');
  return `"NexCorp Billing" <${email}>`;
};
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class OtpUtil {
  static generateOtp(digits: number = 6): string {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    const otpNumber = crypto.randomInt(min, max + 1);
    return otpNumber.toString();
  }

  static hashOtp(otp: string, secret: string = process.env.OTP_SECRET || 'otp_secret'): string {
    return crypto
      .createHmac('sha256', secret)
      .update(otp)
      .digest('hex');
  }

  static verifyOtpHash(otp: string, hashedOtp: string, secret: string = process.env.OTP_SECRET || 'otp_secret'): boolean {
    const calculatedHash = this.hashOtp(otp, secret);
    
    const bufferA = Buffer.from(calculatedHash, 'hex');
    const bufferB = Buffer.from(hashedOtp, 'hex');

    if (bufferA.length !== bufferB.length) return false;

    return crypto.timingSafeEqual(bufferA, bufferB);
  }
}
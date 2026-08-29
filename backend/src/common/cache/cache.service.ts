import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CacheManagerService } from './cache-manager.service';
import { winstonLogger } from '../../config/logger.config';
import * as AuthInterface from "../interfaces/auth.interface"
import * as WhatsAppInterface from "../interfaces/whatsapp.interface"
import * as CompanyInterface from "../interfaces/company.interface";
import * as BranchInterface from "../interfaces/branch.interface"

export interface IGeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

@Injectable()
export class CacheService {
  constructor(private readonly cacheManager: CacheManagerService) { }

  private get client() {
    return this.cacheManager.getClient();
  }

  async set(key: string, value: string, ttlInSeconds?: number): Promise<'OK'> {
    if (ttlInSeconds) {
      return this.client.set(key, value, 'EX', ttlInSeconds);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async setJson(key: string, value: Record<string, any>, ttlInSeconds?: number): Promise<'OK'> {
    const jsonString = JSON.stringify(value);
    return this.set(key, jsonString, ttlInSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, ttlInSeconds: number): Promise<boolean> {
    const result = await this.client.expire(key, ttlInSeconds);
    return result === 1;
  }

  async flushAll(): Promise<'OK'> {
    return this.client.flushall();
  }

  async setRegisterUserCache(payload: AuthInterface.userRegisterCache): Promise<void> {
    try {
      const key = `registerUser:${payload.email}`;
      const ttl = 600;

      await this.client.set(key, JSON.stringify(payload), 'EX', ttl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey User Register SET CACHE Error: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process registration state. Please try again.')
    }
  }

  async getRegisterUserCache(payload: AuthInterface.getUserRegisterCache) {
    try {
      const key = `registerUser:${payload.email}`;

      const getUserData = await this.client.get(key);
      const originalForm = JSON.parse(getUserData);

      if (!getUserData) {
        throw new BadRequestException('Registration OTP session expired. Please register again.');
      }

      return originalForm;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey User Register GET CACHE Error: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process registration state. Please try again.')
    }
  }

  async setActiveBranchId(data: AuthInterface.activeBranchId): Promise<void> {
    try {
      const key = `superadmin:active_branch:${data.userId}`;
      const ttl = 86400;

      await this.client.set(key, data.branchId, 'EX', ttl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey User BranchId SET Register ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process registration state. Please try again.')
    }
  }

  async getActiveBranchId(key: string): Promise<string> {
    try {
      const data = await this.client.get(key);

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey User BranchId GET Register ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process registration state. Please try again.')
    }
  }

  async setForgetPasswordOtp(data: AuthInterface.forgotOtpPayload): Promise<void> {
    try {
      const key = `forgotPassword:${data.userId}`;
      const OTP_TTL_SECONDS = 600;

      await this.client.set(key, JSON.stringify(data), 'EX', OTP_TTL_SECONDS)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Forgot Password Payload SET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process Forgot Password state. Please try again.')
    }
  }

  async getForgotPasswordOtp(userId: string): Promise<AuthInterface.forgotOtpPayload> {
    try {
      const key = `forgotPassword:${userId}`;
      const data = await this.client.get(key);
      const originalForm = JSON.parse(data);

      return originalForm;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Forgot Password Payload GET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process Forgot Password state. Please try again.')
    }
  }

  async setPasswordChangesAt(userId: string, passwordChangedAt: Date | string | number): Promise<void> {
    try {
      const key = `user:password_changed:${userId}`;
      const dateObj = passwordChangedAt instanceof Date
        ? passwordChangedAt
        : new Date(passwordChangedAt);
      const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

      const timeString = validDate.toISOString();
      const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

      await this.client.set(key, timeString, 'EX', SEVEN_DAYS_IN_SECONDS);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Password Changes At Payload GET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process Password Changed At state. Please try again.')
    }
  }

  async setPhoneNoVerify(data: AuthInterface.phoneOtpGenerateCache): Promise<void> {
    try {
      const key = `user:PhoneNoVerify:${data.userId}`;
      const ttl = 600;

      await this.client.set(key, JSON.stringify(data), 'EX', ttl)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Phone no. SET At Payload GET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process Phone no. SET At state. Please try again.')
    }
  }

  async userNumberVerify(data: WhatsAppInterface.whatsappPhoneVerifyCacheData): Promise<void> {
    try {
      const key = `phoneVerify:${data.userId}`;
      const ttl = 600;

      await this.client.set(key, JSON.stringify(data), 'EX', ttl)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Phone no. Verify Payload SET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process Phone no. SET At state. Please try again.')
    }
  }

  async companyProfileDataStore(data: CompanyInterface.CompanyProfileResponse, userId: string): Promise<void> {
    try {
      const key = `user:company_profileGet:${userId}`;
      const ttl = 24 * 60 * 60;

      await this.client.set(key, JSON.stringify(data), 'EX', ttl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Phone no. Verify Payload SET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process Phone no. SET Company Profile Get. Please try again.')
    }
  }

  async companyPhoneNoVerifiedStore(userId: string, phone: string, hashOtp: string, attamp: number): Promise<void> {
    try {
      const key = `user:company_phone_verified:${userId}`;
      const ttl = 60;

      await this.client.set(key, JSON.stringify({ phone, hashOtp, attamp }), 'EX', ttl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Phone no. Verify Payload SET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process Phone no. SET Company Profile Phone Verified. Please try again.')
    }
  }

  async branchDataStore(companyId: string, data: BranchInterface.BranchCreateRes): Promise<void> {
    try {
      const key = `branch:${companyId}:${data.id}`;
      const ttl = 24 * 60 * 60;

      await this.client.set(key, JSON.stringify(data), 'EX', ttl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Branch Data Store SET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process branch data store SET ERROR. Please try again.')
    }
  }

  async branchListStore(companyId: string, data: BranchInterface.IBranchResponse[]): Promise<void> {
    try {
      const key = `branchList:${companyId}`;
      const ttl = 24 * 60 * 60;

      await this.client.set(key, JSON.stringify(data), 'EX', ttl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      winstonLogger.error(`Valkey Branch List Store SET ERROR: ${errorMessage}`);

      throw new InternalServerErrorException('Failed to process branch List store SET ERROR. Please try again.')
    }
  }

  async getChatHistory(sessionId: string): Promise<IGeminiMessage[]> {
    const key = `chat:session:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : [];
  }

  async saveChatHistory(
    userId: string,
    sessionId: string,
    history: IGeminiMessage[],
    userPrompt: string,
    aiReply: string,
    ttlSeconds = 3600,
  ): Promise<void> {
    const key = `chat:${userId}:${sessionId}`;

    const updated = [...history];
    updated.push({ role: 'user', parts: [{ text: userPrompt }] });
    updated.push({ role: 'model', parts: [{ text: aiReply }] });

    const trimmed = updated.slice(-10);

    await this.set(key, JSON.stringify(trimmed), ttlSeconds);
  }
}
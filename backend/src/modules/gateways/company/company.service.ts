import { BadRequestException, Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { CompanyRepo } from "./repositories/company.repository";
import { CacheService } from "../../../common/cache/cache.service";
import { CloudinaryService } from "../../../common/cloudinary/cloudinary.service";
import * as CompanyInterface from "../../../common/interfaces/company.interface";
import { OtpUtil } from "../../../utils/otp.utils";
import { SmsUtil } from "../../../utils/sms.utils";
import { JwtService } from "../../../utils/jwt.utils";
import { AuthRepository } from "../auth/repositories/auth.repository";

@Injectable()
export class CompanyService {
    constructor(
        private readonly repo: CompanyRepo,
        private readonly cache: CacheService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly jwtService: JwtService,
        private readonly authRepo: AuthRepository
    ) { }

    async companyProfileCreate(data: CompanyInterface.CompanyProfileCreate): Promise<CompanyInterface.CreateCompanyResponse> {

        const CompanyAlreadyExist = await this.repo.findUserCompany(data.userId);

        if (CompanyAlreadyExist?.userId === data.userId) {
            throw new ConflictException('Company profile already exists for this user');
        }

        let logoUrl: string | null = null;

        if (data.logo && data.logo.buffer) {
            const uploadResult = await this.cloudinaryService.uploadImage(data.logo, 'Company_Logos')

            logoUrl = uploadResult.secure_url;
        }

        data.logoUrl = logoUrl;

        const dbInsert = await this.repo.companyProfileCreate(data);

        if (!dbInsert) {
            throw new BadRequestException('Somethink is problem Please try Again after some time.')
        }

        await this.cache.companyProfileDataStore(dbInsert, data.userId);

        const tokenPayload: {
            userId: string,
            email: string,
            role: string,
            branchId: string,
            companyId: string
        } = {
            userId: data.userId,
            email: data.email,
            role: data.role,
            branchId: data.branchId,
            companyId: dbInsert.id
        }

        const accessToken = this.jwtService.generateToken(tokenPayload, "25m");
        const refreshToken = this.jwtService.generateRefreshToken(tokenPayload, '3d');

        const sessionPayload: {
            userId: string,
            refreshToken: string,
            ipAddress: string,
            userAgent: string
        } = {
            userId: data.userId,
            refreshToken: refreshToken,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent
        }

        await this.authRepo.sessionDataInsert(sessionPayload);

        const response = {
            dbInsert,
            accessToken,
            refreshToken
        }

        return response;
    }

    async getCompanyProfile(userId: string): Promise<CompanyInterface.CompanyProfileResponse> {
        const key = `user:company_profileGet:${userId}`;
        const cacheDataGet = await this.cache.get(key);

        if (cacheDataGet) {
            const originalForm = JSON.parse(cacheDataGet);
            return originalForm;
        }

        const dbResponse = await this.repo.companyProfileGet(userId);

        if (!dbResponse) {
            throw new NotFoundException("Company profile not found");
        }

        await this.cache.companyProfileDataStore(dbResponse, userId);

        return dbResponse;
    }

    async updateCompanyProfile(data: CompanyInterface.CompanyProfileUpdate): Promise<CompanyInterface.CompanyProfileResponse> {
        let logoUrl: string | null = null;

        if (data.logo && data.logo.buffer) {
            const uploadResult = await this.cloudinaryService.uploadImage(data.logo, "Update_Logo");

            logoUrl = uploadResult.secure_url;
        }

        data.logoUrl = logoUrl;

        const dbUpdate = await this.repo.companyProfileUpdate(data);

        if (!dbUpdate) {
            throw new NotFoundException('Company profile not found or failed to update');
        }

        await this.cache.companyProfileDataStore(dbUpdate, data.userId);

        return dbUpdate;
    }

    async phoneOtpGenerate(phone: string, userId: string): Promise<void> {
        const dbResponse = await this.repo.companyProfileGet(userId);

        if (!dbResponse) {
            throw new NotFoundException("Company profile not found. Please create a profile first.");
        }

        if (phone === dbResponse.phone && dbResponse.isPhoneVerified === true) {
            throw new BadRequestException("This Number Already Add and Verified");
        }

        const otpGenerate = OtpUtil.generateOtp();
        const hashOtp = OtpUtil.hashOtp(otpGenerate);
        const attempts = 3;

        await this.cache.companyPhoneNoVerifiedStore(userId, phone, hashOtp, attempts);

        await SmsUtil.sendVerificationSms('COMPANY', phone, otpGenerate);
    }

    async resendOtp(userId: string): Promise<void> {
        const key = `user:company_phone_verified:${userId}`;
        const getCacheData = await this.cache.get(key);

        if (!getCacheData) {
            throw new BadRequestException("OTP has expired or does not exist. Please request a new OTP.");
        }

        const originalForm = JSON.parse(getCacheData);

        const otpGenerate = OtpUtil.generateOtp();
        const hashOtp = OtpUtil.hashOtp(otpGenerate);
        const attempts = 3;

        await this.cache.companyPhoneNoVerifiedStore(userId, originalForm.phone, hashOtp, attempts);

        await SmsUtil.sendVerificationSms('COMPANY', originalForm.phone, otpGenerate);
    }

    async phoneOtpVerify(userId: string, otp: string): Promise<void> {
        const key = `user:company_phone_verified:${userId}`;
        const getCacheData = await this.cache.get(key);

        if (!getCacheData) {
            throw new BadRequestException("OTP has expired or does not exist. Please request a new OTP.");
        }

        const originalForm = JSON.parse(getCacheData);
        const verifyOtp = OtpUtil.verifyOtpHash(otp, originalForm.hashOtp);

        if (verifyOtp === false) {
            originalForm.attamp -= 1;

            if (originalForm.attamp <= 0) {
                const key = `user:PhoneNoVerify:${userId}`;
                await this.cache.del(key);

                throw new BadRequestException("Maximum attempts limit reached. This OTP is now destroyed. Please request a new OTP.")
            };

            await this.cache.setPhoneNoVerify(originalForm);
            throw new BadRequestException(
                `Invalid OTP. You have ${originalForm.attamp} attempt(s) remaining.`
            );
        };

        const dbResponse = await this.repo.phoneNoUpdate(userId, originalForm.phone);

        if (!dbResponse) {
            throw new NotFoundException('Company Phone no. not found or failed to update');
        }

        await this.cache.del(key);

        await this.cache.companyProfileDataStore(dbResponse, userId);
    }

    async getCompanyStatus(userId: string) {

        const company = await this.repo.getCompanyStatus(userId);

        if (!company) {
            return {
                isProfileCreated: false,
                isPhoneVerified: false,
                isBankDetailsAdded: false,
                isGstinAdded: false,
                canGenerateInvoice: false,
            };
        }

        const isProfileCreated = true;
        const isPhoneVerified = Boolean(company.isPhoneVerified);
        const isBankDetailsAdded = Boolean(company.bankName);
        const isGstinAdded = Boolean(company.gstin);

        const canGenerateInvoice = isProfileCreated && isPhoneVerified;

        return {
            isProfileCreated,
            isPhoneVerified,
            isBankDetailsAdded,
            isGstinAdded,
            canGenerateInvoice,
        };
    }
}
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthRepository } from "./repositories/auth.repository";
import { CacheService } from "../../../common/cache/cache.service";
import * as AuthInterface from "../../../common/interfaces/auth.interface";
import { OtpUtil } from "../../../utils/otp.utils";
import { PasswordUtils } from "../../../utils/password.utils";
import { EmailJobs } from "../../../jobs/email.jobs";
import { JwtService } from "../../../utils/jwt.utils";
import { WhatsappUtil } from "../../../utils/whatsapp.utils";
import { whatsappConfig } from "../../../config/whatsapp.config";
import { SmsUtil } from "../../../utils/sms.utils";

@Injectable()
export class AuthService {

    constructor(
        private readonly authRepo: AuthRepository,
        private readonly config: ConfigService,
        private readonly cache: CacheService,
        private readonly emailJobs: EmailJobs,
        private readonly jwtService: JwtService
    ) { }

    async registerService(data: AuthInterface.userRegister): Promise<string> {
        const findUser = await this.authRepo.findUserByEmail(data.email);

        if (findUser) {
            throw new BadRequestException(`User Already Register!`)
        }

        const registerOTP = OtpUtil.generateOtp();
        const hashOTP = OtpUtil.hashOtp(registerOTP);
        const hashPassword = await PasswordUtils.hash(data.password);

        const userRegisterCacheData: AuthInterface.userRegisterCache = {
            name: data.name,
            email: data.email,
            hashPassword: hashPassword,
            registerOtp: hashOTP
        }

        await this.cache.setRegisterUserCache(userRegisterCacheData);
        await this.emailJobs.userRegisterOtpSend(data.email, registerOTP);

        const registerOtpTokenPayload: AuthInterface.userRegisterTokenPayload = {
            email: data.email,
            purpose: 'USER-REGISTER'
        }

        const otpVerifyToken = this.jwtService.generateToken(registerOtpTokenPayload, '10m');

        return otpVerifyToken;
    }

    async registerUserOtpResend(email: string) {

        const cacheDataGet = await this.cache.getRegisterUserCache({ email });

        const registerOTP = OtpUtil.generateOtp();
        const hashOTP = OtpUtil.hashOtp(registerOTP)

        const userRegisterCacheData: AuthInterface.userRegisterCache = {
            name: cacheDataGet.name,
            email: cacheDataGet.email,
            hashPassword: cacheDataGet.hashPassword,
            registerOtp: hashOTP
        }

        await this.cache.setRegisterUserCache(userRegisterCacheData);
        await this.emailJobs.userRegisterOtpSend(email, registerOTP);

    }

    async registerOtpVerify(data: AuthInterface.registerOtpVerifyService): Promise<{ accessToken: string, refreshToken: string }> {

        const tokenVerify = this.jwtService.verifyToken(data.token);

        if (tokenVerify.purpose !== 'USER-REGISTER') {
            throw new BadRequestException("Invalid token purpose or scope.")
        }

        const cacheDataGet = await this.cache.getRegisterUserCache(data);
        const otpVerify = OtpUtil.verifyOtpHash(data.otp, cacheDataGet.registerOtp);

        if (otpVerify === false) {
            throw new BadRequestException("Please Enter Right Value")
        }

        const dbValuePayload: AuthInterface.userRegisterInDb = {
            name: cacheDataGet.name,
            email: cacheDataGet.email,
            password: cacheDataGet.hashPassword
        }

        const dbResponse = await this.authRepo.userRegsiterData(dbValuePayload);

        const activeBranchIdPayload: AuthInterface.activeBranchId = {
            userId: dbResponse.id,
            branchId: dbResponse.branchId
        }

        await this.cache.setActiveBranchId(activeBranchIdPayload);

        const tokenPayload: {
            userId: string,
            email: string,
            role: string,
        } = {
            userId: dbResponse.id,
            email: dbResponse.email,
            role: dbResponse.role,
        };

        const accessToken = this.jwtService.generateToken(tokenPayload, '25m');
        const refreshToken = this.jwtService.generateRefreshToken(tokenPayload, '3d');

        const sessionPayload: AuthInterface.sessionPayload = {
            userId: dbResponse.id,
            refreshToken: refreshToken,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent
        }

        const deleteCacheTemDataKey = `registerUser:${dbResponse.email}`

        await this.authRepo.sessionDataInsert(sessionPayload);
        await this.cache.del(deleteCacheTemDataKey);
        await this.emailJobs.userRegisterSuccessFullEmail(dbResponse.email, dbResponse.name)

        return {
            accessToken,
            refreshToken
        }
    }

    async loginService(data: AuthInterface.userLogin): Promise<{ accessToken: string, refreshToken: string }> {

        const password = await this.authRepo.userLogin(data.email);

        if (!password) {
            throw new BadRequestException(`User Not Registered. Please register first!`);
        }

        const passwordVerify = await PasswordUtils.compare(data.password, password.passwordHash);

        if (passwordVerify === false) {
            throw new BadRequestException("Please Enter Correct Value.")
        }

        const userDbRes = await this.authRepo.userDataGet(data.email);

        if (!userDbRes) {
            throw new BadRequestException("User record not found.");
        }

        const tokenPayload: {
            userId: string,
            email: string,
            role: string,
            branchId?: string,
            companyId?: string
        } = {
            userId: userDbRes.id,
            email: userDbRes.email,
            role: userDbRes.role,
            companyId: userDbRes.companyId
        };

        if (userDbRes.role !== `SUPER_ADMIN`) {
            tokenPayload.branchId = userDbRes.branchId
        }

        const accessToken = this.jwtService.generateToken(tokenPayload, '25m');
        const refreshToken = this.jwtService.generateRefreshToken(tokenPayload, '3d');

        const sessionPayload: AuthInterface.sessionPayload = {
            userId: userDbRes.id,
            refreshToken: refreshToken,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent
        }

        await this.authRepo.sessionDataInsert(sessionPayload);

        return {
            accessToken,
            refreshToken
        }
    }

    async loggedOutService(data: string): Promise<void> {
        if (!data) return;

        const verifyToken = this.jwtService.verifyRefreshToken(data);

        if (verifyToken?.userId) {
            await this.authRepo.loggedOut(verifyToken.userId, data);
        }
    }

    async resfreshToken(userId: string, refreshToken: string): Promise<string> {
        const dbResponse = await this.authRepo.refreshToken(userId, refreshToken);

        if (dbResponse === false) {
            throw new UnauthorizedException("User Please Again Login.");
        };

        const tokenVerify = await this.jwtService.verifyRefreshToken(refreshToken);

        const { iat, exp, ...userData } = tokenVerify;

        const generateNewToken = this.jwtService.generateToken(userData);

        return generateNewToken;
    }

    async forgotOptGenrate(email: string) {
        const userFind = await this.authRepo.findUserByEmail(email);

        if (!userFind) {
            throw new UnauthorizedException("User Not Found.")
        }

        const otpGenerate = OtpUtil.generateOtp();
        const otpHash = OtpUtil.hashOtp(otpGenerate);

        const userDataGet = await this.authRepo.userDataGet(email);

        const otpPayload: AuthInterface.forgotOtpPayload = {
            userId: userDataGet.id,
            email: userDataGet.email,
            hashOtp: otpHash,
            attamp: 3
        }

        const otpTokenPayload: AuthInterface.forgotOtpTokenPayload = {
            userId: userDataGet.id,
            email: userDataGet.email,
            purpose: 'RESET-PASSWORD'
        }

        const jwtTokenGenerate = this.jwtService.generateToken(otpTokenPayload, '10m');
        await this.cache.setForgetPasswordOtp(otpPayload);
        await this.emailJobs.forgotOtpSend(userDataGet.email, otpGenerate);

        return jwtTokenGenerate
    }

    async forgotOtpVerify(data: AuthInterface.forgotOtpVerify): Promise<string> {

        const tokenVerify = await this.jwtService.verifyToken(data.token);

        if (tokenVerify.purpose !== 'RESET-PASSWORD') {
            throw new UnauthorizedException("Token Invalid.");
        };

        const cacheDataGet = await this.cache.getForgotPasswordOtp(data.userId);

        if (!cacheDataGet) {
            throw new BadRequestException('OTP expired Please Try Again.');
        }

        const isOtpValid = OtpUtil.verifyOtpHash(data.otp, cacheDataGet.hashOtp);

        if (isOtpValid === false) {
            cacheDataGet.attamp -= 1;

            if (cacheDataGet.attamp <= 0) {
                const key = `forgotPassword:${data.userId}`;
                await this.cache.del(key);

                throw new BadRequestException("Maximum attempts limit reached. This OTP is now destroyed. Please request a new OTP.")
            }

            await this.cache.setForgetPasswordOtp(cacheDataGet);
            throw new BadRequestException(
                `Invalid OTP. You have ${cacheDataGet.attamp} attempt(s) remaining.`
            );
        };

        const passwordResetToken: {
            userId: string,
            email: string,
            purpose: string
        } = {
            userId: data.userId,
            email: cacheDataGet.email,
            purpose: 'PASSWORD-FINAL-RESET'
        }

        const resetPass = this.jwtService.generateToken(passwordResetToken, '10m');
        const key = `forgotPassword:${data.userId}`;

        await this.cache.del(key);

        return resetPass;
    }

    async finalPasswordResetService(data: AuthInterface.finalPasswordReset): Promise<void> {
        const tokenVerify = this.jwtService.verifyToken(data.token);

        if (tokenVerify.purpose !== 'PASSWORD-FINAL-RESET') {
            throw new BadRequestException("Token Invalid.")
        }

        const hashPassword = await PasswordUtils.hash(data.pass1);
        await this.authRepo.passwordReset(tokenVerify.userId, hashPassword);
        await this.emailJobs.passwordResetEmail(tokenVerify.email);
    }

    async phoneUpdateOptGenerate(data: AuthInterface.phoneNumberOtpGenerate): Promise<void> {

        const currentPhone = await this.authRepo.oldPhoneNoGet(data.userId);

        if (currentPhone && data.phone === currentPhone) {
            throw new BadRequestException("This phone number is already linked to your account.");
        }

        const otpGenerate = OtpUtil.generateOtp();
        const otpHash = OtpUtil.hashOtp(otpGenerate);

        const cachePayload: AuthInterface.phoneOtpGenerateCache = {
            userId: data.userId,
            phone: data.phone,
            email: data.email,
            hashOtp: otpHash,
            attamp: 3
        };

        await this.cache.setPhoneNoVerify(cachePayload);

        await SmsUtil.sendVerificationSms('USER', data.phone, otpGenerate);
    }

    async phoneOptVerify(data: AuthInterface.phoneOtpVerifyNumberUpdate): Promise<string> {

        const key = `user:PhoneNoVerify:${data.userId}`;
        const cacheDataGet = await this.cache.get(key);
        const originalForm = JSON.parse(cacheDataGet);
        const verifyOtp = OtpUtil.verifyOtpHash(data.otp, originalForm.hashOtp);

        if (verifyOtp === false) {
            originalForm.attamp -= 1;

            if (originalForm.attamp <= 0) {
                const key = `user:PhoneNoVerify:${data.userId}`;
                await this.cache.del(key);

                throw new BadRequestException("Maximum attempts limit reached. This OTP is now destroyed. Please request a new OTP.")
            };

            await this.cache.setPhoneNoVerify(originalForm);
            throw new BadRequestException(
                `Invalid OTP. You have ${originalForm.attamp} attempt(s) remaining.`
            );
        };

        const updatePhone = await this.authRepo.phoneNoSet(originalForm.userId, originalForm.phone, originalForm.email)

        return updatePhone;
    }
}
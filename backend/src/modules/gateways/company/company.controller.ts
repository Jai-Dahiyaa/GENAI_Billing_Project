import {
    Controller, Post, Get, Patch, Body, HttpCode, HttpStatus, Req, UseInterceptors,
    UploadedFile,
    Res
} from "@nestjs/common";
import { Response } from "express";
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from "./company.service";
import * as CompanyInterface from "../../../common/interfaces/company.interface";
import * as CompanyDto from "./dto/company.dto";
import { Public } from "../../../common/decorators/public.decorator";
import { IAuthorizedRequest } from "../../../common/interfaces/request.interface";
import { ClientInfo } from "../../../common/decorators/client-info.decorator";
import { IExtendedClientInfo } from "../../../utils/client-info.utils";
import { CookieUtil } from "../../../utils/cookie.utils";

@Controller('company')
export class CompanyController {
    constructor(
        private readonly service: CompanyService
    ) { }

    @Public()
    @Get('health')
    @HttpCode(HttpStatus.OK)
    async companyApiHealth() {
        return {
            success: true,
            message: "Company APIs is ready",
            version: "1.0.0",
            status: "Stable",
        }
    }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('Logo'))
    async companyProfileCreate(
        @Req() req: IAuthorizedRequest,
        @Body() body: CompanyDto.CreateCompanyProfileDto,
        @Res({passthrough: true}) res: Response,
        @ClientInfo() ClientInfo: IExtendedClientInfo,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<{ status: boolean, message: string, data: object }> {

        const deviceInfo = ClientInfo;
        const { userId, email, role, branchId } = req.user;

        const dataCollect: CompanyInterface.CompanyProfileCreate = {
            userId: userId,
            email,
            role,
            branchId,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            businessName: body.businessName,
            address: body.address,
            phone: body.phone,
            gstin: body.gstin,
            bankName: body.bankName,
            accountNumber: body.accountNumber,
            ifscCode: body.ifscCode,
            upiId: body.upiId,
            logo: file,
        }

        const result = await this.service.companyProfileCreate(dataCollect);

        CookieUtil.setAuthTokens(res, result.accessToken, result.refreshToken, '25m', '3d');

        return {
            status: true,
            message: "Your Company Profile Create SuccessFully",
            data: result.dbInsert
        }
    }

    @Get('get')
    @HttpCode(HttpStatus.OK)
    async companyProfileFetch(
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string, data: object }> {

        const { userId } = req.user;

        const result = await this.service.getCompanyProfile(userId)

        return {
            status: true,
            message: "Your Company Profile Fetched SuccessFully",
            data: result
        }
    }

    @Patch('profile-update')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('Update_Company_Logo'))
    async profileUpdate(
        @Body() body: CompanyDto.UpdateCompanyProfileDto,
        @Req() req: IAuthorizedRequest,
        @UploadedFile() file?: Express.Multer.File
    ): Promise<{ status: boolean, message: string, data: object }> {
        const { userId } = req.user;

        const dataCollect: CompanyInterface.CompanyProfileUpdate = {
            userId: userId,
            businessName: body.businessName,
            address: body.address,
            gstin: body.gstin,
            bankName: body.bankName,
            accountNumber: body.accountNumber,
            ifscCode: body.ifscCode,
            upiId: body.upiId,
            logo: file,
        }

        const result = await this.service.updateCompanyProfile(dataCollect);

        return {
            status: true,
            message: "Update Your Company Profile SuccessFully.",
            data: result
        }
    }

    @Post('phone-update-otp')
    @HttpCode(HttpStatus.OK)
    async companyPhoneNoUpdate(
        @Body() body: CompanyDto.OtpGenerateCompanyPhone,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string }> {
        const { userId } = req.user;
        const phone = body.phone;

        await this.service.phoneOtpGenerate(phone, userId)

        return {
            status: true,
            message: "OTP Send on your mobile number SuccessFully"
        }
    }

    @Post("resend-otp")
    @HttpCode(HttpStatus.OK)
    async resendOtpGenerate(
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string }> {
        const { userId } = req.user;

        await this.service.resendOtp(userId);

        return {
            status: true,
            message: "Again OTP Send on your mobile number SuccessFully"
        }
    }

    @Post('otp-verify-phone-update')
    @HttpCode(HttpStatus.CREATED)
    async phoneOtpVerify(
        @Body() body: CompanyDto.VerifyCompanyPhone,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string }> {
        const { userId } = req.user;
        const otp = body.otp;

        await this.service.phoneOtpVerify(userId, otp)

        return {
            status: true,
            message: "Your Number SuccessFully Update",
        }
    }

    @Get('status')
    @HttpCode(HttpStatus.OK)
    async getCompanyStatus(
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean; message: string; data: object }> {
        const { userId } = req.user;

        const result = await this.service.getCompanyStatus(userId);

        return {
            status: true,
            message: "Company setup status fetched successfully",
            data: result,
        };
    }

}
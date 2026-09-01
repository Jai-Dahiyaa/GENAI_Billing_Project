import { Controller, Body, Get, Post, HttpCode, BadRequestException, Res, UseGuards, Req, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { Public } from "../../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { CookieUtil } from "../../../utils/cookie.utils";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard } from "../../../common/guards/role.guard";
import { IAuthorizedRequest } from "../../../common/interfaces/request.interface";
import { ClientInfo } from "../../../common/decorators/client-info.decorator";
import * as AuthDto from "./dto/auth.dto";
import * as AuthInterface from "../../../common/interfaces/auth.interface";
import { IExtendedClientInfo } from "../../../utils/client-info.utils";

@Controller("auth")
@UseGuards(AuthGuard, RolesGuard)
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }

    @Public()
    @Get('health')
    @HttpCode(200)
    async authHealthCheck() {
        return {
            success: true,
            message: "Auth APIs is ready",
            version: "1.0.0",
            status: "Stable",
        }
    }

    @Public()
    @Post('user-register')
    @HttpCode(200)
    async userRegister(
        @Body() body: AuthDto.SignUpDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ status: boolean, message: string }> {
        const UserData = body;
        const result = await this.authService.registerService(UserData);

        if (!result) {
            throw new BadRequestException("SomeThing is internal Problem")
        }

        const cookiePayload: AuthInterface.regsiterOtpCookiePayload = {
            name: "registerOtpVerify",
            value: result,
            maxAge: '10m'
        }

        CookieUtil.setCookie(res, cookiePayload)

        return {
            status: true,
            message: "OTP sent to your registered email successfully."
        }
    }

    @Post('register-otp-resend')
    @HttpCode(200)
    async registerOtpResend(
        @Req() req: IAuthorizedRequest,
    ): Promise<{ status: boolean, message: string }> {
        const { email } = req.user;

        if (!email) {
            throw new BadRequestException("Please try Again With Your Detail")
        }

        await this.authService.registerUserOtpResend(email);

        return {
            status: true,
            message: "OTP Rsend on your email"
        }
    }

    @Post('register-otp-verify')
    @HttpCode(201)
    async registerOtpVerify(
        @Body() body: AuthDto.VerifySignupOtpDto,
        @Req() req: IAuthorizedRequest,
        @Res({ passthrough: true }) res: Response,
        @ClientInfo() clientInfo: IExtendedClientInfo
    ): Promise<{ status: boolean, message: string }> {
        const { email } = req.user;
        const { otp } = body;
        const deviceInfo = clientInfo;
        const token = req.cookies?.["registerOtpVerify"]

        if (!otp) {
            throw new BadRequestException("OTP be must Required")
        }

        const otpVerifyDataCollect: AuthInterface.registerOtpVerifyService = {
            email,
            otp,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            token
        }

        const result = await this.authService.registerOtpVerify(otpVerifyDataCollect);

        CookieUtil.clearCookies(res, ["registerOtpVerify"])
        CookieUtil.setAuthTokens(res, result.accessToken, result.refreshToken, '25m', '1d');

        return {
            status: true,
            message: "User Register Successfully",
        }
    }

    @Public()
    @Post('login')
    @HttpCode(200)
    async loginController(
        @Body() body: AuthDto.LoginDto,
        @Res({ passthrough: true }) res: Response,
        @ClientInfo() clientInfo: IExtendedClientInfo
    ): Promise<{ status: boolean, message: string }> {
        const { email, password } = body;
        const deviceInfo = clientInfo;

        if (!email || !password) {
            throw new BadRequestException("Email and Password are required, !Please enter value.")
        }

        const loginDataCollect: AuthInterface.userLogin = {
            email,
            password,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
        };

        const result = await this.authService.loginService(loginDataCollect);

        CookieUtil.setAuthTokens(res, result.accessToken, result.refreshToken, '25m', '3d');

        return {
            status: true,
            message: "Welcome Back"
        }
    }

    @Post('logged-out')
    @HttpCode(200)
    async loggedController(
        @Req() req: IAuthorizedRequest,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ status: boolean, message: string }> {

        const refreshToken = req.cookies['refreshToken'];

        if (refreshToken) {
            await this.authService.loggedOutService(refreshToken);
        }

        CookieUtil.clearCookies(res, ["accessToken", "refreshToken"])

        return {
            status: true,
            message: "LogOut SuccessFully."
        }
    }

    @Post('refresh-token')
    @HttpCode(200)
    async asignNewAcessToken(
        @Req() req: IAuthorizedRequest,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ status: boolean, message: string }> {

        const token = req.cookies['refreshToken'];
        const { userId } = req.user;

        const result = await this.authService.resfreshToken(userId, token);

        CookieUtil.setCookie(res, {
            name: 'accessToken',
            value: result,
            maxAge: '25m'
        })

        return {
            status: true,
            message: "New AccessToken Assign."
        }
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(200)
    async forgotPasswordController(
        @Body() body: AuthDto.ForgotPasswordDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ status: boolean, message: string }> {
        const { email } = body;

        if (!email) {
            throw new BadRequestException("Please Enter Your Email.")
        }

        const result = await this.authService.forgotOptGenrate(email);

        CookieUtil.clearCookies(res, ["accessToken", "refreshToken"]);

        CookieUtil.setCookie(res, {
            name: 'forgotPassword',
            value: result,
            maxAge: '10m'
        })

        return {
            status: true,
            message: "Forgot Password OTP send on your Email."
        }
    }

    @Post('forgot-otp-verify')
    @HttpCode(200)
    async forgotOtpVerify(
        @Body() body: AuthDto.ForgotPassOtpVerifyDto,
        @Req() req: IAuthorizedRequest,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ status: boolean, message: string }> {
        const { otp } = body;
        const { userId } = req.user;
        const token = req.cookies?.['forgotPassword']

        const finalPayload: AuthInterface.forgotOtpVerify = {
            otp,
            userId,
            token
        }

        const result = await this.authService.forgotOtpVerify(finalPayload);

        CookieUtil.clearCookies(res, ["forgotPassword"]);
        CookieUtil.setCookie(res, {
            name: 'finalForgotPassword',
            value: result,
            maxAge: '10m'
        });

        return {
            status: true,
            message: "Forgot Password OTP Verify."
        }
    }

    @Post('password-reset')
    @HttpCode(200)
    async finalPasswordReset(
        @Body() body: AuthDto.NewPassword,
        @Req() req: IAuthorizedRequest,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ status: boolean, message: string }> {

        const { password1, password2 } = body;
        const token = req.cookies?.['finalForgotPassword'];

        if (password1 !== password2) {
            throw new BadRequestException("Please Enter Both Input Same Password.")
        }

        const finalPassServicePayload: AuthInterface.finalPasswordReset = {
            pass1: password1,
            pass2: password2,
            token
        }

        await this.authService.finalPasswordResetService(finalPassServicePayload);

        CookieUtil.clearCookies(res, ['finalForgotPassword'])

        return {
            status: true,
            message: "Password Finaly Reset."
        }
    }

    @Post('Phone-otp-generate')
    @HttpCode(HttpStatus.OK)
    async phoneNumberVerify(
        @Body() body: AuthDto.PhoneNo,
        @Req() req: IAuthorizedRequest,
    ): Promise<{ status: boolean, message: string }> {

        const { phone } = body;
        const { userId, email } = req.user;

        await this.authService.phoneUpdateOptGenerate({ userId, phone, email })

        return {
            status: true,
            message: "Phone no Verifcation Otp Send on your number."
        }
    }

    @Post('phone-otp-verify')
    @HttpCode(HttpStatus.CREATED)
    async phoneOptVerify(
        @Body() body: AuthDto.PhoneOtpVerify,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string, Phone: string }> {

        const { otp } = body;
        const { userId, email } = req.user;

        const result = await this.authService.phoneOptVerify({ otp, userId, email })

        return {
            status: true,
            message: 'Your Phone no. Update.',
            Phone: result
        }
    }
}
import { IsString, IsEmail, MinLength, IsNotEmpty, Length } from 'class-validator';

export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsEmail()
    @IsNotEmpty()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string
}

export class VerifySignupOtpDto {
    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: "OTP must be exactly 6 digit" })
    otp: string
}

export class LoginDto {

    @IsEmail()
    @IsNotEmpty()
    @IsNotEmpty()
    email: string


    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string
}

export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    @IsNotEmpty()
    email: string
}

export class ForgotPassOtpVerifyDto {
    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: "OTP must be exactly 6 digit" })
    otp: string
}

export class NewPassword {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password1: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password2: string
}

export class PhoneNo {
    @IsNotEmpty()
    @IsString()
    @MinLength(10, {message: 'Phone no. are required'})
    phone: string
}

export class PhoneOtpVerify {
    @IsNotEmpty()
    @IsString()
    @MinLength(6, {message: 'Please Enter 6 Digit'})
    otp: string
}
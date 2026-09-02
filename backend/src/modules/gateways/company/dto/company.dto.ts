import { IsNotEmpty, IsString, IsOptional, Matches, Length, MinLength } from "class-validator";

export class CreateCompanyProfileDto {
    @IsNotEmpty({ message: 'Business name is required' })
    @IsString()
    @Length(3, 100, { message: 'Business name must be between 3 and 100 characters' })
    businessName: string;

    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian 10-digit mobile number' })
    phone: string;

    @IsNotEmpty({ message: 'Address is required' })
    @IsString()
    @Length(5, 250, { message: 'Address must be between 5 and 250 characters' })
    address: string;

    @IsOptional()
    @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
        message: 'Invalid Indian GSTIN format',
    })
    gstin?: string;

    @IsOptional()
    @IsString()
    @Length(2, 50)
    bankName?: string;

    @IsOptional()
    @Matches(/^\d{9,18}$/, { message: 'Bank account number must be 9 to 18 digits' })
    accountNumber?: string;

    @IsOptional()
    @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid Indian IFSC code' })
    ifscCode?: string;

    @IsOptional()
    @Matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, { message: 'Invalid UPI ID format' })
    upiId?: string;
}

export class UpdateCompanyProfileDto {
    @IsOptional()
    @IsString()
    @Length(3, 100, { message: 'Business name must be between 3 and 100 characters' })
    businessName?: string;

    @IsOptional()
    @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian 10-digit mobile number' })
    phone?: string;

    @IsOptional()
    @IsString()
    @Length(5, 250, { message: 'Address must be between 5 and 250 characters' })
    address?: string;

    @IsOptional()
    @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
        message: 'Invalid Indian GSTIN format',
    })
    gstin?: string;

    @IsOptional()
    @IsString()
    @Length(2, 50, { message: 'Bank name must be between 2 and 50 characters' })
    bankName?: string;

    @IsOptional()
    @Matches(/^\d{9,18}$/, { message: 'Bank account number must be 9 to 18 digits' })
    accountNumber?: string;

    @IsOptional()
    @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid Indian IFSC code' })
    ifscCode?: string;

    @IsOptional()
    @Matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, { message: 'Invalid UPI ID format' })
    upiId?: string;
}

export class OtpGenerateCompanyPhone {
    @IsNotEmpty({ message: "Phone no. are required" })
    @IsString()
    @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian 10-digit mobile number' })
    phone: string
}

export class VerifyCompanyPhone {
    @IsNotEmpty({ message: "OTP are required" })
    @IsString()
    @MinLength(6, {message: "Minimum 6 Number Please Enter"})
    otp: string
}
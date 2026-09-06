import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
    Length
} from 'class-validator';

export class BranchCreate {
    @IsNotEmpty()
    @IsString({ message: "Branch name is required" })
    @MinLength(3, { message: "Branch Name must be at least 3 characters long" })
    @MaxLength(100, { message: "Branch name connot exceed 100 characters" })
    branchName: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    address?: string

    @IsString()
    @IsOptional()
    @Matches(/^[0-9]{10}$/, { message: 'Phone must be a valid 10-digit number' })
    phone?: string;

    @IsString()
    @IsNotEmpty({ message: 'Invoice prefix is required' })
    @MinLength(2, { message: 'Invoice prefix must be at least 2 characters long' })
    @MaxLength(10, { message: 'Invoice prefix cannot exceed 10 characters' })
    @Matches(/^[A-Z0-9_-]+$/, {
        message: 'Invoice prefix must be uppercase alphanumeric (e.g. SNP, MAIN, DL01)',
    })
    invoicePrefix: string;
}

export class BranchUpdate {
    @IsOptional()
    @IsString()
    @Length(3, 100)
    branchName?: string;

    @IsOptional()
    @IsString()
    @Length(2, 50)
    city?: string;

    @IsOptional()
    @IsString()
    @Length(5, 250)
    address?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit Indian phone number' })
    phone?: string;
}
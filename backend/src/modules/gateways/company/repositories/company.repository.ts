import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../db/prismaDB";
import * as CompanyInterface from "../../../../common/interfaces/company.interface"

@Injectable()
export class CompanyRepo {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async findUserCompany(userId: string): Promise<{ userId: string } | null> {
        const res = await this.prisma.$queryRaw<{ userId: string }[]>`
        SELECT "userId" 
        from "company_profile" 
        WHERE "userId" = ${userId}
        LIMIT 1;
        `;

        console.log("response:", res)

        return res[0] ?? null;
    }

    async companyProfileCreate(data: CompanyInterface.CompanyProfileCreate): Promise<CompanyInterface.CompanyProfileResponse> {
        const res = await this.prisma.$queryRaw<any[]>`
        INSERT INTO "company_profile" 
        ("businessName", "logoUrl", "phone", "address", "gstin", "bankName", "accountNumber", "ifscCode", "upiId", "userId", "updatedAt") 
        VALUES (
        ${data.businessName}, 
        ${data.logoUrl ?? null}, 
        ${data.phone}, 
        ${data.address}, 
        ${data.gstin ?? null}, 
        ${data.bankName ?? null}, 
        ${data.accountNumber ?? null}, 
        ${data.ifscCode ?? null}, 
        ${data.upiId ?? null}, 
        ${data.userId}, 
        NOW())
        RETURNING "id", "businessName", "logoUrl", "phone", "isPhoneVerified", "address", "gstin", "bankName", "accountNumber", "ifscCode", "upiId";
        `;

        return res[0];
    }

    async companyProfileGet(userId: string): Promise<CompanyInterface.CompanyProfileResponse> {
        const res = await this.prisma.$queryRaw<CompanyInterface.CompanyProfileResponse[]>`
        SELECT 
        "businessName", "logoUrl", "phone", "isPhoneVerified", "address", "gstin", "bankName", "accountNumber", "ifscCode", "upiId", "updatedAt" 
        FROM "company_profile" 
        WHERE "userId" = ${userId};
        `;

        return res[0];
    }

    async companyProfileUpdate(
        data: Partial<CompanyInterface.CompanyProfileCreate> & { userId: string }
    ): Promise<CompanyInterface.CompanyProfileResponse> {
        const res = await this.prisma.$queryRaw<CompanyInterface.CompanyProfileResponse[]>`
        UPDATE "company_profile"
        SET 
        "businessName"  = COALESCE(${data.businessName ?? null}, "businessName"),
        "logoUrl"       = COALESCE(${data.logoUrl ?? null}, "logoUrl"),
        "address"       = COALESCE(${data.address ?? null}, "address"),
        "gstin"         = COALESCE(${data.gstin ?? null}, "gstin"),
        "bankName"      = COALESCE(${data.bankName ?? null}, "bankName"),
        "accountNumber" = COALESCE(${data.accountNumber ?? null}, "accountNumber"),
        "ifscCode"      = COALESCE(${data.ifscCode ?? null}, "ifscCode"),
        "upiId"         = COALESCE(${data.upiId ?? null}, "upiId"),
        "updatedAt"     = NOW()
        WHERE "userId" = ${data.userId}
        RETURNING 
        "businessName", 
        "logoUrl", 
        "phone",
        "isPhoneVerified", 
        "address", 
        "gstin", 
        "bankName", 
        "accountNumber", 
        "ifscCode", 
        "upiId", 
        "updatedAt";
    `;

        return res[0];
    }

    async phoneNoUpdate(userId: string, phone: string): Promise<CompanyInterface.CompanyProfileResponse> {
        const res = await this.prisma.$queryRaw`
        UPDATE "company_profile" 
        SET 
        "phone" = ${phone}, 
        "isPhoneVerified" = true,
        "updatedAt" = NOW()
        WHERE 
        "userId" = ${userId}
        RETURNING 
        "businessName", 
        "logoUrl", 
        "phone",
        "isPhoneVerified", 
        "address", 
        "gstin", 
        "bankName", 
        "accountNumber", 
        "ifscCode", 
        "upiId", 
        "updatedAt";
        `;

        return res[0];
    }

    async getCompanyStatus(userId: string): Promise<{
        id: string;
        isPhoneVerified: boolean;
        businessName: string;
        gstin: string | null;
        bankName: string | null;
    } | null> {
        const res = await this.prisma.$queryRaw<{
            id: string;
            isPhoneVerified: boolean;
            businessName: string;
            gstin: string | null;
            bankName: string | null;
        }[]>`
        SELECT 
        "id", 
        "isPhoneVerified", 
        "businessName", 
        "gstin", 
        "bankName"
        FROM "company_profile" 
        WHERE "userId" = ${userId}
        LIMIT 1;
    `;

        return res[0] ?? null;
    }
}
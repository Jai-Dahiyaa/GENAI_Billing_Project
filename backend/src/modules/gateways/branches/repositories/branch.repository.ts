import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../db/prismaDB";
import * as BranchInterface from "../../../../common/interfaces/branch.interface"

@Injectable()
export class BranchRepo {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async branchCreate(data: BranchInterface.BranchCreate): Promise<BranchInterface.BranchCreateRes> {
        return await this.prisma.$transaction(async (tx) => {
            const countRes = await tx.$queryRaw<{ count: string }[]>`
            SELECT COUNT(*)::text AS count 
            FROM "branches" 
            WHERE "companyId" = ${data.companyId};
            `;

            const branchCount = parseInt(countRes[0]?.count || '0', 10);
            const isFirstBranch = branchCount === 0;

            const res = await tx.$queryRaw<BranchInterface.BranchCreateRes[]>`
            INSERT INTO "branches" (
                "branchName", 
                "city", 
                "phone", 
                "invoicePrefix", 
                "updatedAt", 
                "userId", 
                "isActive", 
                "companyId", 
                "address",
                "isMainBranch"
            ) 
            VALUES (
                ${data.branchName}, 
                ${data.city}, 
                ${data.phone}, 
                ${data.invoicePrefix}, 
                NOW(), 
                ${data.userId}, 
                true, 
                ${data.companyId}, 
                ${data.address},
                ${isFirstBranch}
            )
            RETURNING
                "id", "branchName", "invoicePrefix", "city", "address", "phone", 
                "isPhoneVerified", "isMainBranch", "isActive", "lastInvoiceNo", "createdAt";
            `;

            return res[0] || null;
        });
    }

    async branchListGet(companyId: string): Promise<BranchInterface.IBranchResponse[]> {
        const res = await this.prisma.$queryRaw<BranchInterface.IBranchResponse[]>`
        SELECT 
        "id", 
        "branchName", 
        "invoicePrefix", 
        "city", 
        "address", 
        "phone", 
        "isPhoneVerified", 
        "isMainBranch", 
        "isActive", 
        "lastInvoiceNo", 
        "createdAt" 
        FROM "branches" 
        WHERE "companyId" = ${companyId} 
        ORDER BY "isMainBranch" DESC, "createdAt" ASC;
        `;

        return res || null;
    }

    async branchDataGet(companyId: string, branchId: string): Promise<BranchInterface.IBranchResponse> {
        const res = await this.prisma.$queryRaw`
        SELECT 
        "id", 
        "branchName", 
        "invoicePrefix", 
        "city", 
        "address", 
        "phone", 
        "isPhoneVerified", 
        "isMainBranch", 
        "isActive", 
        "lastInvoiceNo", 
        "createdAt" 
        FROM "branches" 
        WHERE "companyId" = ${companyId} AND "id" = ${branchId};
        `;

        return res[0] || null;
    }

    async mainBranchSet(companyId: string, branchId: string): Promise<string> {
        return await this.prisma.$transaction(async (tx) => {
            const oldBranch = await tx.$queryRaw<Array<{ id: string }>>`
            UPDATE "branches"
            SET "isMainBranch" = false, "updatedAt" = NOW()
            WHERE "companyId" = ${companyId} AND "isMainBranch" = true
            RETURNING "id";
            `;

            await tx.$executeRaw`
            UPDATE "branches"
            SET "isMainBranch" = true, "updatedAt" = NOW()
            WHERE "id" = ${branchId} AND "companyId" = ${companyId};
            `;

            return oldBranch[0]?.id || null;
        });
    }

    async updateBranchProfile(
        data: BranchInterface.IBranchUpdate
    ): Promise<BranchInterface.IBranchResponse | null> {
        const result = await this.prisma.$queryRaw<BranchInterface.IBranchResponse[]>`
        UPDATE "branches"
        SET 
        "branchName" = COALESCE(${data.branchName ?? null}, "branchName"),
        "city"       = COALESCE(${data.city ?? null}, "city"),
        "address"    = COALESCE(${data.address ?? null}, "address"),
        "phone"      = COALESCE(${data.phone ?? null}, "phone"),
        "isPhoneVerified" = CASE 
            WHEN ${data.resetPhoneVerification ?? false} = true THEN false 
            ELSE "isPhoneVerified" 
        END,
        "updatedAt"  = NOW()
        WHERE "id" = ${data.branchId} AND "companyId" = ${data.companyId}
        RETURNING 
        "id", 
        "branchName", 
        "invoicePrefix", 
        "city", 
        "address", 
        "phone", 
        "isPhoneVerified", 
        "isMainBranch", 
        "isActive", 
        "lastInvoiceNo", 
        "createdAt";
        `;

        return result[0] || null;
    }

    async toggleBranchStatus(companyId: string, branchId: string): Promise<BranchInterface.IBranchResponse | null> {
        const result = await this.prisma.$queryRaw<BranchInterface.IBranchResponse[]>`
            UPDATE "branches"
            SET
            "isActive" = NOT "isActive",
            "updatedAt" = NOW()
            WHERE "id" = ${branchId} AND "companyId" = ${companyId}
            RETURNING 
            "id", 
            "branchName", 
            "invoicePrefix", 
            "city", 
            "address", 
            "phone", 
            "isPhoneVerified", 
            "isMainBranch", 
            "isActive", 
            "lastInvoiceNo", 
            "createdAt";
        `;

        return result[0] || null;
    }
}
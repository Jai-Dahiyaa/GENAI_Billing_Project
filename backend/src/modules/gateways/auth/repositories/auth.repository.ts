import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../db/prismaDB";
import { CacheService } from "../../../../common/cache/cache.service";
import * as AuthInterface from "../../../../common/interfaces/auth.interface"

@Injectable()
export class AuthRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService
    ) { };

    async findUserByEmail(email: string): Promise<{ email: string | null }> {
        const res = await this.prisma.$queryRaw<{ email: string }[]>`
            SELECT email
            FROM users
            WHERE email = ${email};
        `;

        return res[0] || null;
    }

    async userRegsiterData(data: AuthInterface.userRegisterInDb): Promise<{ id: string; email: string; role: string; branchId: string, name: string }> {

        return await this.prisma.$transaction(async (tx) => {

            const userRes = await tx.$queryRaw<{
                id: string;
                email: string;
                name: string;
                role: string;
            }[]>`
            INSERT INTO "users" ("name", "email", "passwordHash", "password_changed_at") 
            VALUES (
                ${data.name}, 
                ${data.email}, 
                ${data.password},
                NOW() 
              ) 
              RETURNING "id", "email", "role", "name", "password_changed_at";
            `;

            const userId = userRes[0].id;

            const branchRes = await tx.$queryRaw<{ id: string }[]>`
            INSERT INTO "branches" ("userId", "branchName", "invoicePrefix", "updatedAt")
            VALUES 
            (${userId}, 'Main Branch', 'INV-MAIN', NOW())
            RETURNING "id";
            `;

            const branchId = branchRes[0].id;

            await tx.$executeRaw`
            UPDATE "users" 
            SET "branchId" = ${branchId} 
            WHERE "id" = ${userId}; 
            `;

            const userData: {
                id: string,
                email: string,
                name: string,
                role: string,
                branchId: string
            } = {
                id: userRes[0].id,
                email: userRes[0].email,
                name: userRes[0].name,
                role: userRes[0].role,
                branchId: branchId
            }

            return userData;
        });
    }

    async sessionDataInsert(data: AuthInterface.sessionPayload): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);

        await this.prisma.$queryRaw`
        INSERT INTO "sessions" 
        ("userId", "refreshToken", "ipAddress", "userAgent", "expiresAt", "updatedAt") 
        VALUES 
        (
        ${data.userId}, 
        ${data.refreshToken}, 
        ${data.ipAddress}, 
        ${data.userAgent}, 
        ${expiresAt}, 
        NOW());
        `;
    }

    async userLogin(email: string): Promise<{ passwordHash: string }> {
        const res = await this.prisma.$queryRaw<{
            passwordHash: string,
        }[]>`
        SELECT "passwordHash", "password_changed_at"
        FROM "users" 
        WHERE "email" = ${email};
        `;

        return res[0];
    }

    async userDataGet(email: string): Promise<{
        id: string;
        email: string;
        role: string;
        companyId?: string | null;
        branchId?: string;
    } | null> {
        const res = await this.prisma.$queryRaw<{
            id: string;
            email: string;
            role: string;
            branchId: string;
            companyId: string | null;
        }[]>`
    SELECT 
        u."id",
        u."email",
        u."role",
        u."branchId",
        c."id" AS "companyId"
    FROM "users" u
    LEFT JOIN "company_profile" c ON c."userId" = u."id"
    WHERE u."email" = ${email}
    LIMIT 1;
    `;

        if (!res || res.length === 0) {
            return null;
        }

        const user = res[0];

        if (user.role === 'SUPER_ADMIN') {
            const activeBranchIdPayload: AuthInterface.activeBranchId = {
                userId: user.id,
                branchId: user.branchId,
            };

            await this.cache.setActiveBranchId(activeBranchIdPayload);

            return {
                id: user.id,
                email: user.email,
                role: user.role,
                companyId: user.companyId ?? null,
            };
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
            companyId: user.companyId ?? null,
        };
    }

    async loggedOut(userId: string, refreshToken: string): Promise<void> {
        await this.prisma.$executeRaw`
        UPDATE "sessions" 
        SET "isRevoked" = true 
        WHERE "userId" = ${userId}
        AND "refreshToken" = ${refreshToken};
        `
    }

    async refreshToken(userId: string, refreshToken: string): Promise<boolean> {
        const res = await this.prisma.$queryRaw`
        SELECT * 
        FROM sessions 
        WHERE "userId" = ${userId} 
        AND "refreshToken" = ${refreshToken}
        AND "isRevoked" = false
        LIMIT 1;
        `;

        if (!res || !Array.isArray(res) || res.length === 0) {
            return false
        }

        return true;
    }

    async passwordReset(userId: string, hashPassword: string): Promise<void> {
        const res = await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`
            UPDATE "users"
            SET "passwordHash" = ${hashPassword},
            "password_changed_at" = NOW()
            WHERE "id" = ${userId};
            `;

            await tx.$executeRaw`
            UPDATE "sessions"
            SET "isRevoked" = true
            WHERE "userId" = ${userId}
            AND "isRevoked" = false;
            `;

            const passwordChangedAt = await tx.$queryRaw`
            SELECT "password_changed_at"
            FROM "users"
            WHERE "id" = ${userId};
            `;

            return passwordChangedAt
        })

        await this.cache.setPasswordChangesAt(userId, res[0]);
    }

    async oldPhoneNoGet(userId: string): Promise<string | null> {

        const res = await this.prisma.$queryRaw<{ phone: string | null }>`
        SELECT "phone" 
        FROM "users" 
        WHERE "id" = ${userId};
        `;

        return res?.[0]?.phone ?? null;
    }

    async phoneNoSet(userId: string, phone: string, email: string): Promise<string> {

        const res = await this.prisma.$queryRaw<{ phone: string | null }>`
        UPDATE "users" 
        SET 
        "phone" = ${phone}, 
        "isPhoneVerified" = true,
        "updatedAt" = NOW()
        WHERE "id" = ${userId} 
        AND "email" = ${email}
        RETURNING phone;
        `;

        return res?.[0]?.phone ?? null;
    }
}
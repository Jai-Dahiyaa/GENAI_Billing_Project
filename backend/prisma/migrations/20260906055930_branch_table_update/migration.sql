/*
  Warnings:

  - A unique constraint covering the columns `[companyId,invoicePrefix]` on the table `branches` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `branches` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "branches_phone_key";

-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "companyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "branches_companyId_isActive_idx" ON "branches"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "branches_userId_idx" ON "branches"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "branches_companyId_invoicePrefix_key" ON "branches"("companyId", "invoicePrefix");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

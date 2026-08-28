/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `branches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `company_profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isMainBranch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "company_profile" ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "branches_phone_key" ON "branches"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "company_profile_phone_key" ON "company_profile"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

/*
  Warnings:

  - Added the required column `userId` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `company_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "company_profile" ADD COLUMN     "userId" TEXT NOT NULL;

/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `company_profile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateIndex
CREATE UNIQUE INDEX "company_profile_userId_key" ON "company_profile"("userId");

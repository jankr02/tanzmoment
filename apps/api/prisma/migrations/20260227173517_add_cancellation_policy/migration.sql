/*
  Warnings:

  - You are about to drop the column `cancellationPolicy` on the `courses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeRefundId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancelledBy" "CancelledBy",
ADD COLUMN     "cancelledByAdminId" TEXT;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "cancellationPolicy",
ADD COLUMN     "cancellationPolicyId" TEXT,
ADD COLUMN     "cancellationPolicyJson" JSONB;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "stripeRefundId" TEXT;

-- CreateTable
CREATE TABLE "cancellation_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fullRefundHours" INTEGER NOT NULL,
    "partialRefundHours" INTEGER NOT NULL DEFAULT 0,
    "partialRefundPercent" INTEGER NOT NULL DEFAULT 50,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeRefundId_key" ON "payments"("stripeRefundId");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_cancellationPolicyId_fkey" FOREIGN KEY ("cancellationPolicyId") REFERENCES "cancellation_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

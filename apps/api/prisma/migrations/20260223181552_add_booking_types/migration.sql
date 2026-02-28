/*
  Warnings:

  - A unique constraint covering the columns `[cancellationToken]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,courseId,sessionId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guestEmail,courseId,sessionId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('FULL_COURSE', 'SINGLE_SESSION');

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropIndex
DROP INDEX "bookings_userId_sessionId_key";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancellationToken" TEXT,
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestFirstName" TEXT,
ADD COLUMN     "guestLastName" TEXT,
ADD COLUMN     "guestPhone" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "sessionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "bookingMode" "BookingMode" NOT NULL DEFAULT 'FULL_COURSE',
ADD COLUMN     "cancellationPolicy" JSONB,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_cancellationToken_key" ON "bookings"("cancellationToken");

-- CreateIndex
CREATE INDEX "bookings_guestEmail_idx" ON "bookings"("guestEmail");

-- CreateIndex
CREATE INDEX "bookings_courseId_idx" ON "bookings"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_userId_courseId_sessionId_key" ON "bookings"("userId", "courseId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_guestEmail_courseId_sessionId_key" ON "bookings"("guestEmail", "courseId", "sessionId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

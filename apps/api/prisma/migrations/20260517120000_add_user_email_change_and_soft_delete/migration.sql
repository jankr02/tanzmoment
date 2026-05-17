-- AlterTable
ALTER TABLE "users" ADD COLUMN "pendingEmail" TEXT;
ALTER TABLE "users" ADD COLUMN "emailChangeToken" TEXT;
ALTER TABLE "users" ADD COLUMN "emailChangeExpires" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_emailChangeToken_key" ON "users"("emailChangeToken");

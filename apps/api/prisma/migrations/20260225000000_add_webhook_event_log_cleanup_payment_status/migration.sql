-- ============================================================================
-- Migration: add_webhook_event_log_cleanup_payment_status
-- Removes SUCCEEDED from PaymentStatus enum (redundant with PAID).
-- Adds WebhookEvent table for Stripe webhook deduplication.
-- ============================================================================

-- Step 1: Remove SUCCEEDED from PaymentStatus enum.
-- Must drop the default before altering the column type, then restore it.
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND', 'CANCELLED', 'EXPIRED');
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus" USING "status"::text::"PaymentStatus";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"PaymentStatus";
DROP TYPE "PaymentStatus_old";

-- Step 2: Create WebhookEventStatus enum
CREATE TYPE "WebhookEventStatus" AS ENUM ('PROCESSED', 'FAILED', 'SKIPPED');

-- Step 3: Create webhook_events table
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'PROCESSED',
    "errorMessage" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- Step 4: Unique constraint and indexes
CREATE UNIQUE INDEX "webhook_events_stripeEventId_key" ON "webhook_events"("stripeEventId");
CREATE INDEX "webhook_events_eventType_idx" ON "webhook_events"("eventType");
CREATE INDEX "webhook_events_createdAt_idx" ON "webhook_events"("createdAt");

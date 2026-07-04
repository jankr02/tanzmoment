import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface EventLogResult {
  /** Whether this event was already processed */
  isDuplicate: boolean;
  /** Log entry ID (for updating status on failure) */
  logId: string | null;
}

/**
 * A RECEIVED event older than this is assumed orphaned – the process handling
 * it died before recording an outcome – and is retried on re-delivery. A fresh
 * RECEIVED row is instead treated as a concurrent in-flight delivery.
 */
const STALE_RECEIVED_MS = 5 * 60 * 1000;

/**
 * Tracks processed Stripe webhook events to prevent duplicate processing.
 *
 * Stripe guarantees at-least-once delivery, meaning the same event
 * can arrive multiple times. This service uses the Stripe event ID
 * as a unique key to detect and skip duplicates.
 */
@Injectable()
export class WebhookEventLogService {
  private readonly logger = new Logger(WebhookEventLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register an event for processing. The row is created as RECEIVED and only
   * flipped to PROCESSED once the handler succeeds (see markProcessed), so a
   * handler that fails leaves the event retryable rather than permanently
   * deduplicated.
   *
   * Uses the unique constraint on stripeEventId to detect re-delivery.
   */
  async registerEvent(
    stripeEventId: string,
    eventType: string,
    payload?: unknown,
  ): Promise<EventLogResult> {
    try {
      const entry = await this.prisma.webhookEvent.create({
        data: {
          stripeEventId,
          eventType,
          status: 'RECEIVED',
          payload: payload as Prisma.InputJsonValue,
        },
      });

      return { isDuplicate: false, logId: entry.id };
    } catch (error: unknown) {
      // Prisma unique constraint violation = the event id is already known
      if (this.isUniqueConstraintError(error)) {
        return this.resolveExistingEvent(stripeEventId);
      }

      // Unexpected error – log but don't block processing
      this.logger.error(
        `Failed to register webhook event ${stripeEventId}: ${error}`,
      );
      return { isDuplicate: false, logId: null };
    }
  }

  /**
   * Decide how to handle a re-delivered event. A fully PROCESSED (or SKIPPED)
   * event is a real duplicate. A previously FAILED event – or one stuck in
   * RECEIVED past STALE_RECEIVED_MS, meaning the earlier attempt died before
   * recording an outcome – is retried. A fresh RECEIVED event is assumed to be
   * concurrently in flight and skipped.
   *
   * The retry claim is an atomic conditional update, so concurrent
   * re-deliveries of a FAILED event cannot both re-run the handler.
   */
  private async resolveExistingEvent(
    stripeEventId: string,
  ): Promise<EventLogResult> {
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { stripeEventId },
    });

    if (!existing) {
      // Row vanished between the failed insert and this lookup – reprocess.
      return { isDuplicate: false, logId: null };
    }

    const isStaleReceived =
      existing.status === 'RECEIVED' &&
      existing.createdAt.getTime() < Date.now() - STALE_RECEIVED_MS;

    if (existing.status !== 'FAILED' && !isStaleReceived) {
      this.logger.log(
        `Duplicate webhook event skipped: ${stripeEventId} (${existing.status})`,
      );
      return { isDuplicate: true, logId: existing.id };
    }

    // Claim the retry atomically: only the caller that flips the row away from
    // its observed status re-runs the handler.
    const claimed = await this.prisma.webhookEvent.updateMany({
      where: { id: existing.id, status: existing.status },
      data: { status: 'RECEIVED', errorMessage: null },
    });

    if (claimed.count === 0) {
      this.logger.log(
        `Webhook event already claimed for retry elsewhere: ${stripeEventId}`,
      );
      return { isDuplicate: true, logId: existing.id };
    }

    this.logger.log(
      `Retrying webhook event: ${stripeEventId} (was ${existing.status})`,
    );
    return { isDuplicate: false, logId: existing.id };
  }

  /**
   * Mark an event as successfully processed. Called only after the handler
   * completes without error.
   */
  async markProcessed(logId: string): Promise<void> {
    try {
      await this.prisma.webhookEvent.update({
        where: { id: logId },
        data: { status: 'PROCESSED', errorMessage: null },
      });
    } catch (error) {
      // The handler already succeeded, so don't rethrow. The row stays RECEIVED
      // and self-heals via the stale-retry path; surface it for visibility.
      this.logger.warn(
        `Failed to mark webhook event ${logId} as processed: ${error}`,
      );
    }
  }

  /**
   * Mark an event as failed (for debugging and retry analysis).
   */
  async markFailed(logId: string, errorMessage: string): Promise<void> {
    try {
      await this.prisma.webhookEvent.update({
        where: { id: logId },
        data: {
          status: 'FAILED',
          errorMessage,
        },
      });
    } catch {
      // Non-critical – don't throw
    }
  }

  /**
   * Clean up old event logs (called by maintenance cron job).
   * Keeps the last 30 days of events by default.
   */
  async cleanup(retentionDays = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const result = await this.prisma.webhookEvent.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} old webhook events`);
    }

    return result.count;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    );
  }
}

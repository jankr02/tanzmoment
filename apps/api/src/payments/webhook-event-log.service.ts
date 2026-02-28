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
   * Attempt to register an event. Returns whether it's a duplicate.
   *
   * Uses a unique constraint on stripeEventId – if the insert fails
   * with a unique violation, the event was already processed.
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
          status: 'PROCESSED',
          payload: payload as Prisma.InputJsonValue,
        },
      });

      return { isDuplicate: false, logId: entry.id };
    } catch (error: unknown) {
      // Prisma unique constraint violation = duplicate event
      if (this.isUniqueConstraintError(error)) {
        this.logger.log(`Duplicate webhook event skipped: ${stripeEventId}`);
        return { isDuplicate: true, logId: null };
      }

      // Unexpected error – log but don't block processing
      this.logger.error(
        `Failed to register webhook event ${stripeEventId}: ${error}`,
      );
      return { isDuplicate: false, logId: null };
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

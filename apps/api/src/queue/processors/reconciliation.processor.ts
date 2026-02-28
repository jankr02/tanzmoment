import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../../payments/stripe.service';
import { WebhookEventLogService } from '../../payments/webhook-event-log.service';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import { MaintenanceJobData } from '../queue.types';

/** Retention periods in days for GDPR cleanup */
const BOOKING_ANONYMIZE_DAYS = 90;
const PAYMENT_CLEANUP_DAYS = 180;

/**
 * Reconciles payment status between the database and Stripe.
 *
 * Catches edge cases where a webhook was lost:
 * - PENDING payments older than 1 hour → check Stripe session status
 * - If Stripe says "paid" but DB says "pending" → fix the DB
 *
 * Also runs webhook event log cleanup.
 */
@Processor(QUEUE_NAMES.MAINTENANCE)
export class ReconciliationProcessor extends WorkerHost {
  private readonly logger = new Logger(ReconciliationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly webhookLog: WebhookEventLogService,
  ) {
    super();
  }

  async process(job: Job<MaintenanceJobData>): Promise<void> {
    this.logger.log(
      `Maintenance job started (triggered by: ${job.data.triggeredBy})`,
    );

    switch (job.name) {
      case JOB_NAMES.RECONCILE_PAYMENTS:
        await this.reconcilePayments();
        break;

      case JOB_NAMES.CLEANUP_WEBHOOK_EVENTS:
        await this.webhookLog.cleanup(30);
        break;

      case JOB_NAMES.GDPR_CLEANUP:
        await this.runGdprCleanup();
        break;

      default:
        this.logger.warn(`Unknown maintenance job: ${job.name}`);
    }
  }

  /**
   * Find PENDING payments older than 1 hour and verify against Stripe.
   * Processes in batches of 50 to avoid overwhelming the Stripe API.
   */
  private async reconcilePayments(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const stalePayments = await this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        stripePaymentId: { not: null },
        createdAt: { lt: oneHourAgo },
      },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            courseId: true,
            sessionId: true,
          },
        },
      },
      take: 50,
    });

    if (stalePayments.length === 0) {
      this.logger.log('Reconciliation: no stale payments found');
      return;
    }

    this.logger.log(
      `Reconciliation: checking ${stalePayments.length} stale payments`,
    );

    let fixed = 0;
    let expired = 0;

    for (const payment of stalePayments) {
      if (!payment.stripePaymentId) continue;

      try {
        const session = await this.stripeService.getCheckoutSession(
          payment.stripePaymentId,
        );

        if (session.payment_status === 'paid') {
          // Stripe says paid but DB says pending → fix DB
          await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'PAID',
                stripeStatus: 'succeeded',
                paidAt: new Date(),
              },
            });

            if (payment.booking?.status === 'PENDING') {
              await tx.booking.update({
                where: { id: payment.booking.id },
                data: { status: 'CONFIRMED' },
              });
            }
          });

          this.logger.warn(
            `Reconciliation FIX: payment ${payment.id} → PAID ` +
              `(booking ${payment.booking?.id} → CONFIRMED)`,
          );
          fixed++;
        } else if (
          session.status === 'expired' ||
          session.status === 'complete'
        ) {
          // Session expired or completed without payment → expire locally
          const booking = payment.booking;
          if (booking?.status === 'PENDING') {
            await this.prisma.$transaction(async (tx) => {
              await tx.payment.update({
                where: { id: payment.id },
                data: { status: 'EXPIRED' },
              });

              await tx.booking.update({
                where: { id: booking.id },
                data: {
                  status: 'CANCELLED',
                  cancellationReason: 'PAYMENT_FAILED',
                  cancelledAt: new Date(),
                },
              });
            });

            expired++;
          }
        }
        // else: session still open, let the normal flow handle it
      } catch (error) {
        this.logger.error(
          `Reconciliation error for payment ${payment.id}: ${error}`,
        );
      }
    }

    this.logger.log(
      `Reconciliation complete: ${fixed} fixed, ${expired} expired, ` +
        `${stalePayments.length - fixed - expired} still pending`,
    );
  }

  // ===========================================================================
  // GDPR CLEANUP
  // ===========================================================================

  /**
   * Anonymizes personal data from old cancelled bookings and cleans up
   * Stripe references from old failed/expired payments.
   *
   * Retention periods:
   * - Cancelled bookings: 90 days → notes anonymized
   * - Failed/expired/cancelled payments: 180 days → Stripe IDs removed
   *
   * Booking records and amounts are preserved for financial/statistical reporting.
   */
  private async runGdprCleanup(): Promise<void> {
    this.logger.log('Starting GDPR cleanup');

    const bookingResult = await this.anonymizeOldBookings();
    const paymentResult = await this.cleanupOldPayments();

    this.logger.log(
      `GDPR cleanup complete: ${bookingResult} bookings anonymized, ` +
        `${paymentResult} payments cleaned`,
    );
  }

  private async anonymizeOldBookings(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - BOOKING_ANONYMIZE_DAYS);

    const result = await this.prisma.booking.updateMany({
      where: {
        status: 'CANCELLED',
        cancelledAt: { lt: cutoff },
        notes: { not: null },
      },
      data: { notes: '[GDPR: data removed]' },
    });

    if (result.count > 0) {
      this.logger.log(`Anonymized ${result.count} old cancelled bookings`);
    }

    return result.count;
  }

  private async cleanupOldPayments(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - PAYMENT_CLEANUP_DAYS);

    const result = await this.prisma.payment.updateMany({
      where: {
        status: { in: ['FAILED', 'EXPIRED', 'CANCELLED'] },
        updatedAt: { lt: cutoff },
        stripePaymentId: { not: null },
      },
      data: {
        stripePaymentId: null,
        stripeRefundId: null,
        stripeStatus: null,
        externalTransactionId: null,
        notes: '[GDPR: data removed]',
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} old payment records`);
    }

    return result.count;
  }
}

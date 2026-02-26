// ============================================================================
// BATCH REFUND PROCESSOR
// ============================================================================

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue.constants';
import { BatchRefundJobData } from '../queue.types';
import { RefundService } from '../../payments/refund.service';
import { CancellationPolicyService } from '../../bookings/cancellation-policy.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingEmailService } from '../../email/booking-email.service';

@Processor(QUEUE_NAMES.BATCH_REFUND)
export class BatchRefundProcessor extends WorkerHost {
  private readonly logger = new Logger(BatchRefundProcessor.name);

  constructor(
    private readonly refundService: RefundService,
    private readonly cancellationPolicyService: CancellationPolicyService,
    private readonly prisma: PrismaService,
    private readonly bookingEmailService: BookingEmailService,
  ) {
    super();
  }

  async process(job: Job<BatchRefundJobData>): Promise<void> {
    const { bookingIds, reason, type, adminId } = job.data;

    this.logger.log(
      `Processing batch refund: type=${type}, bookings=${bookingIds.length}, admin=${adminId}`,
    );

    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const bookingId of bookingIds) {
      try {
        const booking = await this.prisma.booking.findUnique({
          where: { id: bookingId },
          include: { payment: true },
        });

        if (!booking?.payment) {
          this.logger.warn(`Booking ${bookingId} has no payment – skipping`);
          continue;
        }

        // Admin-initiated cancellations always receive a full refund
        const refundCalc = this.cancellationPolicyService.calculateAdminRefund(
          booking.payment.amountInCents,
        );

        const result = await this.refundService.processRefund(
          bookingId,
          refundCalc,
          `${type}: ${reason}`,
        );

        if (result.success) {
          succeeded++;
          // Notify participant about the studio cancellation
          this.bookingEmailService
            .sendBookingCancelledByStudio(bookingId, reason, refundCalc.refundAmountInCents)
            .catch((err) =>
              this.logger.error(`Failed to send cancellation email for ${bookingId}: ${err.message}`),
            );
        } else {
          failed++;
          errors.push(`${bookingId}: ${result.error}`);
        }

        await job.updateProgress(
          Math.round(((succeeded + failed) / bookingIds.length) * 100),
        );
      } catch (error) {
        failed++;
        errors.push(`${bookingId}: ${error.message}`);
        this.logger.error(
          `Refund failed for booking ${bookingId}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Batch refund complete: ${succeeded} succeeded, ${failed} failed ` +
        `out of ${bookingIds.length}`,
    );

    if (errors.length > 0) {
      this.logger.warn(`Refund errors:\n${errors.join('\n')}`);
    }
  }
}

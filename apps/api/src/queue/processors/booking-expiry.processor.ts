import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { WaitlistService } from '../../waitlist/waitlist.service';
import { QUEUE_NAMES } from '../queue.constants';
import { BookingExpiryJobData } from '../queue.types';

/**
 * Cancels PENDING bookings that were not paid within the timeout window,
 * then triggers waitlist promotion to fill the freed spot.
 *
 * Idempotent: skips bookings that are no longer PENDING or already paid.
 */
@Processor(QUEUE_NAMES.BOOKING_EXPIRY)
export class BookingExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingExpiryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waitlistService: WaitlistService,
  ) {
    super();
  }

  async process(job: Job<BookingExpiryJobData>): Promise<void> {
    const { bookingId, reason } = job.data;
    this.logger.log(`Processing expiry for booking ${bookingId} (${reason})`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      this.logger.warn(`Booking ${bookingId} not found, skipping`);
      return;
    }

    if (booking.status !== 'PENDING') {
      this.logger.log(
        `Booking ${bookingId} is ${booking.status} (not PENDING), skipping`,
      );
      return;
    }

    if (booking.payment?.status === 'PAID') {
      this.logger.log(`Booking ${bookingId} payment is PAID, skipping expiry`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'PAYMENT_FAILED',
          cancelledAt: new Date(),
        },
      });

      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'EXPIRED' },
        });
      }
    });

    this.logger.log(`Booking ${bookingId} expired (${reason})`);

    await this.waitlistService.triggerPromotion(
      booking.courseId,
      booking.sessionId,
    );
  }
}

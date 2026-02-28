import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES } from '../queue.constants';
import { SessionReminderJobData } from '../queue.types';
import { BookingEmailService } from '../../email/booking-email.service';

/**
 * Sends session reminders 24 hours before a session starts.
 *
 * Skips reminders for bookings that are no longer CONFIRMED (e.g. cancelled).
 */
@Processor(QUEUE_NAMES.SESSION_REMINDER)
export class SessionReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(SessionReminderProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingEmailService: BookingEmailService,
  ) {
    super();
  }

  async process(job: Job<SessionReminderJobData>): Promise<void> {
    const { bookingId, userId, guestEmail } = job.data;
    this.logger.log(`Processing session reminder for booking ${bookingId}`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { status: true },
    });

    if (!booking || booking.status !== 'CONFIRMED') {
      this.logger.log(
        `Booking ${bookingId} is not CONFIRMED (${booking?.status}), skipping reminder`,
      );
      return;
    }

    this.logger.log(
      `Sending reminder for booking ${bookingId} (recipient: ${userId ?? guestEmail})`,
    );

    // Send reminder email for registered users
    if (userId) {
      await this.bookingEmailService.sendSessionReminder(bookingId);
    }
  }
}

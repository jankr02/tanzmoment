import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { WaitlistService } from '../../waitlist/waitlist.service';
import { QUEUE_NAMES } from '../queue.constants';
import { WaitlistPromotionJobData } from '../queue.types';

/**
 * Promotes the next person on the waitlist when a spot opens up.
 *
 * Free courses: status moves directly to CONFIRMED.
 * Paid courses: status moves to PENDING and a 24h expiry job is scheduled.
 *
 * Email notifications are sent in Phase 7.
 */
@Processor(QUEUE_NAMES.WAITLIST_PROMOTION)
export class WaitlistPromotionProcessor extends WorkerHost {
  private readonly logger = new Logger(WaitlistPromotionProcessor.name);

  constructor(
    private readonly waitlistService: WaitlistService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<WaitlistPromotionJobData>): Promise<void> {
    const { courseId, sessionId } = job.data;
    this.logger.log(
      `Processing waitlist promotion for course=${courseId}, ` +
        `session=${sessionId ?? 'full-course'}`,
    );

    const promotedBookingId = await this.waitlistService.promoteNext(
      courseId,
      sessionId,
    );

    if (!promotedBookingId) {
      this.logger.log('No one promoted (waitlist empty or no free spots)');
      return;
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: promotedBookingId },
      select: { status: true },
    });

    if (booking?.status === 'PENDING') {
      await this.waitlistService.scheduleExpiry(
        promotedBookingId,
        'waitlist_promotion_timeout',
      );
    }

    this.logger.log(`Promotion complete: booking ${promotedBookingId}`);
  }
}

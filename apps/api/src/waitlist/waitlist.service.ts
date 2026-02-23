import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  QUEUE_NAMES,
  JOB_NAMES,
  TIMING,
  type WaitlistPromotionJobData,
  type BookingExpiryJobData,
} from '../queue';

/**
 * Manages waitlist operations: promoting the next person when a spot opens,
 * and scheduling/cancelling booking expiry jobs.
 *
 * Waitlist flow:
 * 1. Course is full → booking created with status WAITLISTED
 * 2. Existing booking is cancelled → triggerPromotion() is called
 * 3. Next in line: WAITLISTED → PENDING (paid) or CONFIRMED (free)
 * 4. If a PENDING promotion is not paid within 24h → expire + promote next again
 */
@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.WAITLIST_PROMOTION)
    private readonly promotionQueue: Queue<WaitlistPromotionJobData>,
    @InjectQueue(QUEUE_NAMES.BOOKING_EXPIRY)
    private readonly expiryQueue: Queue<BookingExpiryJobData>,
  ) {}

  /**
   * Enqueue an async promotion job for the given course/session.
   * Called after a booking is cancelled or expires, so the DB transaction
   * can complete before the promotion logic runs.
   *
   * Uses a deterministic job ID to deduplicate concurrent promotion triggers
   * for the same course/session.
   */
  async triggerPromotion(
    courseId: string,
    sessionId: string | null,
  ): Promise<void> {
    await this.promotionQueue.add(
      JOB_NAMES.PROMOTE_NEXT,
      { courseId, sessionId },
      {
        delay: 1000,
        jobId: `promote-${courseId}-${sessionId ?? 'full'}`,
      },
    );

    this.logger.log(
      `Promotion job queued for course=${courseId}, session=${sessionId ?? 'full-course'}`,
    );
  }

  /**
   * Promote the next person on the waitlist.
   * Called by WaitlistPromotionProcessor.
   *
   * Runs inside a transaction to prevent race conditions.
   * Returns the promoted booking ID, or null if the waitlist is empty
   * or no spot is available yet.
   */
  async promoteNext(
    courseId: string,
    sessionId: string | null,
  ): Promise<string | null> {
    return this.prisma.$transaction(async (tx) => {
      const course = await tx.course.findUniqueOrThrow({
        where: { id: courseId },
        select: { maxParticipants: true, isFree: true, priceInCents: true },
      });

      const activeCount = await tx.booking.count({
        where: {
          courseId,
          sessionId,
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      });

      if (activeCount >= course.maxParticipants) {
        this.logger.log('No free spot available, skipping promotion');
        return null;
      }

      const nextInLine = await tx.booking.findFirst({
        where: { courseId, sessionId, status: 'WAITLISTED' },
        orderBy: { waitlistPosition: 'asc' },
        include: {
          user: { select: { id: true, email: true, firstName: true } },
        },
      });

      if (!nextInLine) {
        this.logger.log('Waitlist is empty, no one to promote');
        return null;
      }

      const isFree = course.isFree || course.priceInCents === 0;
      const newStatus = isFree ? 'CONFIRMED' : 'PENDING';

      await tx.booking.update({
        where: { id: nextInLine.id },
        data: { status: newStatus, waitlistPosition: null },
      });

      if (isFree) {
        await tx.payment.create({
          data: {
            bookingId: nextInLine.id,
            userId: nextInLine.userId,
            amountInCents: 0,
            currency: 'EUR',
            method: 'FREE',
            status: 'PAID',
            paidAt: new Date(),
          },
        });
      }

      // Close the gap left by the promoted person
      await tx.booking.updateMany({
        where: {
          courseId,
          sessionId,
          status: 'WAITLISTED',
          waitlistPosition: { gt: nextInLine.waitlistPosition ?? 0 },
        },
        data: { waitlistPosition: { decrement: 1 } },
      });

      this.logger.log(
        `Promoted booking ${nextInLine.id} from waitlist ` +
          `(position ${nextInLine.waitlistPosition}) → ${newStatus}`,
      );

      return nextInLine.id;
    });
  }

  /**
   * Schedule a delayed job to cancel a PENDING booking if it remains unpaid.
   * Uses a deterministic job ID so duplicate calls for the same booking are safe.
   */
  async scheduleExpiry(
    bookingId: string,
    reason: 'pending_timeout' | 'waitlist_promotion_timeout',
  ): Promise<void> {
    const delay =
      reason === 'pending_timeout'
        ? TIMING.PENDING_EXPIRY_MS
        : TIMING.WAITLIST_PROMOTION_EXPIRY_MS;

    await this.expiryQueue.add(
      JOB_NAMES.EXPIRE_PENDING,
      { bookingId, reason },
      { delay, jobId: `expiry-${bookingId}` },
    );

    this.logger.log(
      `Expiry job scheduled for booking ${bookingId} ` +
        `(reason: ${reason}, delay: ${delay / 1000}s)`,
    );
  }

  /**
   * Remove the expiry job for a booking (e.g. when payment succeeds before timeout).
   * No-op if no job exists.
   */
  async cancelExpiry(bookingId: string): Promise<void> {
    const job = await this.expiryQueue.getJob(`expiry-${bookingId}`);
    if (job) {
      await job.remove();
      this.logger.log(`Expiry job cancelled for booking ${bookingId}`);
    }
  }
}

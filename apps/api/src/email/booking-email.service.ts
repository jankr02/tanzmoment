// ============================================================================
// BOOKING EMAIL SERVICE
// ============================================================================
// Maps booking lifecycle events to email templates.
// Enqueues emails to BullMQ for async delivery.
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE, EmailJobName, EMAIL_SUBJECTS } from './email.constants';
import { EmailJobData } from './email.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingEmailService {
  private readonly logger = new Logger(BookingEmailService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // BOOKING CONFIRMED
  // ──────────────────────────────────────────────────────────────────────────

  async sendBookingConfirmation(bookingId: string): Promise<void> {
    const data = await this.loadBookingWithDetails(bookingId);
    if (!data) return;

    await this.enqueue({
      to: data.user.email,
      subject: EMAIL_SUBJECTS['booking-confirmed'],
      template: 'booking-confirmed',
      bookingId,
      userId: data.user.id,
      variables: {
        firstName: data.user.firstName,
        courseName: data.session.course.title,
        sessionDate: data.session.startTime.toISOString(),
        sessionStart: data.session.startTime.toISOString(),
        sessionEnd: data.session.endTime.toISOString(),
        location: data.session.location,
        instructorName: `${data.session.course.instructor.user.firstName} ${data.session.course.instructor.user.lastName}`,
        amountPaid: data.payment?.amountInCents ?? null,
        bookingId: data.id,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BOOKING CANCELLED (BY USER)
  // ──────────────────────────────────────────────────────────────────────────

  async sendBookingCancelled(
    bookingId: string,
    refund?: { type: string; amountInCents: number; percent: number; policyHours: number },
  ): Promise<void> {
    const data = await this.loadBookingWithDetails(bookingId);
    if (!data) return;

    await this.enqueue({
      to: data.user.email,
      subject: EMAIL_SUBJECTS['booking-cancelled'],
      template: 'booking-cancelled',
      bookingId,
      userId: data.user.id,
      variables: {
        firstName: data.user.firstName,
        courseName: data.session.course.title,
        sessionDate: data.session.startTime.toISOString(),
        sessionStart: data.session.startTime.toISOString(),
        cancelledAt: data.cancelledAt?.toISOString() ?? new Date().toISOString(),
        refundType: refund?.type ?? 'none',
        refundAmount: refund?.amountInCents ?? 0,
        refundPercent: refund?.percent ?? 0,
        policyHours: refund?.policyHours ?? 0,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BOOKING CANCELLED BY STUDIO
  // ──────────────────────────────────────────────────────────────────────────

  async sendBookingCancelledByStudio(
    bookingId: string,
    adminReason: string,
    refundAmountInCents?: number,
  ): Promise<void> {
    const data = await this.loadBookingWithDetails(bookingId);
    if (!data) return;

    await this.enqueue({
      to: data.user.email,
      subject: EMAIL_SUBJECTS['booking-cancelled-by-studio'],
      template: 'booking-cancelled-by-studio',
      bookingId,
      userId: data.user.id,
      variables: {
        firstName: data.user.firstName,
        courseName: data.session.course.title,
        sessionDate: data.session.startTime.toISOString(),
        sessionStart: data.session.startTime.toISOString(),
        adminReason,
        refundAmount: refundAmountInCents ?? 0,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // WAITLIST JOINED
  // ──────────────────────────────────────────────────────────────────────────

  async sendWaitlistJoined(bookingId: string, position: number): Promise<void> {
    const data = await this.loadBookingWithDetails(bookingId);
    if (!data) return;

    await this.enqueue({
      to: data.user.email,
      subject: EMAIL_SUBJECTS['waitlist-joined'],
      template: 'waitlist-joined',
      bookingId,
      userId: data.user.id,
      variables: {
        firstName: data.user.firstName,
        courseName: data.session.course.title,
        sessionDate: data.session.startTime.toISOString(),
        sessionStart: data.session.startTime.toISOString(),
        waitlistPosition: position,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // WAITLIST PROMOTED
  // ──────────────────────────────────────────────────────────────────────────

  async sendWaitlistPromoted(bookingId: string, expiresAt: Date): Promise<void> {
    const data = await this.loadBookingWithDetails(bookingId);
    if (!data) return;

    await this.enqueue({
      to: data.user.email,
      subject: EMAIL_SUBJECTS['waitlist-promoted'],
      template: 'waitlist-promoted',
      bookingId,
      userId: data.user.id,
      variables: {
        firstName: data.user.firstName,
        courseName: data.session.course.title,
        sessionDate: data.session.startTime.toISOString(),
        sessionStart: data.session.startTime.toISOString(),
        location: data.session.location,
        priceInCents: data.session.course.priceInCents,
        expiresAt: expiresAt.toISOString(),
        bookingId: data.id,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SESSION REMINDER
  // ──────────────────────────────────────────────────────────────────────────

  async sendSessionReminder(bookingId: string): Promise<void> {
    const data = await this.loadBookingWithDetails(bookingId);
    if (!data) return;

    await this.enqueue({
      to: data.user.email,
      subject: EMAIL_SUBJECTS['session-reminder'],
      template: 'session-reminder',
      bookingId,
      userId: data.user.id,
      variables: {
        firstName: data.user.firstName,
        courseName: data.session.course.title,
        sessionDate: data.session.startTime.toISOString(),
        sessionStart: data.session.startTime.toISOString(),
        sessionEnd: data.session.endTime.toISOString(),
        location: data.session.location,
        instructorName: `${data.session.course.instructor.user.firstName} ${data.session.course.instructor.user.lastName}`,
        bookingId: data.id,
        notes: data.notes,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // REFUND PROCESSED
  // ──────────────────────────────────────────────────────────────────────────

  async sendRefundProcessed(
    bookingId: string,
    refund: { type: string; amountInCents: number; percent: number },
  ): Promise<void> {
    const data = await this.loadBookingWithDetails(bookingId);
    if (!data) return;

    await this.enqueue({
      to: data.user.email,
      subject: EMAIL_SUBJECTS['refund-processed'],
      template: 'refund-processed',
      bookingId,
      userId: data.user.id,
      variables: {
        firstName: data.user.firstName,
        courseName: data.session.course.title,
        refundType: refund.type,
        refundAmount: refund.amountInCents,
        refundPercent: refund.percent,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BATCH: Studio cancellation emails for multiple bookings
  // ──────────────────────────────────────────────────────────────────────────

  async sendBatchCancellationEmails(
    bookingIds: string[],
    adminReason: string,
    refundAmountPerBooking?: Map<string, number>,
  ): Promise<void> {
    this.logger.log(`Sending batch cancellation emails for ${bookingIds.length} bookings`);

    for (const bookingId of bookingIds) {
      const refundAmount = refundAmountPerBooking?.get(bookingId);
      await this.sendBookingCancelledByStudio(bookingId, adminReason, refundAmount);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Loads booking with all related data needed for email templates.
   * Only works for registered users (guests receive no emails in this flow).
   */
  private async loadBookingWithDetails(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        session: {
          include: {
            course: {
              include: {
                instructor: {
                  include: {
                    user: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      this.logger.warn(`Booking ${bookingId} not found – skipping email`);
      return null;
    }

    if (!booking.user) {
      this.logger.debug(`Booking ${bookingId} is a guest booking – skipping email`);
      return null;
    }

    return booking;
  }

  /**
   * Enqueues an email job to BullMQ with retry support.
   */
  private async enqueue(data: EmailJobData): Promise<void> {
    await this.emailQueue.add(EmailJobName.SEND, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10_000,
      },
      removeOnComplete: { age: 7 * 24 * 3600 },
      removeOnFail: { age: 30 * 24 * 3600 },
    });

    this.logger.debug(
      `Email queued: template=${data.template}, to=${data.to}, booking=${data.bookingId ?? 'n/a'}`,
    );
  }
}

// ============================================================================
// BOOKING EMAIL SERVICE
// ============================================================================
// Maps booking lifecycle events to email templates.
// Enqueues emails to BullMQ for async delivery.
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { BookingMode } from '@prisma/client';
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
      to: data.recipient.email,
      subject: EMAIL_SUBJECTS['booking-confirmed'],
      template: 'booking-confirmed',
      bookingId,
      userId: data.recipient.userId ?? undefined,
      variables: {
        ...this.buildCommonVariables(data),
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
      to: data.recipient.email,
      subject: EMAIL_SUBJECTS['booking-cancelled'],
      template: 'booking-cancelled',
      bookingId,
      userId: data.recipient.userId ?? undefined,
      variables: {
        ...this.buildCommonVariables(data),
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
      to: data.recipient.email,
      subject: EMAIL_SUBJECTS['booking-cancelled-by-studio'],
      template: 'booking-cancelled-by-studio',
      bookingId,
      userId: data.recipient.userId ?? undefined,
      variables: {
        ...this.buildCommonVariables(data),
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
      to: data.recipient.email,
      subject: EMAIL_SUBJECTS['waitlist-joined'],
      template: 'waitlist-joined',
      bookingId,
      userId: data.recipient.userId ?? undefined,
      variables: {
        ...this.buildCommonVariables(data),
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
      to: data.recipient.email,
      subject: EMAIL_SUBJECTS['waitlist-promoted'],
      template: 'waitlist-promoted',
      bookingId,
      userId: data.recipient.userId ?? undefined,
      variables: {
        ...this.buildCommonVariables(data),
        priceInCents: data.course.priceInCents,
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
      to: data.recipient.email,
      subject: EMAIL_SUBJECTS['session-reminder'],
      template: 'session-reminder',
      bookingId,
      userId: data.recipient.userId ?? undefined,
      variables: {
        ...this.buildCommonVariables(data),
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
      to: data.recipient.email,
      subject: EMAIL_SUBJECTS['refund-processed'],
      template: 'refund-processed',
      bookingId,
      userId: data.recipient.userId ?? undefined,
      variables: {
        firstName: data.recipient.firstName,
        courseName: data.course.title,
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

  private async loadBookingWithDetails(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        course: {
          select: {
            title: true,
            priceInCents: true,
            bookingMode: true,
            instructor: {
              select: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        session: {
          select: {
            startTime: true,
            endTime: true,
            location: { select: { name: true } },
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      this.logger.warn(`Booking ${bookingId} not found – skipping email`);
      return null;
    }

    const recipient = this.resolveRecipient(booking);
    if (!recipient) {
      this.logger.warn(
        `Booking ${bookingId} has neither user nor guest contact info – skipping email`,
      );
      return null;
    }

    // Full-course bookings span the whole course and have no single session;
    // their date/location is left out of emails rather than guessed from the
    // (often past) earliest course session. Single-session bookings use their
    // own session.
    const isFullCourse = booking.course.bookingMode === BookingMode.FULL_COURSE;
    const effectiveSession = isFullCourse ? null : booking.session ?? null;

    return { ...booking, recipient, effectiveSession, isFullCourse };
  }

  /**
   * Variables shared across all booking lifecycle emails. For full-course
   * bookings the single-session fields stay undefined so templates omit them.
   */
  private buildCommonVariables(data: {
    recipient: { firstName: string };
    course: { title: string; instructor: { user: { firstName: string; lastName: string } } };
    effectiveSession: { startTime: Date; endTime: Date; location: { name: string } | null } | null;
    isFullCourse: boolean;
  }): Record<string, unknown> {
    return {
      firstName: data.recipient.firstName,
      courseName: data.course.title,
      isFullCourse: data.isFullCourse,
      sessionDate: data.effectiveSession?.startTime.toISOString(),
      sessionStart: data.effectiveSession?.startTime.toISOString(),
      sessionEnd: data.effectiveSession?.endTime.toISOString(),
      location: data.effectiveSession?.location?.name,
      instructorName: `${data.course.instructor.user.firstName} ${data.course.instructor.user.lastName}`,
    };
  }

  private resolveRecipient(booking: {
    user: { id: string; email: string; firstName: string } | null;
    guestEmail: string | null;
    guestFirstName: string | null;
  }): { email: string; firstName: string; userId: string | null } | null {
    if (booking.user) {
      return {
        email: booking.user.email,
        firstName: booking.user.firstName,
        userId: booking.user.id,
      };
    }

    if (booking.guestEmail) {
      return {
        email: booking.guestEmail,
        firstName: booking.guestFirstName ?? 'Gast',
        userId: null,
      };
    }

    return null;
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

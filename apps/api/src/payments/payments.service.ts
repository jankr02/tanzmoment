import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Stripe from 'stripe';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { WebhookEventLogService } from './webhook-event-log.service';
import { BookingEmailService } from '../email/booking-email.service';
import {
  QUEUE_NAMES,
  JOB_NAMES,
  TIMING,
  type SessionReminderJobData,
} from '../queue';

/**
 * Processes Stripe webhook events and manages payment state.
 *
 * All handlers are idempotent: re-processing the same event
 * has no additional side effects.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly waitlistService: WaitlistService,
    private readonly webhookLog: WebhookEventLogService,
    private readonly bookingEmailService: BookingEmailService,
    @InjectQueue(QUEUE_NAMES.SESSION_REMINDER)
    private readonly reminderQueue: Queue<SessionReminderJobData>,
  ) {}

  // ===========================================================================
  // WEBHOOK EVENT ROUTING
  // ===========================================================================

  /**
   * Route a verified Stripe event to the appropriate handler.
   * Includes deduplication via WebhookEventLog.
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook: ${event.type} (${event.id})`);

    // Deduplication: skip if already processed
    const { isDuplicate, logId } = await this.webhookLog.registerEvent(
      event.id,
      event.type,
    );

    if (isDuplicate) {
      this.logger.log(`Skipping duplicate event: ${event.id}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'checkout.session.expired':
          await this.handleCheckoutExpired(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(
            event.data.object as Stripe.Charge,
          );
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      if (logId) {
        await this.webhookLog.markFailed(
          logId,
          error instanceof Error ? error.message : String(error),
        );
      }
      throw error;
    }
  }

  // ===========================================================================
  // CHECKOUT COMPLETED
  // ===========================================================================

  /**
   * Handles successful checkout: Payment → PAID, Booking → CONFIRMED.
   *
   * Idempotency: If payment is already PAID, skip silently.
   */
  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      this.logger.warn('Checkout session has no bookingId in metadata');
      return;
    }

    const payment = await this.prisma.payment.findFirst({
      where: { bookingId },
      include: { booking: true },
    });

    if (!payment) {
      this.logger.warn(`No payment found for booking ${bookingId}`);
      return;
    }

    if (payment.status === 'PAID') {
      this.logger.log(`Payment ${payment.id} already PAID, skipping`);
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          stripePaymentId: paymentIntentId ?? session.id,
          stripeStatus: 'succeeded',
          method: this.resolvePaymentMethod(session.payment_method_types),
          paidAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });
    });

    // Cancel the expiry job – payment received in time
    await this.waitlistService.cancelExpiry(bookingId);

    this.logger.log(
      `Checkout completed: booking ${bookingId} → CONFIRMED, ` +
        `payment ${payment.id} → PAID`,
    );

    await this.scheduleConfirmationSideEffects(bookingId);
  }

  // ===========================================================================
  // POST-CONFIRMATION SIDE EFFECTS
  // ===========================================================================

  /**
   * Fires confirmation email and reminder job after a booking transitions to CONFIRMED.
   * Idempotent — both the email queue (BullMQ) and the reminder job (jobId-deduped)
   * tolerate retries.
   */
  private async scheduleConfirmationSideEffects(bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: { select: { id: true, startTime: true } },
      },
    });

    if (!booking) {
      this.logger.warn(`Booking ${bookingId} vanished before side-effects could run`);
      return;
    }

    this.bookingEmailService
      .sendBookingConfirmation(bookingId)
      .catch((err) =>
        this.logger.error(
          `Failed to send confirmation email for ${bookingId}`,
          err,
        ),
      );

    // Session reminders only apply to single-session bookings. Full-course
    // bookings have no specific session, so there is nothing to remind about.
    if (!booking.session) return;

    const delay = Math.max(
      0,
      booking.session.startTime.getTime() - TIMING.REMINDER_BEFORE_MS - Date.now(),
    );

    if (delay <= 0) return;

    this.reminderQueue
      .add(
        JOB_NAMES.SEND_REMINDER,
        {
          bookingId,
          sessionId: booking.session.id,
          userId: booking.userId,
          guestEmail: booking.guestEmail,
        },
        { delay, jobId: `reminder-${bookingId}` },
      )
      .catch((err) =>
        this.logger.error(`Failed to schedule reminder for ${bookingId}`, err),
      );
  }

  // ===========================================================================
  // CHECKOUT EXPIRED
  // ===========================================================================

  /**
   * Handles expired checkout session (secondary safety net after BullMQ expiry job).
   *
   * Idempotency: If booking is already CANCELLED, skip silently.
   */
  private async handleCheckoutExpired(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return;

    if (booking.status === 'CANCELLED') {
      this.logger.log(`Booking ${bookingId} already CANCELLED, skipping`);
      return;
    }

    if (booking.status !== 'PENDING') {
      this.logger.log(
        `Booking ${bookingId} is ${booking.status}, not PENDING – skipping`,
      );
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

      await tx.payment.updateMany({
        where: { bookingId, status: 'PENDING' },
        data: { status: 'EXPIRED' },
      });
    });

    await this.waitlistService.triggerPromotion(
      booking.courseId,
      booking.sessionId,
    );

    this.logger.log(`Checkout expired: booking ${bookingId} → CANCELLED`);
  }

  // ===========================================================================
  // CHARGE REFUNDED
  // ===========================================================================

  /**
   * Handles Stripe refund events.
   *
   * Updates payment record with refund info. The booking is already CANCELLED
   * at this point (cancellation triggers the refund, not vice versa).
   *
   * Idempotency: If payment is already REFUNDED or PARTIAL_REFUND, skip silently.
   */
  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) return;

    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });

    if (!payment) {
      this.logger.warn(
        `No payment found for PI ${paymentIntentId} on refund event`,
      );
      return;
    }

    if (payment.status === 'REFUNDED' || payment.status === 'PARTIAL_REFUND') {
      this.logger.log(`Payment ${payment.id} already refunded, skipping`);
      return;
    }

    const refundedTotal = charge.amount_refunded;
    const isFullRefund = refundedTotal >= payment.amountInCents;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isFullRefund ? 'REFUNDED' : 'PARTIAL_REFUND',
        refundedAmount: refundedTotal,
        refundedAt: new Date(),
      },
    });

    this.logger.log(
      `Charge refunded: payment ${payment.id} ` +
        `(${refundedTotal} cents, ${isFullRefund ? 'full' : 'partial'})`,
    );
  }

  // ===========================================================================
  // REFUND PROCESSING (called from BookingsService on cancel)
  // ===========================================================================

  /**
   * Initiate a Stripe refund for a cancelled booking.
   *
   * For non-Stripe payments (FREE, CASH, etc.), updates the DB locally.
   * For Stripe payments, the webhook (charge.refunded) will confirm the DB update.
   */
  async processRefund(
    paymentId: string,
    refundAmountInCents: number,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== 'PAID') {
      this.logger.warn(
        `Cannot refund payment ${paymentId} with status ${payment.status}`,
      );
      return;
    }

    if (!payment.stripePaymentId) {
      // Non-Stripe payment: update DB locally, no external call needed
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status:
            refundAmountInCents >= payment.amountInCents
              ? 'REFUNDED'
              : 'PARTIAL_REFUND',
          refundedAmount: refundAmountInCents,
          refundedAt: new Date(),
        },
      });
      return;
    }

    // Stripe refund – the charge.refunded webhook will update payment status
    await this.stripeService.createRefund(
      payment.stripePaymentId,
      refundAmountInCents < payment.amountInCents
        ? refundAmountInCents
        : undefined,
    );

    this.logger.log(
      `Refund initiated: ${refundAmountInCents} cents for payment ${paymentId}`,
    );
  }

  // ===========================================================================
  // VERIFY CHECKOUT (for success page)
  // ===========================================================================

  /**
   * Verify a checkout session and return booking info.
   * Called by the frontend success page to confirm payment status.
   */
  async verifyCheckoutSession(sessionId: string) {
    const session = await this.stripeService.getCheckoutSession(sessionId);

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      throw new BadRequestException('Invalid checkout session');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        course: { select: { title: true, slug: true } },
        payment: { select: { status: true, amountInCents: true } },
      },
    });

    return {
      bookingId,
      status: booking?.status?.toLowerCase() ?? 'unknown',
      courseTitle: booking?.course.title ?? '',
      courseSlug: booking?.course.slug ?? '',
      paymentStatus: booking?.payment?.status?.toLowerCase() ?? 'unknown',
      amountInCents: booking?.payment?.amountInCents ?? 0,
    };
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  /**
   * Map Stripe payment method types to our PaymentMethod enum.
   */
  private resolvePaymentMethod(
    methods: string[] | undefined,
  ): PaymentMethod {
    if (!methods || methods.length === 0) return PaymentMethod.CREDIT_CARD;

    const method = methods[0];
    switch (method) {
      case 'sepa_debit':
        return PaymentMethod.SEPA_DEBIT;
      case 'card':
      default:
        return PaymentMethod.CREDIT_CARD;
    }
  }
}

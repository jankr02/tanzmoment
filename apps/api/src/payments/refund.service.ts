// ============================================================================
// REFUND SERVICE
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { BookingEmailService } from '../email/booking-email.service';
import { PaymentStatus } from '@prisma/client';
import { RefundCalculation, RefundType } from '@tanzmoment/shared/types';

export interface RefundResult {
  success: boolean;
  paymentId: string;
  stripeRefundId?: string;
  amountRefunded: number;
  newPaymentStatus: PaymentStatus;
  error?: string;
}

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly bookingEmailService: BookingEmailService,
  ) {}

  /**
   * Processes a refund for a booking's payment.
   *
   * Steps:
   * 1. Skip if no refund needed
   * 2. Find and validate payment
   * 3. Create Stripe refund
   * 4. Update payment record with stripeRefundId and reason
   *
   * Safe to call multiple times: if stripeRefundId already set, skip.
   */
  async processRefund(
    bookingId: string,
    refundCalc: RefundCalculation,
    reason: string
  ): Promise<RefundResult> {
    if (
      refundCalc.type === RefundType.NONE ||
      refundCalc.refundAmountInCents === 0
    ) {
      this.logger.log(`No refund needed for booking ${bookingId}`);
      return {
        success: true,
        paymentId: '',
        amountRefunded: 0,
        newPaymentStatus: PaymentStatus.CANCELLED,
      };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!payment) {
      this.logger.warn(
        `No payment found for booking ${bookingId} – skipping refund`
      );
      return {
        success: true,
        paymentId: '',
        amountRefunded: 0,
        newPaymentStatus: PaymentStatus.CANCELLED,
      };
    }

    // Idempotency: already refunded
    if (payment.stripeRefundId) {
      this.logger.log(
        `Refund already processed for payment ${payment.id} (refund ${payment.stripeRefundId})`
      );
      return {
        success: true,
        paymentId: payment.id,
        stripeRefundId: payment.stripeRefundId,
        amountRefunded: refundCalc.refundAmountInCents,
        newPaymentStatus: payment.status as PaymentStatus,
      };
    }

    if (payment.status !== PaymentStatus.PAID) {
      this.logger.warn(
        `Payment ${payment.id} is ${payment.status}, not refundable`
      );
      return {
        success: false,
        paymentId: payment.id,
        amountRefunded: 0,
        newPaymentStatus: payment.status as PaymentStatus,
        error: `Payment status is ${payment.status}, expected PAID`,
      };
    }

    if (!payment.stripePaymentId) {
      // Non-Stripe payment: update DB locally
      const isFullRefund =
        refundCalc.refundAmountInCents >= payment.amountInCents;
      const newStatus = isFullRefund
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIAL_REFUND;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          refundedAmount:
            (payment.refundedAmount ?? 0) + refundCalc.refundAmountInCents,
          refundedAt: new Date(),
          refundReason: reason,
        },
      });

      return {
        success: true,
        paymentId: payment.id,
        amountRefunded: refundCalc.refundAmountInCents,
        newPaymentStatus: newStatus,
      };
    }

    const isFullRefund =
      refundCalc.refundAmountInCents >= payment.amountInCents;
    const newStatus = isFullRefund
      ? PaymentStatus.REFUNDED
      : PaymentStatus.PARTIAL_REFUND;

    try {
      const stripeRefund = await this.stripeService.createRefund(
        payment.stripePaymentId,
        refundCalc.refundAmountInCents < payment.amountInCents
          ? refundCalc.refundAmountInCents
          : undefined
      );

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          refundedAmount:
            (payment.refundedAmount ?? 0) + refundCalc.refundAmountInCents,
          refundedAt: new Date(),
          stripeRefundId: stripeRefund.id,
          refundReason: reason,
        },
      });

      this.logger.log(
        `Refund processed: payment=${payment.id}, amount=${refundCalc.refundAmountInCents}c, ` +
          `type=${refundCalc.type}, stripe_refund=${stripeRefund.id}`
      );

      // Notify the user that their refund has been processed
      this.bookingEmailService
        .sendRefundProcessed(bookingId, {
          type: refundCalc.type,
          amountInCents: refundCalc.refundAmountInCents,
          percent: refundCalc.refundPercent,
        })
        .catch((err) =>
          this.logger.error(`Failed to send refund email for booking ${bookingId}: ${err.message}`),
        );

      return {
        success: true,
        paymentId: payment.id,
        stripeRefundId: stripeRefund.id,
        amountRefunded: refundCalc.refundAmountInCents,
        newPaymentStatus: newStatus,
      };
    } catch (error) {
      this.logger.error(
        `Stripe refund failed for payment ${payment.id}: ${error.message}`,
        error.stack
      );

      return {
        success: false,
        paymentId: payment.id,
        amountRefunded: 0,
        newPaymentStatus: payment.status as PaymentStatus,
        error: error.message,
      };
    }
  }
}

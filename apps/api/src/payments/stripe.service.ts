import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutOptions {
  bookingId: string;
  courseTitle: string;
  amountInCents: number;
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  stripePaymentIntentId?: string;
}

/**
 * Low-level Stripe SDK wrapper.
 *
 * All Stripe API calls go through this service.
 * Business logic (booking updates, etc.) stays in PaymentsService.
 */
@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const secretKey = this.config.getOrThrow<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });

    this.logger.log('Stripe SDK initialized');
  }

  // ===========================================================================
  // CHECKOUT SESSION
  // ===========================================================================

  /**
   * Create a Stripe Checkout Session for a booking.
   *
   * Uses `payment` mode (one-time payment, not subscription).
   * Metadata stores bookingId for webhook correlation.
   * Checkout expires after 30 minutes, matching our PENDING_EXPIRY_MS.
   */
  async createCheckoutSession(
    options: CreateCheckoutOptions,
  ): Promise<CheckoutSessionResult> {
    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:4200',
    );

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'sepa_debit'],
      locale: 'de',
      customer_email: options.customerEmail,
      line_items: [
        {
          price_data: {
            currency: options.currency.toLowerCase(),
            unit_amount: options.amountInCents,
            product_data: {
              name: options.courseTitle,
              description: 'Kursbuchung bei Tanzmoment',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: options.bookingId,
        ...options.metadata,
      },
      success_url: `${frontendUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/booking/cancelled?booking_id=${options.bookingId}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    this.logger.log(
      `Checkout session created: ${session.id} for booking ${options.bookingId}`,
    );

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      stripePaymentIntentId: session.payment_intent as string | undefined,
    };
  }

  // ===========================================================================
  // REFUNDS
  // ===========================================================================

  /**
   * Create a refund for a payment intent.
   *
   * @param paymentIntentId - Stripe Payment Intent ID
   * @param amountInCents - Amount to refund (undefined = full refund)
   */
  async createRefund(
    paymentIntentId: string,
    amountInCents?: number,
  ): Promise<Stripe.Refund> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amountInCents ? { amount: amountInCents } : {}),
    });

    this.logger.log(
      `Refund created: ${refund.id} for PI ${paymentIntentId} ` +
        `(amount: ${amountInCents ?? 'full'})`,
    );

    return refund;
  }

  // ===========================================================================
  // WEBHOOK VERIFICATION
  // ===========================================================================

  /**
   * Verify and construct a Stripe webhook event from the raw request body.
   *
   * CRITICAL: Never skip signature verification.
   * The raw body must be the unparsed request buffer.
   */
  constructWebhookEvent(
    rawBody: Buffer,
    signature: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );
  }

  // ===========================================================================
  // SESSION RETRIEVAL
  // ===========================================================================

  /**
   * Retrieve a checkout session by ID (for success page verification).
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
  }
}

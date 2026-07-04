import {
  Controller,
  Post,
  Get,
  Query,
  Req,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // ===========================================================================
  // POST /payments/webhook – Stripe Webhook Handler
  // ===========================================================================

  /**
   * Receives Stripe webhook events for payment lifecycle changes.
   *
   * Raw body is required for HMAC signature verification.
   * Returns 200 once the event is processed (or was already handled), and 5xx
   * when processing fails unexpectedly so Stripe re-delivers it for retry.
   * Signature verification is never skipped.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!signature) {
      this.logger.warn('Webhook received without stripe-signature header');
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.error(
        'Raw body not available – ensure NestJS rawBody option is enabled',
      );
      res.status(400).json({ error: 'Raw body not available' });
      return;
    }

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${err}`);
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    try {
      await this.paymentsService.handleWebhookEvent(event);
    } catch (err) {
      this.logger.error(
        `Error processing webhook ${event.id}: ${err}`,
        err instanceof Error ? err.stack : undefined,
      );
      // Return 5xx so Stripe retries. The event stays FAILED (not PROCESSED)
      // in the log, so the retry is reprocessed rather than skipped as a dupe.
      res.status(500).json({ received: false });
      return;
    }

    res.status(200).json({ received: true });
  }

  // ===========================================================================
  // GET /payments/verify-checkout – Frontend success page verification
  // ===========================================================================

  @Get('verify-checkout')
  @ApiOperation({
    summary: 'Verify a checkout session (for success page)',
    description:
      'Called by the frontend after Stripe redirects back. ' +
      'Returns booking status and payment confirmation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session verified',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or missing session ID',
  })
  async verifyCheckout(
    @Query('session_id') sessionId: string,
  ) {
    if (!sessionId) {
      throw new BadRequestException('session_id is required');
    }

    return this.paymentsService.verifyCheckoutSession(sessionId);
  }
}

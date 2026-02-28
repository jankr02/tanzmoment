import { Module, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { WebhookEventLogService } from './webhook-event-log.service';
import { AdminPaymentsController } from './admin-payments.controller';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { QueueModule, QUEUE_NAMES, JOB_NAMES } from '../queue';
import { EmailModule } from '../email/email.module';
import { ReconciliationProcessor } from '../queue/processors/reconciliation.processor';
import { RefundService } from './refund.service';

@Module({
  imports: [WaitlistModule, QueueModule, EmailModule],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [
    StripeService,
    PaymentsService,
    RefundService,
    WebhookEventLogService,
    ReconciliationProcessor,
  ],
  exports: [PaymentsService, StripeService, WebhookEventLogService, RefundService],
})
export class PaymentsModule implements OnModuleInit {
  constructor(
    @InjectQueue(QUEUE_NAMES.MAINTENANCE)
    private readonly maintenanceQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule recurring maintenance jobs.
    // upsertJobScheduler avoids duplicate schedulers on server restart.

    await this.maintenanceQueue.upsertJobScheduler(
      'reconcile-payments-scheduler',
      { pattern: '0 */4 * * *' }, // Every 4 hours
      {
        name: JOB_NAMES.RECONCILE_PAYMENTS,
        data: { triggeredBy: 'cron' as const },
      },
    );

    await this.maintenanceQueue.upsertJobScheduler(
      'cleanup-webhook-events-scheduler',
      { pattern: '0 3 * * *' }, // Daily at 03:00
      {
        name: JOB_NAMES.CLEANUP_WEBHOOK_EVENTS,
        data: { triggeredBy: 'cron' as const },
      },
    );

    await this.maintenanceQueue.upsertJobScheduler(
      'gdpr-cleanup-scheduler',
      { pattern: '0 2 * * *' }, // Daily at 02:00
      {
        name: JOB_NAMES.GDPR_CLEANUP,
        data: { triggeredBy: 'cron' as const },
      },
    );
  }
}

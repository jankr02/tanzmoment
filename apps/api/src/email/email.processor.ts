// ============================================================================
// EMAIL PROCESSOR
// ============================================================================
// BullMQ processor for async email delivery with retry support.
// ============================================================================

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from './email.constants';
import { EmailJobData } from './email.types';
import { EmailService } from './email.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, template, variables, bookingId } = job.data;

    this.logger.debug(
      `Processing email job ${job.id}: template=${template}, to=${to}, booking=${bookingId ?? 'n/a'}`,
    );

    const result = await this.emailService.send(to, subject, template, variables);

    if (!result.success) {
      throw new Error(`Email delivery failed: ${result.error}`);
    }

    this.logger.log(
      `Email delivered: job=${job.id}, messageId=${result.messageId}, to=${to}`,
    );
  }
}

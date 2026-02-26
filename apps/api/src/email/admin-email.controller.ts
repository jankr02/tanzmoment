// ============================================================================
// ADMIN EMAIL CONTROLLER
// ============================================================================

import {
  Controller,
  Post,
  Param,
  UseGuards,
  Logger,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { BookingEmailService } from './booking-email.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from './email.constants';

@Controller('admin/emails')
@ApiTags('Admin – Emails')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminEmailController {
  private readonly logger = new Logger(AdminEmailController.name);

  constructor(
    private readonly bookingEmailService: BookingEmailService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  /**
   * POST /admin/emails/resend/:bookingId/confirmation
   *
   * Resends booking confirmation email.
   */
  @Post('resend/:bookingId/confirmation')
  @ApiOperation({ summary: 'Resend booking confirmation email' })
  async resendConfirmation(@Param('bookingId') bookingId: string) {
    await this.bookingEmailService.sendBookingConfirmation(bookingId);
    return { message: 'Confirmation email re-queued', bookingId };
  }

  /**
   * POST /admin/emails/resend/:bookingId/reminder
   *
   * Resends session reminder email.
   */
  @Post('resend/:bookingId/reminder')
  @ApiOperation({ summary: 'Resend session reminder email' })
  async resendReminder(@Param('bookingId') bookingId: string) {
    await this.bookingEmailService.sendSessionReminder(bookingId);
    return { message: 'Reminder email re-queued', bookingId };
  }

  /**
   * GET /admin/emails/queue-stats
   *
   * Returns email queue statistics.
   */
  @Get('queue-stats')
  @ApiOperation({ summary: 'Get email queue statistics' })
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * GET /admin/emails/failed
   *
   * Returns recently failed email jobs for debugging.
   */
  @Get('failed')
  @ApiOperation({ summary: 'Get failed email jobs' })
  async getFailedJobs(@Query('limit') limit = 20) {
    const jobs = await this.emailQueue.getFailed(0, limit);
    return jobs.map((job) => ({
      id: job.id,
      template: job.data.template,
      to: job.data.to,
      bookingId: job.data.bookingId,
      error: job.failedReason,
      attempts: job.attemptsMade,
      failedAt: job.finishedOn ? new Date(job.finishedOn) : null,
    }));
  }
}

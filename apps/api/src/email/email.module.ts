// ============================================================================
// EMAIL MODULE
// ============================================================================

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './email.constants';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { TemplateService } from './template/template.service';
import { BookingEmailService } from './booking-email.service';
import { AdminEmailController } from './admin-email.controller';

@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE })],
  controllers: [AdminEmailController],
  providers: [EmailService, EmailProcessor, TemplateService, BookingEmailService],
  exports: [EmailService, BookingEmailService],
})
export class EmailModule {}

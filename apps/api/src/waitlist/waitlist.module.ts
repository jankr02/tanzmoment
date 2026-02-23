import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { QueueModule } from '../queue';
import { BookingExpiryProcessor } from '../queue/processors/booking-expiry.processor';
import { WaitlistPromotionProcessor } from '../queue/processors/waitlist-promotion.processor';
import { SessionReminderProcessor } from '../queue/processors/session-reminder.processor';

/**
 * Provides waitlist management and hosts all BullMQ processors.
 *
 * Processors live here (not in QueueModule) to avoid circular dependencies:
 * QueueModule only handles Redis config and queue registration.
 */
@Module({
  imports: [QueueModule],
  providers: [
    WaitlistService,
    BookingExpiryProcessor,
    WaitlistPromotionProcessor,
    SessionReminderProcessor,
  ],
  exports: [WaitlistService],
})
export class WaitlistModule {}

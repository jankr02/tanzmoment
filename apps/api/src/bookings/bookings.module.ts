import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminBookingsService } from './admin-bookings.service';
import { CancellationPolicyService } from './cancellation-policy.service';
import { AuthModule } from '../auth/auth.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { QueueModule } from '../queue';
import { PaymentsModule } from '../payments/payments.module';
import { BatchRefundProcessor } from '../queue/processors/batch-refund.processor';

@Module({
  imports: [AuthModule, WaitlistModule, QueueModule, PaymentsModule],
  controllers: [BookingsController, AdminBookingsController],
  providers: [
    BookingsService,
    AdminBookingsService,
    CancellationPolicyService,
    BatchRefundProcessor,
  ],
  exports: [BookingsService, CancellationPolicyService],
})
export class BookingsModule {}

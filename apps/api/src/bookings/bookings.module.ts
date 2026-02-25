import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminBookingsService } from './admin-bookings.service';
import { AuthModule } from '../auth/auth.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { QueueModule } from '../queue';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [AuthModule, WaitlistModule, QueueModule, PaymentsModule],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService, AdminBookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

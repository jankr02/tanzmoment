import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AuthModule } from '../auth/auth.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { QueueModule } from '../queue';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [AuthModule, WaitlistModule, QueueModule, PaymentsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

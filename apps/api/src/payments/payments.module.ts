import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { WaitlistModule } from '../waitlist/waitlist.module';

@Module({
  imports: [WaitlistModule],
  controllers: [PaymentsController],
  providers: [StripeService, PaymentsService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}

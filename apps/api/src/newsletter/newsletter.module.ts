import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { QueueModule } from '../queue';
import { NewsletterController } from './newsletter.controller';
import { NewsletterCampaignService } from './newsletter-campaign.service';
import { NewsletterEmailService } from './newsletter-email.service';
import { NewsletterSubscriberService } from './newsletter-subscriber.service';
import { NewsletterSendProcessor } from './processors/newsletter-dispatch.processor';

@Module({
  imports: [AuthModule, EmailModule, QueueModule],
  controllers: [NewsletterController],
  providers: [
    NewsletterSubscriberService,
    NewsletterCampaignService,
    NewsletterEmailService,
    NewsletterSendProcessor,
  ],
  exports: [NewsletterSubscriberService, NewsletterCampaignService],
})
export class NewsletterModule {}

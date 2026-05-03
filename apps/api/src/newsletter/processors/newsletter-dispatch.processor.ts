import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NewsletterCampaignType, NewsletterDeliveryStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import {
  DispatchCampaignJobData,
  SendRecipientJobData,
} from '../../queue/queue.types';
import { NewsletterCampaignService } from '../newsletter-campaign.service';
import { NewsletterEmailService } from '../newsletter-email.service';

@Processor(QUEUE_NAMES.NEWSLETTER_SEND)
export class NewsletterSendProcessor extends WorkerHost {
  private readonly logger = new Logger(NewsletterSendProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly campaignService: NewsletterCampaignService,
    private readonly emailService: NewsletterEmailService,
  ) {
    super();
  }

  async process(job: Job<DispatchCampaignJobData | SendRecipientJobData>): Promise<void> {
    if (job.name === JOB_NAMES.DISPATCH_CAMPAIGN) {
      const { campaignId } = job.data as DispatchCampaignJobData;
      this.logger.log(`Dispatching campaign ${campaignId}`);
      await this.campaignService.dispatchCampaign(campaignId);
      return;
    }

    if (job.name === JOB_NAMES.SEND_RECIPIENT) {
      const data = job.data as SendRecipientJobData;
      await this.handleSend(data);
      return;
    }

    this.logger.warn(`Unknown job in newsletter processor: ${job.name}`);
  }

  private async handleSend(data: SendRecipientJobData): Promise<void> {
    const campaign = await this.prisma.newsletterCampaign.findUnique({
      where: { id: data.campaignId },
      include: { article: true },
    });

    if (!campaign) {
      this.logger.warn(`Campaign ${data.campaignId} not found — skipping ${data.email}`);
      return;
    }

    const result = await this.emailService.sendArticle({
      email: data.email,
      subject: campaign.subject,
      title: campaign.article.title,
      slug: campaign.article.slug,
      excerpt: campaign.article.excerpt,
      category: campaign.article.category,
      coverImageUrl: campaign.article.coverImageUrl,
      bodyHtml: campaign.article.bodyHtml,
      unsubscribeToken: data.unsubscribeToken,
    });

    await this.prisma.newsletterDelivery.update({
      where: { id: data.deliveryId },
      data: {
        status: result.success ? NewsletterDeliveryStatus.SENT : NewsletterDeliveryStatus.FAILED,
        errorMessage: result.error ?? null,
        sentAt: result.success ? new Date() : null,
      },
    });

    if (campaign.type === NewsletterCampaignType.TEST) {
      await this.campaignService.finalizeIfDone(data.campaignId);
    } else {
      await this.campaignService.finalizeIfDone(data.campaignId);
    }
  }
}

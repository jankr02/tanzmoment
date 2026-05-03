import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NewsArticleStatus,
  NewsletterCampaign,
  NewsletterCampaignStatus,
  NewsletterCampaignType,
  NewsletterDeliveryStatus,
  NewsletterSubscriberStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JOB_NAMES, QUEUE_NAMES } from '../queue/queue.constants';
import {
  DispatchCampaignJobData,
  SendRecipientJobData,
} from '../queue/queue.types';

@Injectable()
export class NewsletterCampaignService {
  private readonly logger = new Logger(NewsletterCampaignService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.NEWSLETTER_SEND) private readonly queue: Queue,
  ) {}

  async createTestSend(
    articleId: string,
    email: string,
    triggeredById: string,
  ): Promise<NewsletterCampaign> {
    const article = await this.requireArticle(articleId);

    const subject = article.title;
    const campaign = await this.prisma.newsletterCampaign.create({
      data: {
        articleId,
        type: NewsletterCampaignType.TEST,
        status: NewsletterCampaignStatus.NOT_SENT,
        subject,
        triggeredById,
        testRecipientEmail: email.toLowerCase(),
        recipientCount: 1,
      },
    });

    const delivery = await this.prisma.newsletterDelivery.create({
      data: {
        campaignId: campaign.id,
        email: email.toLowerCase(),
      },
    });

    await this.prisma.newsletterCampaign.update({
      where: { id: campaign.id },
      data: { status: NewsletterCampaignStatus.SENDING, startedAt: new Date() },
    });

    const payload: SendRecipientJobData = {
      campaignId: campaign.id,
      deliveryId: delivery.id,
      email: email.toLowerCase(),
      subscriberId: null,
      unsubscribeToken: 'test',
    };

    await this.queue.add(JOB_NAMES.SEND_RECIPIENT, payload);
    this.logger.log(`Test campaign ${campaign.id} enqueued for ${email}`);
    return campaign;
  }

  async createBulkSend(
    articleId: string,
    triggeredById: string,
    scheduledAt: Date | null,
  ): Promise<NewsletterCampaign> {
    const article = await this.requireArticle(articleId);

    if (article.status !== NewsArticleStatus.PUBLISHED) {
      throw new BadRequestException('Artikel muss vor dem Versand veröffentlicht sein.');
    }

    const recipientCount = await this.prisma.newsletterSubscriber.count({
      where: { status: NewsletterSubscriberStatus.CONFIRMED },
    });
    if (recipientCount === 0) {
      throw new BadRequestException('Keine bestätigten Abonnenten vorhanden.');
    }

    const status = scheduledAt
      ? NewsletterCampaignStatus.SCHEDULED
      : NewsletterCampaignStatus.NOT_SENT;

    const campaign = await this.prisma.newsletterCampaign.create({
      data: {
        articleId,
        type: NewsletterCampaignType.BULK,
        status,
        subject: article.title,
        scheduledAt,
        triggeredById,
        recipientCount,
      },
    });

    const delay = scheduledAt ? Math.max(0, scheduledAt.getTime() - Date.now()) : 0;
    const payload: DispatchCampaignJobData = { campaignId: campaign.id };

    const job = await this.queue.add(JOB_NAMES.DISPATCH_CAMPAIGN, payload, { delay });

    await this.prisma.newsletterCampaign.update({
      where: { id: campaign.id },
      data: { bullJobId: String(job.id ?? '') },
    });

    this.logger.log(
      `Bulk campaign ${campaign.id} enqueued (delay=${delay}ms, recipients=${recipientCount})`,
    );
    return campaign;
  }

  async cancelScheduled(campaignId: string): Promise<NewsletterCampaign> {
    const campaign = await this.prisma.newsletterCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException('Kampagne nicht gefunden');
    }
    if (campaign.status !== NewsletterCampaignStatus.SCHEDULED) {
      throw new BadRequestException('Nur geplante Kampagnen können storniert werden.');
    }

    if (campaign.bullJobId) {
      const job = await this.queue.getJob(campaign.bullJobId);
      if (job) {
        await job.remove().catch((err) => this.logger.warn(`Failed to remove job: ${err}`));
      }
    }

    return this.prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: NewsletterCampaignStatus.CANCELLED, completedAt: new Date() },
    });
  }

  async listForArticle(articleId: string): Promise<NewsletterCampaign[]> {
    return this.prisma.newsletterCampaign.findMany({
      where: { articleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async dispatchCampaign(campaignId: string): Promise<void> {
    const campaign = await this.prisma.newsletterCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.type !== NewsletterCampaignType.BULK) {
      this.logger.warn(`Campaign ${campaignId} not found or wrong type`);
      return;
    }
    if (campaign.status === NewsletterCampaignStatus.CANCELLED) {
      this.logger.log(`Campaign ${campaignId} cancelled — skipping dispatch`);
      return;
    }

    await this.prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: NewsletterCampaignStatus.SENDING, startedAt: new Date() },
    });

    const pageSize = 200;
    let skip = 0;
    let totalQueued = 0;

    while (true) {
      const subscribers = await this.prisma.newsletterSubscriber.findMany({
        where: { status: NewsletterSubscriberStatus.CONFIRMED },
        orderBy: { createdAt: 'asc' },
        skip,
        take: pageSize,
        select: { id: true, email: true, unsubscribeToken: true },
      });
      if (subscribers.length === 0) break;

      for (const sub of subscribers) {
        try {
          const delivery = await this.prisma.newsletterDelivery.upsert({
            where: { campaignId_email: { campaignId, email: sub.email } },
            create: {
              campaignId,
              subscriberId: sub.id,
              email: sub.email,
              status: NewsletterDeliveryStatus.QUEUED,
            },
            update: {},
          });

          const payload: SendRecipientJobData = {
            campaignId,
            deliveryId: delivery.id,
            email: sub.email,
            subscriberId: sub.id,
            unsubscribeToken: sub.unsubscribeToken,
          };

          await this.queue.add(JOB_NAMES.SEND_RECIPIENT, payload);
          totalQueued++;
        } catch (err) {
          this.logger.error(`Failed to enqueue ${sub.email}: ${err}`);
        }
      }

      skip += subscribers.length;
    }

    this.logger.log(`Campaign ${campaignId}: queued ${totalQueued} recipient jobs`);
  }

  async finalizeIfDone(campaignId: string): Promise<void> {
    const counts = await this.prisma.newsletterDelivery.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: true,
    });

    const queued = counts.find((c) => c.status === NewsletterDeliveryStatus.QUEUED)?._count ?? 0;
    if (queued > 0) return;

    const success = counts.find((c) => c.status === NewsletterDeliveryStatus.SENT)?._count ?? 0;
    const failed = counts.find((c) => c.status === NewsletterDeliveryStatus.FAILED)?._count ?? 0;

    await this.prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: failed > 0 && success === 0
          ? NewsletterCampaignStatus.FAILED
          : NewsletterCampaignStatus.SENT,
        completedAt: new Date(),
        successCount: success,
        failureCount: failed,
      },
    });
    this.logger.log(`Campaign ${campaignId} finalized: success=${success}, failed=${failed}`);
  }

  private async requireArticle(articleId: string) {
    const article = await this.prisma.newsArticle.findUnique({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Artikel nicht gefunden');
    }
    return article;
  }
}

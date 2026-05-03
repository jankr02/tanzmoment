import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  NewsletterSubscriber,
  NewsletterSubscriberStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NewsletterEmailService } from './newsletter-email.service';

const CONFIRM_TOKEN_TTL_DAYS = 7;

interface SubscribeOptions {
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class NewsletterSubscriberService {
  private readonly logger = new Logger(NewsletterSubscriberService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: NewsletterEmailService,
  ) {}

  async subscribe(email: string, options: SubscribeOptions = {}): Promise<{ status: NewsletterSubscriberStatus }> {
    const normalized = this.normalizeEmail(email);
    const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { email: normalized } });

    if (existing?.status === NewsletterSubscriberStatus.CONFIRMED) {
      return { status: NewsletterSubscriberStatus.CONFIRMED };
    }

    const confirmToken = this.generateToken();
    const confirmExpiresAt = new Date(Date.now() + CONFIRM_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      create: {
        email: normalized,
        status: NewsletterSubscriberStatus.PENDING,
        confirmToken,
        confirmExpiresAt,
        source: options.source ?? 'footer',
        ipAddress: options.ipAddress ?? null,
        userAgent: options.userAgent ?? null,
      },
      update: {
        status: NewsletterSubscriberStatus.PENDING,
        confirmToken,
        confirmExpiresAt,
        unsubscribedAt: null,
      },
    });

    await this.emailService.sendDoubleOptIn(subscriber.email, confirmToken);
    this.logger.log(`DOI sent to ${subscriber.email}`);
    return { status: subscriber.status };
  }

  async confirm(token: string): Promise<NewsletterSubscriber> {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } });
    if (!subscriber) {
      throw new NotFoundException('Bestätigungs-Token ungültig oder abgelaufen');
    }

    if (subscriber.status === NewsletterSubscriberStatus.CONFIRMED) {
      return subscriber;
    }

    if (subscriber.confirmExpiresAt && subscriber.confirmExpiresAt < new Date()) {
      throw new BadRequestException('Bestätigungs-Link ist abgelaufen. Bitte erneut anmelden.');
    }

    return this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: NewsletterSubscriberStatus.CONFIRMED,
        confirmedAt: new Date(),
        confirmToken: null,
        confirmExpiresAt: null,
      },
    });
  }

  async unsubscribeByToken(token: string): Promise<NewsletterSubscriber> {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } });
    if (!subscriber) {
      throw new NotFoundException('Abmelde-Link ungültig');
    }

    if (subscriber.status === NewsletterSubscriberStatus.UNSUBSCRIBED) {
      return subscriber;
    }

    const updated = await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: NewsletterSubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    });

    await this.emailService.sendUnsubscribeConfirmation(subscriber.email).catch((err) => {
      this.logger.warn(`Failed to send unsubscribe confirmation: ${err}`);
    });

    return updated;
  }

  async getStatusForUser(userId: string): Promise<NewsletterSubscriberStatus> {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { userId } });
    if (!subscriber) return NewsletterSubscriberStatus.UNSUBSCRIBED;
    return subscriber.status;
  }

  async setUserPreference(userId: string, subscribed: boolean): Promise<NewsletterSubscriberStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    if (subscribed) {
      const upserted = await this.prisma.newsletterSubscriber.upsert({
        where: { userId },
        create: {
          email: user.email,
          userId,
          status: NewsletterSubscriberStatus.CONFIRMED,
          confirmedAt: new Date(),
          source: 'account',
        },
        update: {
          status: NewsletterSubscriberStatus.CONFIRMED,
          confirmedAt: new Date(),
          unsubscribedAt: null,
          confirmToken: null,
          confirmExpiresAt: null,
        },
      });
      return upserted.status;
    }

    const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { userId } });
    if (!existing) {
      return NewsletterSubscriberStatus.UNSUBSCRIBED;
    }
    const updated = await this.prisma.newsletterSubscriber.update({
      where: { userId },
      data: {
        status: NewsletterSubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    });
    return updated.status;
  }

  countConfirmed(): Promise<number> {
    return this.prisma.newsletterSubscriber.count({
      where: { status: NewsletterSubscriberStatus.CONFIRMED },
    });
  }

  listConfirmedPaginated(skip: number, take: number): Promise<NewsletterSubscriber[]> {
    return this.prisma.newsletterSubscriber.findMany({
      where: { status: NewsletterSubscriberStatus.CONFIRMED },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }
}

export type { Prisma };

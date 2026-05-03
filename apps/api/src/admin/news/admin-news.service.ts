import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NewsArticleStatus,
  NewsletterCampaign,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TiptapRendererService } from '../../news/tiptap-renderer.service';
import { NewsletterCampaignService } from '../../newsletter/newsletter-campaign.service';
import { AdminNewsQueryDto } from './dto/admin-news-query.dto';
import {
  AdminNewsArticleDto,
  AdminNewsListItemDto,
  PaginatedAdminNewsDto,
} from './dto/admin-news-response.dto';
import { NewsletterCampaignDto } from './dto/campaign-response.dto';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { SendNewsletterDto } from './dto/send-newsletter.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { slugify } from './slug.util';

@Injectable()
export class AdminNewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tiptap: TiptapRendererService,
    private readonly campaigns: NewsletterCampaignService,
  ) {}

  async list(query: AdminNewsQueryDto): Promise<PaginatedAdminNewsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NewsArticleWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, articles] = await Promise.all([
      this.prisma.newsArticle.count({ where }),
      this.prisma.newsArticle.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          campaigns: {
            where: { status: 'SENT' },
            orderBy: { completedAt: 'desc' },
            take: 1,
            select: { completedAt: true },
          },
        },
      }),
    ]);

    return {
      items: articles.map((a): AdminNewsListItemDto => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        category: a.category,
        coverImageUrl: a.coverImageUrl,
        publishedAt: a.publishedAt?.toISOString() ?? null,
        lastSentAt: a.campaigns[0]?.completedAt?.toISOString() ?? null,
        updatedAt: a.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string): Promise<AdminNewsArticleDto> {
    const article = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('News-Artikel nicht gefunden');
    }
    return this.toAdminDto(article);
  }

  async create(dto: CreateNewsArticleDto, authorId: string | null): Promise<AdminNewsArticleDto> {
    const slug = await this.resolveSlug(dto.slug, dto.title);
    const bodyHtml = this.tiptap.render(dto.bodyJson as never);

    const created = await this.prisma.newsArticle.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt ?? null,
        category: dto.category ?? null,
        coverImageUrl: dto.coverImageUrl ?? null,
        bodyJson: dto.bodyJson as Prisma.InputJsonValue,
        bodyHtml,
        metaTitle: dto.metaTitle ?? null,
        metaDescription: dto.metaDescription ?? null,
        authorId,
      },
    });
    return this.toAdminDto(created);
  }

  async update(id: string, dto: UpdateNewsArticleDto): Promise<AdminNewsArticleDto> {
    const existing = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('News-Artikel nicht gefunden');
    }

    const data: Prisma.NewsArticleUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined && dto.slug !== existing.slug) {
      data.slug = await this.resolveSlug(dto.slug, dto.title ?? existing.title, id);
    }
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription;
    if (dto.bodyJson !== undefined) {
      data.bodyJson = dto.bodyJson as Prisma.InputJsonValue;
      data.bodyHtml = this.tiptap.render(dto.bodyJson as never);
    }

    const updated = await this.prisma.newsArticle.update({ where: { id }, data });
    return this.toAdminDto(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.newsArticle.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('News-Artikel nicht gefunden');
    });
  }

  async testSend(id: string, email: string, triggeredById: string): Promise<NewsletterCampaignDto> {
    await this.requireArticle(id);
    const campaign = await this.campaigns.createTestSend(id, email, triggeredById);
    return this.toCampaignDto(campaign);
  }

  async sendBulk(id: string, dto: SendNewsletterDto, triggeredById: string): Promise<NewsletterCampaignDto> {
    const article = await this.requireArticle(id);
    if (article.status !== NewsArticleStatus.PUBLISHED) {
      throw new BadRequestException('Artikel muss vor dem Versand veröffentlicht sein.');
    }
    const scheduledAt = dto.scheduledAt ?? null;
    if (scheduledAt && scheduledAt.getTime() < Date.now()) {
      throw new BadRequestException('Versandzeitpunkt liegt in der Vergangenheit.');
    }
    const campaign = await this.campaigns.createBulkSend(id, triggeredById, scheduledAt);
    return this.toCampaignDto(campaign);
  }

  async listCampaigns(articleId: string): Promise<NewsletterCampaignDto[]> {
    await this.requireArticle(articleId);
    const campaigns = await this.campaigns.listForArticle(articleId);
    return campaigns.map((c) => this.toCampaignDto(c));
  }

  async cancelCampaign(campaignId: string): Promise<NewsletterCampaignDto> {
    const campaign = await this.campaigns.cancelScheduled(campaignId);
    return this.toCampaignDto(campaign);
  }

  private async requireArticle(id: string) {
    const article = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('News-Artikel nicht gefunden');
    }
    return article;
  }

  private toCampaignDto(c: NewsletterCampaign): NewsletterCampaignDto {
    return {
      id: c.id,
      articleId: c.articleId,
      type: c.type,
      status: c.status,
      subject: c.subject,
      scheduledAt: c.scheduledAt?.toISOString() ?? null,
      startedAt: c.startedAt?.toISOString() ?? null,
      completedAt: c.completedAt?.toISOString() ?? null,
      recipientCount: c.recipientCount,
      successCount: c.successCount,
      failureCount: c.failureCount,
      testRecipientEmail: c.testRecipientEmail,
      createdAt: c.createdAt.toISOString(),
    };
  }

  async togglePublish(id: string): Promise<AdminNewsArticleDto> {
    const article = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('News-Artikel nicht gefunden');
    }

    const nextStatus =
      article.status === NewsArticleStatus.PUBLISHED
        ? NewsArticleStatus.DRAFT
        : NewsArticleStatus.PUBLISHED;

    const updated = await this.prisma.newsArticle.update({
      where: { id },
      data: {
        status: nextStatus,
        publishedAt: nextStatus === NewsArticleStatus.PUBLISHED
          ? (article.publishedAt ?? new Date())
          : null,
      },
    });
    return this.toAdminDto(updated);
  }

  private async resolveSlug(input: string | undefined, fallback: string, excludeId?: string): Promise<string> {
    const base = (input && input.length > 0 ? input : slugify(fallback)).trim();
    if (!base) {
      throw new BadRequestException('Slug kann nicht leer sein');
    }

    let candidate = base;
    let counter = 2;
    while (true) {
      const conflict = await this.prisma.newsArticle.findUnique({ where: { slug: candidate } });
      if (!conflict || conflict.id === excludeId) {
        return candidate;
      }
      candidate = `${base}-${counter++}`;
    }
  }

  private toAdminDto(article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    coverImageUrl: string | null;
    bodyJson: Prisma.JsonValue;
    bodyHtml: string;
    status: NewsArticleStatus;
    metaTitle: string | null;
    metaDescription: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AdminNewsArticleDto {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      coverImageUrl: article.coverImageUrl,
      bodyJson: article.bodyJson as Record<string, unknown>,
      bodyHtml: article.bodyHtml,
      status: article.status,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }
}

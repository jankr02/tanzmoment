import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsArticleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NewsListQueryDto } from './dto/news-list-query.dto';
import {
  PaginatedPublicNewsDto,
  PublicNewsArticleDto,
  PublicNewsListItemDto,
} from './dto/public-news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: NewsListQueryDto): Promise<PaginatedPublicNewsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.NewsArticleWhereInput = {
      status: NewsArticleStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
      ...(query.category ? { category: query.category } : {}),
    };

    const [total, articles] = await Promise.all([
      this.prisma.newsArticle.count({ where }),
      this.prisma.newsArticle.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          coverImageUrl: true,
          publishedAt: true,
        },
      }),
    ]);

    return {
      items: articles.map((a): PublicNewsListItemDto => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        category: a.category,
        coverImageUrl: a.coverImageUrl,
        publishedAt: (a.publishedAt ?? new Date()).toISOString(),
      })),
      total,
      page,
      limit,
      hasMore: skip + articles.length < total,
    };
  }

  async getBySlug(slug: string): Promise<PublicNewsArticleDto> {
    const article = await this.prisma.newsArticle.findFirst({
      where: {
        slug,
        status: NewsArticleStatus.PUBLISHED,
        publishedAt: { lte: new Date() },
      },
    });

    if (!article) {
      throw new NotFoundException('News-Artikel nicht gefunden');
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      coverImageUrl: article.coverImageUrl,
      bodyHtml: article.bodyHtml,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      publishedAt: (article.publishedAt ?? new Date()).toISOString(),
    };
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewsListQueryDto } from './dto/news-list-query.dto';
import {
  PaginatedPublicNewsDto,
  PublicNewsArticleDto,
} from './dto/public-news.dto';
import { NewsService } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Veröffentlichte News auflisten' })
  @ApiResponse({ status: 200, type: PaginatedPublicNewsDto })
  list(@Query() query: NewsListQueryDto): Promise<PaginatedPublicNewsDto> {
    return this.newsService.list(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'News-Artikel über Slug abrufen' })
  @ApiParam({ name: 'slug' })
  @ApiResponse({ status: 200, type: PublicNewsArticleDto })
  @ApiResponse({ status: 404, description: 'Artikel nicht gefunden oder nicht veröffentlicht' })
  getBySlug(@Param('slug') slug: string): Promise<PublicNewsArticleDto> {
    return this.newsService.getBySlug(slug);
  }
}

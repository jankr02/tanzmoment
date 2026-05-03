import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AdminNewsService } from './admin-news.service';
import { AdminNewsQueryDto } from './dto/admin-news-query.dto';
import {
  AdminNewsArticleDto,
  PaginatedAdminNewsDto,
} from './dto/admin-news-response.dto';
import { NewsletterCampaignDto } from './dto/campaign-response.dto';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import {
  SendNewsletterDto,
  TestSendNewsletterDto,
} from './dto/send-newsletter.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';

@ApiTags('Admin - News')
@Controller('admin/news')
export class AdminNewsController {
  constructor(private readonly newsService: AdminNewsService) {}

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'News-Artikel auflisten' })
  @ApiResponse({ status: 200, type: PaginatedAdminNewsDto })
  list(@Query() query: AdminNewsQueryDto): Promise<PaginatedAdminNewsDto> {
    return this.newsService.list(query);
  }

  @Get(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'News-Artikel im Detail abrufen' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AdminNewsArticleDto })
  getOne(@Param('id') id: string): Promise<AdminNewsArticleDto> {
    return this.newsService.getById(id);
  }

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'News-Artikel erstellen' })
  @ApiResponse({ status: 201, type: AdminNewsArticleDto })
  create(
    @Body() dto: CreateNewsArticleDto,
    @CurrentUser() user: { id: string },
  ): Promise<AdminNewsArticleDto> {
    return this.newsService.create(dto, user.id);
  }

  @Patch(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'News-Artikel aktualisieren' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AdminNewsArticleDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsArticleDto,
  ): Promise<AdminNewsArticleDto> {
    return this.newsService.update(id, dto);
  }

  @Patch(':id/publish')
  @AdminOnly()
  @ApiOperation({ summary: 'Veröffentlichungs-Status umschalten' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AdminNewsArticleDto })
  togglePublish(@Param('id') id: string): Promise<AdminNewsArticleDto> {
    return this.newsService.togglePublish(id);
  }

  @Delete(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'News-Artikel löschen' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.newsService.delete(id);
  }

  @Post(':id/test-send')
  @AdminOnly()
  @ApiOperation({ summary: 'Test-Mail an einzelne Adresse senden' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 201, type: NewsletterCampaignDto })
  testSend(
    @Param('id') id: string,
    @Body() dto: TestSendNewsletterDto,
    @CurrentUser() user: { id: string },
  ): Promise<NewsletterCampaignDto> {
    return this.newsService.testSend(id, dto.email, user.id);
  }

  @Post(':id/send')
  @AdminOnly()
  @ApiOperation({ summary: 'Newsletter an alle Abonnenten senden (sofort oder geplant)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 201, type: NewsletterCampaignDto })
  send(
    @Param('id') id: string,
    @Body() dto: SendNewsletterDto,
    @CurrentUser() user: { id: string },
  ): Promise<NewsletterCampaignDto> {
    return this.newsService.sendBulk(id, dto, user.id);
  }

  @Get(':id/campaigns')
  @AdminOnly()
  @ApiOperation({ summary: 'Versandhistorie eines Artikels' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: [NewsletterCampaignDto] })
  listCampaigns(@Param('id') id: string): Promise<NewsletterCampaignDto[]> {
    return this.newsService.listCampaigns(id);
  }
}

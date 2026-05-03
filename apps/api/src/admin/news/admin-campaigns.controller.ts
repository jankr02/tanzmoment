import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { AdminNewsService } from './admin-news.service';
import { NewsletterCampaignDto } from './dto/campaign-response.dto';

@ApiTags('Admin - Newsletter Campaigns')
@Controller('admin/campaigns')
export class AdminCampaignsController {
  constructor(private readonly newsService: AdminNewsService) {}

  @Post(':id/cancel')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Geplante Newsletter-Kampagne stornieren' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: NewsletterCampaignDto })
  cancel(@Param('id') id: string): Promise<NewsletterCampaignDto> {
    return this.newsService.cancelCampaign(id);
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NewsletterCampaignStatus, NewsletterCampaignType } from '@prisma/client';

export class NewsletterCampaignDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  articleId!: string;

  @ApiProperty({ enum: NewsletterCampaignType })
  type!: NewsletterCampaignType;

  @ApiProperty({ enum: NewsletterCampaignStatus })
  status!: NewsletterCampaignStatus;

  @ApiProperty()
  subject!: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  scheduledAt!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  startedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  completedAt!: string | null;

  @ApiProperty()
  recipientCount!: number;

  @ApiProperty()
  successCount!: number;

  @ApiProperty()
  failureCount!: number;

  @ApiPropertyOptional({ nullable: true })
  testRecipientEmail!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

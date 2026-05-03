import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NewsArticleStatus } from '@prisma/client';

export class AdminNewsListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: NewsArticleStatus })
  status!: NewsArticleStatus;

  @ApiPropertyOptional({ nullable: true })
  category!: string | null;

  @ApiPropertyOptional({ nullable: true })
  coverImageUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  publishedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  lastSentAt!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}

export class AdminNewsArticleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional({ nullable: true })
  excerpt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  category!: string | null;

  @ApiPropertyOptional({ nullable: true })
  coverImageUrl!: string | null;

  @ApiProperty({ description: 'Tiptap JSON-Dokument' })
  bodyJson!: Record<string, unknown>;

  @ApiProperty()
  bodyHtml!: string;

  @ApiProperty({ enum: NewsArticleStatus })
  status!: NewsArticleStatus;

  @ApiPropertyOptional({ nullable: true })
  metaTitle!: string | null;

  @ApiPropertyOptional({ nullable: true })
  metaDescription!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  publishedAt!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}

export class PaginatedAdminNewsDto {
  @ApiProperty({ type: [AdminNewsListItemDto] })
  items!: AdminNewsListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

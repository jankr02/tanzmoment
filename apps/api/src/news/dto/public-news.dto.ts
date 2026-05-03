import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicNewsListItemDto {
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

  @ApiProperty({ type: String, format: 'date-time' })
  publishedAt!: string;
}

export class PaginatedPublicNewsDto {
  @ApiProperty({ type: [PublicNewsListItemDto] })
  items!: PublicNewsListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  hasMore!: boolean;
}

export class PublicNewsArticleDto {
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

  @ApiProperty()
  bodyHtml!: string;

  @ApiPropertyOptional({ nullable: true })
  metaTitle!: string | null;

  @ApiPropertyOptional({ nullable: true })
  metaDescription!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  publishedAt!: string;
}

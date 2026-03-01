import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseStatus } from '@prisma/client';

const VALID_DANCE_STYLES = ['accessible', 'expressive', 'kids', 'mothers'];

export class AdminCourseQueryDto {
  @ApiPropertyOptional({
    description: 'Free-text search on course title',
    example: 'Ausdruckstanz',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by dance style',
    enum: VALID_DANCE_STYLES,
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_DANCE_STYLES)
  danceStyle?: string;

  @ApiPropertyOptional({
    description: 'Filter by course status',
    enum: CourseStatus,
  })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['title', 'createdAt', 'status', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['title', 'createdAt', 'status', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

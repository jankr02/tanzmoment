/**
 * Course Query DTO
 *
 * Query parameters for filtering and paginating courses.
 * Used by GET /api/courses endpoint.
 *
 * @example
 * GET /api/courses?danceStyle=expressive&location=moessingen&page=1&limit=5
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// Valid dance style IDs (must match frontend constants)
const VALID_DANCE_STYLES = ['accessible', 'expressive', 'kids', 'mothers'];

// Valid location IDs (must match frontend constants)
const VALID_LOCATIONS = ['moessingen', 'bodelshausen'];

export class CourseQueryDto {
  // ===========================================================================
  // FILTERS
  // ===========================================================================

  @ApiPropertyOptional({
    description: 'Filter by dance style ID',
    enum: VALID_DANCE_STYLES,
    example: 'expressive',
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_DANCE_STYLES, {
    message: `danceStyle must be one of: ${VALID_DANCE_STYLES.join(', ')}`,
  })
  danceStyle?: string;

  @ApiPropertyOptional({
    description: 'Filter by location ID',
    enum: VALID_LOCATIONS,
    example: 'moessingen',
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_LOCATIONS, {
    message: `location must be one of: ${VALID_LOCATIONS.join(', ')}`,
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter sessions starting from this date (ISO 8601)',
    example: '2025-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter sessions until this date (ISO 8601)',
    example: '2025-02-15T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Only return highlighted/featured courses',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  highlighted?: boolean;

  // ===========================================================================
  // PAGINATION
  // ===========================================================================

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 50,
    default: 5,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 5;
}

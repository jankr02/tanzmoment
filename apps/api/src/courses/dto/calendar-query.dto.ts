/**
 * Calendar Query DTO
 *
 * Query parameters for the public course-schedule calendar.
 * Used by GET /api/courses/sessions endpoint.
 *
 * @example
 * GET /api/courses/sessions?dateFrom=2026-06-08T00:00:00.000Z&dateTo=2026-06-14T23:59:59.999Z
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

// Valid dance style IDs (must match frontend constants)
const VALID_DANCE_STYLES = ['accessible', 'expressive', 'kids', 'mothers'];

export class CalendarQueryDto {
  @ApiPropertyOptional({
    description: 'Return sessions starting from this date (ISO 8601)',
    example: '2026-06-08T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Return sessions until this date (ISO 8601)',
    example: '2026-06-14T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Optionally pre-filter by dance style ID',
    enum: VALID_DANCE_STYLES,
    example: 'expressive',
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_DANCE_STYLES, {
    message: `danceStyle must be one of: ${VALID_DANCE_STYLES.join(', ')}`,
  })
  danceStyle?: string;
}

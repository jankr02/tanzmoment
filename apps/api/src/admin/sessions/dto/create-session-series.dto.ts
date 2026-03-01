import {
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsOptional,
  IsArray,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionSeriesDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
    minimum: 0,
    maximum: 6,
    example: 3,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '17:00',
  })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 90,
  })
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes: number;

  @ApiProperty({
    description: 'First date of the series (ISO 8601 date)',
    example: '2026-03-01',
  })
  @IsDateString()
  seriesStartDate: string;

  @ApiProperty({
    description: 'Last possible date of the series (ISO 8601 date)',
    example: '2026-06-30',
  })
  @IsDateString()
  seriesEndDate: string;

  @ApiProperty({ description: 'Location ID' })
  @IsString()
  locationId: string;

  @ApiPropertyOptional({
    description: 'Dates to exclude from the series (ISO 8601 dates)',
    type: [String],
    example: ['2026-04-10', '2026-04-17'],
  })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  excludeDates?: string[];
}

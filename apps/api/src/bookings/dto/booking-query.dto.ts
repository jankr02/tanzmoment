import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for listing bookings (authenticated user).
 */
export class BookingQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by booking status',
    enum: [
      'pending',
      'confirmed',
      'cancelled',
      'waitlist',
      'completed',
      'rejected',
      'no_show',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn(
    ['pending', 'confirmed', 'cancelled', 'waitlist', 'completed', 'rejected', 'no_show'],
    { message: 'Invalid booking status' },
  )
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by course ID',
  })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

// ============================================================================
// CANCEL BOOKING DTO
// ============================================================================

import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiPropertyOptional({
    description: 'Optional reason for cancellation',
    example: 'Schedule conflict',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

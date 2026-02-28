// ============================================================================
// ADMIN BATCH CANCEL DTO
// ============================================================================

import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminBatchCancelDto {
  @ApiProperty({
    description: 'Reason for cancellation (shown to participants)',
    example: 'Instructor unavailable due to illness',
  })
  @IsString()
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({
    description: 'Whether to process refunds for paid bookings (default: true)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  processRefunds?: boolean;

  @ApiPropertyOptional({
    description: 'Custom notification message (for Phase 7 email integration)',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notificationMessage?: string;
}

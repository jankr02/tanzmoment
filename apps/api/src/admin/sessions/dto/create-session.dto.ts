import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Session start time (ISO 8601)', example: '2026-03-15T17:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Session end time (ISO 8601)', example: '2026-03-15T18:30:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Location ID' })
  @IsString()
  locationId: string;
}

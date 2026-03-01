import { ApiProperty } from '@nestjs/swagger';

export class CalendarSessionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  courseTitle: string;

  @ApiProperty()
  danceStyle: string;

  @ApiProperty({ description: 'ISO 8601 datetime string' })
  startTime: string;

  @ApiProperty({ description: 'ISO 8601 datetime string' })
  endTime: string;

  @ApiProperty()
  locationName: string;

  @ApiProperty()
  bookedCount: number;

  @ApiProperty()
  maxParticipants: number;

  @ApiProperty()
  status: string;
}

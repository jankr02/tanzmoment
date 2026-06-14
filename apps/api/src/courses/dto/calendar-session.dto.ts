import { ApiProperty } from '@nestjs/swagger';

/**
 * Course metadata embedded in a calendar session.
 */
export class CalendarSessionCourseDto {
  @ApiProperty({ description: 'Course ID' })
  id: string;

  @ApiProperty({ description: 'Course title' })
  title: string;

  @ApiProperty({ description: 'URL-friendly course identifier' })
  slug: string;

  @ApiProperty({ description: 'Short marketing catch phrase', required: false })
  catchPhrase?: string;

  @ApiProperty({
    description: 'Dance style ID',
    enum: ['accessible', 'expressive', 'kids', 'mothers'],
  })
  danceStyle: string;

  @ApiProperty({ description: 'Target group label' })
  targetGroup: string;

  @ApiProperty({
    description: 'Course level',
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
  })
  level: string;

  @ApiProperty({ description: 'Course image URL', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Instructor full name' })
  instructorName: string;
}

/**
 * A single scheduled session for the public course-schedule calendar,
 * enriched with course metadata and real-time availability.
 */
export class CalendarSessionDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ description: 'Start time (ISO)' })
  startTime: string;

  @ApiProperty({ description: 'End time (ISO)' })
  endTime: string;

  @ApiProperty({ description: 'Location name' })
  location: string;

  @ApiProperty({ description: 'Total capacity' })
  maxParticipants: number;

  @ApiProperty({ description: 'Available spots (maxParticipants - bookedCount)' })
  availableSpots: number;

  @ApiProperty({ description: 'Course metadata', type: CalendarSessionCourseDto })
  course: CalendarSessionCourseDto;
}

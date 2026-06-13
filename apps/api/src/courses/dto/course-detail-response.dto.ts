import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR DTO
// ─────────────────────────────────────────────────────────────────────────────

export class CourseDetailInstructorDto {
  @ApiProperty({ description: 'Instructor ID' })
  id: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Biography' })
  bio?: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  imageUrl?: string;

  @ApiProperty({ description: 'Areas of expertise', type: [String] })
  expertise: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION DTO
// ─────────────────────────────────────────────────────────────────────────────

export class CourseDetailSessionDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ description: 'Start time (ISO)' })
  startTime: Date;

  @ApiProperty({ description: 'End time (ISO)' })
  endTime: Date;

  @ApiProperty({ description: 'Location' })
  location: string;

  @ApiProperty({
    description: 'Session status',
    enum: ['SCHEDULED', 'CANCELLED', 'COMPLETED'],
  })
  status: string;

  @ApiProperty({ description: 'Formatted date (e.g. "Mi, 18.12. • 17:00 Uhr")' })
  formattedDate: string;

  @ApiProperty({ description: 'Formatted time range (e.g. "17:00 – 18:30")' })
  formattedTime: string;

  @ApiProperty({ description: 'Number of available spots' })
  availableSpots: number;

  @ApiProperty({ description: 'Whether the session is fully booked' })
  isFullyBooked: boolean;

  @ApiPropertyOptional({ description: 'Optional CMS label (e.g. "Schnupperstunde")' })
  label?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RESPONSE DTO
// ─────────────────────────────────────────────────────────────────────────────

export class CourseDetailResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() slug: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional() catchPhrase?: string;
  @ApiProperty() shortDescription: string;
  @ApiProperty() description: string;
  @ApiProperty() danceStyle: string;
  @ApiProperty() targetGroup: string;
  @ApiProperty({ enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'] })
  level: string;
  @ApiProperty({ description: 'Duration in minutes' }) duration: number;
  @ApiProperty() maxParticipants: number;
  @ApiProperty({
    enum: ['FULL_COURSE', 'SINGLE_SESSION'],
    description: 'Whether the whole course or a single session is booked',
  })
  bookingMode: string;
  @ApiProperty({ description: 'Price in cents' }) priceInCents: number;
  @ApiProperty({ description: 'Price in euros (computed)' }) price: number;
  @ApiProperty({ description: 'Formatted price (e.g. "25 €" or "Kostenlos")' })
  priceFormatted: string;
  @ApiPropertyOptional() imageUrl?: string;

  @ApiPropertyOptional({ description: 'CMS-managed detail content (JSON)' })
  detailContent?: Record<string, unknown>;

  @ApiPropertyOptional() metaTitle?: string;
  @ApiPropertyOptional() metaDescription?: string;
  @ApiPropertyOptional() ogImageUrl?: string;

  @ApiProperty({ type: CourseDetailInstructorDto })
  instructor: CourseDetailInstructorDto;

  @ApiProperty({ type: [CourseDetailSessionDto] })
  sessions: CourseDetailSessionDto[];

  @ApiProperty({ description: 'Total number of upcoming sessions' })
  totalUpcomingSessions: number;

  @ApiProperty({ description: 'Available spots (based on next session)' })
  availableSpots: number;

  @ApiProperty({ description: 'Whether the course is fully booked' })
  isFullyBooked: boolean;
}

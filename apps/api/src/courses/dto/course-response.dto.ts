/**
 * Course List Response DTOs
 *
 * Response types for the paginated course list endpoint.
 * These DTOs shape the API response for GET /api/courses.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// =============================================================================
// SESSION DTO (for upcoming session info)
// =============================================================================

export class SessionInfoDto {
  @ApiProperty({
    description: 'Session start time',
    example: '2025-01-15T18:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'Session end time',
    example: '2025-01-15T19:30:00.000Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'Formatted date/time string for display',
    example: 'Mi, 15.01. • 18:00 Uhr',
  })
  startsAt: string;

  @ApiProperty({
    description: 'Session location',
    example: 'Mössingen',
  })
  location: string;
}

// =============================================================================
// INSTRUCTOR DTO (minimal info for list view)
// =============================================================================

export class InstructorInfoDto {
  @ApiProperty({
    description: 'Instructor ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Instructor first name',
    example: 'Sarah',
  })
  firstName: string;

  @ApiProperty({
    description: 'Instructor last name',
    example: 'Müller',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Instructor profile image URL',
    example: '/assets/images/instructors/sarah-mueller.jpg',
  })
  imageUrl?: string;
}

// =============================================================================
// COURSE LIST ITEM DTO
// =============================================================================

export class CourseListItemDto {
  @ApiProperty({
    description: 'Course ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'ausdruckstanz-frei-verbunden',
  })
  slug: string;

  @ApiProperty({
    description: 'Course title',
    example: 'Ausdruckstanz – frei & verbunden',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Catchy phrase for the course',
    example: 'Mein Tipp ...',
  })
  catchPhrase?: string;

  @ApiProperty({
    description: 'Short description for list view',
    example: 'Deinen wahren Ausdruck findest du nicht im Spiegel...',
  })
  shortDescription: string;

  @ApiProperty({
    description: 'Dance style ID',
    example: 'expressive',
  })
  danceStyle: string;

  @ApiProperty({
    description: 'Target group description',
    example: 'Erwachsene jeden Alters',
  })
  targetGroup: string;

  @ApiProperty({
    description: 'Course level',
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
    example: 'ALL_LEVELS',
  })
  level: string;

  @ApiProperty({
    description: 'Course duration in minutes',
    example: 90,
  })
  duration: number;

  @ApiProperty({
    description: 'Price in cents',
    example: 2500,
  })
  priceInCents: number;

  @ApiProperty({
    description: 'Price in euros',
    example: 25,
  })
  price: number;

  @ApiProperty({
    description: 'Formatted price string for display',
    example: '25 €',
  })
  priceFormatted: string;

  @ApiPropertyOptional({
    description: 'Course image URL',
    example: '/assets/images/courses/expressive-frei.jpg',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Whether course is highlighted/featured',
    example: true,
  })
  isMarkedAsHighlighted: boolean;

  @ApiProperty({
    description: 'Alias for isMarkedAsHighlighted (frontend compatibility)',
    example: true,
  })
  isHighlighted: boolean;

  @ApiProperty({
    description: 'Maximum number of participants',
    example: 12,
  })
  maxParticipants: number;

  @ApiProperty({
    description: 'Instructor information',
    type: InstructorInfoDto,
  })
  instructor: InstructorInfoDto;

  @ApiPropertyOptional({
    description: 'Next upcoming session (if any)',
    type: SessionInfoDto,
  })
  nextSession?: SessionInfoDto;

  @ApiProperty({
    description: 'Total number of upcoming sessions',
    example: 6,
  })
  upcomingSessionCount: number;
}

// =============================================================================
// PAGINATION META DTO
// =============================================================================

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Total number of items across all pages',
    example: 23,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number (1-indexed)',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 5,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there are more pages after current',
    example: true,
  })
  hasMore: boolean;
}

// =============================================================================
// PAGINATED RESPONSE DTO
// =============================================================================

export class PaginatedCoursesResponseDto {
  @ApiProperty({
    description: 'Array of courses for current page',
    type: [CourseListItemDto],
  })
  data: CourseListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

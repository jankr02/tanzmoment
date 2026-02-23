import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating a booking.
 *
 * Supports two modes:
 * 1. Authenticated user: userId extracted from JWT, guest fields ignored
 * 2. Guest: guestEmail + guestFirstName required, no JWT needed
 *
 * The controller validates that either a user is authenticated OR
 * guest fields are provided – this DTO only handles field-level validation.
 */
export class CreateBookingDto {
  @ApiProperty({
    description: 'Course ID to book',
    example: 'clx1234567890',
  })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({
    description:
      'Session ID for drop-in courses (SINGLE_SESSION mode). ' +
      'Omit for FULL_COURSE bookings.',
    example: 'clxsession123',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Optional notes from the participant',
    example: 'Ich bin Anfängerin, ist das okay?',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Notizen dürfen maximal 500 Zeichen lang sein.',
  })
  notes?: string;

  // ── Guest fields (only when not authenticated) ──

  @ApiPropertyOptional({
    description: 'Guest email (required for guest bookings)',
    example: 'gast@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an.' })
  guestEmail?: string;

  @ApiPropertyOptional({
    description: 'Guest first name (required for guest bookings)',
    example: 'Maria',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Vorname darf nicht leer sein.' })
  @MaxLength(100)
  guestFirstName?: string;

  @ApiPropertyOptional({
    description: 'Guest last name',
    example: 'Beispiel',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  guestLastName?: string;

  @ApiPropertyOptional({
    description: 'Guest phone number',
    example: '+49 123 456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  guestPhone?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// =============================================================================
// GUEST INFO DTO
// =============================================================================

export class GuestInfoDto {
  @ApiProperty({ example: 'gast@example.com' })
  email: string;

  @ApiProperty({ example: 'Maria' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Beispiel' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+49 123 456789' })
  phone?: string;
}

// =============================================================================
// BOOKING COURSE INFO (minimal, for list view)
// =============================================================================

export class BookingInstructorInfoDto {
  @ApiProperty({ example: 'Sarah' })
  firstName: string;

  @ApiProperty({ example: 'Becker' })
  lastName: string;

  @ApiPropertyOptional({ example: '/assets/images/instructors/sarah.jpg' })
  imageUrl?: string;
}

export class BookingCourseInfoDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'Ausdruckstanz – frei & verbunden' })
  title: string;

  @ApiProperty({ example: 'ausdruckstanz-frei-verbunden' })
  slug: string;

  @ApiProperty({ example: 'expressive' })
  danceStyle: string;

  @ApiPropertyOptional({ example: '/assets/images/courses/expressive.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ type: BookingInstructorInfoDto })
  instructor?: BookingInstructorInfoDto;
}

// =============================================================================
// BOOKING SESSION INFO (minimal)
// =============================================================================

export class BookingSessionInfoDto {
  @ApiProperty({ example: 'clxsession123' })
  id: string;

  @ApiProperty({ example: '2026-03-15T18:00:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2026-03-15T19:30:00.000Z' })
  endTime: string;

  @ApiProperty({ example: 'Mössingen' })
  location: string;
}

// =============================================================================
// BOOKING RESPONSE DTO
// =============================================================================

export class BookingPaymentInfoDto {
  @ApiProperty({ example: 'clpay123' })
  id: string;

  @ApiProperty({
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partial_refund', 'cancelled', 'expired'],
  })
  status: string;

  @ApiProperty({ example: 2500 })
  amountInCents: number;

  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiPropertyOptional({ example: '2026-02-25T12:00:00.000Z' })
  paidAt?: string;

  @ApiPropertyOptional({ example: 1250 })
  refundedAmount?: number;
}

export class BookingResponseDto {
  @ApiProperty({ example: 'clbook123' })
  id: string;

  @ApiProperty({
    enum: ['pending', 'confirmed', 'cancelled', 'waitlist', 'completed', 'rejected', 'no_show'],
  })
  status: string;

  @ApiProperty({ example: false })
  isGuestBooking: boolean;

  @ApiPropertyOptional()
  guestInfo?: GuestInfoDto;

  @ApiProperty({ type: BookingCourseInfoDto })
  course: BookingCourseInfoDto;

  @ApiPropertyOptional({ type: BookingSessionInfoDto })
  session?: BookingSessionInfoDto;

  @ApiPropertyOptional({ type: BookingPaymentInfoDto })
  payment?: BookingPaymentInfoDto;

  @ApiPropertyOptional({ example: 3 })
  waitlistPosition?: number;

  @ApiPropertyOptional({ example: 'Ich bin Anfängerin' })
  notes?: string;

  @ApiPropertyOptional({ example: 'user_request' })
  cancellationReason?: string;

  @ApiProperty({ example: '2026-02-23T10:00:00.000Z' })
  createdAt: string;

  @ApiPropertyOptional({ example: '2026-02-24T10:00:00.000Z' })
  cancelledAt?: string;
}

// =============================================================================
// CREATE BOOKING RESPONSE
// =============================================================================

export class CreateBookingResponseDto {
  @ApiProperty({ type: BookingResponseDto })
  booking: BookingResponseDto;

  @ApiPropertyOptional({
    description: 'Stripe checkout URL (null for free courses or waitlist)',
    example: null,
  })
  checkoutUrl: string | null;

  @ApiPropertyOptional({
    description: 'Payment info (null for waitlist bookings)',
  })
  payment?: {
    id: string;
    amountInCents: number;
    currency: string;
    status: string;
  };
}

// =============================================================================
// CANCEL BOOKING RESPONSE
// =============================================================================

export class CancelBookingResponseDto {
  @ApiProperty({ type: BookingResponseDto })
  booking: BookingResponseDto;

  @ApiProperty({
    description: 'Refund percentage applied',
    example: 100,
  })
  refundPercentage: number;

  @ApiProperty({
    description: 'Refund amount in cents',
    example: 2500,
  })
  refundAmountInCents: number;
}

// =============================================================================
// AVAILABILITY RESPONSE
// =============================================================================

export class AvailabilityResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  courseId: string;

  @ApiPropertyOptional({ example: 'clxsession123' })
  sessionId?: string;

  @ApiProperty({ example: 12 })
  maxParticipants: number;

  @ApiProperty({ example: 10 })
  confirmedBookings: number;

  @ApiProperty({ example: 2 })
  availableSpots: number;

  @ApiProperty({ example: 0 })
  waitlistCount: number;

  @ApiProperty({
    enum: ['available', 'few_spots', 'waitlist_available', 'full', 'not_open', 'cancelled'],
    example: 'available',
  })
  status: string;

  @ApiProperty({
    enum: ['full_course', 'single_session'],
    example: 'full_course',
  })
  bookingMode: string;
}

// =============================================================================
// PAGINATED BOOKINGS RESPONSE
// =============================================================================

export class PaginatedBookingsResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  data: BookingResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

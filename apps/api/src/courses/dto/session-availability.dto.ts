import { ApiProperty } from '@nestjs/swagger';

/**
 * Session with availability information.
 * Used for booking flow to display available spots and waitlist status.
 */
export class SessionAvailabilityDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @ApiProperty({ description: 'Start time (ISO)' })
  startTime: string;

  @ApiProperty({ description: 'End time (ISO)' })
  endTime: string;

  @ApiProperty({ description: 'Location' })
  location: string;

  @ApiProperty({
    description: 'Session status',
    enum: ['SCHEDULED', 'CANCELLED', 'COMPLETED'],
  })
  status: string;

  @ApiProperty({ description: 'Total capacity' })
  maxParticipants: number;

  @ApiProperty({ description: 'Current confirmed bookings' })
  bookedCount: number;

  @ApiProperty({ description: 'Available spots (maxParticipants - bookedCount)' })
  availableSpots: number;

  @ApiProperty({
    description: 'Whether current user already has a booking (always false for guests)',
  })
  userHasBooking: boolean;

  @ApiProperty({ description: 'Waitlist count' })
  waitlistCount: number;
}

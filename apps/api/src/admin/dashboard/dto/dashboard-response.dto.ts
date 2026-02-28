import { ApiProperty } from '@nestjs/swagger';

export class SessionSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courseTitle: string;

  @ApiProperty()
  danceStyle: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  locationName: string;

  @ApiProperty()
  bookedCount: number;

  @ApiProperty()
  maxParticipants: number;

  @ApiProperty({ description: 'Occupancy as percentage (0-100)' })
  occupancy: number;
}

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total bookings this week' })
  bookingsThisWeek: number;

  @ApiProperty({ description: 'Revenue this month in cents' })
  revenueThisMonth: number;

  @ApiProperty({ description: 'Average occupancy percentage across upcoming sessions' })
  averageOccupancy: number;

  @ApiProperty({ description: 'Total active customers' })
  activeCustomers: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: [SessionSummaryDto] })
  upcomingSessions: SessionSummaryDto[];

  @ApiProperty({ description: 'Number of bookings with status PENDING' })
  pendingBookings: number;

  @ApiProperty({ description: 'Number of bookings with status WAITLISTED' })
  waitlistEntries: number;

  @ApiProperty({ type: [SessionSummaryDto], description: 'Sessions with 0 bookings in next 7 days' })
  emptySessions: SessionSummaryDto[];

  @ApiProperty({ description: 'Number of bookings with unpaid payments' })
  unpaidBookings: number;

  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;
}

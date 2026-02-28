export interface SessionSummary {
  id: string;
  courseTitle: string;
  danceStyle: string;
  startTime: string;
  endTime: string;
  locationName: string;
  bookedCount: number;
  maxParticipants: number;
  occupancy: number;
}

export interface DashboardStats {
  bookingsThisWeek: number;
  revenueThisMonth: number;
  averageOccupancy: number;
  activeCustomers: number;
}

export interface DashboardResponse {
  upcomingSessions: SessionSummary[];
  pendingBookings: number;
  waitlistEntries: number;
  emptySessions: SessionSummary[];
  unpaidBookings: number;
  stats: DashboardStats;
}

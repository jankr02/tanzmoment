export interface AdminCourseListItem {
  id: string;
  slug: string;
  title: string;
  danceStyle: string;
  status: string;
  visibility: string;
  isPublished: boolean;
  level: string;
  priceInCents: number;
  priceFormatted: string;
  maxParticipants: number;
  instructorName: string;
  totalSessions: number;
  upcomingSessions: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCourseDetail {
  id: string;
  slug: string;
  title: string;
  catchPhrase?: string;
  shortDescription: string;
  description: string;
  danceStyle: string;
  targetGroup: string;
  level: string;
  duration: number;
  maxParticipants: number;
  priceInCents: number;
  priceInEuros: number;
  imageUrl?: string;
  bookingMode: string;
  isFree: boolean;
  isPublished: boolean;
  isMarkedAsHighlighted: boolean;
  status: string;
  visibility: string;
  detailContent?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  cancellationPolicyId?: string;
  instructorId: string;
  instructor: { id: string; firstName: string; lastName: string };
  sessions: AdminSession[];
  totalBookings: number;
  activeBookings: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  locationId: string;
  locationName: string;
  bookedCount: number;
  maxParticipants: number;
  waitlistCount: number;
}

export interface AdminCourseListResponse {
  data: AdminCourseListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface AdminCourseQueryParams {
  search?: string;
  danceStyle?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCourseRequest {
  title: string;
  shortDescription: string;
  description: string;
  danceStyle: string;
  targetGroup: string;
  level: string;
  duration: number;
  maxParticipants: number;
  priceInEuros: number;
  bookingMode: string;
  catchPhrase?: string;
  imageUrl?: string;
  isFree?: boolean;
  visibility?: string;
  isMarkedAsHighlighted?: boolean;
  instructorId?: string;
  metaTitle?: string;
  metaDescription?: string;
  cancellationPolicyId?: string;
  detailContent?: Record<string, unknown>;
}

export interface CreateSessionRequest {
  courseId: string;
  startTime: string;
  endTime: string;
  locationId: string;
}

export interface CreateSessionSeriesRequest {
  courseId: string;
  weekday: number;
  startTime: string;
  durationMinutes: number;
  seriesStartDate: string;
  seriesEndDate: string;
  locationId: string;
  excludeDates?: string[];
}

export interface AdminLocation {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export interface SessionParticipant {
  bookingId: string;
  name: string;
  email: string;
  phone?: string;
  isGuest: boolean;
  bookingStatus: string;
  paymentStatus?: string;
}

export { adminAuthGuard } from './lib/guards/admin-auth.guard';
export { AdminApiService } from './lib/services/admin-api.service';
export type {
  DashboardResponse,
  DashboardStats,
  SessionSummary,
} from './lib/types/dashboard.types';
export type {
  AdminCourseListItem,
  AdminCourseDetail,
  AdminSession,
  AdminCourseListResponse,
  AdminCourseQueryParams,
  CreateCourseRequest,
  CreateSessionRequest,
  CreateSessionSeriesRequest,
  AdminLocation,
  SessionParticipant,
} from './lib/types/course.types';
export type {
  AdminBookingListItem,
  AdminBookingDetail,
  BookingListFilters,
  BookingListMeta,
  BookingListResponse,
} from './lib/types/booking.types';
export type {
  CalendarSession,
  CalendarView,
  CalendarDay,
} from './lib/types/calendar.types';

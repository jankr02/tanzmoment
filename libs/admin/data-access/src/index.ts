export { adminAuthGuard } from './lib/guards/admin-auth.guard';
export { AdminApiService } from './lib/services/admin-api.service';
export { AdminNewsService } from './lib/services/admin-news.service';
export type {
  NewsArticleStatus,
  NewsletterCampaignStatus,
  NewsletterCampaignType,
  AdminNewsListItem,
  AdminNewsArticle,
  PaginatedAdminNews,
  AdminNewsListQuery,
  CreateNewsArticleRequest,
  UpdateNewsArticleRequest,
  UploadResponse,
  NewsletterCampaign,
  SendNewsletterRequest,
  TestSendNewsletterRequest,
} from './lib/types/news.types';
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
export type {
  AdminCustomerListItem,
  AdminCustomerDetail,
  AdminCustomerBooking,
  CustomerNote,
  CustomerListFilters,
  CustomerListMeta,
  CustomerListResponse,
} from './lib/types/customer.types';
export type {
  FinanceSummary,
  FinancePayment,
  FinancePaymentUser,
  MonthlyRevenueStat,
  FinancePaymentFilters,
  FinanceListMeta,
  FinancePaymentListResponse,
} from './lib/types/finance.types';
export type {
  StudioSettings,
  UpdateStudioSettingsRequest,
  ChangePasswordRequest,
} from './lib/types/settings.types';

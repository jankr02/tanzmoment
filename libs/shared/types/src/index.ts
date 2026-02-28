/**
 * @tanzmoment/shared/types
 *
 * Shared type definitions and constants for Tanzmoment.
 *
 * @example
 * ```typescript
 * import {
 *   DANCE_STYLES,
 *   LOCATIONS,
 *   DanceStyleId,
 *   PaginatedResponse,
 *   CourseStatus,
 *   BookingStatus,
 *   PaymentStatus,
 * } from '@tanzmoment/shared/types';
 * ```
 */

// =============================================================================
// DANCE STYLES
// =============================================================================
export {
  // Types
  type DanceStyleConfig,
  type DanceStyleId,
  type DanceStyleValue,
  // Constants
  DANCE_STYLES,
  DANCE_STYLE_IDS,
  DANCE_STYLE_ID_VALUES,
  DANCE_STYLE_OPTIONS,
  // Helpers
  getDanceStyleById,
  isValidDanceStyleId,
} from './lib/dance-style.types';

// =============================================================================
// LOCATIONS
// =============================================================================
export {
  // Types
  type LocationConfig,
  type LocationId,
  type LocationValue,
  // Constants
  LOCATIONS,
  LOCATION_IDS,
  LOCATION_ID_VALUES,
  LOCATION_OPTIONS,
  // Helpers
  getLocationById,
  isValidLocationId,
} from './lib/location.types';

// =============================================================================
// PAGINATION
// =============================================================================
export {
  // Types
  type PaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
  // Constants
  PAGINATION_DEFAULTS,
  // Helpers
  calculatePaginationMeta,
  calculateSkip,
  normalizePaginationParams,
} from './lib/pagination.types';

// =============================================================================
// COURSE FILTERS
// =============================================================================
export {
  // Types
  type CourseFilterState,
  type CourseFilterParams,
  // Constants
  INITIAL_FILTER_STATE,
  // Helpers
  filterStateToParams,
  hasActiveFilters,
  countActiveFilters,
} from './lib/course-filter.types';

// =============================================================================
// COURSE STATUS
// =============================================================================
export {
  // Enums
  CourseStatus,
  SessionStatus,
  CourseVisibility,
  // Types
  type CourseStatusMeta,
  type SessionStatusMeta,
  // Constants
  COURSE_STATUS_META,
  SESSION_STATUS_META,
  COURSE_VISIBILITY_LABELS,
  // Helpers
  isCourseBookable,
  isCourseVisible,
  isSessionUpcoming,
  isSessionCancelled,
  getAllowedCourseStatusTransitions,
  getAllowedSessionStatusTransitions,
} from './lib/course-status.types';

// =============================================================================
// BOOKING
// =============================================================================
export {
  // Enums
  BookingMode,
  BookingStatus,
  CancellationReason,
  // Types
  type BookingStatusMeta,
  type Booking,
  type GuestInfo,
  type CreateBookingRequest,
  type CreateBookingResponse,
  type UpdateBookingRequest,
  type CancelBookingRequest,
  type CancelBookingResponse,
  // Constants
  BOOKING_MODE_LABELS,
  BOOKING_STATUS_META,
  CANCELLATION_REASON_LABELS,
  // Helpers
  isBookingActive,
  isBookingCancellable,
  requiresAccount,
  getAllowedStatusTransitions,
} from './lib/booking.types';

// =============================================================================
// CANCELLATION POLICY
// =============================================================================
export {
  // Types
  type CancellationPolicy,
  type RefundTier,
  // Constants
  DEFAULT_CANCELLATION_POLICY,
  NO_CANCELLATION_POLICY,
  FREE_CANCELLATION_POLICY,
  // Helpers
  resolveRefundPercentage,
  getRefundInfo,
  validateCancellationPolicy,
} from './lib/cancellation-policy.types';

// =============================================================================
// AVAILABILITY
// =============================================================================
export {
  // Enums
  AvailabilityStatus,
  // Types
  type AvailabilityInfo,
  // Constants
  AVAILABILITY_STATUS_META,
  // Helpers
  deriveAvailabilityStatus,
} from './lib/availability.types';

// =============================================================================
// PAYMENT
// =============================================================================
export {
  // Enums
  PaymentStatus,
  PaymentMethod,
  Currency,
  // Types
  type PaymentStatusMeta,
  type Payment,
  type PriceDisplay,
  // Constants
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  CURRENCY_SYMBOLS,
  DEFAULT_CURRENCY,
  // Helpers
  formatPrice,
  createPriceDisplay,
  isPaymentSuccessful,
  isPaymentPending,
  isPaymentFailed,
  isPaymentRefundable,
  getAllowedPaymentTransitions,
} from './lib/payment.types';

// =============================================================================
// CANCELLATION – Phase 6 (CancelledBy, RefundType, RefundCalculation, batch)
// =============================================================================
export {
  // Enums
  CancelledBy,
  RefundType,
  // Types
  type RefundCalculation,
  type AdminBatchCancelRequest,
  type AdminBatchCancelResponse,
  // Helpers
  hoursUntil,
  calculateRefund,
} from './lib/cancellation.types';

// =============================================================================
// BOOKING API (Frontend ↔ Backend communication types)
// =============================================================================
export type {
  SessionAvailability,
  CreateBookingApiRequest,
  CreateBookingApiResponse,
  BookingDetail,
  CancellationPreview,
  StripeRedirectParams,
} from './lib/booking-api.types';

// =============================================================================
// COURSE DETAIL CONTENT
// =============================================================================
export {
  // Root
  type CourseDetailContent,
  // Section types
  type CourseDetailHeroContent,
  type CourseDetailQuickFactsContent,
  type CourseDetailDescriptionContent,
  type CourseDetailInstructorContent,
  type CourseDetailScheduleContent,
  type CourseDetailBookingContent,
  // V2 types (prepared)
  type CourseDetailCourseFlowContent,
  type CourseDetailSocialProofContent,
  type CourseDetailFaqContent,
  // Sub-types
  type QuickFactType,
  type CustomFact,
  type CourseHighlight,
  type CourseFlowStep,
  type Testimonial,
  type FaqItem,
  // Constants
  EMPTY_COURSE_DETAIL_CONTENT,
} from './lib/course-detail-content.types';

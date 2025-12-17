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
  BookingStatus,
  CancellationReason,
  // Types
  type BookingStatusMeta,
  type Booking,
  type CreateBookingRequest,
  type UpdateBookingRequest,
  // Constants
  BOOKING_STATUS_META,
  CANCELLATION_REASON_LABELS,
  // Helpers
  isBookingActive,
  isBookingCancellable,
  getAllowedStatusTransitions,
} from './lib/booking.types';

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

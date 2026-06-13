// ============================================================================
// BOOKING TYPES
// ============================================================================
// Booking system types with support for:
// - Full-course and single-session booking modes
// - Guest checkout (no account required)
// - Configurable cancellation policies
// Enums synchronized with Prisma schema
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING MODE ENUM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines how a course can be booked.
 *
 * FULL_COURSE: One booking covers all sessions (default)
 * SINGLE_SESSION: Users pick individual sessions (drop-in)
 *
 * @prisma enum BookingMode
 */
export enum BookingMode {
  /** Book entire course – all sessions included in one booking */
  FULL_COURSE = 'FULL_COURSE',

  /** Book individual sessions – drop-in style */
  SINGLE_SESSION = 'SINGLE_SESSION',
}

export const BOOKING_MODE_LABELS: Record<BookingMode, string> = {
  [BookingMode.FULL_COURSE]: 'Gesamter Kurs',
  [BookingMode.SINGLE_SESSION]: 'Einzelne Termine',
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING STATUS ENUM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status of a booking
 *
 * Happy path (paid):     PENDING → CONFIRMED → COMPLETED
 * Happy path (free):     PENDING → CONFIRMED → COMPLETED
 * Waitlist path:         WAITLIST → PENDING → CONFIRMED → COMPLETED
 * Cancellation:          PENDING/CONFIRMED/WAITLIST → CANCELLED
 * Rejection:             PENDING → REJECTED
 * No-show:               CONFIRMED → NO_SHOW
 * Payment failure:       PENDING → CANCELLED (reason: PAYMENT_FAILED)
 *
 * @prisma enum BookingStatus
 */
export enum BookingStatus {
  /** Booking request received, awaiting payment or confirmation */
  PENDING = 'pending',

  /** Spot is confirmed, participant is registered */
  CONFIRMED = 'confirmed',

  /** Booking was cancelled (by user, admin, or system) */
  CANCELLED = 'cancelled',

  /** On waitlist – course is full, requires account */
  WAITLIST = 'waitlist',

  /** Course/session was attended and completed */
  COMPLETED = 'completed',

  /** Booking rejected (e.g., prerequisites not met) */
  REJECTED = 'rejected',

  /** Participant did not show up without cancellation */
  NO_SHOW = 'no_show',
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING STATUS METADATA
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingStatusMeta {
  label: string;
  labelShort: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

export const BOOKING_STATUS_META: Record<BookingStatus, BookingStatusMeta> = {
  [BookingStatus.PENDING]: {
    label: 'Ausstehend',
    labelShort: 'Offen',
    color: '#B8860B',
    bgColor: '#FEF3C7',
    icon: 'clock',
    description: 'Buchungsanfrage wird bearbeitet',
  },
  [BookingStatus.CONFIRMED]: {
    label: 'Bestätigt',
    labelShort: 'Bestätigt',
    color: '#059669',
    bgColor: '#D1FAE5',
    icon: 'check-circle',
    description: 'Platz ist reserviert',
  },
  [BookingStatus.CANCELLED]: {
    label: 'Storniert',
    labelShort: 'Storniert',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'x-circle',
    description: 'Buchung wurde storniert',
  },
  [BookingStatus.WAITLIST]: {
    label: 'Warteliste',
    labelShort: 'Wartet',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    icon: 'users',
    description: 'Auf der Warteliste (Account erforderlich)',
  },
  [BookingStatus.COMPLETED]: {
    label: 'Abgeschlossen',
    labelShort: 'Fertig',
    color: '#374151',
    bgColor: '#F3F4F6',
    icon: 'check',
    description: 'Kurs wurde besucht',
  },
  [BookingStatus.REJECTED]: {
    label: 'Abgelehnt',
    labelShort: 'Abgelehnt',
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    icon: 'ban',
    description: 'Buchung wurde abgelehnt',
  },
  [BookingStatus.NO_SHOW]: {
    label: 'Nicht erschienen',
    labelShort: 'No-Show',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'user-x',
    description: 'Nicht erschienen ohne Absage',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CANCELLATION REASON
// ─────────────────────────────────────────────────────────────────────────────

export enum CancellationReason {
  USER_REQUEST = 'user_request',
  STUDIO_CANCELLED = 'studio_cancelled',
  COURSE_CANCELLED = 'course_cancelled',
  PAYMENT_FAILED = 'payment_failed',
  OTHER = 'other',
}

export const CANCELLATION_REASON_LABELS: Record<CancellationReason, string> = {
  [CancellationReason.USER_REQUEST]: 'Auf Wunsch des Teilnehmers',
  [CancellationReason.STUDIO_CANCELLED]: 'Vom Studio storniert',
  [CancellationReason.COURSE_CANCELLED]: 'Kurs wurde abgesagt',
  [CancellationReason.PAYMENT_FAILED]: 'Zahlung fehlgeschlagen',
  [CancellationReason.OTHER]: 'Sonstiger Grund',
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Booking (frontend representation)
 *
 * A booking links either a registered user (userId) or a guest
 * (guestEmail + guestFirstName) to a course or session.
 */
export interface Booking {
  id: string;

  /** Registered user (null for guest bookings) */
  userId?: string;

  /** Course reference (always present) */
  courseId: string;

  /** Session reference (only for SINGLE_SESSION mode) */
  sessionId?: string;

  /** Current booking status */
  status: BookingStatus;

  /** Waitlist position (only for WAITLIST status) */
  waitlistPosition?: number;

  /** Cancellation reason (only for CANCELLED status) */
  cancellationReason?: CancellationReason;

  /** Optional notes from the participant */
  notes?: string;

  /** Guest info (only for guest bookings) */
  guestInfo?: GuestInfo;

  /** Whether this is a guest booking (derived) */
  isGuestBooking: boolean;

  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
}

/**
 * Guest information for bookings without account
 */
export interface GuestInfo {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST / RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create booking request – works for both registered users and guests.
 *
 * For registered users: userId is extracted from JWT, guest fields omitted.
 * For guests: guestEmail + guestFirstName required.
 */
export interface CreateBookingRequest {
  courseId: string;

  /** Required for SINGLE_SESSION mode, omitted for FULL_COURSE */
  sessionId?: string;

  /** Optional notes from the participant */
  notes?: string;

  /** Guest fields (only when not authenticated) */
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
}

/**
 * Booking creation response – includes checkout URL for paid courses
 */
export interface CreateBookingResponse {
  booking: Booking;

  /** Stripe checkout URL (null for free courses or waitlist) */
  checkoutUrl: string | null;

  /** Payment info (null for waitlist) */
  payment?: {
    id: string;
    amountInCents: number;
    currency: string;
    status: string;
  };
}

/**
 * Update booking (admin only)
 */
export interface UpdateBookingRequest {
  status?: BookingStatus;
  notes?: string;
  cancellationReason?: CancellationReason;
}

/**
 * Cancel booking request
 */
export interface CancelBookingRequest {
  /** Required for guest cancellation via token */
  cancellationToken?: string;

  /** Optional reason */
  reason?: string;
}

/**
 * Cancel booking response
 */
export interface CancelBookingResponse {
  booking: Booking;
  refundPercentage: number;
  refundAmountInCents: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if booking is in an active state (not terminal)
 */
export function isBookingActive(status: BookingStatus): boolean {
  return ![
    BookingStatus.CANCELLED,
    BookingStatus.REJECTED,
    BookingStatus.NO_SHOW,
    BookingStatus.COMPLETED,
  ].includes(status);
}

/**
 * Checks if booking can be cancelled by the user
 */
export function isBookingCancellable(status: BookingStatus): boolean {
  return [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.WAITLIST,
  ].includes(status);
}

/**
 * Checks if a booking requires a registered account.
 * Currently only waitlist requires an account.
 */
export function requiresAccount(status: BookingStatus): boolean {
  return status === BookingStatus.WAITLIST;
}

/**
 * Returns allowed status transitions for a given booking status.
 * Used for validation in both frontend and backend.
 */
export function getAllowedStatusTransitions(
  currentStatus: BookingStatus
): BookingStatus[] {
  const transitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.REJECTED,
      BookingStatus.WAITLIST,
    ],
    [BookingStatus.CONFIRMED]: [
      BookingStatus.CANCELLED,
      BookingStatus.COMPLETED,
      BookingStatus.NO_SHOW,
    ],
    [BookingStatus.WAITLIST]: [
      BookingStatus.PENDING, // Promoted from waitlist
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.REJECTED]: [],
    [BookingStatus.NO_SHOW]: [],
  };

  return transitions[currentStatus] ?? [];
}

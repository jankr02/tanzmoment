// ============================================================================
// BOOKING TYPES
// ============================================================================
// Types for the booking system
// Enums synchronized with Prisma schema
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING STATUS ENUM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status of a booking
 *
 * Flow: PENDING → CONFIRMED → COMPLETED
 *       PENDING → CANCELLED
 *       PENDING → WAITLIST → CONFIRMED
 *
 * @prisma enum BookingStatus
 */
export enum BookingStatus {
  /** Booking request received, not yet confirmed */
  PENDING = 'pending',

  /** Spot is confirmed, participant is registered */
  CONFIRMED = 'confirmed',

  /** Booking was cancelled (by user or admin) */
  CANCELLED = 'cancelled',

  /** On waitlist - course is full */
  WAITLIST = 'waitlist',

  /** Course was completed */
  COMPLETED = 'completed',

  /** Booking rejected (e.g., prerequisites not met) */
  REJECTED = 'rejected',

  /** No-show: Did not appear without cancellation */
  NO_SHOW = 'no_show',
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING STATUS METADATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metadata for BookingStatus (labels, colors, icons)
 */
export interface BookingStatusMeta {
  label: string;
  labelShort: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

/**
 * Metadata for all BookingStatus values
 */
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
    description: 'Auf der Warteliste',
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

/**
 * Cancellation reasons
 */
export enum CancellationReason {
  /** Cancellation by participant */
  USER_REQUEST = 'user_request',

  /** Cancellation by studio */
  STUDIO_CANCELLED = 'studio_cancelled',

  /** Course cancelled */
  COURSE_CANCELLED = 'course_cancelled',

  /** Payment failed */
  PAYMENT_FAILED = 'payment_failed',

  /** No reason given */
  OTHER = 'other',
}

/**
 * Labels for cancellation reasons
 */
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
 */
export interface Booking {
  id: string;

  /** Reference to user */
  userId: string;

  /** Reference to course */
  courseId: string;

  /** Reference to session (optional, for single appointments) */
  sessionId?: string;

  /** Current status */
  status: BookingStatus;

  /** Position on waitlist (only for WAITLIST) */
  waitlistPosition?: number;

  /** Cancellation reason (only for CANCELLED) */
  cancellationReason?: CancellationReason;

  /** Notes for the booking */
  notes?: string;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;

  /** Cancellation timestamp */
  cancelledAt?: string;
}

/**
 * Booking request (for POST /bookings)
 */
export interface CreateBookingRequest {
  courseId: string;
  sessionId?: string;
  notes?: string;
}

/**
 * Booking update (for PATCH /bookings/:id)
 */
export interface UpdateBookingRequest {
  status?: BookingStatus;
  notes?: string;
  cancellationReason?: CancellationReason;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if booking is active (not cancelled/rejected)
 */
export function isBookingActive(status: BookingStatus): boolean {
  return ![
    BookingStatus.CANCELLED,
    BookingStatus.REJECTED,
    BookingStatus.NO_SHOW,
  ].includes(status);
}

/**
 * Checks if booking can be cancelled
 */
export function isBookingCancellable(status: BookingStatus): boolean {
  return [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.WAITLIST,
  ].includes(status);
}

/**
 * Returns allowed status transitions
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

// ============================================================================
// BOOKING API TYPES
// ============================================================================
// Types for frontend ↔ backend communication.
// Supports both authenticated and guest booking flows.
// ============================================================================

import { BookingStatus } from './booking.types';

// ─────────────────────────────────────────────────────────────────────────────
// SESSION AVAILABILITY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Session with availability info (returned by API for booking context).
 */
export interface SessionAvailability {
  id: string;
  courseId: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;

  /** Total capacity */
  maxParticipants: number;

  /** Current confirmed bookings */
  bookedCount: number;

  /** Available spots (maxParticipants - bookedCount) */
  availableSpots: number;

  /** Whether current user already has a booking (always false for guests) */
  userHasBooking: boolean;

  /** Waitlist count */
  waitlistCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING REQUEST / RESPONSE (API-specific)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /bookings – Request body.
 *
 * Two modes:
 * - Authenticated: courseId + sessionId needed (userId from JWT)
 * - Guest: courseId + sessionId + guestEmail + guestFirstName required
 */
export interface CreateBookingApiRequest {
  courseId: string;
  /** Required for SINGLE_SESSION courses; omitted for FULL_COURSE bookings. */
  sessionId?: string;
  notes?: string;

  /** Guest fields (required when not authenticated) */
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
}

/**
 * POST /bookings – Response body.
 */
export interface CreateBookingApiResponse {
  booking: {
    id: string;
    status: BookingStatus;
    sessionId: string;
    waitlistPosition?: number;
    /** Token for guest cancellation (only for guest bookings) */
    cancellationToken?: string;
  };

  /** Stripe checkout URL for paid courses (redirect the user here) */
  checkoutUrl?: string;

  /** Whether booking is immediately confirmed (free courses) */
  isConfirmed: boolean;

  /** Whether user was placed on waitlist */
  isWaitlisted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING DETAIL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /bookings/:id – Full booking detail.
 *
 * Mirrors the backend `BookingResponseDto` shape (status/payment.status are
 * lowercase strings on the wire).
 */
export interface BookingDetail {
  id: string;
  status: string;
  waitlistPosition?: number;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  cancelledAt?: string;

  isGuestBooking: boolean;

  guestInfo?: {
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  };

  course: {
    id: string;
    title: string;
    slug: string;
    danceStyle: string;
    imageUrl?: string;
    instructor?: {
      firstName: string;
      lastName: string;
      imageUrl?: string;
    };
  };

  session?: {
    id: string;
    startTime: string;
    endTime: string;
    location: string;
  };

  payment?: {
    id: string;
    status: string;
    amountInCents: number;
    currency: string;
    paidAt?: string;
    refundedAmount?: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CANCELLATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /bookings/:id/cancellation-preview
 */
export interface CancellationPreview {
  bookingId: string;
  canCancel: boolean;
  refundType: 'full' | 'partial' | 'none';
  refundAmountInCents: number;
  refundPercent: number;
  originalAmountInCents: number;
  policyName: string;
  explanation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE REDIRECT PARAMS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Query params on redirect from Stripe.
 */
export interface StripeRedirectParams {
  bookingId: string;
  sessionId: string;
}

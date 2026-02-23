// ============================================================================
// AVAILABILITY TYPES
// ============================================================================
// Types for checking and displaying course/session availability.
// Used by the public availability endpoint and the booking form UI.
// ============================================================================

/**
 * Availability status for display logic
 */
export enum AvailabilityStatus {
  /** Spots available for booking */
  AVAILABLE = 'available',

  /** Few spots remaining (threshold: <= 3) */
  FEW_SPOTS = 'few_spots',

  /** No spots available, waitlist is possible */
  WAITLIST_AVAILABLE = 'waitlist_available',

  /** Fully booked, no waitlist */
  FULL = 'full',

  /** Registration/booking not yet open */
  NOT_OPEN = 'not_open',

  /** Course/session has been cancelled */
  CANCELLED = 'cancelled',
}

export const AVAILABILITY_STATUS_META: Record<
  AvailabilityStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  [AvailabilityStatus.AVAILABLE]: {
    label: 'Plätze verfügbar',
    color: '#059669',
    bgColor: '#D1FAE5',
    icon: 'check-circle',
  },
  [AvailabilityStatus.FEW_SPOTS]: {
    label: 'Nur noch wenige Plätze',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'alert-triangle',
  },
  [AvailabilityStatus.WAITLIST_AVAILABLE]: {
    label: 'Warteliste verfügbar',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    icon: 'users',
  },
  [AvailabilityStatus.FULL]: {
    label: 'Ausgebucht',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'x-circle',
  },
  [AvailabilityStatus.NOT_OPEN]: {
    label: 'Anmeldung noch nicht geöffnet',
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    icon: 'clock',
  },
  [AvailabilityStatus.CANCELLED]: {
    label: 'Abgesagt',
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    icon: 'ban',
  },
};

/**
 * Availability information returned by the public endpoint.
 * No sensitive data (user lists, etc.) exposed.
 */
export interface AvailabilityInfo {
  /** Course or session ID this applies to */
  courseId: string;
  sessionId?: string;

  /** Capacity */
  maxParticipants: number;
  confirmedBookings: number;
  availableSpots: number;

  /** Waitlist */
  waitlistCount: number;

  /** Derived status for display */
  status: AvailabilityStatus;

  /** Booking mode of the course */
  bookingMode: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Threshold for "few spots" warning */
const FEW_SPOTS_THRESHOLD = 3;

/**
 * Derives the availability status from raw numbers.
 * Used in both backend (API response) and frontend (display logic).
 */
export function deriveAvailabilityStatus(
  availableSpots: number,
  waitlistEnabled: boolean,
  isCancelled: boolean
): AvailabilityStatus {
  if (isCancelled) return AvailabilityStatus.CANCELLED;
  if (availableSpots > FEW_SPOTS_THRESHOLD) return AvailabilityStatus.AVAILABLE;
  if (availableSpots > 0) return AvailabilityStatus.FEW_SPOTS;
  if (waitlistEnabled) return AvailabilityStatus.WAITLIST_AVAILABLE;
  return AvailabilityStatus.FULL;
}

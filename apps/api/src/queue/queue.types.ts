/**
 * Job payload types for type-safe queue operations.
 */

export interface BookingExpiryJobData {
  bookingId: string;
  reason: 'pending_timeout' | 'waitlist_promotion_timeout';
}

export interface WaitlistPromotionJobData {
  courseId: string;
  sessionId: string | null;
}

export interface SessionReminderJobData {
  bookingId: string;
  sessionId: string;
  userId: string | null;
  guestEmail: string | null;
}

/** Empty payload for scheduled maintenance jobs */
export interface MaintenanceJobData {
  triggeredBy: 'cron' | 'manual';
}

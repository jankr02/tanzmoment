/**
 * Queue names used across the application.
 * Each queue maps to one BullMQ processor.
 */
export const QUEUE_NAMES = {
  BOOKING_EXPIRY: 'booking-expiry',
  WAITLIST_PROMOTION: 'waitlist-promotion',
  SESSION_REMINDER: 'session-reminder',
  MAINTENANCE: 'maintenance',
  BATCH_REFUND: 'batch-refund',
  NEWSLETTER_SEND: 'newsletter-send',
} as const;

/**
 * Job names within each queue.
 */
export const JOB_NAMES = {
  EXPIRE_PENDING: 'expire-pending',
  EXPIRE_WAITLIST_PROMOTION: 'expire-waitlist-promotion',
  PROMOTE_NEXT: 'promote-next',
  SEND_REMINDER: 'send-reminder',

  // maintenance queue
  RECONCILE_PAYMENTS: 'reconcile-payments',
  CLEANUP_WEBHOOK_EVENTS: 'cleanup-webhook-events',
  GDPR_CLEANUP: 'gdpr-cleanup',

  // batch-refund queue
  PROCESS_BATCH_REFUND: 'process-batch-refund',

  // newsletter-send queue
  DISPATCH_CAMPAIGN: 'dispatch-campaign',
  SEND_RECIPIENT: 'send-recipient',
} as const;

/**
 * Timing constants (in milliseconds).
 */
export const TIMING = {
  /** PENDING bookings expire after 30 minutes without payment. */
  PENDING_EXPIRY_MS: 30 * 60 * 1000,

  /** Waitlist promotions expire after 24 hours without payment. */
  WAITLIST_PROMOTION_EXPIRY_MS: 24 * 60 * 60 * 1000,

  /** Session reminders are sent 24 hours before start. */
  REMINDER_BEFORE_MS: 24 * 60 * 60 * 1000,
} as const;

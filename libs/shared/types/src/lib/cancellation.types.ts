// ============================================================================
// CANCELLATION TYPES – Phase 6
// ============================================================================
// Types for the new DB-backed cancellation and refund system.
// CancellationPolicy interface and CancelBookingRequest/Response are
// already exported from their respective type files; only new types
// are defined here.
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// CANCELLED BY ENUM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Who initiated the cancellation.
 * @prisma enum CancelledBy
 */
export enum CancelledBy {
  /** Cancelled by the participant themselves */
  USER = 'USER',
  /** Cancelled by an admin */
  ADMIN = 'ADMIN',
  /** Cancelled by the system (e.g., payment expiry, GDPR cleanup) */
  SYSTEM = 'SYSTEM',
}

// ─────────────────────────────────────────────────────────────────────────────
// REFUND CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

export enum RefundType {
  FULL = 'full',
  PARTIAL = 'partial',
  NONE = 'none',
}

/** Result of refund calculation based on a cancellation policy */
export interface RefundCalculation {
  /** Type of refund applicable */
  type: RefundType;

  /** Original payment amount in cents */
  originalAmountInCents: number;

  /** Refund amount in cents */
  refundAmountInCents: number;

  /** Refund percentage (0–100) */
  refundPercent: number;

  /** Hours remaining until session start (may be negative for past sessions) */
  hoursUntilSession: number;

  /** Policy name that was applied */
  policyName: string;

  /** Human-readable explanation */
  explanation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN BATCH CANCELLATION
// ─────────────────────────────────────────────────────────────────────────────

/** Admin request to cancel an entire session or course */
export interface AdminBatchCancelRequest {
  /** Reason shown to participants */
  reason: string;

  /** Whether to process refunds (default: true) */
  processRefunds?: boolean;

  /** Optional override message for notification emails (Phase 7) */
  notificationMessage?: string;
}

/** Response for batch cancellation */
export interface AdminBatchCancelResponse {
  /** Number of bookings cancelled */
  cancelledCount: number;

  /** Number of refunds queued */
  refundsQueued: number;

  /** BullMQ job ID for tracking (if refunds were queued) */
  refundJobId?: string;

  /** Bookings that could not be cancelled */
  skippedCount: number;

  /** IDs of affected sessions */
  affectedSessions: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the number of hours between now and a future date.
 * Returns negative values if the date is in the past.
 */
export function hoursUntil(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  return (target.getTime() - Date.now()) / (1000 * 60 * 60);
}

/**
 * Calculates a refund based on a policy config and time until session start.
 * Mirrors the server-side CancellationPolicyService.calculateRefund logic,
 * so the frontend can preview the refund before confirming cancellation.
 */
export function calculateRefund(
  policy: {
    name: string;
    fullRefundHours: number;
    partialRefundHours: number;
    partialRefundPercent: number;
  },
  sessionStartTime: Date | string,
  amountInCents: number
): RefundCalculation {
  const hours = hoursUntil(sessionStartTime);

  if (hours >= policy.fullRefundHours) {
    return {
      type: RefundType.FULL,
      originalAmountInCents: amountInCents,
      refundAmountInCents: amountInCents,
      refundPercent: 100,
      hoursUntilSession: Math.round(hours),
      policyName: policy.name,
      explanation: `Vollständige Erstattung (mehr als ${policy.fullRefundHours}h vor Kursbeginn)`,
    };
  }

  if (policy.partialRefundHours > 0 && hours >= policy.partialRefundHours) {
    const refundAmount = Math.round(
      amountInCents * (policy.partialRefundPercent / 100)
    );
    return {
      type: RefundType.PARTIAL,
      originalAmountInCents: amountInCents,
      refundAmountInCents: refundAmount,
      refundPercent: policy.partialRefundPercent,
      hoursUntilSession: Math.round(hours),
      policyName: policy.name,
      explanation: `Teilerstattung ${policy.partialRefundPercent}% (${policy.partialRefundHours}–${policy.fullRefundHours}h vor Kursbeginn)`,
    };
  }

  return {
    type: RefundType.NONE,
    originalAmountInCents: amountInCents,
    refundAmountInCents: 0,
    refundPercent: 0,
    hoursUntilSession: Math.round(hours),
    policyName: policy.name,
    explanation: `Keine Erstattung (weniger als ${policy.partialRefundHours || policy.fullRefundHours}h vor Kursbeginn)`,
  };
}

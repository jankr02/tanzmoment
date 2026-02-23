// ============================================================================
// CANCELLATION POLICY TYPES
// ============================================================================
// Configurable cancellation rules per course.
// Stored as JSONB in Course.cancellationPolicy.
// The JSON structure is validated at the application layer via these types.
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-course cancellation policy, stored as JSON in the Course model.
 *
 * The refund tiers are evaluated top-down (highest daysBeforeStart first).
 * First matching tier determines the refund percentage.
 *
 * @example
 * // 100% refund > 7 days, 50% refund 3-7 days, 0% under 3 days
 * {
 *   allowCancellation: true,
 *   refundTiers: [
 *     { daysBeforeStart: 7, refundPercentage: 100, label: 'Volle Erstattung' },
 *     { daysBeforeStart: 3, refundPercentage: 50,  label: '50% Erstattung' },
 *     { daysBeforeStart: 0, refundPercentage: 0,   label: 'Keine Erstattung' },
 *   ],
 *   defaultRefundPercentage: 0,
 * }
 */
export interface CancellationPolicy {
  /** Whether cancellation is allowed at all */
  allowCancellation: boolean;

  /** Refund tiers – evaluated in order of daysBeforeStart (desc) */
  refundTiers: RefundTier[];

  /** Fallback when no tier matches */
  defaultRefundPercentage: number;

  /** Custom message shown to user during cancellation (optional) */
  cancellationNote?: string;
}

/**
 * Single refund tier within a cancellation policy
 */
export interface RefundTier {
  /** Minimum days before session/course start for this tier */
  daysBeforeStart: number;

  /** Refund percentage (0–100) */
  refundPercentage: number;

  /** Human-readable label for display */
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standard cancellation policy applied when a course has no custom policy.
 * Can be overridden per course via the admin UI.
 */
export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  allowCancellation: true,
  refundTiers: [
    { daysBeforeStart: 7, refundPercentage: 100, label: 'Volle Erstattung' },
    { daysBeforeStart: 3, refundPercentage: 50, label: '50% Erstattung' },
    { daysBeforeStart: 0, refundPercentage: 0, label: 'Keine Erstattung' },
  ],
  defaultRefundPercentage: 0,
};

/**
 * Policy for courses that don't allow cancellation
 */
export const NO_CANCELLATION_POLICY: CancellationPolicy = {
  allowCancellation: false,
  refundTiers: [],
  defaultRefundPercentage: 0,
  cancellationNote: 'Für diesen Kurs ist keine Stornierung möglich.',
};

/**
 * Policy for courses with free cancellation at any time
 */
export const FREE_CANCELLATION_POLICY: CancellationPolicy = {
  allowCancellation: true,
  refundTiers: [
    { daysBeforeStart: 0, refundPercentage: 100, label: 'Volle Erstattung' },
  ],
  defaultRefundPercentage: 100,
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves refund percentage for a given number of days before start.
 * Tiers are sorted descending by daysBeforeStart, first match wins.
 */
export function resolveRefundPercentage(
  policy: CancellationPolicy,
  daysBeforeStart: number
): number {
  if (!policy.allowCancellation) return 0;

  const sortedTiers = [...policy.refundTiers].sort(
    (a, b) => b.daysBeforeStart - a.daysBeforeStart
  );

  for (const tier of sortedTiers) {
    if (daysBeforeStart >= tier.daysBeforeStart) {
      return tier.refundPercentage;
    }
  }

  return policy.defaultRefundPercentage;
}

/**
 * Returns human-readable refund info for a given number of days.
 * Useful for displaying cancellation conditions to the user.
 */
export function getRefundInfo(
  policy: CancellationPolicy,
  daysBeforeStart: number
): { percentage: number; label: string } {
  if (!policy.allowCancellation) {
    return {
      percentage: 0,
      label: policy.cancellationNote ?? 'Keine Stornierung möglich',
    };
  }

  const sortedTiers = [...policy.refundTiers].sort(
    (a, b) => b.daysBeforeStart - a.daysBeforeStart
  );

  for (const tier of sortedTiers) {
    if (daysBeforeStart >= tier.daysBeforeStart) {
      return { percentage: tier.refundPercentage, label: tier.label };
    }
  }

  return {
    percentage: policy.defaultRefundPercentage,
    label: `${policy.defaultRefundPercentage}% Erstattung`,
  };
}

/**
 * Validates a cancellation policy structure.
 * Used in the backend when saving course settings.
 */
export function validateCancellationPolicy(
  policy: unknown
): policy is CancellationPolicy {
  if (!policy || typeof policy !== 'object') return false;

  const p = policy as Record<string, unknown>;

  if (typeof p['allowCancellation'] !== 'boolean') return false;
  if (!Array.isArray(p['refundTiers'])) return false;
  if (typeof p['defaultRefundPercentage'] !== 'number') return false;

  for (const tier of p['refundTiers'] as unknown[]) {
    if (!tier || typeof tier !== 'object') return false;
    const t = tier as Record<string, unknown>;
    if (typeof t['daysBeforeStart'] !== 'number') return false;
    if (typeof t['refundPercentage'] !== 'number') return false;
    if (typeof t['label'] !== 'string') return false;
    if (t['refundPercentage'] < 0 || t['refundPercentage'] > 100) return false;
    if (t['daysBeforeStart'] < 0) return false;
  }

  return true;
}

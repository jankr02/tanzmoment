// ============================================================================
// PAYMENT TYPES
// ============================================================================
// Types for the payment system
// Enums synchronized with Prisma schema
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT STATUS ENUM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status of a payment
 *
 * Flow: PENDING → PROCESSING → PAID
 *       PENDING → FAILED
 *       PAID → REFUNDED / PARTIAL_REFUND
 *
 * @prisma enum PaymentStatus
 */
export enum PaymentStatus {
  /** Payment pending (not yet initiated) */
  PENDING = 'pending',

  /** Payment is being processed */
  PROCESSING = 'processing',

  /** Payment successfully completed */
  PAID = 'paid',

  /** Payment failed */
  FAILED = 'failed',

  /** Fully refunded */
  REFUNDED = 'refunded',

  /** Partially refunded */
  PARTIAL_REFUND = 'partial_refund',

  /** Payment cancelled (e.g., by user) */
  CANCELLED = 'cancelled',

  /** Payment is expiring / has expired */
  EXPIRED = 'expired',
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT STATUS METADATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metadata for PaymentStatus
 */
export interface PaymentStatusMeta {
  label: string;
  labelShort: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

/**
 * Metadata for all PaymentStatus values
 */
export const PAYMENT_STATUS_META: Record<PaymentStatus, PaymentStatusMeta> = {
  [PaymentStatus.PENDING]: {
    label: 'Ausstehend',
    labelShort: 'Offen',
    color: '#B8860B',
    bgColor: '#FEF3C7',
    icon: 'clock',
    description: 'Zahlung wurde noch nicht gestartet',
  },
  [PaymentStatus.PROCESSING]: {
    label: 'In Bearbeitung',
    labelShort: 'Läuft',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    icon: 'loader',
    description: 'Zahlung wird verarbeitet',
  },
  [PaymentStatus.PAID]: {
    label: 'Bezahlt',
    labelShort: 'Bezahlt',
    color: '#059669',
    bgColor: '#D1FAE5',
    icon: 'check-circle',
    description: 'Zahlung erfolgreich abgeschlossen',
  },
  [PaymentStatus.FAILED]: {
    label: 'Fehlgeschlagen',
    labelShort: 'Fehler',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'alert-circle',
    description: 'Zahlung ist fehlgeschlagen',
  },
  [PaymentStatus.REFUNDED]: {
    label: 'Erstattet',
    labelShort: 'Erstattet',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    icon: 'rotate-ccw',
    description: 'Vollständig erstattet',
  },
  [PaymentStatus.PARTIAL_REFUND]: {
    label: 'Teilerstattung',
    labelShort: 'Teilerst.',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    icon: 'rotate-ccw',
    description: 'Teilweise erstattet',
  },
  [PaymentStatus.CANCELLED]: {
    label: 'Abgebrochen',
    labelShort: 'Abgebr.',
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    icon: 'x-circle',
    description: 'Zahlung wurde abgebrochen',
  },
  [PaymentStatus.EXPIRED]: {
    label: 'Abgelaufen',
    labelShort: 'Abgelaufen',
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    icon: 'clock',
    description: 'Zahlungsfrist abgelaufen',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT METHOD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supported payment methods
 */
export enum PaymentMethod {
  /** Bank transfer */
  BANK_TRANSFER = 'bank_transfer',

  /** Cash payment on-site */
  CASH = 'cash',

  /** PayPal */
  PAYPAL = 'paypal',

  /** Credit card (via Stripe) */
  CREDIT_CARD = 'credit_card',

  /** SEPA direct debit */
  SEPA_DEBIT = 'sepa_debit',

  /** Voucher */
  VOUCHER = 'voucher',

  /** Free / no charge */
  FREE = 'free',
}

/**
 * Labels for payment methods
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.BANK_TRANSFER]: 'Überweisung',
  [PaymentMethod.CASH]: 'Barzahlung',
  [PaymentMethod.PAYPAL]: 'PayPal',
  [PaymentMethod.CREDIT_CARD]: 'Kreditkarte',
  [PaymentMethod.SEPA_DEBIT]: 'SEPA-Lastschrift',
  [PaymentMethod.VOUCHER]: 'Gutschein',
  [PaymentMethod.FREE]: 'Kostenlos',
};

/**
 * Icons for payment methods (Lucide icon names)
 */
export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  [PaymentMethod.BANK_TRANSFER]: 'landmark',
  [PaymentMethod.CASH]: 'banknote',
  [PaymentMethod.PAYPAL]: 'wallet',
  [PaymentMethod.CREDIT_CARD]: 'credit-card',
  [PaymentMethod.SEPA_DEBIT]: 'building-2',
  [PaymentMethod.VOUCHER]: 'ticket',
  [PaymentMethod.FREE]: 'gift',
};

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supported currencies
 */
export enum Currency {
  EUR = 'EUR',
  CHF = 'CHF',
}

/**
 * Currency symbols
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.EUR]: '€',
  [Currency.CHF]: 'CHF',
};

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = Currency.EUR;

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Payment (frontend representation)
 */
export interface Payment {
  id: string;

  /** Reference to booking */
  bookingId: string;

  /** Amount in cents (for EUR: 1000 = 10.00€) */
  amount: number;

  /** Currency */
  currency: Currency;

  /** Status */
  status: PaymentStatus;

  /** Payment method */
  method: PaymentMethod;

  /** External transaction ID (e.g., Stripe, PayPal) */
  externalTransactionId?: string;

  /** Refunded amount in cents */
  refundedAmount?: number;

  /** Notes */
  notes?: string;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  refundedAt?: string;
}

/**
 * Price display (formatted)
 */
export interface PriceDisplay {
  amount: number;
  currency: Currency;
  formatted: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats amount in cents to readable string
 * @example formatPrice(1500, Currency.EUR) → "15,00 €"
 */
export function formatPrice(
  amountInCents: number,
  currency: Currency = Currency.EUR
): string {
  const euros = amountInCents / 100;
  const symbol = CURRENCY_SYMBOLS[currency];

  const formatted = euros.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency === Currency.EUR
    ? `${formatted} ${symbol}`
    : `${symbol} ${formatted}`;
}

/**
 * Creates PriceDisplay object
 */
export function createPriceDisplay(
  amountInCents: number,
  currency: Currency = Currency.EUR
): PriceDisplay {
  return {
    amount: amountInCents,
    currency,
    formatted: formatPrice(amountInCents, currency),
  };
}

/**
 * Checks if payment is successful
 */
export function isPaymentSuccessful(status: PaymentStatus): boolean {
  return status === PaymentStatus.PAID;
}

/**
 * Checks if payment is still pending
 */
export function isPaymentPending(status: PaymentStatus): boolean {
  return [PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(status);
}

/**
 * Checks if payment failed / was cancelled
 */
export function isPaymentFailed(status: PaymentStatus): boolean {
  return [
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
    PaymentStatus.EXPIRED,
  ].includes(status);
}

/**
 * Checks if payment is refundable
 */
export function isPaymentRefundable(status: PaymentStatus): boolean {
  return status === PaymentStatus.PAID;
}

/**
 * Returns allowed payment status transitions
 */
export function getAllowedPaymentTransitions(
  currentStatus: PaymentStatus
): PaymentStatus[] {
  const transitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [
      PaymentStatus.PROCESSING,
      PaymentStatus.PAID,
      PaymentStatus.CANCELLED,
      PaymentStatus.EXPIRED,
    ],
    [PaymentStatus.PROCESSING]: [
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
    ],
    [PaymentStatus.PAID]: [
      PaymentStatus.REFUNDED,
      PaymentStatus.PARTIAL_REFUND,
    ],
    [PaymentStatus.FAILED]: [PaymentStatus.PENDING], // Retry
    [PaymentStatus.REFUNDED]: [],
    [PaymentStatus.PARTIAL_REFUND]: [PaymentStatus.REFUNDED],
    [PaymentStatus.CANCELLED]: [],
    [PaymentStatus.EXPIRED]: [PaymentStatus.PENDING], // Retry
  };

  return transitions[currentStatus] ?? [];
}

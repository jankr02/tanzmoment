import { TemplateName } from './template/template.service';

/**
 * Data structure for an email job (enqueued to BullMQ).
 */
export interface EmailJobData {
  /** Recipient email address */
  to: string;

  /** Email subject line */
  subject: string;

  /** Template name to render */
  template: TemplateName;

  /** Variables to inject into the template */
  variables: Record<string, unknown>;

  /** Optional: Override reply-to address */
  replyTo?: string;

  /** Optional: Reference to booking for logging */
  bookingId?: string;

  /** Optional: Reference to user for logging */
  userId?: string;
}

/**
 * Result of an email send attempt.
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  /** Ethereal preview URL (dev only) */
  previewUrl?: string;
}

// ============================================================================
// CONTACT SERVICE TYPES
// ============================================================================

/**
 * Daten, die vom Kontaktformular an das Backend gesendet werden.
 *
 * Beachte: Diese Struktur muss exakt mit dem Backend-DTO übereinstimmen.
 * Jede Änderung hier muss auch im Backend angepasst werden und umgekehrt.
 */
export interface ContactFormDto {
  /** Vollständiger Name des Absenders (mind. 2 Zeichen) */
  name: string;

  /** E-Mail-Adresse für Rückantworten */
  email: string;

  /** Optionale Telefonnummer */
  phone?: string;

  /** Betreff der Nachricht (z.B. "Kursanfrage", "Feedback") */
  subject: string;

  /** Die eigentliche Nachricht (10-500 Zeichen) */
  message: string;

  /** Bestätigung der Datenschutzerklärung (muss true sein) */
  privacyAccepted: boolean;
}

/**
 * Antwort vom Backend nach erfolgreicher oder fehlgeschlagener Submission.
 *
 * Diese Struktur ist absichtlich generisch gehalten, damit wir später
 * zusätzliche Felder hinzufügen können (z.B. eine Ticket-ID oder
 * eine geschätzte Antwortzeit), ohne Breaking Changes zu produzieren.
 */
export interface ContactFormResponse {
  /** Gibt an, ob die Nachricht erfolgreich verarbeitet wurde */
  success: boolean;

  /** Eine benutzerfreundliche Nachricht, die im UI angezeigt werden kann */
  message: string;

  /** Optionale zusätzliche Daten (für zukünftige Erweiterungen) */
  data?: {
    processedAt?: Date;
    formData?: Partial<ContactFormDto>;
  };
}

/**
 * Mögliche Error-Typen bei der Formular-Submission.
 *
 * Diese Enum hilft uns, verschiedene Fehlerszenarien zu unterscheiden
 * und entsprechend zu reagieren (z.B. bei Rate-Limiting anders als
 * bei Validierungsfehlern).
 */
export enum ContactFormErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Strukturierte Error-Information für besseres Error-Handling.
 */
export interface ContactFormError {
  type: ContactFormErrorType;
  message: string;
  details?: unknown;
}

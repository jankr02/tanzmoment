// ============================================================================
// COURSE STATUS TYPES
// ============================================================================
// Status types for courses and sessions
// Enums synchronized with Prisma schema
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// COURSE STATUS ENUM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status of a course (entire course)
 *
 * @prisma enum CourseStatus
 */
export enum CourseStatus {
  /** Draft - not yet published */
  DRAFT = 'draft',

  /** Active - bookable and visible */
  ACTIVE = 'active',

  /** Full - no spots available */
  FULL = 'full',

  /** Paused - temporarily not bookable */
  PAUSED = 'paused',

  /** Completed - course has ended */
  COMPLETED = 'completed',

  /** Archived - no longer visible */
  ARCHIVED = 'archived',

  /** Cancelled - course will not take place */
  CANCELLED = 'cancelled',
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE STATUS METADATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metadata for CourseStatus
 */
export interface CourseStatusMeta {
  label: string;
  labelShort: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  isBookable: boolean;
  isVisible: boolean;
}

/**
 * Metadata for all CourseStatus values
 */
export const COURSE_STATUS_META: Record<CourseStatus, CourseStatusMeta> = {
  [CourseStatus.DRAFT]: {
    label: 'Entwurf',
    labelShort: 'Entwurf',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: 'file-edit',
    description: 'Kurs wird noch bearbeitet',
    isBookable: false,
    isVisible: false,
  },
  [CourseStatus.ACTIVE]: {
    label: 'Aktiv',
    labelShort: 'Aktiv',
    color: '#059669',
    bgColor: '#D1FAE5',
    icon: 'check-circle',
    description: 'Kurs ist buchbar',
    isBookable: true,
    isVisible: true,
  },
  [CourseStatus.FULL]: {
    label: 'Ausgebucht',
    labelShort: 'Voll',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'users',
    description: 'Kurs ist voll – Warteliste möglich',
    isBookable: false, // Waitlist only
    isVisible: true,
  },
  [CourseStatus.PAUSED]: {
    label: 'Pausiert',
    labelShort: 'Pause',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: 'pause-circle',
    description: 'Buchungen temporär deaktiviert',
    isBookable: false,
    isVisible: true,
  },
  [CourseStatus.COMPLETED]: {
    label: 'Beendet',
    labelShort: 'Beendet',
    color: '#374151',
    bgColor: '#E5E7EB',
    icon: 'check',
    description: 'Kurs wurde erfolgreich abgeschlossen',
    isBookable: false,
    isVisible: false,
  },
  [CourseStatus.ARCHIVED]: {
    label: 'Archiviert',
    labelShort: 'Archiv',
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    icon: 'archive',
    description: 'Kurs ist archiviert',
    isBookable: false,
    isVisible: false,
  },
  [CourseStatus.CANCELLED]: {
    label: 'Abgesagt',
    labelShort: 'Abgesagt',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'x-circle',
    description: 'Kurs wurde abgesagt',
    isBookable: false,
    isVisible: true, // Visible with notice
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SESSION STATUS ENUM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status of a single session/appointment
 *
 * @prisma enum SessionStatus
 */
export enum SessionStatus {
  /** Scheduled - date is confirmed */
  SCHEDULED = 'scheduled',

  /** In progress - session is currently running */
  IN_PROGRESS = 'in_progress',

  /** Completed - session is over */
  COMPLETED = 'completed',

  /** Cancelled - session will not take place */
  CANCELLED = 'cancelled',

  /** Postponed - new date will be announced */
  POSTPONED = 'postponed',
}

/**
 * Metadata for SessionStatus
 */
export interface SessionStatusMeta {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

/**
 * Metadata for all SessionStatus values
 */
export const SESSION_STATUS_META: Record<SessionStatus, SessionStatusMeta> = {
  [SessionStatus.SCHEDULED]: {
    label: 'Geplant',
    color: '#059669',
    bgColor: '#D1FAE5',
    icon: 'calendar',
  },
  [SessionStatus.IN_PROGRESS]: {
    label: 'Läuft',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    icon: 'play-circle',
  },
  [SessionStatus.COMPLETED]: {
    label: 'Abgeschlossen',
    color: '#374151',
    bgColor: '#E5E7EB',
    icon: 'check',
  },
  [SessionStatus.CANCELLED]: {
    label: 'Abgesagt',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'x-circle',
  },
  [SessionStatus.POSTPONED]: {
    label: 'Verschoben',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'clock',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COURSE VISIBILITY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Visibility of a course
 */
export enum CourseVisibility {
  /** Public - visible to everyone */
  PUBLIC = 'public',

  /** Unlisted - not shown in lists */
  UNLISTED = 'unlisted',

  /** Private - only for invitees */
  PRIVATE = 'private',
}

/**
 * Labels for visibility
 */
export const COURSE_VISIBILITY_LABELS: Record<CourseVisibility, string> = {
  [CourseVisibility.PUBLIC]: 'Öffentlich',
  [CourseVisibility.UNLISTED]: 'Nur mit Link',
  [CourseVisibility.PRIVATE]: 'Privat',
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if a course is bookable
 */
export function isCourseBookable(status: CourseStatus): boolean {
  return COURSE_STATUS_META[status]?.isBookable ?? false;
}

/**
 * Checks if a course is publicly visible
 */
export function isCourseVisible(status: CourseStatus): boolean {
  return COURSE_STATUS_META[status]?.isVisible ?? false;
}

/**
 * Checks if a session is upcoming
 */
export function isSessionUpcoming(status: SessionStatus): boolean {
  return status === SessionStatus.SCHEDULED;
}

/**
 * Checks if a session was cancelled
 */
export function isSessionCancelled(status: SessionStatus): boolean {
  return [SessionStatus.CANCELLED, SessionStatus.POSTPONED].includes(status);
}

/**
 * Returns allowed CourseStatus transitions
 */
export function getAllowedCourseStatusTransitions(
  currentStatus: CourseStatus
): CourseStatus[] {
  const transitions: Record<CourseStatus, CourseStatus[]> = {
    [CourseStatus.DRAFT]: [CourseStatus.ACTIVE, CourseStatus.ARCHIVED],
    [CourseStatus.ACTIVE]: [
      CourseStatus.FULL,
      CourseStatus.PAUSED,
      CourseStatus.COMPLETED,
      CourseStatus.CANCELLED,
    ],
    [CourseStatus.FULL]: [
      CourseStatus.ACTIVE, // Spots became available
      CourseStatus.PAUSED,
      CourseStatus.COMPLETED,
      CourseStatus.CANCELLED,
    ],
    [CourseStatus.PAUSED]: [
      CourseStatus.ACTIVE,
      CourseStatus.CANCELLED,
      CourseStatus.ARCHIVED,
    ],
    [CourseStatus.COMPLETED]: [CourseStatus.ARCHIVED],
    [CourseStatus.ARCHIVED]: [],
    [CourseStatus.CANCELLED]: [CourseStatus.ARCHIVED],
  };

  return transitions[currentStatus] ?? [];
}

/**
 * Returns allowed SessionStatus transitions
 */
export function getAllowedSessionStatusTransitions(
  currentStatus: SessionStatus
): SessionStatus[] {
  const transitions: Record<SessionStatus, SessionStatus[]> = {
    [SessionStatus.SCHEDULED]: [
      SessionStatus.IN_PROGRESS,
      SessionStatus.CANCELLED,
      SessionStatus.POSTPONED,
    ],
    [SessionStatus.IN_PROGRESS]: [SessionStatus.COMPLETED],
    [SessionStatus.COMPLETED]: [],
    [SessionStatus.CANCELLED]: [],
    [SessionStatus.POSTPONED]: [
      SessionStatus.SCHEDULED, // New date
      SessionStatus.CANCELLED,
    ],
  };

  return transitions[currentStatus] ?? [];
}

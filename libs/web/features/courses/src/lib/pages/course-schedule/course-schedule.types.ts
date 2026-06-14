// ============================================================================
// COURSE SCHEDULE (KURSPLAN) — TYPES, GROUP META & DATE HELPERS
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// API MODEL (mirrors CalendarSessionDto from the backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarSessionCourse {
  id: string;
  title: string;
  slug: string;
  catchPhrase?: string;
  danceStyle: string;
  targetGroup: string;
  level: string;
  imageUrl?: string;
  instructorName: string;
}

export interface CalendarSession {
  id: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  availableSpots: number;
  course: CalendarSessionCourse;
}

// ─────────────────────────────────────────────────────────────────────────────
// TARGET-GROUP META
// ─────────────────────────────────────────────────────────────────────────────

export type GroupKey = 'mama' | 'kids' | 'inklusiv' | 'ausdruck';

export interface GroupMeta {
  key: GroupKey;
  /** Short chip label */
  label: string;
  /** Long descriptive label */
  long: string;
  /** Path to the group line illustration (white-tinted in the detail badge) */
  illustration: string;
}

export const GROUP_ORDER: GroupKey[] = ['mama', 'kids', 'inklusiv', 'ausdruck'];

export const GROUP_META: Record<GroupKey, GroupMeta> = {
  mama: {
    key: 'mama',
    label: 'Mama',
    long: 'Mama tanzt',
    illustration: '/assets/illustrations/dance-styles/mother.svg',
  },
  kids: {
    key: 'kids',
    label: 'Kids',
    long: 'Kinder & Familie',
    illustration: '/assets/illustrations/dance-styles/kids.svg',
  },
  inklusiv: {
    key: 'inklusiv',
    label: 'Inklusiv',
    long: 'Inklusiver Tanz',
    illustration: '/assets/illustrations/dance-styles/accessible.svg',
  },
  ausdruck: {
    key: 'ausdruck',
    label: 'Ausdruck',
    long: 'Ausdruckstanz',
    illustration: '/assets/illustrations/dance-styles/expressive.svg',
  },
};

/**
 * Inline CSS custom properties mapping a group to the shared event vars.
 * The `--group-*` palette is defined once on the page host and cascades into
 * child view components (custom properties pierce view encapsulation).
 */
export function groupVars(key: GroupKey): Record<string, string> {
  return {
    '--evt-fill': `var(--group-${key}-fill)`,
    '--evt-edge': `var(--group-${key}-edge)`,
    '--evt-deep': `var(--group-${key}-deep)`,
  };
}

/**
 * Map a session to one of the four calendar groups.
 * Primary signal is danceStyle (1:1 with the four groups); targetGroup text is a fallback.
 */
export function resolveGroup(session: CalendarSession): GroupKey {
  switch (session.course.danceStyle) {
    case 'mothers':
      return 'mama';
    case 'kids':
      return 'kids';
    case 'accessible':
      return 'inklusiv';
    case 'expressive':
      return 'ausdruck';
  }

  const target = session.course.targetGroup?.toLowerCase() ?? '';
  if (target.includes('mütter') || target.includes('mama')) return 'mama';
  if (target.includes('kinder') || target.includes('familie')) return 'kids';
  if (target.includes('behinderung') || target.includes('rollstuhl')) return 'inklusiv';
  return 'ausdruck';
}

// ─────────────────────────────────────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────────────────────────────────────

export const WD_LONG = [
  '',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];

export const WD_SHORT = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Anfänger:innen',
  INTERMEDIATE: 'Mittelstufe',
  ADVANCED: 'Fortgeschrittene',
  ALL_LEVELS: 'Alle Level',
};

// ─────────────────────────────────────────────────────────────────────────────
// TIME GRID CONSTANTS (week view)
// ─────────────────────────────────────────────────────────────────────────────

export const DAY_START_MIN = 9 * 60; // 09:00
export const DAY_END_MIN = 21 * 60; // 21:00
export const HOUR_HEIGHT = 66; // px per hour — must match --kp-hour-h in scss
export const PX_PER_MIN = HOUR_HEIGHT / 60;

// ─────────────────────────────────────────────────────────────────────────────
// DATE / TIME HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** ISO weekday 1..7 (Mon..Sun) */
export function isoDow(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

/** Monday 00:00 of the week containing `date` */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - (isoDow(d) - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Minutes since midnight for a session start/end ISO string */
export function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** "HH:MM" for an ISO string in local time */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Human duration between two ISO strings, e.g. "1 Std 15 Min" */
export function formatDuration(startIso: string, endIso: string): string {
  const diff = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000,
  );
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (!h) return `${m} Min`;
  return m ? `${h} Std ${m} Min` : `${h} Std`;
}

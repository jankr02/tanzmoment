// ============================================================================
// FILTER BAR TYPES
// ============================================================================
// Types for the filter bar on the Course Overview Page
// Synchronized with backend query parameters
// ============================================================================

import { DanceStyleId } from '../dance-style-card/dance-style-card.types';

// Re-export for easy import
export type { DanceStyleId } from '../dance-style-card/dance-style-card.types';

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Location IDs - matching Backend
 */
export type LocationId = 'moessingen' | 'bodelshausen';

/**
 * Location option for dropdown
 */
export interface LocationOption {
  id: LocationId;
  label: string;
}

/**
 * Available locations
 */
export const LOCATION_OPTIONS: LocationOption[] = [
  { id: 'moessingen', label: 'Mössingen' },
  { id: 'bodelshausen', label: 'Bodelshausen' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DANCE STYLE OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dance Style option for filter
 */
export interface DanceStyleOption {
  id: DanceStyleId;
  label: string;
  shortLabel?: string; // For mobile/chips
  color?: string; // Color for display
}

/**
 * Available dance styles for filter
 */
export const DANCE_STYLE_OPTIONS: DanceStyleOption[] = [
  {
    id: 'accessible',
    label: 'Tanzen mit Behinderung',
    shortLabel: 'Inklusiv',
    color: '#EEF4F0',
  },
  {
    id: 'expressive',
    label: 'Ausdruckstanz',
    shortLabel: 'Ausdruck',
    color: 'rgb(178, 154, 147)',
  },
  {
    id: 'kids',
    label: 'Tanzen für Kinder',
    shortLabel: 'Kinder',
    color: '#d5dee2',
  },
  {
    id: 'mothers',
    label: 'Tanzen für Mütter',
    shortLabel: 'Mütter',
    color: '#F0E6E8',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FILTER STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Current filter state
 * Sent as query parameters to backend
 */
export interface CourseFilterState {
  /** Selected dance style (optional) */
  danceStyle: DanceStyleId | null;

  /** Selected location (optional) */
  location: LocationId | null;

  /** Date from (ISO string, optional) */
  dateFrom: string | null;

  /** Date to (ISO string, optional) */
  dateTo: string | null;
}

/**
 * Initial/empty filter state
 */
export const EMPTY_FILTER_STATE: CourseFilterState = {
  danceStyle: null,
  location: null,
  dateFrom: null,
  dateTo: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE FILTER TAG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type for active filter tags
 */
export type FilterType = 'danceStyle' | 'location' | 'dateFrom' | 'dateTo';

/**
 * Active filter as tag representation
 */
export interface ActiveFilterTag {
  type: FilterType;
  label: string;
  value: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if any filters are active
 */
export function hasActiveFilters(state: CourseFilterState): boolean {
  return !!(
    state.danceStyle ||
    state.location ||
    state.dateFrom ||
    state.dateTo
  );
}

/**
 * Counts active filters
 */
export function countActiveFilters(state: CourseFilterState): number {
  let count = 0;
  if (state.danceStyle) count++;
  if (state.location) count++;
  if (state.dateFrom) count++;
  if (state.dateTo) count++;
  return count;
}

/**
 * Converts filter state to active filter tags
 */
export function filterStateToTags(state: CourseFilterState): ActiveFilterTag[] {
  const tags: ActiveFilterTag[] = [];

  if (state.danceStyle) {
    const option = DANCE_STYLE_OPTIONS.find((o) => o.id === state.danceStyle);
    tags.push({
      type: 'danceStyle',
      label: option?.shortLabel ?? option?.label ?? state.danceStyle,
      value: state.danceStyle,
    });
  }

  if (state.location) {
    const option = LOCATION_OPTIONS.find((o) => o.id === state.location);
    tags.push({
      type: 'location',
      label: option?.label ?? state.location,
      value: state.location,
    });
  }

  if (state.dateFrom) {
    tags.push({
      type: 'dateFrom',
      label: `Ab ${formatDateShort(state.dateFrom)}`,
      value: state.dateFrom,
    });
  }

  if (state.dateTo) {
    tags.push({
      type: 'dateTo',
      label: `Bis ${formatDateShort(state.dateTo)}`,
      value: state.dateTo,
    });
  }

  return tags;
}

/**
 * Formats ISO date short (e.g., "15.12.")
 */
function formatDateShort(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

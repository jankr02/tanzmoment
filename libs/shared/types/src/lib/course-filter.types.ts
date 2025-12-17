/**
 * Course Filter Types
 *
 * Types for filtering courses in the Course Overview page.
 * Used by both Frontend (filter state) and Backend (query params).
 *
 * @example
 * ```typescript
 * import { CourseFilterParams, CourseFilterState } from '@tanzmoment/shared/types';
 *
 * // Frontend state
 * const filterState: CourseFilterState = {
 *   danceStyle: 'expressive',
 *   location: 'moessingen',
 *   dateFrom: new Date('2025-01-01'),
 *   dateTo: null,
 * };
 *
 * // API query params
 * const params: CourseFilterParams = {
 *   danceStyle: 'expressive',
 *   location: 'moessingen',
 *   dateFrom: '2025-01-01T00:00:00.000Z',
 *   page: 1,
 *   limit: 5,
 * };
 * ```
 */

import { PaginationParams } from './pagination.types';

// =============================================================================
// FRONTEND STATE
// =============================================================================

/**
 * Filter state for the Course Overview page (Frontend)
 * Uses Date objects for datepicker binding
 */
export interface CourseFilterState {
  /** Selected dance style ID or null for all */
  danceStyle: string | null;
  /** Selected location ID or null for all */
  location: string | null;
  /** Start date filter or null */
  dateFrom: Date | null;
  /** End date filter or null (optional) */
  dateTo: Date | null;
}

/**
 * Initial/default filter state
 */
export const INITIAL_FILTER_STATE: CourseFilterState = {
  danceStyle: null,
  location: null,
  dateFrom: null,
  dateTo: null,
};

// =============================================================================
// API QUERY PARAMS
// =============================================================================

/**
 * Query parameters for GET /api/courses endpoint
 * Extends pagination with filter options
 */
export interface CourseFilterParams extends PaginationParams {
  /** Filter by dance style ID */
  danceStyle?: string;
  /** Filter by location ID */
  location?: string;
  /** Filter sessions starting from this date (ISO string) */
  dateFrom?: string;
  /** Filter sessions until this date (ISO string) */
  dateTo?: string;
  /** Only return highlighted courses */
  highlighted?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Convert frontend filter state to API query params
 *
 * @param state - Frontend filter state
 * @param pagination - Optional pagination params
 * @returns Query params object for API call
 */
export function filterStateToParams(
  state: CourseFilterState,
  pagination?: PaginationParams
): CourseFilterParams {
  const params: CourseFilterParams = {};

  if (state.danceStyle) {
    params.danceStyle = state.danceStyle;
  }

  if (state.location) {
    params.location = state.location;
  }

  if (state.dateFrom) {
    params.dateFrom = state.dateFrom.toISOString();
  }

  if (state.dateTo) {
    params.dateTo = state.dateTo.toISOString();
  }

  if (pagination) {
    params.page = pagination.page;
    params.limit = pagination.limit;
  }

  return params;
}

/**
 * Check if any filters are active
 *
 * @param state - Filter state to check
 * @returns True if at least one filter is set
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
 * Count number of active filters
 *
 * @param state - Filter state to check
 * @returns Number of active filters
 */
export function countActiveFilters(state: CourseFilterState): number {
  let count = 0;
  if (state.danceStyle) count++;
  if (state.location) count++;
  if (state.dateFrom) count++;
  if (state.dateTo) count++;
  return count;
}

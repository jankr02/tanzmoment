/**
 * Pagination Types
 *
 * Generic pagination types for API responses.
 * Used consistently across all paginated endpoints.
 *
 * @example
 * ```typescript
 * import { PaginatedResponse, PaginationParams } from '@tanzmoment/shared/types';
 *
 * interface Course { id: string; title: string; }
 *
 * // API Response Type
 * type CoursesResponse = PaginatedResponse<Course>;
 *
 * // Request params
 * const params: PaginationParams = { page: 1, limit: 5 };
 * ```
 */

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Metadata for paginated responses
 */
export interface PaginationMeta {
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages after current */
  hasMore: boolean;
}

/**
 * Generic paginated response wrapper
 *
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];
  /** Pagination metadata */
  meta: PaginationMeta;
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Common pagination query parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed), defaults to 1 */
  page?: number;
  /** Items per page, defaults to 10 */
  limit?: number;
}

// =============================================================================
// DEFAULTS
// =============================================================================

/** Default pagination values */
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 5,
  maxLimit: 50,
} as const;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Calculate pagination metadata from total count
 *
 * @param total - Total number of items
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Pagination metadata
 *
 * @example
 * ```typescript
 * const meta = calculatePaginationMeta(23, 2, 5);
 * // { total: 23, page: 2, limit: 5, totalPages: 5, hasMore: true }
 * ```
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    total,
    page,
    limit,
    totalPages,
    hasMore,
  };
}

/**
 * Calculate skip value for database queries
 *
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Number of items to skip
 *
 * @example
 * ```typescript
 * const skip = calculateSkip(3, 10); // 20
 * ```
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Normalize pagination params with defaults
 *
 * @param params - Raw pagination params
 * @returns Normalized params with defaults applied
 */
export function normalizePaginationParams(
  params: PaginationParams
): Required<PaginationParams> {
  return {
    page: Math.max(1, params.page || PAGINATION_DEFAULTS.page),
    limit: Math.min(
      PAGINATION_DEFAULTS.maxLimit,
      Math.max(1, params.limit || PAGINATION_DEFAULTS.limit)
    ),
  };
}

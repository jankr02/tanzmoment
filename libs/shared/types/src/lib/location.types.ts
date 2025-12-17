/**
 * Location Types & Constants
 *
 * Hardcoded studio locations for Tanzmoment.
 *
 * @example
 * ```typescript
 * import { LOCATIONS, LOCATION_OPTIONS } from '@tanzmoment/shared/types';
 *
 * const loc = LOCATIONS.MOESSINGEN;
 * console.log(loc.label); // 'Mössingen'
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export interface LocationConfig {
  /** Unique identifier (lowercase, used in DB and URLs) */
  readonly id: string;
  /** Display label (German) */
  readonly label: string;
  /** Full address (optional) */
  readonly address?: string;
  /** Google Maps link (optional) */
  readonly mapsUrl?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const LOCATIONS = {
  /**
   * Mössingen Studio
   */
  MOESSINGEN: {
    id: 'moessingen',
    label: 'Mössingen',
    address: 'Tanzstudio Mössingen', // TODO: Add real address
    mapsUrl: undefined,
  },

  /**
   * Bodelshausen Studio
   */
  BODELSHAUSEN: {
    id: 'bodelshausen',
    label: 'Bodelshausen',
    address: 'Tanzstudio Bodelshausen', // TODO: Add real address
    mapsUrl: undefined,
  },
} as const;

// =============================================================================
// DERIVED TYPES
// =============================================================================

/** Union type of all location keys */
export type LocationId = keyof typeof LOCATIONS;

/** Type of a single location configuration */
export type LocationValue = (typeof LOCATIONS)[LocationId];

/** Array of all location IDs */
export const LOCATION_IDS = Object.keys(LOCATIONS) as LocationId[];

/** Array of all location id values (lowercase) */
export const LOCATION_ID_VALUES: readonly string[] = Object.values(
  LOCATIONS
).map((loc) => loc.id);

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Options array for dropdowns/select components
 *
 * @example
 * ```html
 * <select>
 *   <option *ngFor="let opt of LOCATION_OPTIONS" [value]="opt.value">
 *     {{ opt.label }}
 *   </option>
 * </select>
 * ```
 */
export const LOCATION_OPTIONS: readonly { value: string; label: string }[] =
  Object.values(LOCATIONS).map((loc) => ({
    value: loc.id,
    label: loc.label,
  }));

/**
 * Get location config by ID
 *
 * @param id - The location ID (e.g., 'moessingen')
 * @returns The location config or undefined
 */
export function getLocationById(id: string): LocationValue | undefined {
  return Object.values(LOCATIONS).find((loc) => loc.id === id);
}

/**
 * Check if a string is a valid location ID
 *
 * @param id - The string to check
 * @returns True if valid location ID
 */
export function isValidLocationId(id: string): boolean {
  return LOCATION_ID_VALUES.includes(id);
}

/**
 * Dance Style Types & Constants
 *
 * Hardcoded dance style definitions for Tanzmoment.
 * These are the core dance categories offered by the studio.
 *
 * @example
 * ```typescript
 * import { DANCE_STYLES, DanceStyleId } from '@tanzmoment/shared/types';
 *
 * const style = DANCE_STYLES.EXPRESSIVE;
 * console.log(style.label); // 'Ausdruckstanz'
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export interface DanceStyleConfig {
  /** Unique identifier (lowercase, used in DB and URLs) */
  readonly id: string;
  /** Display label (German) */
  readonly label: string;
  /** Short description for overview cards */
  readonly description: string;
  /** Background color for cards (hex or rgba) */
  readonly backgroundColor: string;
  /** Path to illustration image */
  readonly image: string;
  /** Optional accent/text color for contrast */
  readonly accentColor?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const DANCE_STYLES = {
  /**
   * Dance with disabilities
   * Inclusive dance for people with disabilities
   */
  ACCESSIBLE: {
    id: 'accessible',
    label: 'Tanzen mit Behinderung',
    description:
      'Tanz kennt keine Grenzen. Bewegung für alle – angepasst, inklusiv und voller Freude. Du tanzt nicht nach – du wirst zur Bewegung.',
    backgroundColor: '#D5DEE2',
    image: 'assets/illustrations/dance-styles/dance-accessible.svg',
    accentColor: '#4A5568',
  },

  /**
   * Expressive dance
   * Expressive dance focusing on emotions and personal expression
   */
  EXPRESSIVE: {
    id: 'expressive',
    label: 'Ausdruckstanz',
    description:
      'Ausdruckstanz ist Emotion in Bewegung. Jeder Schritt, jede Geste trägt Gefühl – leise oder laut, zart oder wild. Du tanzt nicht nach – du wirst zur Bewegung.',
    backgroundColor: 'rgba(178, 154, 147, 1)',
    image: 'assets/illustrations/dance-styles/dance-expressive.svg',
    accentColor: '#8B6914',
  },

  /**
   * Dance for kids
   * Playful dance classes for children
   */
  KIDS: {
    id: 'kids',
    label: 'Tanzen für Kinder',
    description:
      'Spielerisch bewegen, Rhythmus entdecken. Tanz als Abenteuer für kleine Entdecker. Hier darf gelacht, gesprungen und geträumt werden.',
    backgroundColor: '#D5DEE2',
    image: 'assets/illustrations/dance-styles/dance-kids.svg',
    accentColor: '#6C94A2',
  },

  /**
   * Dance for mothers
   * Dance classes specifically designed for mothers
   */
  MOTHERS: {
    id: 'mothers',
    label: 'Tanzen für Mütter',
    description:
      'Zeit für dich. Bewegung, die Kraft gibt und den Alltag vergessen lässt. Eine Auszeit, in der du wieder zu dir selbst findest.',
    backgroundColor: '#F5D592',
    image: 'assets/illustrations/dance-styles/dance-mothers.svg',
    accentColor: '#8B6914',
  },
} as const;

// =============================================================================
// DERIVED TYPES
// =============================================================================

/** Union type of all dance style keys */
export type DanceStyleId = keyof typeof DANCE_STYLES;

/** Type of a single dance style configuration */
export type DanceStyleValue = (typeof DANCE_STYLES)[DanceStyleId];

/** Array of all dance style IDs */
export const DANCE_STYLE_IDS = Object.keys(DANCE_STYLES) as DanceStyleId[];

/** Array of all dance style id values (lowercase) */
export const DANCE_STYLE_ID_VALUES: readonly string[] = Object.values(
  DANCE_STYLES
).map((style) => style.id);

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Options array for dropdowns/select components
 *
 * @example
 * ```html
 * <select>
 *   <option *ngFor="let opt of DANCE_STYLE_OPTIONS" [value]="opt.value">
 *     {{ opt.label }}
 *   </option>
 * </select>
 * ```
 */
export const DANCE_STYLE_OPTIONS: readonly { value: string; label: string }[] =
  Object.values(DANCE_STYLES).map((style) => ({
    value: style.id,
    label: style.label,
  }));

/**
 * Get dance style config by ID
 *
 * @param id - The dance style ID (e.g., 'expressive')
 * @returns The dance style config or undefined
 *
 * @example
 * ```typescript
 * const style = getDanceStyleById('expressive');
 * console.log(style?.label); // 'Ausdruckstanz'
 * ```
 */
export function getDanceStyleById(id: string): DanceStyleValue | undefined {
  return Object.values(DANCE_STYLES).find((style) => style.id === id);
}

/**
 * Check if a string is a valid dance style ID
 *
 * @param id - The string to check
 * @returns True if valid dance style ID
 */
export function isValidDanceStyleId(id: string): boolean {
  return DANCE_STYLE_ID_VALUES.includes(id);
}

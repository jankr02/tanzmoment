/**
 * A single value/principle the studio stands for.
 * Rendered as an expandable band in the accordion.
 */
export interface ValueItem {
  /** Short value title */
  title: string;

  /** One- to two-sentence explanation shown when the band is open */
  text: string;
}

/**
 * Data structure for the Values Section ("Unsere Werte").
 * Presented as a staggered accordion of expandable bands.
 */
export interface ValuesSectionData {
  /** Optional eyebrow/kicker above the headline */
  kicker?: string;

  /** Section headline */
  sectionTitle: string;

  /** Optional subheadline */
  subtitle?: string;

  /** The values, rendered as expandable bands (max. six, one open at a time) */
  values: ValueItem[];
}

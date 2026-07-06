/**
 * Icon keys for the accessibility band. Each maps to an inline SVG in the
 * template (per the Tanzmoment inline-SVG convention — no icon font).
 */
export type SpaceAccessibilityIcon =
  | 'entrance'
  | 'sanitary'
  | 'atmosphere'
  | 'floor'
  | 'assistance'
  | 'transit';

/**
 * A single labelled fact in a location's profile panel.
 */
export interface SpaceFact {
  label: string;
  value: string;
}

/**
 * A single framed photo in a location's collage.
 */
export interface SpacePhoto {
  src: string;
  alt: string;
  /** Short caption shown on the pill tag */
  caption: string;
}

/**
 * A studio location, explorable via the segmented switch.
 */
export interface SpaceLocation {
  /** Stable id, also used as the switch value */
  id: string;
  name: string;
  tagline: string;
  description: string;
  facts: SpaceFact[];
  /** Exactly three photos, rendered as the editorial collage */
  photos: SpacePhoto[];
}

/**
 * A single accessibility feature (shared across all locations).
 */
export interface AccessibilityFeature {
  icon: SpaceAccessibilityIcon;
  label: string;
}

/**
 * Data structure for the Spaces Section ("Unsere Räume").
 * Two switchable locations plus a shared accessibility band.
 */
export interface SpacesSectionData {
  /** Optional overline above the headline */
  overline?: string;

  /** Section headline */
  sectionTitle: string;

  /** Optional subheadline */
  subtitle?: string;

  /** The switchable locations (two expected) */
  locations: SpaceLocation[];

  /** Headline for the accessibility band */
  accessibilityTitle: string;

  /** Accessibility features, identical for every location */
  accessibilityFeatures: AccessibilityFeature[];
}

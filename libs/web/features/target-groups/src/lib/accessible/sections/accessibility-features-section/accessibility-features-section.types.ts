export interface AccessibilityFeature {
  title: string;
  description: string;
  /** Emoji or short illustration glyph. Omitted on quote-eyecatcher cards. */
  icon?: string;
  /** Optional short muted secondary line shown under the title. */
  accent?: string;
  /** When set, the card renders as a quote eyecatcher instead of a feature. */
  quote?: string;
}

export interface AccessibilityFeaturesSectionData {
  headline: string;
  subheadline: string;
  features: AccessibilityFeature[];
}

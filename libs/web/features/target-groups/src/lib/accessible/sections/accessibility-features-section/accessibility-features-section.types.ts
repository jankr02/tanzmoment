export interface AccessibilityFeature {
  /** Asset path to the line-style SVG icon (tinted via CSS mask). */
  icon: string;
  /** Uppercase eyebrow shown above the title. */
  kicker: string;
  title: string;
  description: string;
  /** Additional text revealed when the card is expanded. */
  details: string;
}

export interface AccessibilityFeaturesSectionData {
  headline: string;
  subheadline: string;
  features: AccessibilityFeature[];
}

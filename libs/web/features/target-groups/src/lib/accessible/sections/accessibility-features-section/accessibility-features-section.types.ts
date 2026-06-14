export interface AccessibilityFeature {
  /** Asset path to the line-style SVG icon (tinted via CSS mask). */
  icon: string;
  /** Uppercase eyebrow shown above the title. */
  eyebrow: string;
  title: string;
  description: string;
  /** Accent colour as a CSS value, e.g. 'var(--color-brand)'. */
  color: string;
}

export interface AccessibilityNeed {
  label: string;
  /** Indices of the features this need highlights. */
  matches: number[];
}

export interface AccessibilityFeaturesSectionData {
  headline: string;
  subheadline: string;
  /** Eyebrow prompt above the need chips. */
  prompt: string;
  needs: AccessibilityNeed[];
  features: AccessibilityFeature[];
}

export interface AccessibilityFeature {
  icon: string;
  title: string;
  description: string;
}

export interface AccessibilityFeaturesSectionData {
  headline: string;
  subheadline: string;
  features: AccessibilityFeature[];
}

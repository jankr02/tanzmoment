export interface AccessibleHeroHighlight {
  icon: string;
  text: string;
}

export interface AccessibleHeroData {
  backgroundImage: string;
  headline: string;
  subheadline: string;
  highlights: AccessibleHeroHighlight[];
  ctaText: string;
  ctaRoute: string;
  secondaryCtaText?: string;
  secondaryCtaRoute?: string;
}

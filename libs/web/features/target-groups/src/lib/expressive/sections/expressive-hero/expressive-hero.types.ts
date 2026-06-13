export interface ExpressiveHeroHighlight {
  icon: string;
  text: string;
}

export interface ExpressiveHeroData {
  backgroundImage: string;
  headline: string;
  subheadline: string;
  highlights: ExpressiveHeroHighlight[];
  ctaText: string;
  ctaRoute: string;
  secondaryCtaText?: string;
  secondaryCtaRoute?: string;
}

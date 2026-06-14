export type BenefitCategory = 'physical' | 'emotional' | 'social';

export interface SpotlightBenefit {
  category: BenefitCategory;
  title: string;
  /** Body copy, may contain <strong>/<b> emphasis. */
  description: string;
}

export interface BenefitsSpotlightData {
  headline: string;
  subheadline: string;
  benefits: SpotlightBenefit[];
}

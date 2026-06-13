export interface Benefit {
  icon: string;
  title: string;
  description: string;
  category: 'physical' | 'emotional' | 'social';
}

export interface BenefitsData {
  headline: string;
  subheadline: string;
  benefits: Benefit[];
}

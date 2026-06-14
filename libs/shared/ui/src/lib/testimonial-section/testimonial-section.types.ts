export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  context?: string; // e.g., "Rollstuhlnutzerin"
  imageUrl?: string;
  /** Optional per-voice accent as a CSS variable name, e.g. '--color-brand'. */
  accent?: string;
}

export interface TestimonialsData {
  headline: string;
  testimonials: Testimonial[];
  /** Section-wide fallback accent (CSS variable name), e.g. '--color-mothers-accent'. */
  accentColor?: string;
}

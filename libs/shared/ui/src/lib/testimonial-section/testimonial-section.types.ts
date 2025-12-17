export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  context?: string; // e.g., "Mutter von zwei Kindern, 3 und 5"
  imageUrl?: string;
}

export interface TestimonialsData {
  headline: string;
  testimonials: Testimonial[];
  accentColor?: string; // CSS variable name, e.g., '--color-mothers-accent'
}

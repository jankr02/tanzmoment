export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqData {
  headline: string;
  items: FaqItem[];
  accentColor?: string; // CSS variable name, e.g., '--color-mothers-accent'
}

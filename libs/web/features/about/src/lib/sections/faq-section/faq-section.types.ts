/**
 * A single frequently-asked question and its answer.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Data structure for the FAQ Section ("Häufige Fragen").
 */
export interface FaqSectionData {
  /** Section headline */
  sectionTitle: string;

  /** Optional subheadline */
  subtitle?: string;

  /** The question/answer pairs, rendered as an accordion */
  items: FaqItem[];
}

/**
 * Data structure for the Story Section ("Wie alles begann").
 * Tells the founding narrative of Tanzmoment.
 */
export interface StorySectionData {
  /** Section headline */
  sectionTitle: string;

  /** Optional eyebrow above the headline (e.g. "Unsere Geschichte") */
  eyebrow?: string;

  /** Optional supporting image (studio or founder in action) */
  image?: string;

  /** Alt text for the supporting image */
  imageAlt?: string;

  /** Narrative paragraphs, rendered in order */
  paragraphs: string[];
}

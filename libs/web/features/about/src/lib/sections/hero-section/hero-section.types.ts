/**
 * Data structure for the Hero Section of the About Page
 */
export interface AboutHeroData {
  /** URL to portrait image */
  portraitImage: string;

  /** Person's name */
  name: string;

  /** Title/role (e.g., "Dance teacher & founder") */
  title: string;

  /** Personal quote */
  quote: string;

  /** Short description/bio (2-3 sentences) */
  description: string;
}

/**
 * Data structure for the Mission & Vision Section
 */
export interface MissionVisionData {
  /** Section headline */
  sectionTitle: string;

  /** Mission block */
  mission: {
    headline: string;
    text: string;
  };

  /** Vision block */
  vision: {
    headline: string;
    text: string;
  };
}

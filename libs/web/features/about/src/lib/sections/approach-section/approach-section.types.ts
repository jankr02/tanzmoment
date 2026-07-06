/**
 * A single phase of the studio's pedagogical approach.
 */
export interface ApproachStep {
  /** Short phase title (e.g. "Ankommen") */
  title: string;

  /** One- to two-sentence explanation shown in the detail panel */
  text: string;
}

/**
 * Data structure for the Approach Section ("Unsere Herangehensweise").
 * Presented as an interactive horizontal path stepper.
 */
export interface ApproachSectionData {
  /** Optional eyebrow/kicker above the headline */
  kicker?: string;

  /** Section headline */
  sectionTitle: string;

  /** Optional subheadline */
  subtitle?: string;

  /** Optional hint line below the stepper */
  hint?: string;

  /** The phases, rendered as milestones on the path (four expected) */
  steps: ApproachStep[];
}

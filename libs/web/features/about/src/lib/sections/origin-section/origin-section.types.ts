/**
 * Which value a bloom card represents — drives its background tint and icon.
 */
export type ValueCardVariant = 'mission' | 'vision';

/**
 * A single chapter of the origin story, shown as a timeline tab + panel.
 */
export interface StoryChapter {
  /** Tab label */
  tag: string;

  /** Panel eyebrow — the chapter's phase/period word */
  label: string;

  /** Panel heading */
  title: string;

  /** Panel body text */
  body: string;
}

/**
 * A mission/vision value, rendered as a bloom-on-hover card.
 */
export interface ValueCard {
  variant: ValueCardVariant;
  title: string;
  body: string;
}

/**
 * Data structure for the combined origin section:
 * an interactive story timeline plus the mission & vision values.
 */
export interface OriginSectionData {
  /** Eyebrow above the headline */
  eyebrow: string;

  /** Section headline */
  sectionTitle: string;

  /** Intro paragraph below the headline */
  intro: string;

  /** Story chapters (three expected), navigated via the timeline tabs */
  chapters: StoryChapter[];

  /** Heading for the values block */
  valuesTitle: string;

  /** Hint line for the values block */
  valuesHint: string;

  /** The mission & vision cards */
  values: ValueCard[];
}

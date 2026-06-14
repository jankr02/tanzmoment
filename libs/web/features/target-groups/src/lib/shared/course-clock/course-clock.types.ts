export interface CoursePhase {
  name: string;
  minutes: number;
  /** Phase colour as a CSS value, e.g. 'var(--color-secondary)'. */
  color: string;
  description: string;
}

export type CourseFactIcon = 'group' | 'clock' | 'wear' | 'level';

export interface CourseFact {
  icon: CourseFactIcon;
  value: string;
  label: string;
}

export interface CourseClockData {
  headline: string;
  intro: string;
  eyebrow: string;
  phases: CoursePhase[];
  facts: CourseFact[];
}

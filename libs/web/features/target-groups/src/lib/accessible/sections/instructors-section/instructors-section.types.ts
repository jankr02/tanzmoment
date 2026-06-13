export interface InstructorQualification {
  /** Asset path to the line-style SVG icon (tinted via CSS mask). */
  icon: string;
  title: string;
  description: string;
}

export interface InstructorsSectionData {
  headline: string;
  intro: string;
  qualifications: InstructorQualification[];
  certificationNote?: string;
}

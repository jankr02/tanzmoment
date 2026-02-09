export interface InstructorQualification {
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

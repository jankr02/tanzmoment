export interface MethodologyPoint {
  title: string;
  description: string;
}

export interface MethodologyData {
  headline: string;
  intro: string;
  points: MethodologyPoint[];
  qualificationNote: string;
}

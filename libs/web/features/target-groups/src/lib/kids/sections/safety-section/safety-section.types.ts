export interface SafetyPoint {
  icon: string;
  title: string;
  description: string;
}

export interface MethodologyPoint {
  title: string;
  description: string;
}

export interface SafetySectionData {
  headline: string;
  intro: string;
  safetyPoints: SafetyPoint[];
  methodologyHeadline: string;
  methodologyIntro: string;
  methodologyPoints: MethodologyPoint[];
  certificationNote: string;
}

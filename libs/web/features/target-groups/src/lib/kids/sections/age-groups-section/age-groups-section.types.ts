export interface AgeGroup {
  id: string;
  name: string;
  ageRange: string;
  icon: string;
  description: string;
  highlights: string[];
}

export interface AgeGroupsData {
  headline: string;
  subheadline: string;
  groups: AgeGroup[];
}

export interface CourseDetail {
  icon: string;
  title: string;
  description: string;
}

export interface CourseFlowStep {
  phase: string;
  duration: string;
  description: string;
}

export interface WhatToExpectData {
  headline: string;
  intro: string;
  courseFlow: {
    headline: string;
    steps: CourseFlowStep[];
  };
  details: CourseDetail[];
}

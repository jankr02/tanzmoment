// ============================================================================
// COURSE DETAIL CONTENT TYPES
// ============================================================================
// TypeScript-Schema for the `detailContent` JSONB field in the Course model.
// Used by backend (validation) and frontend (rendering).
//
// ALL fields are optional — the frontend uses fallback values
// from the regular Course fields (title, description, imageUrl, etc.).
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// ROOT INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseDetailContent {
  hero?: CourseDetailHeroContent;
  quickFacts?: CourseDetailQuickFactsContent;
  description?: CourseDetailDescriptionContent;
  instructor?: CourseDetailInstructorContent;
  schedule?: CourseDetailScheduleContent;
  booking?: CourseDetailBookingContent;

  // V2 fields (prepared, not yet implemented)
  courseFlow?: CourseDetailCourseFlowContent;
  socialProof?: CourseDetailSocialProofContent;
  faq?: CourseDetailFaqContent;
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseDetailHeroContent {
  /** Override for course title in hero (Fallback: course.title) */
  headlineOverride?: string;
  /** Sub-headline (Fallback: course.catchPhrase) */
  subHeadline?: string;
  /** Alternative hero image (Fallback: course.imageUrl) */
  imageUrl?: string;
  /** Optional: Video URL (YouTube/Vimeo embed) – V2 */
  videoUrl?: string;
  /** Overlay text color override (for dark/light images) */
  textColorOverride?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK FACTS
// ─────────────────────────────────────────────────────────────────────────────

export type QuickFactType =
  | 'price'
  | 'duration'
  | 'level'
  | 'location'
  | 'nextDate'
  | 'spotsAvailable'
  | 'maxParticipants';

export interface CustomFact {
  icon: string;
  label: string;
  value: string;
}

export interface CourseDetailQuickFactsContent {
  customFacts?: CustomFact[];
  factOrder?: QuickFactType[];
  hiddenFacts?: QuickFactType[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIPTION
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseHighlight {
  icon?: string;
  text: string;
}

export interface CourseDetailDescriptionContent {
  /** Section headline (Fallback: "Über diesen Kurs") */
  headline?: string;
  /** Main text — Markdown allowed (Fallback: course.description) */
  body?: string;
  /** Optional: target audience block */
  targetAudience?: {
    headline?: string;
    body?: string;
  };
  /** Feature highlights list */
  highlights?: CourseHighlight[];
  /** Atmospheric image URL shown beside the description text */
  imageUrl?: string;
  /** Alt text for the atmospheric image */
  imageAlt?: string;
  /** Image position relative to text. Default: 'right' */
  imagePosition?: 'left' | 'right';
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseDetailInstructorContent {
  /** Bio override for this specific course (Fallback: instructor.bio) */
  bioOverride?: string;
  /** Personal quote about the dance style */
  quote?: string;
  /** Qualifications/certifications (Fallback: instructor.expertise) */
  qualifications?: string[];
  /** Alternative image in course context (Fallback: instructor.imageUrl) */
  imageOverride?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseDetailScheduleContent {
  /** Section headline (Fallback: "Termine & Verfügbarkeit") */
  headline?: string;
  /** Info text above the session list */
  infoText?: string;
  /** Session-specific labels (Key = Session ID, Value = label text) */
  sessionLabels?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseDetailBookingContent {
  /** CTA button text (Fallback: "Jetzt buchen") */
  ctaText?: string;
  /** Price note (e.g. "inkl. Materialien", "pro Einzelstunde") */
  priceNote?: string;
  /** Included services list */
  includes?: string[];
  /** Notice text (e.g. "Kostenlose Stornierung bis 24h vorher") */
  notice?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// V2: COURSE FLOW (prepared)
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseFlowStep {
  phase: string;
  duration: string;
  description: string;
  icon?: string;
}

export interface CourseDetailCourseFlowContent {
  headline?: string;
  intro?: string;
  steps?: CourseFlowStep[];
}

// ─────────────────────────────────────────────────────────────────────────────
// V2: SOCIAL PROOF (prepared)
// ─────────────────────────────────────────────────────────────────────────────

export interface Testimonial {
  text: string;
  authorName: string;
  authorRole?: string;
  imageUrl?: string;
  rating?: number;
}

export interface CourseDetailSocialProofContent {
  headline?: string;
  testimonials?: Testimonial[];
}

// ─────────────────────────────────────────────────────────────────────────────
// V2: FAQ (prepared)
// ─────────────────────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  /** Markdown allowed */
  answer: string;
}

export interface CourseDetailFaqContent {
  headline?: string;
  items?: FaqItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Default empty content object
// ─────────────────────────────────────────────────────────────────────────────

export const EMPTY_COURSE_DETAIL_CONTENT: CourseDetailContent = {};

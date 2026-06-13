// ============================================================================
// COURSE DETAIL TYPES (Feature-internal)
// ============================================================================
// Types required only within the Course Feature:
// - Theme definitions
// - Component input types
// - Display helper types
// ============================================================================

import {
  BookingMode,
  CourseDetailContent,
  CourseDetailHeroContent,
  CourseDetailQuickFactsContent,
  CourseDetailDescriptionContent,
  CourseDetailInstructorContent,
  CourseDetailScheduleContent,
  CourseDetailBookingContent,
  CourseDetailCourseFlowContent,
  CourseFlowStep,
  CourseDetailSocialProofContent,
  Testimonial,
  CourseDetailFaqContent,
  FaqItem,
} from '@tanzmoment/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// DANCE STYLE THEMING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Theme tokens for the Course Detail Page.
 * Set as CSS Custom Properties on the host element.
 */
export interface CourseDetailTheme {
  /** Hero & section backgrounds */
  background: string;
  /** Accent for badges, hover states, borders */
  accent: string;
  /** Button background color */
  buttonBg: string;
  /** Button text color */
  buttonText: string;
  /** Primary text color */
  text: string;
  /** Secondary text color */
  textSecondary: string;
  /** Card border color */
  border: string;
  /** Box shadow color */
  shadowColor: string;
  /** Wave divider fill color */
  waveFill: string;
}

/**
 * Theme map for all dance styles + default fallback.
 *
 * Keys are lowercase dance style IDs from the API:
 * 'accessible', 'expressive', 'kids', 'mothers', 'default'
 */
export const COURSE_DETAIL_THEMES: Record<
  'accessible' | 'expressive' | 'kids' | 'mothers' | 'default',
  CourseDetailTheme
> = {
  accessible: {
    background: '#E8F3EC',
    accent: '#B5D4C0',
    buttonBg: '#7A9D85',
    buttonText: '#FFFFFF',
    text: '#2E2A25',
    textSecondary: '#5E5A55',
    border: 'rgba(122, 157, 133, 0.2)',
    shadowColor: 'rgba(122, 157, 133, 0.15)',
    waveFill: '#E8F3EC',
  },
  expressive: {
    background: '#EDE4F2',
    accent: '#D4C8E0',
    buttonBg: '#A893B8',
    buttonText: '#FFFFFF',
    text: '#2E2A25',
    textSecondary: '#5E5A55',
    border: 'rgba(168, 147, 184, 0.2)',
    shadowColor: 'rgba(168, 147, 184, 0.15)',
    waveFill: '#EDE4F2',
  },
  kids: {
    background: '#E4EDF2',
    accent: '#B8D0DC',
    buttonBg: '#89A9B5',
    buttonText: '#FFFFFF',
    text: '#2E2A25',
    textSecondary: '#5E5A55',
    border: 'rgba(137, 169, 181, 0.2)',
    shadowColor: 'rgba(137, 169, 181, 0.15)',
    waveFill: '#E4EDF2',
  },
  mothers: {
    background: '#FAE8C8',
    accent: '#EDDBB8',
    buttonBg: '#D8B890',
    buttonText: '#FFFFFF',
    text: '#2E2A25',
    textSecondary: '#5E5A55',
    border: 'rgba(216, 184, 144, 0.2)',
    shadowColor: 'rgba(216, 184, 144, 0.15)',
    waveFill: '#FAE8C8',
  },
  default: {
    background: '#F2ECE3',
    accent: '#D0A373',
    buttonBg: '#688B68',
    buttonText: '#FFFFFF',
    text: '#2E2A25',
    textSecondary: '#5E5A55',
    border: 'rgba(104, 139, 104, 0.2)',
    shadowColor: 'rgba(104, 139, 104, 0.15)',
    waveFill: '#F2ECE3',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES (Frontend)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Instructor data in the detail response
 */
export interface CourseDetailInstructor {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  imageUrl?: string;
  expertise: string[];
}

/**
 * Session data in the detail response
 */
export interface CourseDetailSession {
  id: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  formattedDate: string;
  formattedTime: string;
  availableSpots: number;
  isFullyBooked: boolean;
  label?: string;
}

/**
 * Complete course detail data from API response
 */
export interface CourseDetailData {
  id: string;
  slug: string;
  title: string;
  catchPhrase?: string;
  shortDescription: string;
  description: string;
  danceStyle: string;
  targetGroup: string;
  level: string;
  duration: number;
  maxParticipants: number;
  bookingMode: BookingMode;
  priceInCents: number;
  price: number;
  priceFormatted: string;
  imageUrl?: string;

  // CMS Content
  detailContent?: CourseDetailContent;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;

  // Relations
  instructor: CourseDetailInstructor;
  sessions: CourseDetailSession[];

  // Computed
  totalUpcomingSessions: number;
  availableSpots: number;
  isFullyBooked: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORTS for convenient imports in section components
// ─────────────────────────────────────────────────────────────────────────────

export type {
  CourseDetailContent,
  CourseDetailHeroContent,
  CourseDetailQuickFactsContent,
  CourseDetailDescriptionContent,
  CourseDetailInstructorContent,
  CourseDetailScheduleContent,
  CourseDetailBookingContent,
  CourseDetailCourseFlowContent,
  CourseFlowStep,
  CourseDetailSocialProofContent,
  Testimonial,
  CourseDetailFaqContent,
  FaqItem,
};

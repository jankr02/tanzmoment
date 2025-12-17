// ============================================================================
// COURSE CARD TYPES V7
// ============================================================================

import { DanceStyleId, DANCE_STYLE_COLOR_SCHEMES } from '../dance-style-card/dance-style-card.types';

// Re-export DanceStyleId as DanceStyle for backwards compatibility
export type DanceStyle = DanceStyleId;

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';

export interface CourseCardData {
  id: string;
  slug: string;

  // Header
  danceStyle: DanceStyle;
  catchPhrase?: string;
  isHighlighted?: boolean;

  // Content
  title: string;
  shortDescription: string;
  imageUrl?: string;

  // Meta Info
  dateTime: string;
  location: string;
  price: number;
  priceFormatted?: string;

  // Participants
  targetGroup?: string;
  maxParticipants?: number;
  availableSpots?: number;

  // CTA
  ctaText?: string;
  ctaLink?: string;
}

// Color Mapping for Dance Styles - uses the centralized color schemes
export interface CourseCardColorScheme {
  bg: string;
  border: string;
  accent: string;
  text: string;
  textSecondary: string;
  buttonBg: string;
  shadowColor: string;
}

export const DANCE_STYLE_COLORS: Record<DanceStyle, CourseCardColorScheme> = {
  accessible: {
    bg: DANCE_STYLE_COLOR_SCHEMES.accessible.background,
    border: DANCE_STYLE_COLOR_SCHEMES.accessible.border,
    accent: DANCE_STYLE_COLOR_SCHEMES.accessible.accent,
    text: DANCE_STYLE_COLOR_SCHEMES.accessible.text,
    textSecondary: DANCE_STYLE_COLOR_SCHEMES.accessible.textSecondary,
    buttonBg: DANCE_STYLE_COLOR_SCHEMES.accessible.buttonBg || DANCE_STYLE_COLOR_SCHEMES.accessible.accent,
    shadowColor: DANCE_STYLE_COLOR_SCHEMES.accessible.shadowColor,
  },
  expressive: {
    bg: DANCE_STYLE_COLOR_SCHEMES.expressive.background,
    border: DANCE_STYLE_COLOR_SCHEMES.expressive.border,
    accent: DANCE_STYLE_COLOR_SCHEMES.expressive.accent,
    text: DANCE_STYLE_COLOR_SCHEMES.expressive.text,
    textSecondary: DANCE_STYLE_COLOR_SCHEMES.expressive.textSecondary,
    buttonBg: DANCE_STYLE_COLOR_SCHEMES.expressive.buttonBg || DANCE_STYLE_COLOR_SCHEMES.expressive.accent,
    shadowColor: DANCE_STYLE_COLOR_SCHEMES.expressive.shadowColor,
  },
  kids: {
    bg: DANCE_STYLE_COLOR_SCHEMES.kids.background,
    border: DANCE_STYLE_COLOR_SCHEMES.kids.border,
    accent: DANCE_STYLE_COLOR_SCHEMES.kids.accent,
    text: DANCE_STYLE_COLOR_SCHEMES.kids.text,
    textSecondary: DANCE_STYLE_COLOR_SCHEMES.kids.textSecondary,
    buttonBg: DANCE_STYLE_COLOR_SCHEMES.kids.buttonBg || DANCE_STYLE_COLOR_SCHEMES.kids.accent,
    shadowColor: DANCE_STYLE_COLOR_SCHEMES.kids.shadowColor,
  },
  mothers: {
    bg: DANCE_STYLE_COLOR_SCHEMES.mothers.background,
    border: DANCE_STYLE_COLOR_SCHEMES.mothers.border,
    accent: DANCE_STYLE_COLOR_SCHEMES.mothers.accent,
    text: DANCE_STYLE_COLOR_SCHEMES.mothers.text,
    textSecondary: DANCE_STYLE_COLOR_SCHEMES.mothers.textSecondary,
    buttonBg: DANCE_STYLE_COLOR_SCHEMES.mothers.buttonBg || DANCE_STYLE_COLOR_SCHEMES.mothers.accent,
    shadowColor: DANCE_STYLE_COLOR_SCHEMES.mothers.shadowColor,
  },
};

// Icons for Dance Styles (Lucide icon names or custom SVG paths)
export const DANCE_STYLE_ICONS: Record<DanceStyle, string> = {
  accessible: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  expressive: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
  kids: 'M9 18V5l12-2v13 M9 9l12-2',
  mothers: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
};

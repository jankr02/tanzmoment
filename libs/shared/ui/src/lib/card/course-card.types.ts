// ============================================================================
// COURSE CARD TYPES V6
// ============================================================================

export type DanceStyle = 
  | 'Contemporary'
  | 'Modern'
  | 'Jazz'
  | 'Ballet'
  | 'Improvisation'
  | 'Ausdruckstanz';

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

// Color Mapping for Dance Styles
export const DANCE_STYLE_COLORS: Record<DanceStyle, { bg: string; border: string; text: string }> = {
  Contemporary: {
    bg: '#F5ECE7',
    border: '#B29A93',
    text: '#2E2A25',
  },
  Modern: {
    bg: '#A9CDD4',
    border: '#8DB8C2',
    text: '#1A3A3E',
  },
  Jazz: {
    bg: '#688B68',
    border: '#5A7A5A',
    text: '#FFFFFF',
  },
  Ballet: {
    bg: '#FBD8CF',
    border: '#E6C5BD',
    text: '#2E2A25',
  },
  Improvisation: {
    bg: '#F2ECE3',
    border: '#E6DED7',
    text: '#2E2A25',
  },
  Ausdruckstanz: {
    bg: '#C08969',
    border: '#A87358',
    text: '#FFFFFF',
  },
};

// Icons for Dance Styles (Lucide icon names or custom SVG paths)
export const DANCE_STYLE_ICONS: Record<DanceStyle, string> = {
  Contemporary: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  Modern: 'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  Jazz: 'M9 18V5l12-2v13 M9 9l12-2',
  Ballet: 'M3 12h18 M12 3v18',
  Improvisation: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  Ausdruckstanz: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
};

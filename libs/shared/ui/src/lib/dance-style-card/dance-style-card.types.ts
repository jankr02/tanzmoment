// ============================================================================
// DANCE STYLE CARD TYPES
// ============================================================================
// UI card for displaying a dance style on the Course Overview Page
// Uses DanceStyleId from @tanzmoment/shared/types
// ============================================================================

/**
 * Dance Style IDs - matching the backend enum
 * These IDs are also used for URL parameters and API filters
 */
export type DanceStyleId = 'accessible' | 'expressive' | 'kids' | 'mothers';

/**
 * Data structure for a Dance Style Card
 */
export interface DanceStyleCardData {
  /** Unique ID of the dance style */
  id: DanceStyleId;

  /** Display label (localized) */
  label: string;

  /** Short description of the dance style */
  description: string;

  /** Path to illustration (SVG recommended) */
  illustrationUrl?: string;

  /** Alternative: Icon name from IconComponent */
  iconName?: string;

  /** Optional: Number of available courses */
  courseCount?: number;

  /** Optional: CTA text (default: "Mehr erfahren") */
  ctaText?: string;

  /** Optional: Route for navigation (e.g., '/fuer-muetter') */
  route?: string;
}

/**
 * Navigation mode for Dance Style Cards
 * - 'emit': Event is emitted (default)
 * - 'navigate': Direct navigation to route
 */
export type DanceStyleNavigationMode = 'emit' | 'navigate';

/**
 * Color scheme for each dance style
 * Defines background, accent and text colors
 */
export interface DanceStyleColorScheme {
  /** Main background color */
  background: string;

  /** Accent color for hover/border */
  accent: string;

  /** Text color (must be AA compliant) */
  text: string;

  /** Secondary text color for description */
  textSecondary: string;

  /** Optional button background color */
  buttonBg?: string;

  /** Optional button text color */
  buttonText?: string;

  /** Border color for the card */
  border: string;

  /** Shadow color (rgba) for drop shadow */
  shadowColor: string;
}

/**
 * Color mapping for all dance styles
 * Based on defined colors from COURSE_OVERVIEW_PROGRESS.md
 */
export const DANCE_STYLE_COLOR_SCHEMES: Record<
  DanceStyleId,
  DanceStyleColorScheme
> = {
  accessible: {
    background: '#E8F3EC', // Soft sage green (pastel)
    accent: '#B5D4C0', // Gentle green accent
    text: '#2E2A25', // --color-text-primary
    buttonBg: '#7A9D85', // Softer green
    textSecondary: '#5E5A55', // --color-text-secondary
    border: 'rgba(122, 157, 133, 0.2)', // Soft green tint
    shadowColor: 'rgba(122, 157, 133, 0.15)', // Soft green shadow
  },
  expressive: {
    background: '#EDE4F2', // Delicate lavender (pastel)
    accent: '#D4C8E0', // Gentle lilac accent
    text: '#2E2A25',
    buttonBg: '#A893B8', // Soft lavender
    textSecondary: '#5E5A55',
    border: 'rgba(168, 147, 184, 0.2)', // Soft lavender tint
    shadowColor: 'rgba(168, 147, 184, 0.15)', // Soft lavender shadow
  },
  kids: {
    background: '#E4EDF2', // Soft sky blue (pastel)
    accent: '#B8D0DC', // Gentle blue accent
    text: '#2E2A25',
    buttonBg: '#89A9B5', // Softer blue-gray
    textSecondary: '#5E5A55',
    border: 'rgba(137, 169, 181, 0.2)', // Soft blue tint
    shadowColor: 'rgba(137, 169, 181, 0.15)', // Soft blue shadow
  },
  mothers: {
    background: '#FAE8C8', // Creamy champagne yellow (pastel)
    accent: '#EDDBB8', // Gentle gold accent
    text: '#2E2A25',
    buttonBg: '#D8B890', // Softer gold
    textSecondary: '#5E5A55',
    border: 'rgba(216, 184, 144, 0.2)', // Soft gold tint
    shadowColor: 'rgba(216, 184, 144, 0.15)', // Soft gold shadow
  },
};

/**
 * Default data for all 4 dance styles
 * Can be used as basis for display
 */
export const DEFAULT_DANCE_STYLES: DanceStyleCardData[] = [
  {
    id: 'accessible',
    label: 'Tanzen mit Behinderung',
    description:
      'Inklusiver Tanz für Menschen mit und ohne Behinderung. Gemeinsam Bewegung erleben.',
    illustrationUrl: '/assets/illustrations/dance-styles/accessible.svg',
    ctaText: 'Mehr erfahren',
    route: '/barrierefreier-tanz',
  },
  {
    id: 'expressive',
    label: 'Ausdruckstanz',
    description:
      'Freier, kreativer Ausdruck durch Bewegung. Entdecke deinen eigenen Tanzstil.',
    illustrationUrl: '/assets/illustrations/dance-styles/expressive.svg',
    ctaText: 'Mehr erfahren',
    route: '/ausdruckstanz',
  },
  {
    id: 'kids',
    label: 'Tanzen für Kinder',
    description:
      'Spielerische Bewegung für kleine Tänzer:innen. Spaß und Kreativität vereint.',
    illustrationUrl: '/assets/illustrations/dance-styles/kids.svg',
    ctaText: 'Mehr erfahren',
    route: '/fuer-kinder',
  },
  {
    id: 'mothers',
    label: 'Tanzen für Mütter',
    description: 'Zeit für dich – Tanz und Entspannung speziell für Mütter.',
    illustrationUrl: '/assets/illustrations/dance-styles/mother.svg',
    ctaText: 'Mehr erfahren',
    route: '/fuer-muetter',
  },
];

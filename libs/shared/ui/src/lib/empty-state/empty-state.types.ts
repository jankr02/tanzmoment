// ============================================================================
// EMPTY STATE TYPES
// ============================================================================
// Types for the Empty State Component
// ============================================================================

/**
 * Variants of the Empty State display
 */
export type EmptyStateVariant =
  | 'no-results' // Filters yield no results
  | 'no-courses' // No courses available yet
  | 'error' // Error loading
  | 'offline' // No internet connection
  | 'custom'; // Custom display

/**
 * Illustration Preset
 */
export type EmptyStateIllustration =
  | 'search' // Magnifying glass / search
  | 'empty-box' // Empty box
  | 'calendar' // Calendar
  | 'error' // Error symbol
  | 'offline' // Offline symbol
  | 'dance' // Dance illustration
  | 'none'; // No illustration

/**
 * Action Button Config
 */
export interface EmptyStateAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  action: 'clear-filters' | 'retry' | 'home' | 'custom';
  customHandler?: () => void;
}

/**
 * Empty State Configuration
 */
export interface EmptyStateConfig {
  variant: EmptyStateVariant;
  title: string;
  message: string;
  illustration?: EmptyStateIllustration;
  actions?: EmptyStateAction[];
}

/**
 * Preset Configurations
 */
export const EMPTY_STATE_PRESETS: Record<
  EmptyStateVariant,
  Omit<EmptyStateConfig, 'variant'>
> = {
  'no-results': {
    title: 'Keine Kurse gefunden',
    message:
      'Mit den aktuellen Filtern wurden keine Kurse gefunden. Versuche es mit anderen Filtereinstellungen.',
    illustration: 'search',
    actions: [
      {
        label: 'Filter zurücksetzen',
        icon: 'rotate-ccw',
        variant: 'primary',
        action: 'clear-filters',
      },
    ],
  },
  'no-courses': {
    title: 'Noch keine Kurse',
    message: 'Aktuell sind keine Kurse verfügbar. Schau bald wieder vorbei!',
    illustration: 'calendar',
    actions: [
      {
        label: 'Zur Startseite',
        icon: 'home',
        variant: 'secondary',
        action: 'home',
      },
    ],
  },
  error: {
    title: 'Etwas ist schiefgelaufen',
    message:
      'Die Kurse konnten nicht geladen werden. Bitte versuche es erneut.',
    illustration: 'error',
    actions: [
      {
        label: 'Erneut versuchen',
        icon: 'refresh-cw',
        variant: 'primary',
        action: 'retry',
      },
    ],
  },
  offline: {
    title: 'Keine Verbindung',
    message:
      'Du scheinst offline zu sein. Bitte prüfe deine Internetverbindung.',
    illustration: 'offline',
    actions: [
      {
        label: 'Erneut versuchen',
        icon: 'refresh-cw',
        variant: 'primary',
        action: 'retry',
      },
    ],
  },
  custom: {
    title: '',
    message: '',
    illustration: 'none',
    actions: [],
  },
};

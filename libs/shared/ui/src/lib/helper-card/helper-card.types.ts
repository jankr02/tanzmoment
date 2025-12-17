// ============================================================================
// HELPER CARD TYPES
// Shared types for the Helper Card component
// ============================================================================

/**
 * Supported helper action types
 * - 'route': Internal Angular route navigation
 * - 'link': External URL (opens in new tab)
 * - 'action': Custom event emission (for modals, etc.)
 */
export type HelperActionType = 'route' | 'link' | 'action';

/**
 * Predefined helper card IDs for type-safe usage
 */
export type HelperCardId = 'course-plan' | 'message' | 'newsletter';

/**
 * Helper Card Data Interface
 *
 * Defines the structure for a single helper card.
 * Used to configure the helper-card component.
 */
export interface HelperCardData {
  /** Unique identifier for the card */
  id: HelperCardId;

  /** Display title (shown below illustration) */
  title: string;

  /** Optional subtitle/description */
  subtitle?: string;

  /** Path to SVG illustration */
  illustration: string;

  /** Alt text for illustration (accessibility) */
  alt: string;

  /** Type of action when clicked */
  actionType: HelperActionType;

  /**
   * Target destination or action identifier
   * - For 'route': Angular route path (e.g., '/courses')
   * - For 'link': Full URL (e.g., 'https://newsletter.example.com')
   * - For 'action': Action identifier (e.g., 'open-newsletter-modal')
   */
  target: string;

  /** Optional CTA button text (defaults to title) */
  ctaText?: string;
}

/**
 * Helper Card Click Event
 * Emitted when a card is clicked with action type 'action'
 */
export interface HelperCardClickEvent {
  /** ID of the clicked card */
  cardId: HelperCardId;

  /** Action identifier from target */
  action: string;
}

// ============================================================================
// PREDEFINED HELPER CARDS DATA
// ============================================================================

/**
 * Default helper cards configuration
 * Used by helper-section to display the three main helper actions
 */
export const HELPER_CARDS_DATA: HelperCardData[] = [
  {
    id: 'course-plan',
    title: 'Kursplan',
    subtitle: 'Alle Termine auf einen Blick',
    illustration: '/assets/illustrations/helper-card/course-plan.svg',
    alt: 'Kursplan Illustration - Kalender mit Terminen',
    actionType: 'route',
    target: '/courses',
    ctaText: 'Zum Kursplan',
  },
  {
    id: 'message',
    title: 'Kontakt',
    subtitle: 'Fragen? Ich bin für dich da!',
    illustration: '/assets/illustrations/helper-card/message.svg',
    alt: 'Kontakt Illustration - Hände mit Nachricht',
    actionType: 'route',
    target: '/kontakt',
    ctaText: 'Nachricht senden',
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    subtitle: 'Bleib auf dem Laufenden',
    illustration: '/assets/illustrations/helper-card/newsletter.svg',
    alt: 'Newsletter Illustration - Person mit Blumen',
    actionType: 'action',
    target: 'open-newsletter-modal',
    ctaText: 'Anmelden',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a helper card by ID
 */
export function getHelperCard(id: HelperCardId): HelperCardData | undefined {
  return HELPER_CARDS_DATA.find((card) => card.id === id);
}

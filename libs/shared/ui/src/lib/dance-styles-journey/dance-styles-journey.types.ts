// ============================================================================
// DANCE STYLES JOURNEY — Theme + content per dance style (mobile only)
// ============================================================================

import type { DanceStyleId } from '../dance-style-card/dance-style-card.types';

export interface DanceStyleJourneyTheme {
  catchphrase: string;
  audience: string;
  description: string;
  bg: string;
  bgDeep: string;
  accent: string;
  ink: string;
}

export const DANCE_STYLE_JOURNEY_THEMES: Record<
  DanceStyleId,
  DanceStyleJourneyTheme
> = {
  kids: {
    catchphrase: 'Spiel & Spaß',
    audience: '3 – 12 Jahre',
    description:
      'Spielerische Bewegung für kleine Tänzer:innen. Hier wird gehüpft, gewirbelt und entdeckt — Kreativität trifft Freude.',
    bg: '#E8EFD8',
    bgDeep: '#D4DEC0',
    accent: '#7a8d5b',
    ink: '#3a4a2d',
  },
  mothers: {
    catchphrase: 'Kraft & Leichtigkeit',
    audience: 'Mama & Mama-Baby',
    description:
      'Zeit für dich, Raum für Bewegung und neue Energie nach der Geburt — mit oder ohne Baby auf dem Arm.',
    bg: '#F8E6C7',
    bgDeep: '#EFD4A6',
    accent: '#d4933e',
    ink: '#5a3f1a',
  },
  expressive: {
    catchphrase: 'Frei & lebendig',
    audience: 'Erwachsene',
    description:
      'Freier, kreativer Ausdruck durch Bewegung. Entdecke deinen eigenen Tanz — ohne Schritte, ohne Vorgaben.',
    bg: '#F5DDCB',
    bgDeep: '#ECC6AB',
    accent: '#c67a52',
    ink: '#5a2f1a',
  },
  accessible: {
    catchphrase: 'Inklusiv & verbindend',
    audience: 'Alle Erwachsenen',
    description:
      'Inklusiver Tanz für Menschen mit und ohne Behinderung. Gemeinsam Bewegung erleben — Rollstuhl, Stock oder frei.',
    bg: '#DDE3CC',
    bgDeep: '#C5CFB0',
    accent: '#6b7c4d',
    ink: '#2a3520',
  },
};

export const DANCE_STYLE_JOURNEY_ORDER: DanceStyleId[] = [
  'kids',
  'mothers',
  'expressive',
  'accessible',
];

export const DANCE_STYLE_JOURNEY_FIRST_BG =
  DANCE_STYLE_JOURNEY_THEMES.kids.bg;

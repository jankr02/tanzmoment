import { TrustGroup, TrustGroupTheme } from './trust-rings.types';

/** Shared safety guarantee shown in the band across all audiences. */
export const TRUST_GUARANTEE =
  'Alle Kursleiter:innen haben ein erweitertes Führungszeugnis und bilden sich regelmäßig fort.';

/**
 * Per-audience theming + copy for the "Sicher aufgehoben" trust rings.
 * The four-step ramps are section-local presentation values (inner dark →
 * outer light); they have no single-token equivalent in the palette.
 *
 * NOTE: the Mütter and Ausdruckstanz layer copy is provisional placeholder
 * from the design handoff and should be reviewed/approved before launch.
 */
export const TRUST_GROUPS: Record<TrustGroup, TrustGroupTheme> = {
  kids: {
    ramp: ['#2f7e8b', '#4ba0ab', '#84c2ca', '#b6dee3'],
    tint: '#e4f0f1',
    heading: 'Bei uns ist dein Kind sicher aufgehoben',
    sub: 'Spielerisch, ohne Druck – und von geschulten Kursleiter:innen begleitet.',
    layers: [
      {
        title: 'Spielerisches Lernen',
        description:
          'Kinder lernen am besten, wenn sie Spass haben. Wir verpacken alles in Spiele, Geschichten und kreative Aufgaben – Lernen passiert ganz nebenbei.',
      },
      {
        title: 'Kein Leistungsdruck',
        description:
          'Es gibt kein „zu langsam" oder „nicht gut genug". Jedes Kind entwickelt sich in seinem eigenen Tempo, und wir feiern jeden Fortschritt.',
      },
      {
        title: 'Positive Verstärkung',
        description:
          'Wir arbeiten mit Ermutigung statt Kritik. Kinder sollen stolz auf sich sein dürfen – egal auf welchem Level sie sind.',
      },
      {
        title: 'Altersgerechte Inhalte',
        description:
          'Musik, Bewegungen und Themen sind auf das jeweilige Alter abgestimmt. Was für 4-Jährige funktioniert, ist anders als für 10-Jährige.',
      },
    ],
  },
  ausdruck: {
    ramp: ['#9c5a36', '#c0784f', '#d59b78', '#e6c3aa'],
    tint: '#f4ece5',
    heading: 'Ein geschützter Raum für deinen Ausdruck',
    sub: 'Ohne Wertung, mit erfahrener Anleitung – du gibst das Tempo vor.',
    layers: [
      {
        title: 'Kein Richtig oder Falsch',
        description:
          'Ausdruck kennt keine Fehler. Deine Bewegung ist deine Sprache – wir bewerten sie nicht, wir begleiten sie.',
      },
      {
        title: 'Kreative Impulse',
        description:
          'Wir geben Impulse statt fertiger Choreografien. Du entscheidest, wie du sie mit dir füllst.',
      },
      {
        title: 'Sicherer Raum',
        description:
          'Eine Atmosphäre ohne Leistungsdenken, in der du dich öffnen und ausprobieren darfst.',
      },
      {
        title: 'Erfahrene Anleitung',
        description:
          'Tanzpädagog:innen mit Fokus auf kreativer Bewegungsarbeit und einem feinen Gespür für Gruppen.',
      },
    ],
  },
  muetter: {
    ramp: ['#a87d28', '#c99a3a', '#e0bd6b', '#efd9a3'],
    tint: '#f6eedd',
    heading: 'Sanft begleitet, sicher aufgehoben',
    sub: 'Mit Rücksicht auf dich und deinen Körper – flexibel und ohne Leistungsdruck.',
    layers: [
      {
        title: 'Dein Tempo',
        description:
          'Dein Körper, dein Tempo. Pausen sind ausdrücklich Teil des Kurses, nicht Schwäche.',
      },
      {
        title: 'Rücksicht nach der Geburt',
        description:
          'Besondere Achtsamkeit für Beckenboden und Rumpfmuskulatur – sanft und sicher aufgebaut.',
      },
      {
        title: 'Raum für dich',
        description:
          'Kleine Gruppen, in denen du als Mensch gesehen wirst – nicht nur als Mama.',
      },
      {
        title: 'Erfahrene Begleitung',
        description:
          'Kursleiterinnen mit Erfahrung in der Arbeit mit jungen Müttern und der Zeit nach der Geburt.',
      },
    ],
  },
  behinderung: {
    ramp: ['#44508c', '#5f6ba8', '#9298c4', '#c4c8de'],
    tint: '#ebedf6',
    heading: 'Erfahrung, die zählt',
    sub: 'Inklusive Tanzarbeit erfordert Wissen, Empathie und Flexibilität – das bringen wir mit.',
    layers: [
      {
        title: 'Individuelle Anpassung',
        description:
          'Jede Kursstunde wird an die aktuellen Bedürfnisse der Teilnehmenden angepasst. Schmerzen heute? Müdigkeit? Wir reagieren darauf.',
      },
      {
        title: 'Kommunikative Kompetenz',
        description:
          'Grundkenntnisse in Gebärdensprache, Erfahrung mit Unterstützter Kommunikation, sensibel für verschiedene Kommunikationsbedürfnisse.',
      },
      {
        title: 'Medizinisches Grundwissen',
        description:
          'Kenntnisse über Behinderungsformen, Kontraindikationen und sichere Bewegungsausführung. Erste-Hilfe-Zertifizierung selbstverständlich.',
      },
      {
        title: 'Spezialisierte Ausbildung',
        description:
          'Fortbildungen in inklusiver Tanzpädagogik und Bewegungsarbeit mit Menschen mit Behinderung.',
      },
    ],
  },
};

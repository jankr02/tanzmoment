/**
 * Database Seed Script
 *
 * Creates initial data for development and testing.
 * Run with: npx prisma db seed
 *
 * Test Accounts:
 * - Admin:      admin@tanzmoment.de / admin123
 * - Instructor: sarah@tanzmoment.de / sarah123
 * - Customer:   max@example.com / customer123
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =============================================================================
// ENUM VALUES (as strings to avoid import issues before prisma generate)
// =============================================================================

const UserRole = {
  CUSTOMER: 'CUSTOMER',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN',
} as const;

const CourseLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  ALL_LEVELS: 'ALL_LEVELS',
} as const;

// =============================================================================
// DETAIL CONTENT (CMS JSON per dance style)
// =============================================================================

const DETAIL_CONTENT = {
  expressiveFrei: {
    hero: {
      subHeadline:
        'Dein Körper erzählt die Geschichte – lass sie tanzen.',
    },
    quickFacts: {
      customFacts: [
        { icon: 'sparkle', label: 'Vorkenntnisse', value: 'Keine nötig' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 12 Personen' },
        { icon: 'clock', label: 'Kursdauer', value: '90 Minuten' },
      ],
    },
    description: {
      headline: 'Bewegung, die berührt',
      body: 'Ausdruckstanz ist mehr als Choreografie – es ist eine Reise zu dir selbst.\n\nIn diesem Kurs lernst du, Emotionen in Bewegung umzusetzen. Jede Stunde beginnt mit sanftem Aufwärmen, gefolgt von Improvisation und angeleiteten Sequenzen.\n\n**Kein Schritt ist falsch.** Hier geht es nicht um Perfektion, sondern um Ausdruck.\n\nDu wirst lernen, Spannungen loszulassen, deinen Atem bewusst einzusetzen und deinen Körper als Werkzeug des Ausdrucks zu entdecken – in einem sicheren, wertungsfreien Raum.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Für alle, die ihren Körper als Ausdrucksmittel entdecken wollen – unabhängig von Alter, Vorerfahrung oder Fitnesslevel. Ob du gerade erst anfängst oder schon Erfahrung mitbringst: In diesem Kurs findest du deinen eigenen Rhythmus.',
      },
      highlights: [
        { icon: 'sparkle', text: 'Keine Vorkenntnisse nötig' },
        { icon: 'group', text: 'Kleine Gruppen (max. 12 Teilnehmer)' },
        { icon: 'star', text: 'Persönliche Betreuung durch erfahrene Tanzpädagogin' },
        { icon: 'music', text: 'Musik aus verschiedenen Genres als Inspiration' },
        { icon: 'heart', text: 'Wertungsfreier Raum für echten Ausdruck' },
      ],
    },
    instructor: {
      quote:
        'Tanz ist die Sprache, die jeder versteht – auch ohne Worte.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        'Laban-Bewegungsanalyse',
        '15 Jahre Unterrichtserfahrung',
        'Ausbildung in Somatics & Body-Mind Centering',
      ],
    },
    schedule: {
      headline: 'Termine & Verfügbarkeit',
      infoText:
        'Du kannst jederzeit einsteigen – ein fortlaufender Kurs ohne festen Starttermin. Einzelstunden oder Monatskarte möglich.',
    },
    booking: {
      ctaText: 'Platz sichern',
      priceNote: 'pro Einzelstunde',
      includes: ['Materialien inklusive', 'Wasser & Tee', 'Umkleideraum', 'Kostenloses Erstgespräch'],
      notice: 'Kostenlose Stornierung bis 24h vor Kursbeginn.',
    },
  },

  expressiveVertiefung: {
    hero: {
      subHeadline: 'Geh tiefer – entdecke neue Ebenen deines Ausdrucks.',
    },
    quickFacts: {
      customFacts: [
        { icon: 'level', label: 'Level', value: 'Fortgeschrittene' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 10 Personen' },
        { icon: 'clock', label: 'Kursdauer', value: '90 Minuten' },
        { icon: 'check', label: 'Voraussetzung', value: 'Grundkurs oder Erfahrung' },
      ],
    },
    description: {
      headline: 'Tiefer eintauchen',
      body: 'Für alle, die bereits erste Erfahrungen im Ausdruckstanz haben und ihre Praxis vertiefen wollen.\n\nWir arbeiten an fortgeschrittenen Improvisationstechniken, choreografischen Elementen und Performance-Vorbereitung.\n\n**Was dich erwartet:** Wir erkunden Themen wie Raumgestaltung, Dynamik, Timing und die Verbindung zwischen innerer Haltung und äußerem Ausdruck. Optional bereiten wir gemeinsame Performances für Studio-Abende vor.',
      targetAudience: {
        headline: 'Für wen ist dieser Aufbaukurs?',
        body: 'Für alle, die den Grundkurs „Ausdruckstanz – frei & verbunden" abgeschlossen haben oder vergleichbare Vorerfahrung im freien Tanz mitbringen. Du solltest Freude daran haben, dich intensiver mit Bewegung und Ausdruck auseinanderzusetzen.',
      },
      highlights: [
        { icon: 'sparkle', text: 'Aufbaukurs – Grundkenntnisse vorausgesetzt' },
        { icon: 'fire', text: 'Intensivere Übungen & längere Sequenzen' },
        { icon: 'stage', text: 'Performance-Vorbereitung für Studio-Abende' },
        { icon: 'group', text: 'Exklusive Kleingruppe (max. 10 Teilnehmer)' },
        { icon: 'explore', text: 'Choreografische Gestaltung und Raumarbeit' },
      ],
    },
    instructor: {
      quote:
        'Vertiefung bedeutet nicht Perfektion – sondern Ehrlichkeit in der Bewegung.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        'Laban-Bewegungsanalyse',
        'Performance & Stage Work',
        'Choreografie und Komposition',
      ],
    },
    schedule: {
      headline: 'Termine & Verfügbarkeit',
      infoText:
        'Dieser Kurs läuft in festen Semestern (10 Einheiten). Einstieg zu Semesterbeginn – Einzeltermine auf Anfrage.',
    },
    booking: {
      ctaText: 'Platz sichern',
      priceNote: 'pro Einzelstunde',
      includes: ['Materialien inklusive', 'Wasser & Tee', 'Umkleideraum'],
      notice: 'Voraussetzung: Grundkurs oder vergleichbare Erfahrung. Bei Unsicherheit meld dich gerne vorab.',
    },
  },

  tanzmaeuse: {
    hero: {
      subHeadline:
        'Spielerisch bewegen, Rhythmus entdecken, Spaß haben!',
    },
    quickFacts: {
      customFacts: [
        { icon: 'child', label: 'Altersgruppe', value: '4–6 Jahre' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 12 Kinder' },
        { icon: 'clock', label: 'Kursdauer', value: '45 Minuten' },
        { icon: 'sparkle', label: 'Vorkenntnisse', value: 'Keine nötig' },
      ],
    },
    description: {
      headline: 'Tanz-Abenteuer für kleine Entdecker',
      body: 'Kinder lernen am besten, wenn sie Spaß haben. In unserem Tanzkurs verbinden wir spielerische Bewegung mit kreativen Geschichten und altersgerechter Musik.\n\nJede Stunde ist ein kleines Abenteuer: Mal sind wir tanzende Tiere, mal reisen wir in fremde Länder – immer begleitet von fröhlicher Musik und viel Gelächter.\n\nDie Kinder entwickeln ganz nebenbei Koordination, Rhythmusgefühl und Selbstbewusstsein.',
      targetAudience: {
        headline: 'Altersgruppe & Voraussetzungen',
        body: 'Für Kinder von 4–6 Jahren. Keine Vorkenntnisse nötig – nur Freude an Bewegung und Neugier auf Neues! Die erste Stunde kann als kostenlose Schnupperstunde gebucht werden.',
      },
      highlights: [
        { icon: 'music', text: 'Altersgerechte Musik und bewegte Geschichten' },
        { icon: 'group', text: 'Kleine Gruppen (max. 12 Kinder)' },
        { icon: 'sparkle', text: 'Erste Schnupperstunde kostenlos' },
        { icon: 'heart', text: 'Spielerische Förderung von Koordination & Rhythmus' },
        { icon: 'star', text: 'Liebevolle, erfahrene Kursleitung' },
      ],
    },
    instructor: {
      bioOverride:
        'Sarah liebt es, Kindern die Freude an Bewegung zu schenken. Ihre Stunden sind kreativ, laut und voller Lachen – jedes Kind darf sein, wie es ist.',
      quote:
        'Wenn Kinder tanzen, leuchten ihre Augen. Diesen Moment liebe ich.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        'Kindertanzausbildung (ADTV)',
        'Rhythmik & Elementare Musikpädagogik',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText:
        'Der Kurs findet wöchentlich statt. Einstieg jederzeit möglich – wir empfehlen den Start zu Semesterbeginn.',
    },
    booking: {
      ctaText: 'Kind anmelden',
      priceNote: 'pro Monat (4 Einheiten)',
      includes: ['Tanzraum & Musik', 'Erste Schnupperstunde gratis', 'Kleine Abschlussvorführung im Semester'],
      notice: 'Eltern können bei der ersten Stunde zuschauen.',
    },
  },

  tanzfuechse: {
    hero: {
      subHeadline:
        'Erste echte Schritte, coole Choreografien, jede Menge Spaß!',
    },
    quickFacts: {
      customFacts: [
        { icon: 'child', label: 'Altersgruppe', value: '7–10 Jahre' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 14 Kinder' },
        { icon: 'clock', label: 'Kursdauer', value: '60 Minuten' },
        { icon: 'level', label: 'Level', value: 'Einsteiger' },
      ],
    },
    description: {
      headline: 'Werde zum Tanzfuchs',
      body: 'Die Tanzfüchse lernen bereits erste echte Tanzschritte und arbeiten an kleinen Choreografien – mit viel Teamgeist und Selbstbewusstsein.\n\nWir tanzen zu aktueller Musik und lernen Grundlagen aus Hip Hop, Jazz Dance und freier Improvisation. Am Ende jedes Semesters gibt es eine kleine Aufführung, auf die sich alle gemeinsam vorbereiten.\n\n**Wichtig:** Der Fokus liegt auf Spaß und Gemeinschaft – nicht auf Perfektion.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Für Kinder von 7–10 Jahren mit oder ohne Vorerfahrung. Wer schon die Tanzmäuse besucht hat, ist bestens vorbereitet – aber auch absolute Newcomer sind herzlich willkommen!',
      },
      highlights: [
        { icon: 'dance', text: 'Grundlegende Tanztechniken aus verschiedenen Stilen' },
        { icon: 'group', text: 'Teamwork und Gruppenübungen' },
        { icon: 'star', text: 'Aufführungsvorbereitung am Semesterende' },
        { icon: 'music', text: 'Aktuelle und kindgerechte Musik' },
        { icon: 'heart', text: 'Selbstbewusstsein und Ausdruckskraft stärken' },
      ],
    },
    instructor: {
      bioOverride:
        'Sarah bringt Kindern bei, sich in ihrer eigenen Haut wohlzufühlen – durch Bewegung, Musik und gemeinsames Erleben. Ihre Kurse sind energiegeladen und immer mit einem Lächeln.',
      quote:
        'Tanzen macht stark – im Körper und im Kopf.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        'Kindertanzausbildung (ADTV)',
        'Jazz Dance & Hip Hop Grundlagen',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText:
        'Wöchentlicher Kurs mit fester Gruppenzugehörigkeit. Einstieg zu Semesterbeginn empfohlen.',
    },
    booking: {
      ctaText: 'Kind anmelden',
      priceNote: 'pro Monat (4 Einheiten)',
      includes: ['Tanzraum & Musik', 'Semesterabschluss-Aufführung', 'Tanzskript & Choreografie-Notizen'],
      notice: 'Erste Schnupperstunde auf Anfrage möglich.',
    },
  },

  schnupperkurs: {
    hero: {
      subHeadline: 'Einfach mal ausprobieren – der perfekte Einstieg für alle!',
    },
    quickFacts: {
      customFacts: [
        { icon: 'sparkle', label: 'Vorkenntnisse', value: 'Keine nötig' },
        { icon: 'group', label: 'Altersgruppe', value: 'Alle Altersgruppen' },
        { icon: 'clock', label: 'Kursdauer', value: '60 Minuten' },
        { icon: 'heart', label: 'Atmosphäre', value: 'Entspannt & offen' },
      ],
    },
    description: {
      headline: 'Dein erster Tanzschritt',
      body: 'Du wolltest schon immer mal tanzen, hast dich aber nie getraut? Dieser Schnupperkurs ist deine Chance!\n\nIn entspannter Atmosphäre lernst du verschiedene Tanzstile kennen – von sanften Bewegungen bis hin zu rhythmischem Ausdruckstanz. Kein Leistungsdruck, kein Wettbewerb – einfach ausprobieren.\n\n**Und das Beste:** Du entscheidest danach, ob und welcher Kurs zu dir passt. Wir helfen dir dabei.',
      targetAudience: {
        headline: 'Wer ist eingeladen?',
        body: 'Dieser Kurs ist wirklich für alle – Kinder, Erwachsene, Senioren, Menschen mit oder ohne Vorerfahrung. Ob 8 oder 80: Wenn du neugierig auf Tanz bist, bist du hier genau richtig.',
      },
      highlights: [
        { icon: 'sparkle', text: 'Keine Vorkenntnisse nötig' },
        { icon: 'dance', text: 'Verschiedene Tanzstile kennenlernen' },
        { icon: 'heart', text: 'Entspannte Atmosphäre ohne Leistungsdruck' },
        { icon: 'group', text: 'Alle Altersgruppen willkommen' },
        { icon: 'star', text: 'Direkte Kursempfehlung im Anschluss' },
      ],
    },
    instructor: {
      bioOverride:
        'Sarah gestaltet den Schnupperkurs so, dass sich wirklich jeder wohlfühlt – egal wie viel oder wenig Erfahrung jemand mitbringt. Ihr Ziel: dass du nach der Stunde mit einem Lächeln nach Hause gehst.',
      quote:
        'Der erste Schritt ist immer der mutigste – und meistens der schönste.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        '15 Jahre Unterrichtserfahrung',
        'Erfahrung mit allen Altersgruppen',
      ],
    },
    schedule: {
      headline: 'Schnupperstunden',
      infoText:
        'Schnupperkurse finden regelmäßig statt – keine Anmeldung für feste Termine nötig. Einfach vorbeikommen!',
    },
    booking: {
      ctaText: 'Schnuppern',
      priceNote: 'Einmalig – kein Abo',
      includes: ['Einblick in mehrere Tanzstile', 'Persönliche Kursberatung', 'Wasser & Tee'],
      notice: 'Komm wie du bist – bequeme Kleidung reicht! Keine Tanzklamotten nötig.',
    },
  },

  inklusiverTanzkreis: {
    hero: {
      subHeadline: 'Tanz kennt keine Grenzen – Bewegung für alle.',
    },
    quickFacts: {
      customFacts: [
        {
          icon: 'wheelchair',
          label: 'Barrierefreiheit',
          value: 'Vollständig barrierefrei',
        },
        {
          icon: 'heart',
          label: 'Inklusion',
          value: 'Mit & ohne Behinderung',
        },
        {
          icon: 'group',
          label: 'Gruppengröße',
          value: 'Max. 10 Personen',
        },
        {
          icon: 'clock',
          label: 'Kursdauer',
          value: '60 Minuten',
        },
      ],
    },
    description: {
      headline: 'Gemeinsam in Bewegung',
      body: 'Inklusiver Tanz bedeutet, dass jeder Mensch teilnehmen kann – unabhängig von körperlichen oder geistigen Voraussetzungen.\n\nWir passen jede Übung individuell an und schaffen einen sicheren Raum, in dem Bewegung Freude bringt.\n\nIm Tanzkreis erleben wir Gemeinschaft durch Bewegung: Wir tanzen im Sitzen, Stehen oder in Bewegung – so wie es für dich passt. Begleitpersonen und Assistenzen sind herzlich willkommen.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Für Menschen mit und ohne Behinderung. Der Kurs ist für Rollstuhlfahrer:innen, Menschen mit Lernschwierigkeiten, Sehbehinderung, psychischen Erkrankungen und alle anderen zugänglich. Begleitpersonen sind ebenfalls willkommen.',
      },
      highlights: [
        { icon: 'wheelchair', text: 'Barrierefreier Zugang zum Studio' },
        { icon: 'heart', text: 'Individuelle Anpassung jeder Übung' },
        { icon: 'star', text: 'Erfahrung mit verschiedenen Behinderungsformen' },
        { icon: 'group', text: 'Begleitpersonen und Assistenzen willkommen' },
        { icon: 'sparkle', text: 'Inklusion als gelebte Praxis – nicht nur als Konzept' },
      ],
    },
    instructor: {
      bioOverride:
        'Sarah hat über 10 Jahre Erfahrung im inklusiven Tanz und arbeitet eng mit Therapeut:innen, Heimen und Schulen zusammen. Ihr DanceAbility-Zertifikat und ihre Ausbildung in Tanztherapie befähigen sie, auf jede Teilnehmerin individuell einzugehen.',
      quote:
        'Jeder Körper kann tanzen – auf seine eigene, einzigartige Weise.',
      qualifications: [
        'DanceAbility-Zertifikat',
        'Tanztherapie (Grundausbildung)',
        'Inklusionspädagogik',
        '10+ Jahre Erfahrung im inklusiven Tanz',
      ],
    },
    schedule: {
      headline: 'Termine & Verfügbarkeit',
      infoText:
        'Der Kurs findet wöchentlich statt. Einstieg jederzeit möglich – wir nehmen uns Zeit, um dich und deine Bedürfnisse kennenzulernen.',
    },
    booking: {
      ctaText: 'Jetzt anmelden',
      priceNote: 'Ermäßigung auf Anfrage möglich',
      includes: ['Vollständig barrierefreier Zugang', 'Individuelle Betreuung', 'Begleitperson kostenfrei'],
      notice:
        'Bei Fragen zur Barrierefreiheit oder besonderen Bedürfnissen kontaktiere uns gerne vorab – wir planen gemeinsam, wie wir es für dich möglich machen.',
    },
  },

  rollstuhltanz: {
    hero: {
      subHeadline: 'Elegante Bewegungen auf Rädern – Tanz ohne Grenzen.',
    },
    quickFacts: {
      customFacts: [
        {
          icon: 'wheelchair',
          label: 'Barrierefreiheit',
          value: 'Vollständig barrierefrei',
        },
        {
          icon: 'group',
          label: 'Gruppengröße',
          value: 'Max. 8 Personen',
        },
        {
          icon: 'clock',
          label: 'Kursdauer',
          value: '75 Minuten',
        },
        {
          icon: 'sparkle',
          label: 'Rollstuhl',
          value: 'Eigen oder Leih',
        },
      ],
    },
    description: {
      headline: 'Tanz auf Rädern',
      body: 'Rollstuhltanz ist eine anerkannte Tanzsportdisziplin, die Eleganz und Ausdruck mit Mobilität verbindet.\n\nDer Kurs ist sowohl für Rollstuhlfahrer:innen als auch für Fußgänger:innen als Tanzpartner:innen geeignet – so entstehen wunderschöne Duette und Gruppenformationen.\n\n**Was wir lernen:** Grundbewegungen und Drehungen im Rollstuhl, Partnerwork mit und ohne Rollstuhl sowie verschiedene Musikstile von Walzer bis Contemporary.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Für Rollstuhlfahrer:innen jedes Alters und ihre Tanzpartner:innen (Fußgänger:innen). Keine Tanzvorkenntnisse nötig. Leih-Rollstühle sind vorhanden – du musst keinen eigenen mitbringen.',
      },
      highlights: [
        { icon: 'wheelchair', text: 'Grundlagen des Rollstuhltanzes' },
        { icon: 'heart', text: 'Partnerübungen für Rollstuhl & Fußgänger (optional)' },
        { icon: 'music', text: 'Verschiedene Musikstile: Walzer, Tango, Contemporary' },
        { icon: 'sparkle', text: 'Leih-Rollstühle vorhanden' },
        { icon: 'star', text: 'Vollständig barrierefreies Studio' },
      ],
    },
    instructor: {
      bioOverride:
        'Sarah hat sich in ihrer Ausbildung intensiv mit Rollstuhltanz als Tanzsportdisziplin beschäftigt und unterrichtet diesen Kurs mit großer Leidenschaft. Sie sieht den Rollstuhl nicht als Einschränkung, sondern als Teil des tänzerischen Ausdrucks.',
      quote: 'Im Tanz gibt es keine Einschränkungen – nur Möglichkeiten.',
      qualifications: [
        'DanceAbility-Zertifikat',
        'Rollstuhltanz – Grundausbildung',
        'Inklusiver Tanzsport',
        'Tanztherapie (Grundausbildung)',
      ],
    },
    schedule: {
      headline: 'Termine & Verfügbarkeit',
      infoText:
        'Der Kurs findet wöchentlich statt. Einstieg jederzeit möglich – meld dich gerne vorab an, damit wir ggf. einen Leih-Rollstuhl für dich bereitstellen können.',
    },
    booking: {
      ctaText: 'Jetzt anmelden',
      priceNote: 'pro Einheit',
      includes: ['Barrierefreier Zugang', 'Leih-Rollstuhl auf Anfrage', 'Wasser & Tee'],
      notice:
        'Eigener Rollstuhl oder Leih-Rollstuhl verfügbar – bitte bei Anmeldung angeben.',
    },
  },

  mamaTanzt: {
    hero: {
      subHeadline: 'Zeit für dich – Bewegung, die Kraft gibt.',
    },
    quickFacts: {
      customFacts: [
        { icon: 'heart', label: 'Zielgruppe', value: 'Mütter (alle Phasen)' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 10 Personen' },
        { icon: 'clock', label: 'Kursdauer', value: '75 Minuten' },
        { icon: 'child', label: 'Kinderbetreuung', value: 'Vor Ort möglich' },
      ],
    },
    description: {
      headline: 'Eine Auszeit vom Alltag',
      body: 'Dieser Kurs ist speziell für Mütter gestaltet – ein Raum, in dem du den Alltag hinter dir lassen und dich ganz auf dich selbst konzentrieren kannst.\n\nDurch sanfte bis dynamische Bewegungen findest du neue Energie und Leichtigkeit. Keine Choreografie, die du auswendig lernen musst – sondern intuitive Bewegung, die gut tut.\n\n**Du musst nicht perfekt sein.** Du musst nur kommen.',
      targetAudience: {
        headline: 'Für welche Mütter ist dieser Kurs?',
        body: 'Für alle Mütter – egal ob Frischgebackene oder erfahrene Mamas, ob dein Kind 3 Monate oder 15 Jahre alt ist. Babys können schlafend im Kinderwagen mitgebracht werden. Kinderbetreuung vor Ort ist auf Anfrage buchbar.',
      },
      highlights: [
        { icon: 'child', text: 'Kinderbetreuung vor Ort buchbar' },
        { icon: 'heart', text: 'Rückbildungsfreundliche Übungen für alle Phasen' },
        { icon: 'sparkle', text: 'Flexible Terminwahl ohne Semesterbindung' },
        { icon: 'group', text: 'Austausch mit anderen Müttern' },
        { icon: 'star', text: 'Stressabbau durch achtsame Bewegung' },
      ],
    },
    instructor: {
      bioOverride:
        'Sarah ist selbst Mutter und weiß genau, wie wertvoll eine Stunde nur für sich selbst ist. In ihren Mütter-Kursen schafft sie eine Atmosphäre, in der sich jede Frau wohlfühlt und ihren eigenen Rhythmus findet.',
      quote:
        'Als Mutter weiß ich, wie wertvoll eine Stunde nur für sich selbst ist.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        'Rückbildungsgymnastik (Grundkenntnisse)',
        'Achtsamkeit & Somatische Arbeit',
        '15 Jahre Erfahrung',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText:
        'Der Kurs findet wöchentlich statt. Einstieg jederzeit möglich – flexibel ohne Semesterbindung.',
    },
    booking: {
      ctaText: 'Auszeit buchen',
      priceNote: 'pro Einheit',
      includes: ['75 Min. Tanz & Bewegung', 'Wasser & Tee', 'Raum zum Austausch'],
      notice: 'Kinderbetreuung vor Ort auf Anfrage zubuchbar. Babys im Kinderwagen jederzeit willkommen.',
    },
  },

  mamaBaby: {
    hero: {
      subHeadline:
        'Gemeinsam von Anfang an – Bindung durch Bewegung.',
    },
    quickFacts: {
      customFacts: [
        { icon: 'child', label: 'Babys', value: '3–12 Monate' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 8 Paare' },
        { icon: 'clock', label: 'Kursdauer', value: '60 Minuten' },
        { icon: 'heart', label: 'Stillen & Wickeln', value: 'Jederzeit möglich' },
      ],
    },
    description: {
      headline: 'Tanzen mit deinem Baby',
      body: 'Dieser Kurs verbindet sanfte Bewegung mit wertvoller Bindungszeit zwischen dir und deinem Baby.\n\nGeeignet für Babys von 3–12 Monaten. Stillen und Wickeln sind jederzeit möglich – hier ist alles willkommen, was dazugehört.\n\nWir bewegen uns zur Musik, singen, schaukeln und erkunden gemeinsam, was Tanz für euch als Paar bedeutet. Eine besondere Erfahrung, die du und dein Baby nie vergessen werden.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Für Mütter mit Babys im Alter von 3–12 Monaten. Keine Tanzvorkenntnisse nötig. Der Kurs ist rückbildungsfreundlich gestaltet und berücksichtigt die körperlichen Veränderungen nach der Geburt.',
      },
      highlights: [
        { icon: 'heart', text: 'Babytragen-freundliche Bewegungen & Choreografien' },
        { icon: 'sparkle', text: 'Beckenbodenfreundliche Übungen' },
        { icon: 'music', text: 'Singen, Schaukeln und Bewegungslieder' },
        { icon: 'star', text: 'Entspannungseinheiten für Mama & Baby' },
        { icon: 'group', text: 'Vernetzung mit anderen Mamas in ähnlicher Lebenslage' },
      ],
    },
    instructor: {
      bioOverride:
        'Sarah liebt es, Mütter und ihre Babys in dieser besonderen Zeit zu begleiten. Ihr Kurs ist ein warmer, offener Raum, in dem Tränen, Lachen und alles dazwischen willkommen sind.',
      quote:
        'Dieser Tanz zwischen Mutter und Kind ist der älteste der Welt.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        'Baby-Tanz & Musikale Früherziehung',
        'Rückbildungsgymnastik (Grundkenntnisse)',
        'Achtsame Eltern-Kind-Begleitung',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText:
        'Der Kurs läuft in Blöcken (8 Einheiten). Einstieg zu Blockbeginn – flexible Einzeltermine auf Anfrage.',
    },
    booking: {
      ctaText: 'Gemeinsam anmelden',
      priceNote: 'pro Einheit',
      includes: ['Wickelmöglichkeit vor Ort', 'Krabbelmatten & Hilfsmittel', 'Wasser & Tee für Mama'],
      notice: 'Stillen und Wickeln jederzeit möglich – Baby und Mama kommen so wie sie sind.',
    },
  },
};

// Mapping: slug → detailContent key + SEO data
const COURSE_DETAIL_MAP: Record<
  string,
  {
    content: keyof typeof DETAIL_CONTENT;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  'ausdruckstanz-frei-verbunden': {
    content: 'expressiveFrei',
    metaTitle: 'Ausdruckstanz – frei & verbunden | Tanzmoment',
    metaDescription:
      'Entdecke Ausdruckstanz bei Tanzmoment. Emotionen in Bewegung umsetzen – für Anfänger und Fortgeschrittene.',
  },
  'ausdruckstanz-vertiefung': {
    content: 'expressiveVertiefung',
    metaTitle: 'Ausdruckstanz Vertiefung | Tanzmoment',
    metaDescription:
      'Vertiefe deine Ausdruckstanz-Praxis mit fortgeschrittenen Techniken und Performance-Vorbereitung.',
  },
  'tanzmaeuse-4-6': {
    content: 'tanzmaeuse',
    metaTitle: 'Tanzmäuse (4-6 Jahre) | Tanzmoment',
    metaDescription:
      'Spielerischer Tanzkurs für Kinder von 4–6 Jahren. Bewegung, Musik und Spaß in kleinen Gruppen.',
  },
  'tanzfuechse-7-10': {
    content: 'tanzfuechse',
    metaTitle: 'Tanzfüchse (7-10 Jahre) | Tanzmoment',
    metaDescription:
      'Tanzkurs für Kinder von 7–10 Jahren. Erste Tanzschritte, Choreografien und Teamwork.',
  },
  'schnupperkurs-alt-jung': {
    content: 'schnupperkurs',
    metaTitle: 'Schnupperkurs – Alt oder Jung | Tanzmoment',
    metaDescription:
      'Der perfekte Einstieg in die Welt des Tanzes. Für alle Altersgruppen – keine Vorkenntnisse nötig.',
  },
  'inklusiver-tanzkreis': {
    content: 'inklusiverTanzkreis',
    metaTitle: 'Inklusiver Tanzkreis | Tanzmoment',
    metaDescription:
      'Inklusiver Tanz für Menschen mit und ohne Behinderung. Barrierefreier Zugang, individuelle Anpassung.',
  },
  rollstuhltanz: {
    content: 'rollstuhltanz',
    metaTitle: 'Rollstuhltanz | Tanzmoment',
    metaDescription:
      'Rollstuhltanz bei Tanzmoment. Eleganz und Ausdruck auf Rädern – für Rollstuhlfahrer:innen und Partner:innen.',
  },
  'mama-tanzt-zeit-fuer-mich': {
    content: 'mamaTanzt',
    metaTitle: 'Mama tanzt – Zeit für mich | Tanzmoment',
    metaDescription:
      'Tanzkurs für Mütter. Eine Auszeit vom Alltag mit Bewegung, die Kraft gibt. Kinderbetreuung möglich.',
  },
  'mama-baby-tanz': {
    content: 'mamaBaby',
    metaTitle: 'Mama & Baby Tanz | Tanzmoment',
    metaDescription:
      'Tanzen mit deinem Baby bei Tanzmoment. Bindungszeit mit Bewegung und Musik für Mütter mit Baby (3–12 Monate).',
  },
};

// =============================================================================
// COURSE DATA
// =============================================================================

/**
 * Course definitions organized by dance style
 * Each course has sessions at both locations
 */
const COURSES_BY_STYLE = {
  // =========================================================================
  // AUSDRUCKSTANZ (Expressive Dance)
  // =========================================================================
  expressive: [
    {
      title: 'Ausdruckstanz – frei & verbunden',
      slug: 'ausdruckstanz-frei-verbunden',
      catchPhrase: 'Mein Tipp ...',
      shortDescription:
        'Deinen wahren Ausdruck findest du nicht im Spiegel, sondern in der Bewegung. Lass los und entdecke, was in dir tanzt.',
      description: `Ausdruckstanz ist Emotion in Bewegung. In diesem Kurs geht es nicht um perfekte Schritte, sondern um authentischen Ausdruck.

Wir arbeiten mit:
• Freier Improvisation und geführten Bewegungssequenzen
• Atemtechniken zur Körperwahrnehmung
• Musik verschiedener Genres als Inspirationsquelle
• Partner- und Gruppenübungen für Verbindung

Dieser Kurs ist perfekt für alle, die Tanz als Form der Selbsterfahrung entdecken möchten. Keine Vorkenntnisse nötig – nur die Bereitschaft, sich auf dich selbst einzulassen.`,
      danceStyle: 'expressive',
      targetGroup: 'Erwachsene jeden Alters',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 12,
      priceInCents: 2500,
      duration: 90,
      imageUrl: '/assets/images/courses/expressive-frei.jpg',
      isPublished: true,
      isMarkedAsHighlighted: true, // Featured course
    },
    {
      title: 'Ausdruckstanz – Vertiefung',
      slug: 'ausdruckstanz-vertiefung',
      catchPhrase: 'Geh tiefer ...',
      shortDescription:
        'Für alle, die bereits erste Erfahrungen im Ausdruckstanz gesammelt haben und ihre Praxis vertiefen möchten.',
      description: `In diesem Aufbaukurs vertiefen wir die Grundlagen des Ausdruckstanzes und erkunden fortgeschrittene Techniken.

Schwerpunkte:
• Erweiterte Improvisationstechniken
• Choreografische Elemente
• Emotionale Tiefe und Ausdruck
• Performance-Vorbereitung

Voraussetzung: Grundkurs oder vergleichbare Erfahrung im freien Tanz.`,
      danceStyle: 'expressive',
      targetGroup: 'Fortgeschrittene',
      level: CourseLevel.INTERMEDIATE,
      maxParticipants: 10,
      priceInCents: 2800,
      duration: 90,
      imageUrl: '/assets/images/courses/expressive-vertiefung.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
  ],

  // =========================================================================
  // TANZEN FÜR KINDER (Kids Dance)
  // =========================================================================
  kids: [
    {
      title: 'Tanzmäuse (4-6 Jahre)',
      slug: 'tanzmaeuse-4-6',
      catchPhrase: 'Kinderleicht ...',
      shortDescription:
        'Spielerischer Einstieg in die Welt des Tanzes. Hier wird gelacht, gehüpft und die Freude an Bewegung entdeckt.',
      description: `Bei den Tanzmäusen steht der Spaß im Vordergrund! Durch spielerische Übungen und kindgerechte Musik entdecken die Kleinen ihren Körper und seine Möglichkeiten.

Was wir machen:
• Bewegungsspiele und Tanzgeschichten
• Rhythmusübungen mit Musik
• Kreative Improvisation
• Kleine Choreografien

Die Kinder entwickeln Körpergefühl, Koordination und Selbstvertrauen – ganz nebenbei und mit viel Freude!`,
      danceStyle: 'kids',
      targetGroup: 'Kinder 4-6 Jahre',
      level: CourseLevel.BEGINNER,
      maxParticipants: 12,
      priceInCents: 1500,
      duration: 45,
      imageUrl: '/assets/images/courses/kids-tanzmaeuse.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Tanzfüchse (7-10 Jahre)',
      slug: 'tanzfuechse-7-10',
      catchPhrase: 'Werde zum Tanzfuchs ...',
      shortDescription:
        'Für kleine Tänzer:innen, die schon etwas mehr wollen. Erste Schritte, echte Choreografien und jede Menge Tanzspaß.',
      description: `Die Tanzfüchse lernen bereits erste "echte" Tanzschritte und arbeiten an kleinen Choreografien.

Kursinhalte:
• Grundlegende Tanztechniken
• Rhythmusgefühl und Musikalität
• Teamwork und Gruppenübungen
• Aufführungsvorbereitung

Der Kurs fördert nicht nur die motorischen Fähigkeiten, sondern auch Teamgeist und Selbstbewusstsein.`,
      danceStyle: 'kids',
      targetGroup: 'Kinder 7-10 Jahre',
      level: CourseLevel.BEGINNER,
      maxParticipants: 14,
      priceInCents: 1800,
      duration: 60,
      imageUrl: '/assets/images/courses/kids-tanzfuechse.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Schnupperkurs – Alt oder Jung',
      slug: 'schnupperkurs-alt-jung',
      catchPhrase: 'Einfach mal ausprobieren ...',
      shortDescription:
        'Der perfekte Einstieg! Dieser Kurs richtet sich an jeden, der den ersten Tanzschritt wagen möchte – egal welches Alter.',
      description: `Du wolltest schon immer mal tanzen, hast dich aber nie getraut? Dieser Schnupperkurs ist deine Chance!

In entspannter Atmosphäre:
• Lernst du erste einfache Bewegungen
• Entdeckst du verschiedene Tanzstile
• Findest du heraus, was dir Spaß macht
• Triffst du Gleichgesinnte

Keine Vorkenntnisse nötig. Komm wie du bist!`,
      danceStyle: 'kids',
      targetGroup: 'Alle Altersgruppen',
      level: CourseLevel.BEGINNER,
      maxParticipants: 16,
      priceInCents: 1200,
      duration: 60,
      imageUrl: '/assets/images/courses/schnupperkurs.jpg',
      isPublished: true,
      isMarkedAsHighlighted: true, // Featured course
    },
  ],

  // =========================================================================
  // TANZEN MIT BEHINDERUNG (Accessible Dance)
  // =========================================================================
  accessible: [
    {
      title: 'Inklusiver Tanzkreis',
      slug: 'inklusiver-tanzkreis',
      catchPhrase: 'Gemeinsam bewegen ...',
      shortDescription:
        'Tanz für alle – angepasst an individuelle Bedürfnisse. Hier zählt die Freude an der Bewegung, nicht die Perfektion.',
      description: `Im inklusiven Tanzkreis ist jede:r willkommen, unabhängig von körperlichen oder geistigen Einschränkungen.

Unser Ansatz:
• Individuell angepasste Bewegungen
• Unterstützung durch erfahrene Assistenz
• Musik und Rhythmus als verbindende Elemente
• Gemeinschaft und Akzeptanz

Wir tanzen im Sitzen, Stehen oder in Bewegung – so wie es für dich passt. Das Wichtigste ist die Freude am gemeinsamen Erleben.`,
      danceStyle: 'accessible',
      targetGroup: 'Menschen mit und ohne Behinderung',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 10,
      priceInCents: 2000,
      duration: 60,
      imageUrl: '/assets/images/courses/inclusive-tanzkreis.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Rollstuhltanz',
      slug: 'rollstuhltanz',
      catchPhrase: 'Tanz kennt keine Grenzen ...',
      shortDescription:
        'Elegante Bewegungen auf Rädern. Entdecke, wie viel Ausdruck und Freude im Rollstuhltanz steckt.',
      description: `Rollstuhltanz ist eine anerkannte Tanzsportdisziplin, die Eleganz und Ausdruck mit Mobilität verbindet.

Was dich erwartet:
• Grundlagen des Rollstuhltanzes
• Koordination und Körpergefühl
• Partnerübungen (optional)
• Verschiedene Musikstile

Der Kurs ist sowohl für Rollstuhlfahrer:innen als auch für Fußgänger:innen als Tanzpartner:innen geeignet.`,
      danceStyle: 'accessible',
      targetGroup: 'Rollstuhlfahrer:innen & Partner:innen',
      level: CourseLevel.BEGINNER,
      maxParticipants: 8,
      priceInCents: 2200,
      duration: 75,
      imageUrl: '/assets/images/courses/rollstuhltanz.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
  ],

  // =========================================================================
  // TANZEN FÜR MÜTTER (Mothers Dance)
  // =========================================================================
  mothers: [
    {
      title: 'Mama tanzt – Zeit für mich',
      slug: 'mama-tanzt-zeit-fuer-mich',
      catchPhrase: 'Durchatmen & Bewegen ...',
      shortDescription:
        'Eine Auszeit vom Alltag – Bewegung, die Kraft gibt und den Alltag vergessen lässt. Zeit nur für dich.',
      description: `Als Mama kommt man selbst oft zu kurz. Dieser Kurs ist deine Zeit – zum Durchatmen, Bewegen und Kraft tanken.

Was dich erwartet:
• Sanfte bis dynamische Bewegungen
• Stressabbau durch Tanz
• Körperarbeit nach der Schwangerschaft
• Austausch mit anderen Müttern

Babys können mitgebracht werden (schlafend im Kinderwagen) oder du genießt die kinderfreie Zeit. Beides ist willkommen!`,
      danceStyle: 'mothers',
      targetGroup: 'Mütter (mit/ohne Baby)',
      level: CourseLevel.BEGINNER,
      maxParticipants: 10,
      priceInCents: 2200,
      duration: 75,
      imageUrl: '/assets/images/courses/mama-tanzt.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Mama & Baby Tanz',
      slug: 'mama-baby-tanz',
      catchPhrase: 'Gemeinsam von Anfang an ...',
      shortDescription:
        'Tanzen mit deinem Baby – eine besondere Bindungszeit mit Bewegung, Musik und anderen Mamas.',
      description: `Dieser Kurs verbindet sanfte Bewegung mit wertvoller Bindungszeit zwischen dir und deinem Baby.

Kursinhalte:
• Babytragen-freundliche Choreografien
• Bewegungslieder und Fingerspiele
• Beckenbodenfreundliche Übungen
• Entspannungseinheiten

Geeignet für Babys von 3-12 Monaten. Stillen und Wickeln jederzeit möglich.`,
      danceStyle: 'mothers',
      targetGroup: 'Mütter mit Baby (3-12 Monate)',
      level: CourseLevel.BEGINNER,
      maxParticipants: 8,
      priceInCents: 2000,
      duration: 60,
      imageUrl: '/assets/images/courses/mama-baby.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
  ],
};

// =============================================================================
// LOCATIONS
// =============================================================================

const LOCATIONS = ['Mössingen', 'Bodelshausen'];

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedUsers() {
  console.log('👤 Creating users...');

  // Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tanzmoment.de' },
    update: {},
    create: {
      email: 'admin@tanzmoment.de',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log('  ✅ Admin:', admin.email);

  // Instructor User
  const instructorPassword = await bcrypt.hash('sarah123', 10);
  const instructorUser = await prisma.user.upsert({
    where: { email: 'sarah@tanzmoment.de' },
    update: {},
    create: {
      email: 'sarah@tanzmoment.de',
      passwordHash: instructorPassword,
      firstName: 'Sarah',
      lastName: 'Müller',
      role: UserRole.INSTRUCTOR,
      emailVerified: true,
    },
  });
  console.log('  ✅ Instructor:', instructorUser.email);

  // Instructor Profile
  const instructor = await prisma.instructor.upsert({
    where: { userId: instructorUser.id },
    update: {},
    create: {
      userId: instructorUser.id,
      bio: 'Professionelle Tänzerin und Tanzpädagogin mit 15 Jahren Erfahrung. Ich liebe es, Menschen durch Bewegung zu inspirieren und ihre eigene Ausdrucksform zu finden. Mein Herz schlägt besonders für inklusiven Tanz.',
      expertise: [
        'Ausdruckstanz',
        'Inklusiver Tanz',
        'Kindertanz',
        'Improvisation',
      ],
      imageUrl: '/assets/images/instructors/sarah-mueller.jpg',
    },
  });
  console.log('  ✅ Instructor profile created');

  // Customer User
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'max@example.com' },
    update: {},
    create: {
      email: 'max@example.com',
      passwordHash: customerPassword,
      firstName: 'Max',
      lastName: 'Mustermann',
      phone: '+49 176 12345678',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });
  console.log('  ✅ Customer:', customer.email);

  return { admin, instructorUser, instructor, customer };
}

async function seedCourses(instructorId: string) {
  console.log('\n📚 Creating courses...');

  const allCourses = Object.values(COURSES_BY_STYLE).flat();
  let createdCount = 0;

  for (const courseData of allCourses) {
    const detailMap = COURSE_DETAIL_MAP[courseData.slug];
    const detailFields = detailMap
      ? {
          detailContent: DETAIL_CONTENT[detailMap.content],
          metaTitle: detailMap.metaTitle,
          metaDescription: detailMap.metaDescription,
        }
      : {};

    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: detailFields,
      create: {
        ...courseData,
        instructorId,
        ...detailFields,
      },
    });
    createdCount++;
    console.log(`  ✅ ${course.title} (${course.danceStyle})`);

    // Create sessions for each course
    await seedSessionsForCourse(course.id, course.duration);
  }

  console.log(`  📊 Total courses: ${createdCount}`);
}

async function seedSessionsForCourse(courseId: string, duration: number) {
  // Create sessions for the next 6 weeks at both locations
  const sessionsPerLocation = 3;

  for (const location of LOCATIONS) {
    for (let week = 0; week < sessionsPerLocation; week++) {
      const date = new Date();

      // Alternate days: Mössingen = Wednesday (3), Bodelshausen = Friday (5)
      const targetDay = location === 'Mössingen' ? 3 : 5;
      const daysUntilTarget = (targetDay - date.getDay() + 7) % 7 || 7;

      date.setDate(date.getDate() + daysUntilTarget + week * 7);

      // Alternate times based on course type
      const hour = week % 2 === 0 ? 17 : 19; // 17:00 or 19:00
      date.setHours(hour, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setMinutes(endDate.getMinutes() + duration);

      await prisma.session.create({
        data: {
          courseId,
          startTime: date,
          endTime: endDate,
          location,
        },
      });
    }
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log('━'.repeat(50));

  // Seed users
  const { instructor } = await seedUsers();

  // Seed courses with sessions
  await seedCourses(instructor.id);

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('🎉 Seeding completed successfully!\n');

  console.log('📊 Summary:');
  const courseCount = await prisma.course.count();
  const sessionCount = await prisma.session.count();
  const userCount = await prisma.user.count();

  console.log(`   • Users: ${userCount}`);
  console.log(`   • Courses: ${courseCount}`);
  console.log(`   • Sessions: ${sessionCount}`);

  console.log('\n🔐 Test Accounts:');
  console.log('━'.repeat(50));
  console.log('   Admin:      admin@tanzmoment.de / admin123');
  console.log('   Instructor: sarah@tanzmoment.de / sarah123');
  console.log('   Customer:   max@example.com / customer123');
  console.log('━'.repeat(50) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

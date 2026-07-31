/**
 * Database Seed Script
 *
 * Creates initial data for development and testing.
 * Run with: npx prisma db seed
 *
 * Test Accounts:
 * - Admin:      admin@tanzmoment.de / admin123
 * - Instructor: daniela@tanzmoment.de / daniela123
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

const BookingMode = {
  FULL_COURSE: 'FULL_COURSE',
  SINGLE_SESSION: 'SINGLE_SESSION',
} as const;

const DEFAULT_CANCELLATION_POLICY = {
  allowCancellation: true,
  refundTiers: [
    { daysBeforeStart: 7, refundPercentage: 100, label: 'Volle Erstattung' },
    { daysBeforeStart: 3, refundPercentage: 50, label: '50% Erstattung' },
    { daysBeforeStart: 0, refundPercentage: 0, label: 'Keine Erstattung' },
  ],
  defaultRefundPercentage: 0,
};

const FREE_CANCELLATION_POLICY = {
  allowCancellation: true,
  refundTiers: [
    { daysBeforeStart: 0, refundPercentage: 100, label: 'Kostenlose Stornierung' },
  ],
  defaultRefundPercentage: 100,
};

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
        'Tanz- und Bewegungspädagogin',
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
    courseFlow: {
      headline: 'So läuft eine Stunde ab',
      intro: 'Jede Stunde folgt einem sanften Rhythmus – vom Ankommen bis zum kreativen Loslassen.',
      steps: [
        {
          phase: 'Ankommen & Erden',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Wir beginnen mit einer kurzen Atem- und Erdungsübung, um den Alltag hinter uns zu lassen.',
        },
        {
          phase: 'Aufwärmen',
          duration: '15 Min.',
          icon: 'sparkle',
          description: 'Sanfte Gelenkarbeit, Körperwahrnehmung und leichtes Stretching – Vorbereitung auf die Bewegung.',
        },
        {
          phase: 'Freie Improvisation',
          duration: '30 Min.',
          icon: 'music',
          description: 'Das kreative Herzstück der Stunde. Die Musik führt dich, aber dein Körper entscheidet. Kein richtig oder falsch.',
        },
        {
          phase: 'Angeleitete Sequenz',
          duration: '20 Min.',
          icon: 'improvisation',
          description: 'Eine kurze, strukturierte Bewegungsphrase, die wir gemeinsam erkunden – mit Raum für individuellen Ausdruck.',
        },
        {
          phase: 'Cool-Down & Reflexion',
          duration: '15 Min.',
          icon: 'sparkle',
          description: 'Wir schließen mit sanftem Stretching und einem Moment der Stille. Optionaler Austausch in der Gruppe.',
        },
      ],
    },
    socialProof: {
      headline: 'Das sagen Teilnehmende',
      testimonials: [
        {
          text: 'Ich bin total verkrampft reingekommen – ohne jede Tanzerfahrung. Nach drei Stunden habe ich mich frei bewegt und es tatsächlich genossen. Daniela schafft einen Raum, in dem man vergisst, befangen zu sein.',
          authorName: 'Miriam H.',
          authorRole: 'Teilnehmerin',
          rating: 5,
        },
        {
          text: 'Dieser Kurs hat verändert, wie ich mit meinem eigenen Körper umgehe. Die Improvisation gibt mir etwas, das ich nirgendwo anders finde – Freiheit mit Anleitung.',
          authorName: 'Julia W.',
          authorRole: 'Regelmäßige Teilnehmerin',
          rating: 5,
        },
        {
          text: 'Ich hatte einen Fitnesskurs erwartet. Was ich bekommen habe, ist etwas Therapie-ähnliches. Im besten Sinne.',
          authorName: 'Karin S.',
          authorRole: 'Teilnehmerin',
          rating: 5,
        },
        {
          text: 'Nach dem ersten Kurs hatte ich das Gefühl, meinen Körper neu kennengelernt zu haben. Ich habe nie gedacht, dass Tanzen so befreiend sein kann.',
          authorName: 'Laura M.',
          authorRole: 'Teilnehmerin',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen & Antworten',
      items: [
        {
          question: 'Brauche ich Tanzerfahrung?',
          answer: 'Nein, überhaupt nicht. Dieser Kurs ist für alle Levels gedacht. Anfänger und erfahrene Tänzer bewegen sich Seite an Seite – jeder in seinem eigenen Tempo.',
        },
        {
          question: 'Was soll ich anziehen?',
          answer: 'Bequeme Kleidung, in der du dich frei bewegen kannst. Barfuß oder mit Tanzsocken ist ideal. Keine spezielle Tanzkleidung nötig.',
        },
        {
          question: 'Kann ich mitten im Kurs einsteigen?',
          answer: 'Ja! Der Kurs ist fortlaufend ohne feste Starttermine. Du kannst jederzeit einsteigen. Wir empfehlen ein kostenloses Erstgespräch mit Daniela vorab.',
        },
        {
          question: 'Gibt es eine Schnupperstunde?',
          answer: 'Ja. Deine erste Stunde beinhaltet ein kostenloses Kennenlerngespräch mit Daniela. Gib das einfach bei der Buchung an.',
        },
      ],
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
        body: 'Für Kinder von 7–10 Jahren mit oder ohne Vorerfahrung. Wer schon erste Tanzerfahrung hat, ist bestens vorbereitet – aber auch absolute Newcomer sind herzlich willkommen!',
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
        'Daniela bringt Kindern bei, sich in ihrer eigenen Haut wohlzufühlen – durch Bewegung, Musik und gemeinsames Erleben. Ihre Kurse sind energiegeladen und immer mit einem Lächeln.',
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
    courseFlow: {
      headline: 'Eine Stunde bei den Tanzfüchsen',
      intro: 'Viel Struktur und trotzdem immer voller Spaß – die Tanzfüchse balancieren Lernen und Spiel.',
      steps: [
        {
          phase: 'Energiser',
          duration: '10 Min.',
          icon: 'sparkle',
          description: 'Ein aktives Aufwärmspiel, um den Körper und den Teamgeist zu wecken.',
        },
        {
          phase: 'Technik',
          duration: '15 Min.',
          icon: 'bar-chart',
          description: 'Wir arbeiten an einem bestimmten Skill: ein Sprung, eine Drehung, ein Schrittmuster oder eine Rhythmus-Challenge.',
        },
        {
          phase: 'Choreografie',
          duration: '20 Min.',
          icon: 'music',
          description: 'Schritt für Schritt bauen wir das Semester-Stück auf. Alle bringen Ideen ein.',
        },
        {
          phase: 'Impro-Runde',
          duration: '10 Min.',
          icon: 'improvisation',
          description: 'Freie Bewegungszeit, um das Gelernte auf eigene Art auszuprobieren.',
        },
        {
          phase: 'Cool-Down',
          duration: '5 Min.',
          icon: 'heart',
          description: 'Dehnen, eine Reflexionsfrage und ein Team-High-Five zum Abschluss.',
        },
      ],
    },
    socialProof: {
      headline: 'Das sagen Familien',
      testimonials: [
        {
          text: 'Mein Sohn stand nie auf Tanzen, aber ein Freund hat ihn mitgeschleppt. Sechs Monate später erinnert er uns an den Kurs. Die Gruppenenergie ist unglaublich.',
          authorName: 'Petra V.',
          authorRole: 'Mama eines 9-Jährigen',
          rating: 5,
        },
        {
          text: 'Die Aufführung am Semesterende war großartig. Die Kinder waren so stolz. Daniela holt wirklich das Beste aus ihnen heraus.',
          authorName: 'Michael B.',
          authorRole: 'Papa eines 7-Jährigen',
          rating: 5,
        },
        {
          text: 'Meine Tochter hat durch den Kurs so viel Selbstvertrauen gewonnen. Sie steht jetzt einfach anders auf der Bühne – und auch im Alltag.',
          authorName: 'Sabine L.',
          authorRole: 'Mama einer 9-Jährigen',
          rating: 5,
        },
        {
          text: 'Der Teamgeist in der Gruppe ist wirklich besonders. Mein Sohn hat hier Freundschaften geschlossen, die über den Kurs hinausgehen.',
          authorName: 'Frank A.',
          authorRole: 'Papa eines 8-Jährigen',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zu den Tanzfüchsen',
      items: [
        {
          question: 'Mein Kind hat keine Erfahrung – geht das?',
          answer: 'Absolut. Wir heißen Anfänger willkommen. Kinder mit erster Tanzerfahrung haben einen kleinen Vorsprung, aber Quereinsteiger holen schnell auf.',
        },
        {
          question: 'Was ist die Semesteraufführung?',
          answer: 'Am Ende jedes Semesters führen die Tanzfüchse ihre Choreografie für Familie und Freunde im Studio auf. Es ist ein informelles, festliches Event – kein Wettbewerb.',
        },
        {
          question: 'Kann mein Kind mitten im Semester einsteigen?',
          answer: 'Wir empfehlen den Einstieg zu Semesterbeginn, da die Choreografie aufbauend ist. Ausnahmen sind möglich – kontaktiere uns, um das zu besprechen.',
        },
      ],
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
        'Daniela gestaltet den Schnupperkurs so, dass sich wirklich jeder wohlfühlt – egal wie viel oder wenig Erfahrung jemand mitbringt. Ihr Ziel: dass du nach der Stunde mit einem Lächeln nach Hause gehst.',
      quote:
        'Der erste Schritt ist immer der mutigste – und meistens der schönste.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        'Tanz- und Bewegungspädagogin',
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
    courseFlow: {
      headline: 'Was passiert in der Schnupperstunde',
      steps: [
        {
          phase: 'Willkommen',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Daniela stellt sich und das Studio vor. Alle teilen, was sie hergeführt hat – oder hören einfach zu.',
        },
        {
          phase: 'Einfaches Warm-Up',
          duration: '15 Min.',
          icon: 'sparkle',
          description: 'Sanfte Bewegung, zugänglich für alle Körper und alle Altersgruppen. Keine Erfahrung nötig.',
        },
        {
          phase: 'Stil-Kostproben',
          duration: '25 Min.',
          icon: 'music',
          description: 'Wir probieren 2–3 verschiedene Stile: etwas Ausdruckstanz, Rhythmusarbeit und einen Hauch von Partnertanz.',
        },
        {
          phase: 'Q&A & Kursempfehlung',
          duration: '10 Min.',
          icon: 'info',
          description: 'Daniela beantwortet Fragen und hilft jedem Teilnehmer, den passenden Kurs für Interessen und Verfügbarkeit zu finden.',
        },
      ],
    },
    socialProof: {
      headline: 'Erste Eindrücke',
      testimonials: [
        {
          text: 'Ich wäre fast nicht gegangen, weil ich Angst hatte, mich lächerlich zu machen. Nach zehn Minuten hatte ich komplett vergessen, dass diese Angst existiert. Eine tolle Stunde.',
          authorName: 'Renate F.',
          authorRole: 'Teilnehmerin',
          rating: 5,
        },
        {
          text: 'War mit meiner 70-jährigen Mutter dort. Wir haben es beide geliebt und uns danach beide für verschiedene reguläre Kurse angemeldet.',
          authorName: 'Claudia H.',
          authorRole: 'Teilnehmerin',
          rating: 5,
        },
        {
          text: 'Endlich ein Angebot, bei dem ich mich nicht fehl am Platz fühle. Die Atmosphäre ist so herzlich und offen.',
          authorName: 'Thomas K.',
          authorRole: 'Teilnehmer',
          rating: 5,
        },
        {
          text: 'Meine Tochter und ich gehen jetzt regelmäßig zusammen hin. Das verbindet uns auf eine ganz neue Art.',
          authorName: 'Martina S.',
          authorRole: 'Teilnehmerin',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zur Schnupperstunde',
      items: [
        {
          question: 'Muss ich danach einen regulären Kurs buchen?',
          answer: 'Absolut nicht. Die Schnupperstunde ist ein eigenständiges Erlebnis. Wenn du dich in den Tanz verliebst und weitermachen möchtest, super – aber es gibt keinen Druck.',
        },
        {
          question: 'Ist die Stunde wirklich für alle Altersgruppen?',
          answer: 'Ja. Wir hatten schon Teilnehmer von 6 bis 78 Jahren in derselben Stunde. Daniela passt jede Übung an, damit jeder bequem mitmachen kann.',
        },
        {
          question: 'Was soll ich anziehen?',
          answer: 'Alles Bequeme, worin du dich bewegen kannst. Normale Sportkleidung ist perfekt. Keine spezielle Ausrüstung nötig.',
        },
      ],
    },
  },

  kinderJugend: {
    hero: {
      subHeadline: 'Tanz, sei kreativ und neugierig – denn jeder kann tanzen',
    },
    quickFacts: {
      customFacts: [
        { icon: 'sparkle', label: 'Vorkenntnisse', value: 'Keine nötig' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 14 Personen' },
        { icon: 'clock', label: 'Kursdauer', value: '60 Minuten' },
        { icon: 'child', label: 'Altersgruppe', value: '11–17 Jahre' },
      ],
    },
    description: {
      headline: 'Bewegung, Fantasie und jede Menge Spaß',
      body: 'Tanz, sei kreativ und neugierig – denn jeder kann tanzen. Mit viel Fantasie entdecken wir gemeinsam vielfältige Ausdrucksformen in Tanz und Bewegung und haben dabei eine Menge Spaß.\n\nElemente aus Jazz Dance, Hip Hop und Improvisation fließen ineinander. Schritt für Schritt erarbeiten wir eine **coole Choreographie**, die am Ende ganz euch gehört.\n\nHier zählt nicht Perfektion, sondern die Freude an der eigenen Bewegung. Jede und jeder darf sich ausprobieren und den eigenen Ausdruck finden.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Für Kinder und Jugendliche von 11 bis 17 Jahren, die Lust auf Tanz und Bewegung haben – ganz gleich, ob mit oder ohne Vorerfahrung. Wer neugierig ist und sich gerne kreativ ausdrückt, ist genau richtig.',
      },
      highlights: [
        { icon: 'sparkle', text: 'Kreatives Entdecken statt Leistungsdruck' },
        { icon: 'group', text: 'Kleine Gruppe mit viel Raum für jede Person' },
        { icon: 'star', text: 'Eine eigene Choreographie erarbeiten' },
        { icon: 'music', text: 'Jazz Dance, Hip Hop und Improvisation' },
        { icon: 'heart', text: 'Ein Ort zum Ausprobieren und Wohlfühlen' },
      ],
    },
    instructor: {
      quote: 'Ich möchte, dass jedes Kind spürt: Du darfst genau so tanzen, wie du bist. Aus Neugier und Fantasie entsteht bei uns etwas ganz Eigenes.',
      qualifications: [
        'Tanz- und Bewegungspädagogin',
        'Jazz Dance & Hip Hop',
        'Kinder- & Jugendtanz',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText: 'Der Kurs findet fortlaufend wöchentlich statt. Ein Schnuppern ist jederzeit möglich – meldet euch einfach für einen freien Termin an.',
    },
    booking: {
      ctaText: 'Platz sichern',
      priceNote: 'Preis auf Anfrage',
      includes: [
        'Wöchentliche Kursstunde in kleiner Gruppe',
        'Gemeinsame Choreographie-Arbeit',
        'Persönliche Begleitung durch Daniela',
      ],
      notice: 'Bitte bringt bequeme Kleidung und etwas zu trinken mit. Getanzt wird barfuß oder mit rutschfesten Socken.',
    },
    courseFlow: {
      headline: 'So läuft eine Stunde ab',
      intro: 'Jede Stunde folgt einem ruhigen Bogen – vom sanften Ankommen bis zum gemeinsamen Ausklang.',
      steps: [
        { phase: 'Ankommen & Aufwärmen', duration: '10 Min.', icon: 'heart', description: 'Wir kommen zur Ruhe, lockern den Körper und stimmen uns spielerisch auf die Bewegung ein.' },
        { phase: 'Bewegung entdecken', duration: '15 Min.', icon: 'sparkle', description: 'Mit kleinen Übungen aus Jazz Dance und Hip Hop erkunden wir Rhythmus, Raum und den eigenen Ausdruck.' },
        { phase: 'Choreographie', duration: '25 Min.', icon: 'music', description: 'Schritt für Schritt bauen wir gemeinsam an unserer Choreographie und setzen die Bewegungen zu Musik zusammen.' },
        { phase: 'Freies Tanzen & Ausklang', duration: '10 Min.', icon: 'improvisation', description: 'Zum Abschluss gibt es Raum für Improvisation und ein ruhiges gemeinsames Ausklingen.' },
      ],
    },
    socialProof: {
      headline: 'Das sagen Familien über den Kurs',
      testimonials: [
        { text: 'Meine Tochter geht jede Woche voller Vorfreude hin und kommt strahlend zurück. Sie hat hier ihre Freude an Bewegung entdeckt.', authorName: 'Sabine R.', authorRole: 'Mutter einer Teilnehmerin', rating: 5 },
        { text: 'Endlich ein Tanzkurs ohne Druck. Daniela nimmt jedes Kind so an, wie es ist – das spürt man sofort.', authorName: 'Markus L.', authorRole: 'Vater eines Teilnehmers', rating: 5 },
        { text: 'Die Choreographie am Ende war ein tolles Erlebnis. Mein Sohn ist richtig aufgeblüht.', authorName: 'Christine B.', authorRole: 'Mutter eines Teilnehmers', rating: 5 },
      ],
    },
    faq: {
      headline: 'Häufige Fragen',
      items: [
        { question: 'Braucht mein Kind Tanzerfahrung?', answer: 'Nein, überhaupt nicht. Der Kurs ist für Anfängerinnen und Anfänger gedacht – Neugier und Lust an Bewegung reichen völlig aus.' },
        { question: 'Was soll mein Kind anziehen?', answer: 'Bequeme Kleidung, in der man sich gut bewegen kann. Getanzt wird barfuß oder mit rutschfesten Socken.' },
        { question: 'Kann mein Kind zuerst schnuppern?', answer: 'Ja, sehr gerne. Eine Schnupperstunde ist jederzeit möglich – meldet euch einfach vorab für einen freien Termin an.' },
      ],
    },
  },
  kindergeburtstag: {
    hero: {
      subHeadline: 'Ein Tanzfest voller Fantasie, Freude und Erinnerungen',
    },
    quickFacts: {
      customFacts: [
        { icon: 'sparkle', label: 'Anlass', value: 'Kindergeburtstag' },
        { icon: 'clock', label: 'Dauer', value: '90 Minuten' },
        { icon: 'group', label: 'Gruppe', value: 'Bis 12 Kinder' },
        { icon: 'music', label: 'Musik', value: 'Wunschmusik' },
      ],
    },
    description: {
      headline: 'Schenkt Eurem Kind einen Tag voller Bewegung',
      body: 'Schenkt Eurem Kind Bewegung, Selbstbewusstsein und gemeinsame Erinnerungen. Ich gestalte einen altersgerechten Workshop voller Fantasie – ganz auf das Geburtstagskind und seine Gäste abgestimmt.\n\nWir tanzen zu **Wunschmusik**, erfinden Geschichten mit dem Körper und stärken den Teamgeist. Aus Bewegung, Spiel und Fantasie wird ein Fest, an das sich alle gerne erinnern.\n\nDer Fokus liegt auf Freude, nicht auf Perfektion. Hier darf jedes Kind einfach sein und mitmachen.',
      targetAudience: {
        headline: 'Für wen ist der Workshop?',
        body: 'Für Geburtstagskinder und ihre Gäste, die den besonderen Tag mit Tanz, Musik und viel Bewegung feiern möchten. Der Ablauf wird jeweils auf das Alter der Gruppe abgestimmt.',
      },
      highlights: [
        { icon: 'music', text: 'Getanzt wird zur Lieblingsmusik der Kinder' },
        { icon: 'sparkle', text: 'Geschichten mit dem Körper erfinden' },
        { icon: 'group', text: 'Spiele, die den Teamgeist stärken' },
        { icon: 'heart', text: 'Freude statt Perfektion' },
        { icon: 'star', text: 'Gemeinsame Erinnerungen für den besonderen Tag' },
      ],
    },
    instructor: {
      quote: 'Ein Geburtstag ist ein besonderer Moment. Ich möchte, dass jedes Kind an diesem Tag spürt, wie viel Freude im gemeinsamen Tanzen steckt.',
      qualifications: [
        'Tanz- und Bewegungspädagogin',
        'Kinder- & Jugendtanz',
        'Jazz Dance & Hip Hop',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText: 'Der Workshop ist ein Einzeltermin und individuell buchbar. Wir stimmen den Tag und die Uhrzeit ganz nach Absprache auf euch ab.',
    },
    booking: {
      ctaText: 'Workshop anfragen',
      priceNote: 'Preis auf Anfrage',
      includes: [
        '90-minütiger, altersgerechter Tanzworkshop',
        'Tanzen zur Wunschmusik der Kinder',
        'Bewegungsspiele und kreative Geschichten',
      ],
      notice: 'Ort und Uhrzeit legen wir gemeinsam fest. Bitte gebt bei der Anfrage das Alter der Kinder und die gewünschte Gruppengröße an.',
    },
    courseFlow: {
      headline: 'So läuft der Workshop ab',
      intro: 'Der Ablauf passt sich flexibel an die Gruppe an – hier ein typischer Bogen durch die 90 Minuten.',
      steps: [
        { phase: 'Ankommen & Warmwerden', duration: '10 Min.', icon: 'heart', description: 'Wir begrüßen uns, lernen uns kennen und lockern spielerisch den Körper.' },
        { phase: 'Bewegungsspiele', duration: '15 Min.', icon: 'sparkle', description: 'Mit kleinen Spielen kommen alle in Schwung und der Teamgeist wächst.' },
        { phase: 'Tanzen zur Wunschmusik', duration: '25 Min.', icon: 'music', description: 'Zur Lieblingsmusik der Kinder erfinden wir Bewegungen und kleine Tanzsequenzen.' },
        { phase: 'Fantasiereise & Ausklang', duration: '10 Min.', icon: 'improvisation', description: 'Wir erzählen Geschichten mit dem Körper und lassen den Workshop ruhig ausklingen.' },
      ],
    },
    socialProof: {
      headline: 'Das sagen Familien über den Workshop',
      testimonials: [
        { text: 'Der schönste Geburtstag bisher. Die Kinder waren begeistert und wir Eltern konnten einfach genießen.', authorName: 'Nadine K.', authorRole: 'Mutter des Geburtstagskindes', rating: 5 },
        { text: 'Daniela hat eine wundervolle Art mit den Kindern. Alle haben mitgemacht, keiner stand am Rand.', authorName: 'Tobias M.', authorRole: 'Vater des Geburtstagskindes', rating: 5 },
        { text: 'Wunschmusik, Spiele, Tanzen – rundum ein gelungenes Fest voller Bewegung und Lachen.', authorName: 'Elena S.', authorRole: 'Mutter eines Gastkindes', rating: 5 },
      ],
    },
    faq: {
      headline: 'Häufige Fragen',
      items: [
        { question: 'Wo findet der Workshop statt?', answer: 'Das legen wir gemeinsam fest – der Workshop kann bei euch zu Hause oder in geeigneten Räumen stattfinden. Wichtig ist genügend Platz zum Bewegen.' },
        { question: 'Für welches Alter ist der Workshop geeignet?', answer: 'Der Ablauf wird jeweils auf das Alter der Kinder abgestimmt. Gebt bei der Anfrage einfach das Alter der Gruppe an, dann plane ich passend.' },
        { question: 'Was ist im Workshop enthalten?', answer: 'Enthalten sind die 90-minütige Anleitung, das Tanzen zur Wunschmusik, Bewegungsspiele und kreative Geschichten. Um Kuchen und Deko kümmert ihr euch selbst.' },
      ],
    },
  },
  dancetogetherErwachsene: {
    hero: {
      subHeadline: 'Wir tanzen gemeinsam – mit und ohne Beeinträchtigung',
    },
    quickFacts: {
      customFacts: [
        { icon: 'wheelchair', label: 'Barrierefrei', value: 'Rollstuhl & Rollator willkommen' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 12 Personen' },
        { icon: 'clock', label: 'Kursdauer', value: '75 Minuten' },
        { icon: 'sparkle', label: 'Vorkenntnisse', value: 'Keine nötig' },
      ],
    },
    description: {
      headline: 'DANCETOGETHER – wir tanzen gemeinsam',
      body: 'DANCETOGETHER heißt: Wir tanzen gemeinsam. In einer kleinen Choreographie verbinden wir Jazz Dance, Hip Hop und DanceAbility zu etwas, das uns alle trägt.\n\nDieser Kurs ist für Erwachsene mit Behinderung geeignet – egal ob mit Rollstuhl, Rollator oder mit psychischer oder geistiger Beeinträchtigung. **Alle sind willkommen**, mit und ohne Beeinträchtigung.\n\nWorte sind nicht notwendig. Lass deinen Körper sprechen und finde deinen eigenen Ausdruck in der Bewegung.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Für Erwachsene mit und ohne Beeinträchtigung, die gemeinsam tanzen möchten. Ob mit Rollstuhl, Rollator oder mit psychischer oder geistiger Beeinträchtigung – hier ist jede und jeder herzlich willkommen. Begleitpersonen und Assistenzen sind kostenfrei dabei.',
      },
      highlights: [
        { icon: 'wheelchair', text: 'Barrierefrei – Rollstuhl und Rollator willkommen' },
        { icon: 'users', text: 'Begleitpersonen und Assistenzen kostenfrei dabei' },
        { icon: 'dance', text: 'Jazz Dance, Hip Hop und DanceAbility' },
        { icon: 'heart', text: 'Worte sind nicht nötig – der Körper spricht' },
        { icon: 'star', text: 'Eine gemeinsame Choreographie für alle' },
      ],
    },
    instructor: {
      quote: 'Beim gemeinsamen Tanzen zählt kein Können und keine Grenze. Ich erlebe immer wieder, wie viel Verbindung entsteht, wenn wir den Körper sprechen lassen.',
      qualifications: [
        'Tanz- und Bewegungspädagogin',
        'DanceAbility',
        'Inklusionspädagogik',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText: 'Der Kurs findet fortlaufend wöchentlich statt. Ein Schnuppern ist jederzeit möglich – meldet euch gerne für einen freien Termin an.',
    },
    booking: {
      ctaText: 'Platz sichern',
      priceNote: 'Preis auf Anfrage',
      includes: [
        'Wöchentliche Kursstunde in barrierefreier Umgebung',
        'Begleitpersonen und Assistenzen kostenfrei',
        'Persönliche Begleitung durch Daniela',
      ],
      notice: 'Wenn du besondere Bedürfnisse hast oder etwas vorab besprechen möchtest, melde dich gerne. Wir finden gemeinsam einen Weg, der für dich passt.',
    },
    courseFlow: {
      headline: 'So läuft eine Stunde ab',
      intro: 'Jede Stunde folgt einem ruhigen, verlässlichen Ablauf, der allen Sicherheit gibt.',
      steps: [
        { phase: 'Ankommen & Spüren', duration: '10 Min.', icon: 'heart', description: 'Wir kommen zusammen, atmen durch und spüren behutsam in den eigenen Körper hinein.' },
        { phase: 'Bewegung wecken', duration: '15 Min.', icon: 'sparkle', description: 'Mit sanften Impulsen aus DanceAbility bringen wir den ganzen Körper in Bewegung – im Sitzen wie im Stehen.' },
        { phase: 'Gemeinsame Choreographie', duration: '25 Min.', icon: 'music', description: 'Aus Jazz Dance und Hip Hop entsteht eine kleine Choreographie, die wir alle miteinander tragen.' },
        { phase: 'Freier Ausdruck & Ausklang', duration: '10 Min.', icon: 'improvisation', description: 'Zum Abschluss gibt es Raum für freie Bewegung und ein ruhiges, verbindendes Ausklingen.' },
      ],
    },
    socialProof: {
      headline: 'Stimmen aus dem Kurs',
      testimonials: [
        { text: 'Zum ersten Mal habe ich mich beim Tanzen wirklich frei gefühlt. Hier zählt kein Können, nur das gemeinsame Erleben.', authorName: 'Petra H.', authorRole: 'Teilnehmerin', rating: 5 },
        { text: 'Als Begleiterin durfte ich einfach mittanzen. Die Atmosphäre ist so warm und offen – das tut allen gut.', authorName: 'Andrea W.', authorRole: 'Begleitperson', rating: 5 },
        { text: 'Endlich ein Kurs, in dem mein Rollstuhl kein Hindernis ist, sondern dazugehört. Ich freue mich jede Woche.', authorName: 'Michael D.', authorRole: 'Teilnehmer', rating: 5 },
      ],
    },
    faq: {
      headline: 'Häufige Fragen',
      items: [
        { question: 'Kann ich mit Rollstuhl oder Rollator teilnehmen?', answer: 'Ja, unbedingt. Der Kurs ist barrierefrei gestaltet, und die Bewegungen lassen sich im Sitzen wie im Stehen umsetzen.' },
        { question: 'Darf eine Begleitperson mitkommen?', answer: 'Ja, Begleitpersonen und Assistenzen sind herzlich willkommen und nehmen kostenfrei teil.' },
        { question: 'Brauche ich Tanzerfahrung?', answer: 'Nein. Es sind keine Vorkenntnisse nötig – wichtig ist nur die Lust, gemeinsam in Bewegung zu kommen.' },
      ],
    },
  },
  dancetogetherKids: {
    hero: {
      subHeadline: 'Tolle Musik, Bewegung und Spaß – gemeinsam für alle',
    },
    quickFacts: {
      customFacts: [
        { icon: 'wheelchair', label: 'Barrierefrei', value: 'Rollstuhl & Rollator willkommen' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 10 Personen' },
        { icon: 'clock', label: 'Kursdauer', value: '60 Minuten' },
        { icon: 'child', label: 'Für', value: 'Kinder & Jugendliche' },
      ],
    },
    description: {
      headline: 'Habt Ihr Lust auf Tanzen und Spaß?',
      body: 'Habt Ihr Lust auf Tanzen, auf tolle Musik und richtig viel Spaß? Dann seid Ihr hier genau richtig. Dieser Kurs ist speziell für Kinder und Jugendliche mit Behinderung gedacht.\n\nEgal ob mit Rollstuhl, Rollator oder mit psychischer oder geistiger Beeinträchtigung – **jede und jeder ist willkommen**. Aus Jazz Dance, Hip Hop und DanceAbility entsteht eine bunte Mischung aus Bewegungen und Impulsen.\n\nGemeinsam erarbeiten wir eine kleine Choreographie. Dabei steht immer die Freude an der Bewegung im Vordergrund.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Nur für Kinder und Jugendliche mit Behinderung – ob mit Rollstuhl, Rollator oder mit psychischer oder geistiger Beeinträchtigung. Wer Lust auf Musik, Bewegung und eine bunte Gruppe hat, ist herzlich willkommen. Begleitpersonen und Assistenzen sind kostenfrei dabei.',
      },
      highlights: [
        { icon: 'wheelchair', text: 'Barrierefrei – Rollstuhl und Rollator willkommen' },
        { icon: 'music', text: 'Tolle Musik und viel Spaß' },
        { icon: 'dance', text: 'Jazz Dance, Hip Hop und DanceAbility' },
        { icon: 'sparkle', text: 'Eine bunte Mischung aus Bewegungen und Impulsen' },
        { icon: 'heart', text: 'Freude an der Bewegung steht im Mittelpunkt' },
      ],
    },
    instructor: {
      quote: 'Es macht mich glücklich zu sehen, wie die Kinder aufblühen, sobald die Musik läuft. Hier darf jedes Kind auf seine eigene Weise strahlen.',
      qualifications: [
        'Tanz- und Bewegungspädagogin',
        'DanceAbility',
        'Kinder- & Jugendtanz',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText: 'Der Kurs findet fortlaufend wöchentlich statt. Ein Schnuppern ist jederzeit möglich – meldet euch gerne für einen freien Termin an.',
    },
    booking: {
      ctaText: 'Platz sichern',
      priceNote: 'Preis auf Anfrage',
      includes: [
        'Wöchentliche Kursstunde in barrierefreier Umgebung',
        'Begleitpersonen und Assistenzen kostenfrei',
        'Persönliche Begleitung durch Daniela',
      ],
      notice: 'Wenn euer Kind besondere Bedürfnisse hat oder ihr etwas vorab besprechen möchtet, meldet euch gerne. Wir finden gemeinsam einen Weg, der passt.',
    },
    courseFlow: {
      headline: 'So läuft eine Stunde ab',
      intro: 'Jede Stunde folgt einem klaren, liebevollen Ablauf, der den Kindern Sicherheit gibt.',
      steps: [
        { phase: 'Ankommen & Begrüßen', duration: '10 Min.', icon: 'heart', description: 'Wir sagen Hallo, kommen an und wärmen uns gemeinsam mit sanften Bewegungen auf.' },
        { phase: 'Bewegung entdecken', duration: '15 Min.', icon: 'sparkle', description: 'Mit Impulsen aus DanceAbility probieren wir spielerisch aus, was der Körper alles kann.' },
        { phase: 'Choreographie & Musik', duration: '25 Min.', icon: 'music', description: 'Zu toller Musik bauen wir Schritt für Schritt an unserer kleinen gemeinsamen Choreographie.' },
        { phase: 'Freies Tanzen & Ausklang', duration: '10 Min.', icon: 'improvisation', description: 'Zum Schluss darf jedes Kind frei tanzen, bevor wir die Stunde ruhig ausklingen lassen.' },
      ],
    },
    socialProof: {
      headline: 'Das sagen Familien über den Kurs',
      testimonials: [
        { text: 'Mein Sohn zählt die Tage bis zur nächsten Stunde. Hier wird er gesehen und gefeiert, so wie er ist.', authorName: 'Katrin F.', authorRole: 'Mutter eines Teilnehmers', rating: 5 },
        { text: 'Ein Kurs, in dem der Rollstuhl einfach dazugehört. Meine Tochter tanzt mit so viel Freude – wunderbar.', authorName: 'Stefan G.', authorRole: 'Vater einer Teilnehmerin', rating: 5 },
        { text: 'Daniela schafft eine Atmosphäre, in der sich jedes Kind trauen darf. Wir sind unendlich dankbar.', authorName: 'Yvonne P.', authorRole: 'Mutter eines Teilnehmers', rating: 5 },
      ],
    },
    faq: {
      headline: 'Häufige Fragen',
      items: [
        { question: 'Für welche Kinder ist der Kurs?', answer: 'Der Kurs ist speziell für Kinder und Jugendliche mit Behinderung gedacht – ob mit Rollstuhl, Rollator oder mit psychischer oder geistiger Beeinträchtigung.' },
        { question: 'Darf eine Begleitperson mitkommen?', answer: 'Ja, Begleitpersonen und Assistenzen sind herzlich willkommen und nehmen kostenfrei teil.' },
        { question: 'Braucht mein Kind Tanzerfahrung?', answer: 'Nein, überhaupt nicht. Wichtig ist nur die Lust auf Musik, Bewegung und gemeinsamen Spaß.' },
      ],
    },
  },
  muetterToechter: {
    hero: {
      subHeadline: 'Gemeinsam ins Flow kommen und die Bindung stärken',
    },
    quickFacts: {
      customFacts: [
        { icon: 'sparkle', label: 'Vorkenntnisse', value: 'Keine nötig' },
        { icon: 'group', label: 'Gruppengröße', value: 'Max. 10 Personen' },
        { icon: 'clock', label: 'Kursdauer', value: '90 Minuten' },
        { icon: 'heart', label: 'Für', value: 'Mütter & Töchter ab ca. 14 J.' },
      ],
    },
    description: {
      headline: 'Ein besonderer Kurs für Mütter und Töchter',
      body: 'Ein besonderer Kurs für Mütter und Töchter ab etwa 14 Jahren, die ihre Bindung stärken, sich wieder näherkommen und gemeinsam ins **Flow** kommen möchten.\n\nIn einer geschützten Atmosphäre schenken wir uns eine bewusste Auszeit vom Alltag. Über Bewegung entstehen Nähe, Vertrauen und ein gemeinsamer kreativer Ausdruck.\n\nWorte sind nicht immer nötig – manchmal spricht die Bewegung für sich. Hier dürft ihr euch spüren, loslassen und einfach zusammen sein.',
      targetAudience: {
        headline: 'Für wen ist der Kurs?',
        body: 'Für Mütter und Töchter ab etwa 14 Jahren, die sich eine gemeinsame Auszeit wünschen und ihre Verbindung über die Bewegung vertiefen möchten. Vorerfahrung ist nicht nötig – nur die Offenheit, sich aufeinander einzulassen.',
      },
      highlights: [
        { icon: 'heart', text: 'Bindung und Vertrauen stärken' },
        { icon: 'sparkle', text: 'Eine bewusste Auszeit zu zweit' },
        { icon: 'dance', text: 'Gemeinsamer kreativer Ausdruck' },
        { icon: 'group', text: 'Geschützte Atmosphäre in kleiner Gruppe' },
        { icon: 'music', text: 'Nähe finden, wo Worte nicht nötig sind' },
      ],
    },
    instructor: {
      quote: 'Wenn Mutter und Tochter gemeinsam in Bewegung kommen, entsteht eine Nähe, die keine Worte braucht. Diesen Raum halte ich mit viel Achtsamkeit.',
      qualifications: [
        'Tanz- und Bewegungspädagogin',
        'Kinder- & Jugendtanz',
        'Inklusionspädagogik',
      ],
    },
    schedule: {
      headline: 'Termine',
      infoText: 'Der Kurs findet zu festen Terminen statt. Meldet euch gerne für einen freien Termin an – Mutter und Tochter buchen gemeinsam als Paar.',
    },
    booking: {
      ctaText: 'Platz sichern',
      priceNote: 'Preis auf Anfrage',
      includes: [
        '90-minütige gemeinsame Kursstunde',
        'Geschützter Raum für Mutter und Tochter',
        'Achtsame Begleitung durch Daniela',
      ],
      notice: 'Gebucht wird als Paar aus Mutter und Tochter. Bringt bequeme Kleidung mit, in der ihr euch frei bewegen könnt.',
    },
    courseFlow: {
      headline: 'So läuft eine Stunde ab',
      intro: 'Jede Stunde führt behutsam vom Ankommen über die gemeinsame Bewegung bis zu einem ruhigen Ausklang.',
      steps: [
        { phase: 'Ankommen & Einstimmen', duration: '10 Min.', icon: 'heart', description: 'Wir lassen den Alltag hinter uns, kommen zur Ruhe und stimmen uns achtsam aufeinander ein.' },
        { phase: 'Verbindung wecken', duration: '15 Min.', icon: 'sparkle', description: 'Mit sanften Partnerübungen spüren Mutter und Tochter einander und bauen Vertrauen auf.' },
        { phase: 'Gemeinsam in Bewegung', duration: '25 Min.', icon: 'music', description: 'Über Musik und Bewegung finden wir einen gemeinsamen Ausdruck und kommen ins Flow.' },
        { phase: 'Freier Ausdruck & Ausklang', duration: '10 Min.', icon: 'improvisation', description: 'Zum Abschluss gibt es Raum für freie Bewegung und ein ruhiges, verbindendes Ausklingen.' },
      ],
    },
    socialProof: {
      headline: 'Stimmen aus dem Kurs',
      testimonials: [
        { text: 'Diese 90 Minuten gehören nur uns beiden. Meiner Tochter und mir hat der Kurs eine ganz neue Nähe geschenkt.', authorName: 'Birgit E.', authorRole: 'Mutter', rating: 5 },
        { text: 'Ohne Handy, ohne Alltag – einfach zusammen bewegen. Ich habe meine Mama noch nie so entspannt erlebt.', authorName: 'Lena T.', authorRole: 'Tochter', rating: 5 },
        { text: 'Ein wunderbarer, geschützter Raum. Man muss nichts können, man darf einfach da sein und spüren.', authorName: 'Claudia N.', authorRole: 'Mutter', rating: 5 },
      ],
    },
    faq: {
      headline: 'Häufige Fragen',
      items: [
        { question: 'Ab welchem Alter können Töchter mitmachen?', answer: 'Der Kurs richtet sich an Töchter ab etwa 14 Jahren. Wenn ihr unsicher seid, ob es schon passt, meldet euch gerne vorab.' },
        { question: 'Brauchen wir Tanzerfahrung?', answer: 'Nein. Es geht nicht um Können oder Technik, sondern um das gemeinsame Erleben. Vorerfahrung ist nicht nötig.' },
        { question: 'Müssen wir zusammen buchen?', answer: 'Ja, Mutter und Tochter nehmen als Paar teil und buchen gemeinsam. So ist der Kurs von Beginn an auf euch beide ausgerichtet.' },
      ],
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
        'Daniela ist selbst Mutter und weiß genau, wie wertvoll eine Stunde nur für sich selbst ist. In ihren Mütter-Kursen schafft sie eine Atmosphäre, in der sich jede Frau wohlfühlt und ihren eigenen Rhythmus findet.',
      quote:
        'Als Mutter weiß ich, wie wertvoll eine Stunde nur für sich selbst ist.',
      qualifications: [
        'Dipl. Tanzpädagogin',
        'Rückbildungsgymnastik (Grundkenntnisse)',
        'Achtsamkeit & Somatische Arbeit',
        'Erfahrung in achtsamer Bewegung',
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
    courseFlow: {
      headline: 'Deine Stunde',
      intro: 'Fünfundsiebzig Minuten ganz für dich. Keine Agenda, keine Ziele – nur Bewegung.',
      steps: [
        {
          phase: 'Ankommen',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Den Tag ausatmen. Wir beginnen mit einem sanften Body-Scan und erlauben uns, ganz anzukommen.',
        },
        {
          phase: 'Energetisches Warm-Up',
          duration: '15 Min.',
          icon: 'sparkle',
          description: 'Dynamische Sequenzen, um Energie zu heben. Angepasst an alle Phasen der Rückbildung.',
        },
        {
          phase: 'Tanz',
          duration: '30 Min.',
          icon: 'music',
          description: 'Freie und geführte Bewegung zu einer kuratierten Playlist. Mal mehr strukturiert, mal reine Improvisation.',
        },
        {
          phase: 'Stille',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Sanfte Bodenarbeit und Entspannung. Das ist der Teil, den viele Teilnehmerinnen am meisten schätzen.',
        },
        {
          phase: 'Verbindung',
          duration: '10 Min.',
          icon: 'users',
          description: 'Optional – Austausch bei Tee mit anderen Müttern. Daniela bleibt für Fragen da.',
        },
      ],
    },
    socialProof: {
      headline: 'Mütter erzählen',
      testimonials: [
        {
          text: 'Ich hatte vergessen, wie es sich anfühlt, in meinem eigenen Körper zu sein. Dieser Kurs gibt mir mich selbst zurück, einmal die Woche. Ich hüte diese Stunde wie einen Schatz.',
          authorName: 'Sandra B.',
          authorRole: 'Mutter von zwei Kindern',
          rating: 5,
        },
        {
          text: 'Ich hatte einen Workout-Kurs erwartet. Was ich gefunden habe, war eine kleine Gemeinschaft von Frauen, die sich verstehen. Das Tanzen ist wunderbar, aber das Gefühl, nicht allein zu sein, ist genauso wichtig.',
          authorName: 'Jana P.',
          authorRole: 'Junge Mutter, Teilnehmerin',
          rating: 5,
        },
        {
          text: 'Dieser Kurs ist meine wöchentliche Insel. 75 Minuten, in denen ich nur ich bin – keine Mama, keine Frau, keine Kollegin. Nur ich und die Musik.',
          authorName: 'Brigitte L.',
          authorRole: 'Mutter von drei Kindern',
          rating: 5,
        },
        {
          text: 'Ich war sechs Wochen nach der Geburt dabei und hätte nie erwartet, mich so willkommen zu fühlen. Daniela ist unglaublich einfühlsam.',
          authorName: 'Anna-Marie W.',
          authorRole: 'Frischgebackene Mutter',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zu Mama tanzt',
      items: [
        {
          question: 'Kann ich mein Baby mitbringen?',
          answer: 'Schlafende Babys im Kinderwagen sind im Raum immer willkommen. Für ältere Babys, die aktive Betreuung brauchen, kann Kinderbetreuung vor Ort gebucht werden – kontaktiere uns vorab.',
        },
        {
          question: 'Bin ich nach der Geburt schon fit genug?',
          answer: 'Bitte kläre das mit deiner Hebamme oder Ärztin. Daniela hat eine Ausbildung in rückbildungsfreundlicher Bewegung und bietet immer Alternativen an. Im Zweifel sprich sie vor deiner ersten Stunde an.',
        },
        {
          question: 'Muss ich mich für ein Semester anmelden?',
          answer: 'Nein. Dieser Kurs ist bewusst flexibel – keine Semesterbindung. Buche einzelne Stunden, wie es dein Zeitplan erlaubt.',
        },
      ],
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
        'Daniela liebt es, Mütter und ihre Babys in dieser besonderen Zeit zu begleiten. Ihr Kurs ist ein warmer, offener Raum, in dem Tränen, Lachen und alles dazwischen willkommen sind.',
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
    courseFlow: {
      headline: 'Eine Stunde zusammen',
      intro: 'Sechzig Minuten Nähe, Bewegung und Musik für dich und dein Baby.',
      steps: [
        {
          phase: 'Ankommen & Einrichten',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Wir kommen an, stillen bei Bedarf, wickeln bei Bedarf. Es gibt keine Eile. Wir beginnen, wenn alle bereit sind.',
        },
        {
          phase: 'Mama Warm-Up',
          duration: '10 Min.',
          icon: 'sparkle',
          description: 'Sanfte, rückbildungsfreundliche Bewegung für die Mutter, während die Babys auf der Matte liegen oder im Arm sind.',
        },
        {
          phase: 'Gemeinsame Zeit',
          duration: '25 Min.',
          icon: 'music',
          description: 'Wir tanzen mit unseren Babys – tragen, wiegen, schaukeln. Bewegungslieder, sanftes Heben, Bodenspiel.',
        },
        {
          phase: 'Baby-Spielzeit',
          duration: '10 Min.',
          icon: 'users',
          description: 'Die Babys erkunden selbstständig auf der Matte, während die Mütter sich dehnen und atmen.',
        },
        {
          phase: 'Schlaflied-Abschluss',
          duration: '5 Min.',
          icon: 'heart',
          description: 'Wir schließen jede Stunde mit dem gleichen sanften Lied. Babys beginnen, es als Zeichen für Ruhe zu erkennen.',
        },
      ],
    },
    socialProof: {
      headline: 'Aus unseren Mama-Baby-Familien',
      testimonials: [
        {
          text: 'Meine Tochter war vier Monate alt und ich war verzweifelt, die Wohnung zu verlassen, aber hatte Angst vor formellen Kursen. Das hier war perfekt – kein Urteil, keine Stille, kein Druck. Nur Wärme.',
          authorName: 'Melanie K.',
          authorRole: 'Erstmals-Mama',
          rating: 5,
        },
        {
          text: 'Mein Sohn ist jetzt ein Kleinkind und ich vermisse diese Stunden immer noch. Die Bindungen, die ich mit anderen Müttern in diesem Kurs aufgebaut habe, halten seit Jahren.',
          authorName: 'Nicole W.',
          authorRole: 'Ehemalige Teilnehmerin',
          rating: 5,
        },
        {
          text: 'Mein Baby schläft jetzt nach jeder Stunde besonders gut. Ich glaube, das Schaukeln und die Musik tun ihr genauso gut wie mir.',
          authorName: 'Laura H.',
          authorRole: 'Teilnehmerin, Mama einer 7-Monate-Alten',
          rating: 5,
        },
        {
          text: 'Hier wird Mutterschaft gefeiert, nicht geduldet. Ich fühlte mich zum ersten Mal seit der Geburt wieder wie eine vollständige Person.',
          authorName: 'Katrin V.',
          authorRole: 'Teilnehmerin',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zu Mama & Baby Tanz',
      items: [
        {
          question: 'Mein Baby ist sehr unruhig – stört das?',
          answer: 'Überhaupt nicht. Weinen, Stillen und Quengeln sind völlig normal und erwartet. Jedes Baby im Raum lebt in der gleichen Welt. Daniela strukturiert die Stunde so, dass sie mit den natürlichen Rhythmen der Babys arbeitet.',
        },
        {
          question: 'Ab welchem Alter kann mein Baby mitmachen?',
          answer: 'Ab 3 Monaten. Wir empfehlen, zu warten, bis dein Baby eine gute Kopfkontrolle hat. Die Obergrenze liegt bei etwa 12 Monaten, oder wenn dein Baby selbstständig läuft.',
        },
        {
          question: 'Brauche ich Tanzerfahrung?',
          answer: 'Keinerlei. Die Bewegung ist einfach, intuitiv und für Körper konzipiert, die sich noch von der Geburt erholen.',
        },
      ],
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
  'kinder-jugendliche-11-17': {
    content: 'kinderJugend',
    metaTitle: 'Kinder & Jugendliche (11-17 Jahre) | Tanzmoment',
    metaDescription:
      'Tanzkurs für Kinder & Jugendliche von 11–17 Jahren. Jazz Dance, Hip Hop und kreative Choreografien – mit und ohne Vorerfahrung.',
  },
  'tanzworkshop-kindergeburtstag': {
    content: 'kindergeburtstag',
    metaTitle: 'Tanzworkshop zum Kindergeburtstag | Tanzmoment',
    metaDescription:
      'Altersgerechter Tanzworkshop zum Kindergeburtstag. Tanzen zu Wunschmusik, Geschichten mit dem Körper und jede Menge Spaß.',
  },
  'dancetogether-erwachsene': {
    content: 'dancetogetherErwachsene',
    metaTitle: 'Dancetogether – Erwachsene | Tanzmoment',
    metaDescription:
      'Inklusiver Tanzkurs für Erwachsene mit und ohne Behinderung. Jazz Dance, Hip Hop und DanceAbility – barrierefrei, gemeinsam, mit Freude.',
  },
  'dancetogether-kinder-jugendliche': {
    content: 'dancetogetherKids',
    metaTitle: 'Dancetogether – Kinder & Jugendliche | Tanzmoment',
    metaDescription:
      'Inklusiver Tanzkurs für Kinder & Jugendliche mit Behinderung. Tolle Musik, kleine Choreografien und jede Menge Spaß – egal ob mit Rollstuhl, Rollator oder Beeinträchtigung.',
  },
  'muetter-toechter': {
    content: 'muetterToechter',
    metaTitle: 'Mütter & Töchter | Tanzmoment',
    metaDescription:
      'Besonderer Tanzkurs für Mütter und Töchter ab ca. 14 Jahren. Bindung stärken, sich näherkommen und gemeinsam in den Flow kommen.',
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
      bookingMode: BookingMode.SINGLE_SESSION,
      isFree: false,
      cancellationPolicy: FREE_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
      isMarkedAsHighlighted: true, // Featured course
    },
  ],

  // =========================================================================
  // TANZEN FÜR KINDER (Kids Dance)
  // =========================================================================
  kids: [
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
      bookingMode: BookingMode.FULL_COURSE,
      isFree: false,
      cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
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
      bookingMode: BookingMode.SINGLE_SESSION,
      isFree: true,
      cancellationPolicy: FREE_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
      isMarkedAsHighlighted: true, // Featured course
    },
    {
      title: 'Kinder & Jugendliche (11-17 Jahre)',
      slug: 'kinder-jugendliche-11-17',
      catchPhrase: 'Sei kreativ & neugierig ...',
      shortDescription:
        'Tanz, tanz, sei kreativ und neugierig – denn jeder kann tanzen! Mit viel Fantasie entdecken wir vielfältige Ausdrucksformen und haben eine Menge Spaß dabei.',
      description: `Für Kinder und Jugendliche, die Lust auf Musik, Bewegung und Spaß haben. Mit viel Fantasie entdecken wir vielfältige Ausdrucksformen in Tanz und Bewegung.

Was wir machen:
• Aktuelle Musik und kreative Bewegungsspiele
• Elemente aus Jazz Dance, Hip Hop und freier Improvisation
• Gemeinsam eine coole Choreographie erarbeiten
• Selbstbewusstsein und Ausdruckskraft stärken

Wichtig: Der Fokus liegt auf Freude und Gemeinschaft – mit und ohne Tanzerfahrung.`,
      danceStyle: 'kids',
      targetGroup: 'Kinder & Jugendliche 11-17 Jahre',
      level: CourseLevel.BEGINNER,
      maxParticipants: 14,
      priceInCents: 0, // Price on request – to be confirmed by Daniela
      duration: 60,
      imageUrl: '/assets/images/courses/kids-jugendliche.jpg',
      bookingMode: BookingMode.FULL_COURSE,
      isFree: false,
      cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Tanzworkshop zum Kindergeburtstag',
      slug: 'tanzworkshop-kindergeburtstag',
      catchPhrase: 'Bewegung schenken ...',
      shortDescription:
        'Schenkt Eurem Kind Bewegung, Selbstbewusstsein und gemeinsame Erinnerungen – ein altersgerechter Tanzworkshop voller Fantasie.',
      description: `Schenkt Eurem Kind Bewegung, Selbstbewusstsein und gemeinsame Erinnerungen.

Ich gestalte einen altersgerechten Workshop voller Fantasie. Wir tanzen zu Wunschmusik, erfinden Geschichten mit dem Körper und stärken den Teamgeist. Der Fokus liegt auf Freude, nicht auf Perfektion.

Ein besonderes Erlebnis für den Kindergeburtstag – gemeinsam tanzen, lachen und den Tag unvergesslich machen.`,
      danceStyle: 'kids',
      targetGroup: 'Kindergeburtstage',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 12,
      priceInCents: 0, // Package price on request – to be confirmed by Daniela
      duration: 90,
      imageUrl: '/assets/images/courses/kindergeburtstag.jpg',
      bookingMode: BookingMode.SINGLE_SESSION,
      isFree: false,
      cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
      isMarkedAsHighlighted: false,
    },
  ],

  // =========================================================================
  // DANCETOGETHER (Accessible / Inclusive Dance)
  // =========================================================================
  accessible: [
    {
      title: 'Dancetogether – Erwachsene',
      slug: 'dancetogether-erwachsene',
      catchPhrase: 'Wir tanzen gemeinsam ...',
      shortDescription:
        'Dancetogether – wir tanzen gemeinsam! Egal ob mit oder ohne Beeinträchtigung, mit Rollstuhl, Rollator oder psychischer/geistiger Beeinträchtigung. Mach mit!',
      description: `Dancetogether ist für alle: Erwachsene mit und ohne Behinderung tanzen gemeinsam. Egal ob mit Rollstuhl, Rollator oder mit psychischer/geistiger Beeinträchtigung – hier zählt die Freude an der Bewegung, nicht die Perfektion.

Tanzrichtung: Wir kombinieren zu einer kleinen Choreographie Elemente aus Jazz Dance, Hip Hop und DanceAbility.

Unser Ansatz:
• Individuell angepasste Bewegungen – im Sitzen, Stehen oder in Bewegung
• Musik und Rhythmus als verbindende Elemente
• Gemeinschaft, Inklusion und Akzeptanz
• Begleitpersonen und Assistenzen herzlich willkommen

Worte sind nicht notwendig – lass deinen Körper sprechen.`,
      danceStyle: 'accessible',
      targetGroup: 'Erwachsene mit & ohne Behinderung',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 12,
      priceInCents: 0, // Price on request – to be confirmed by Daniela
      duration: 75,
      imageUrl: '/assets/images/courses/dancetogether-erwachsene.jpg',
      bookingMode: BookingMode.FULL_COURSE,
      isFree: false,
      cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
      isMarkedAsHighlighted: true, // Featured inclusion course
    },
    {
      title: 'Dancetogether – Kinder & Jugendliche',
      slug: 'dancetogether-kinder-jugendliche',
      catchPhrase: 'Tanzen ohne Grenzen ...',
      shortDescription:
        'Habt Ihr Lust auf Tanzen, tolle Musik und Spaß? Für Kinder und Jugendliche mit Behinderung – egal ob mit Rollstuhl, Rollator oder Beeinträchtigung.',
      description: `Dieser Kurs ist für Kinder und Jugendliche mit Behinderung – egal ob mit Rollstuhl, Rollator oder mit psychischer/geistiger Beeinträchtigung. Habt Ihr Lust auf Tanzen, auf tolle Musik und darauf, Spaß zu haben?

Tanzrichtung: Wir kombinieren zu einer kleinen Choreographie Elemente aus Jazz Dance, Hip Hop und DanceAbility.

Was wir machen:
• Bunte Mischung aus Bewegungen und Impulsen
• Individuell angepasst an jede:n Teilnehmer:in
• Gemeinsam eine kleine Choreographie erarbeiten
• Begleitpersonen und Assistenzen herzlich willkommen

Also, mach mit – egal ob mit oder ohne Beeinträchtigung!`,
      danceStyle: 'accessible',
      targetGroup: 'Kinder & Jugendliche mit & ohne Behinderung',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 10,
      priceInCents: 0, // Price on request – to be confirmed by Daniela
      duration: 60,
      imageUrl: '/assets/images/courses/dancetogether-kinder.jpg',
      bookingMode: BookingMode.FULL_COURSE,
      isFree: false,
      cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
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
      bookingMode: BookingMode.FULL_COURSE,
      isFree: false,
      cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
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
      bookingMode: BookingMode.FULL_COURSE,
      isFree: false,
      cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Mütter & Töchter',
      slug: 'muetter-toechter',
      catchPhrase: 'Gemeinsam im Flow ...',
      shortDescription:
        'Ein besonderer Kurs für Mütter und Töchter (ab ca. 14 Jahre) – die Bindung stärken, sich wieder näherkommen und gemeinsam in den Flow kommen.',
      description: `Ein besonderer Kurs für Mütter und Töchter (ab ca. 14 Jahre), die ihre Bindung stärken, sich wieder näherkommen und gemeinsam in den Flow kommen möchten.

Was dich erwartet:
• Gemeinsame Bewegung, die verbindet
• Achtsame Übungen für Nähe und Vertrauen
• Kreativer Ausdruck ohne Leistungsdruck
• Eine wertvolle gemeinsame Auszeit

Worte sind nicht immer nötig – manchmal spricht die Bewegung für sich.`,
      danceStyle: 'mothers',
      targetGroup: 'Mütter & Töchter (ab ca. 14 Jahre)',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 10,
      priceInCents: 0, // Price on request – to be confirmed by Daniela
      duration: 90,
      imageUrl: '/assets/images/courses/muetter-toechter.jpg',
      bookingMode: BookingMode.FULL_COURSE,
      isFree: false,
      cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
      isPublished: true,
      status: 'ACTIVE',
      isMarkedAsHighlighted: false,
    },
  ],
};

// =============================================================================
// LOCATIONS
// =============================================================================

const LOCATION_DATA = [
  { name: 'Mössingen', address: null },
  { name: 'Bodelshausen', address: null },
];

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
  const instructorPassword = await bcrypt.hash('daniela123', 10);
  const instructorUser = await prisma.user.upsert({
    where: { email: 'daniela@tanzmoment.de' },
    update: {},
    create: {
      email: 'daniela@tanzmoment.de',
      passwordHash: instructorPassword,
      firstName: 'Daniela',
      lastName: 'Savasta-Eberle',
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
      bio: 'In Ragusa auf Sizilien geboren, verheiratet, zwei erwachsene Kinder. Die Liebe zum Tanz begleitet mich seit Kindheitstagen. Als Tanz- und Bewegungspädagogin gebe ich diese Freude weiter – für mich ist Tanz Kunst, Sprache und Ausdruck. Seit Juni 2025 habe ich meinen Kindheitstraum zum Beruf gemacht und mich freiberuflich selbstständig gemacht.',
      expertise: [
        'Ausdruckstanz',
        'Inklusiver Tanz (DanceAbility)',
        'Kinder- & Jugendtanz',
        'Jazz Dance & Hip Hop',
      ],
      imageUrl: '/assets/images/instructors/daniela-savasta-eberle.jpg',
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

async function seedLocations(): Promise<Record<string, string>> {
  console.log('\n📍 Creating locations...');

  const created: Record<string, string> = {};

  for (const loc of LOCATION_DATA) {
    const location = await prisma.location.upsert({
      where: { name: loc.name },
      update: {},
      create: {
        name: loc.name,
        address: loc.address,
        isActive: true,
      },
    });
    created[loc.name] = location.id;
    console.log(`  ✅ Location: ${location.name} (${location.id})`);
  }

  return created;
}

async function seedCourses(instructorId: string, locationIds: Record<string, string>) {
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

    const { cancellationPolicy, ...rest } = courseData as any;

    const course = await prisma.course.upsert({
      where: { slug: rest.slug },
      update: detailFields,
      create: {
        ...rest,
        instructorId,
        ...detailFields,
        cancellationPolicyJson: cancellationPolicy ?? null,
        cancellationPolicyId: 'default-policy',
      },
    });
    createdCount++;
    console.log(`  ✅ ${course.title} (${course.danceStyle})`);

    // Create sessions for each course
    await seedSessionsForCourse(
      course.id,
      course.duration,
      locationIds,
      createdCount - 1,
    );
  }

  console.log(`  📊 Total courses: ${createdCount}`);
}

interface WeeklySlot {
  /** ISO weekday 1=Mon … 6=Sat */
  day: number;
  hour: number;
  minute: number;
}

/**
 * Per-course weekly slots, spread across weekdays and times so the calendar
 * shows a realistic, non-overlapping schedule. Each course recurs weekly at
 * two slots (one per location) for SESSION_WEEKS weeks.
 */
const COURSE_SCHEDULES: { a: WeeklySlot; b: WeeklySlot }[] = [
  { a: { day: 1, hour: 19, minute: 0 }, b: { day: 4, hour: 18, minute: 30 } },
  { a: { day: 4, hour: 19, minute: 0 }, b: { day: 2, hour: 18, minute: 0 } },
  { a: { day: 1, hour: 16, minute: 0 }, b: { day: 3, hour: 15, minute: 30 } },
  { a: { day: 2, hour: 16, minute: 30 }, b: { day: 5, hour: 16, minute: 0 } },
  { a: { day: 6, hour: 10, minute: 0 }, b: { day: 3, hour: 17, minute: 0 } },
  { a: { day: 3, hour: 18, minute: 0 }, b: { day: 6, hour: 11, minute: 30 } },
  { a: { day: 5, hour: 17, minute: 30 }, b: { day: 1, hour: 17, minute: 0 } },
  { a: { day: 2, hour: 9, minute: 30 }, b: { day: 4, hour: 9, minute: 30 } },
  { a: { day: 4, hour: 10, minute: 0 }, b: { day: 1, hour: 10, minute: 0 } },
  { a: { day: 5, hour: 10, minute: 30 }, b: { day: 2, hour: 17, minute: 30 } },
];

const SESSION_WEEKS = 3;

/**
 * Date for `slot` anchored to the current ISO week (Mon-based), shifted by
 * whole weeks. Week offset 0 lands in the week the calendar shows by default.
 */
function dateForSlot(slot: WeeklySlot, weekOffset: number): Date {
  const date = new Date();
  const isoDow = date.getDay() === 0 ? 7 : date.getDay(); // 1=Mon … 7=Sun
  date.setDate(date.getDate() - (isoDow - 1) + (slot.day - 1) + weekOffset * 7);
  date.setHours(slot.hour, slot.minute, 0, 0);
  return date;
}

async function seedSessionsForCourse(
  courseId: string,
  duration: number,
  locationIds: Record<string, string>,
  courseIndex: number,
) {
  const schedule = COURSE_SCHEDULES[courseIndex % COURSE_SCHEDULES.length];
  const locationNames = Object.keys(locationIds);

  // Map the two weekly slots to the (up to) two locations.
  const slotByLocation = locationNames.map((name, idx) => ({
    name,
    slot: idx === 0 ? schedule.a : schedule.b,
  }));

  for (const { name, slot } of slotByLocation) {
    for (let week = 0; week < SESSION_WEEKS; week++) {
      const startTime = dateForSlot(slot, week);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      await prisma.session.create({
        data: {
          courseId,
          startTime,
          endTime,
          locationId: locationIds[name],
        },
      });
    }
  }
}

async function seedBookings(customerId: string) {
  console.log('\n🎟️ Creating bookings...');

  await prisma.booking.deleteMany();

  const courses = await prisma.course.findMany({
    include: { sessions: { take: 1 } },
    take: 3,
  });

  if (courses.length === 0) return;

  // Registered user booking
  const course1 = courses[0];
  await prisma.booking.create({
    data: {
      userId: customerId,
      courseId: course1.id,
      ...(course1.sessions[0] ? { sessionId: course1.sessions[0].id } : {}),
      status: 'CONFIRMED',
    },
  });
  console.log(`  ✅ Registered booking: ${course1.title}`);

  // Guest booking
  if (courses.length > 1) {
    const course2 = courses[1];
    await prisma.booking.create({
      data: {
        guestEmail: 'gast@example.com',
        guestFirstName: 'Maria',
        guestLastName: 'Beispiel',
        courseId: course2.id,
        status: 'CONFIRMED',
      },
    });
    console.log(`  ✅ Guest booking: ${course2.title}`);
  }

  // Waitlisted booking
  if (courses.length > 2) {
    const course3 = courses[2];
    await prisma.booking.create({
      data: {
        userId: customerId,
        courseId: course3.id,
        status: 'WAITLISTED',
        waitlistPosition: 1,
      },
    });
    console.log(`  ✅ Waitlisted booking: ${course3.title}`);
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function seedCancellationPolicy() {
  const policy = await prisma.cancellationPolicy.upsert({
    where: { id: 'default-policy' },
    update: {},
    create: {
      id: 'default-policy',
      name: 'Standard 48h Policy',
      description:
        'Full refund up to 48 hours before session start. ' +
        '50% refund between 24–48 hours. No refund within 24 hours.',
      fullRefundHours: 48,
      partialRefundHours: 24,
      partialRefundPercent: 50,
      isDefault: true,
    },
  });
  console.log(`✅ Cancellation policy: ${policy.name}`);
}

async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log('━'.repeat(50));

  // Seed cancellation policy (must be before courses)
  await seedCancellationPolicy();

  // Seed users
  const { instructor, customer } = await seedUsers();

  // Seed locations
  const locationIds = await seedLocations();

  // Clear sessions (and dependent bookings) so re-seeding stays idempotent
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();

  // Seed courses with sessions
  await seedCourses(instructor.id, locationIds);

  // Seed bookings
  await seedBookings(customer.id);

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('🎉 Seeding completed successfully!\n');

  console.log('📊 Summary:');
  const courseCount = await prisma.course.count();
  const sessionCount = await prisma.session.count();
  const userCount = await prisma.user.count();
  const bookingCount = await prisma.booking.count();

  console.log(`   • Users: ${userCount}`);
  console.log(`   • Courses: ${courseCount}`);
  console.log(`   • Sessions: ${sessionCount}`);
  console.log(`   • Bookings: ${bookingCount}`);

  console.log('\n🔐 Test Accounts:');
  console.log('━'.repeat(50));
  console.log('   Admin:      admin@tanzmoment.de / admin123');
  console.log('   Instructor: daniela@tanzmoment.de / daniela123');
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

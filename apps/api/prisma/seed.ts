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
          text: 'Ich bin total verkrampft reingekommen – ohne jede Tanzerfahrung. Nach drei Stunden habe ich mich frei bewegt und es tatsächlich genossen. Sarah schafft einen Raum, in dem man vergisst, befangen zu sein.',
          authorName: 'Miriam H.',
          authorRole: 'Teilnehmerin seit 2023',
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
          answer: 'Ja! Der Kurs ist fortlaufend ohne feste Starttermine. Du kannst jederzeit einsteigen. Wir empfehlen ein kostenloses Erstgespräch mit Sarah vorab.',
        },
        {
          question: 'Gibt es eine Schnupperstunde?',
          answer: 'Ja. Deine erste Stunde beinhaltet ein kostenloses Kennenlerngespräch mit Sarah. Gib das einfach bei der Buchung an.',
        },
      ],
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
    courseFlow: {
      headline: 'So arbeiten wir zusammen',
      intro: 'Die Stunden wechseln zwischen individueller Erkundung und gemeinsamer Gruppenarbeit. Jedes Treffen baut auf dem vorherigen auf.',
      steps: [
        {
          phase: 'Check-In',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Kurzer Body-Scan und Austausch über den individuellen Fokus für die Stunde.',
        },
        {
          phase: 'Technik-Fokus',
          duration: '25 Min.',
          icon: 'bar-chart',
          description: 'Arbeit an spezifischen Elementen: Dynamik, Raumwahrnehmung, Timing oder Gewichtsverlagerung.',
        },
        {
          phase: 'Solo-Erkundung',
          duration: '20 Min.',
          icon: 'improvisation',
          description: 'Erweiterte individuelle Improvisation mit einem gewählten Thema oder Score.',
        },
        {
          phase: 'Duett & Gruppenarbeit',
          duration: '20 Min.',
          icon: 'users',
          description: 'Kollaborative Strukturen und Partner-Improvisation. Material für die Studio-Abende aufbauen.',
        },
        {
          phase: 'Reflexion',
          duration: '15 Min.',
          icon: 'sparkle',
          description: 'Wir beobachten, diskutieren und integrieren. Was hast du bemerkt? Was willst du weiterentwickeln?',
        },
      ],
    },
    socialProof: {
      headline: 'Stimmen aus dem Kurs',
      testimonials: [
        {
          text: 'Der Vertiefungskurs hat mich genau in die richtige Richtung geschoben. Sarah stellt die richtigen Fragen und gibt Raum, in sie hineinzuwachsen.',
          authorName: 'Anna L.',
          authorRole: 'Fortgeschrittene Teilnehmerin',
          rating: 5,
        },
        {
          text: 'Ich habe jahrelang Tanz studiert, aber hier habe ich mehr über meine eigene Bewegung gelernt als in jedem Technikkurs.',
          authorName: 'Thomas R.',
          authorRole: 'Teilnehmer',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zum Aufbaukurs',
      items: [
        {
          question: 'Welche Vorerfahrung brauche ich?',
          answer: 'Den abgeschlossenen Grundkurs „Ausdruckstanz – frei & verbunden" oder vergleichbare Erfahrung im freien Tanz. Bei Unsicherheit kontaktiere Sarah für eine kurze Einschätzung.',
        },
        {
          question: 'Was sind die Studio-Abende?',
          answer: 'Zweimal pro Semester teilt die Gruppe Work-in-Progress-Stücke in einem informellen Rahmen. Die Teilnahme ist freiwillig, aber empfohlen.',
        },
        {
          question: 'Kann ich eine Stunde verpassen?',
          answer: 'Der Kurs läuft in Semestern. Gelegentliches Fehlen ist kein Problem, aber Kontinuität ist wichtig für die Tiefe der Arbeit. Nachholterminen können individuell vereinbart werden.',
        },
      ],
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
    courseFlow: {
      headline: 'Eine Stunde bei den Tanzmäusen',
      intro: 'Jede Stunde ist ein kleines Abenteuer – genug Struktur, damit sich die Kinder sicher fühlen, und genug Offenheit für ihre Fantasie.',
      steps: [
        {
          phase: 'Begrüßungskreis',
          duration: '5 Min.',
          icon: 'heart',
          description: 'Wir versammeln uns im Kreis, begrüßen uns und finden heraus, welches Tier oder Thema wir heute erkunden.',
        },
        {
          phase: 'Aufwärmspiel',
          duration: '10 Min.',
          icon: 'sparkle',
          description: 'Ein spielerisches Bewegungsspiel, um die Körper in Schwung zu bringen – oft ein Favorit aus der Vorwoche.',
        },
        {
          phase: 'Tanzgeschichte',
          duration: '15 Min.',
          icon: 'music',
          description: 'Wir bewegen uns durch eine Geschichte – die Kinder sind die Figuren und ihre Körper erzählen die Handlung.',
        },
        {
          phase: 'Kreatives Spielen',
          duration: '10 Min.',
          icon: 'improvisation',
          description: 'Freies Erkunden mit Requisiten, Bändern oder Schlaginstrumenten.',
        },
        {
          phase: 'Cool-Down',
          duration: '5 Min.',
          icon: 'heart',
          description: 'Ein ruhiges Abschlussritual – Dehnen, Atmen und ein sanftes Abschiedslied.',
        },
      ],
    },
    socialProof: {
      headline: 'Eltern erzählen',
      testimonials: [
        {
          text: 'Meine Tochter fragt jede Woche, ob Tanzmäuse-Tag ist. Sie kommt strahlend nach Hause. Sarah ist unglaublich warm und geduldig mit den Kleinen.',
          authorName: 'Lisa M.',
          authorRole: 'Mama einer 5-Jährigen',
          rating: 5,
        },
        {
          text: 'Wir haben schon nach einem Semester eine deutliche Verbesserung in Koordination und Selbstvertrauen gesehen. Sehr empfehlenswert.',
          authorName: 'Stefan K.',
          authorRole: 'Papa eines 4-Jährigen',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zu den Tanzmäusen',
      items: [
        {
          question: 'Können Eltern zuschauen?',
          answer: 'Bei der ersten Stunde sind Eltern herzlich willkommen. Ab der zweiten Stunde haben wir die Erfahrung gemacht, dass Kinder sich schneller einleben und besser konzentrieren, wenn die Eltern draußen warten. Ihr seid aber telefonisch immer erreichbar.',
        },
        {
          question: 'Was muss mein Kind mitbringen?',
          answer: 'Bequeme, dehnbare Kleidung und nackte Füße oder Tanzsocken. Keine spezielle Tanzkleidung nötig. Eine kleine Wasserflasche wird empfohlen.',
        },
        {
          question: 'Gibt es eine Schnupperstunde?',
          answer: 'Ja – die erste Stunde ist kostenlos. Einfach über das Formular buchen oder uns direkt kontaktieren.',
        },
        {
          question: 'Mein Kind ist schüchtern. Geht das trotzdem?',
          answer: 'Absolut. Sarah hat jahrelange Erfahrung mit Kindern, die etwas mehr Zeit zum Auftauen brauchen. Es gibt keinen Druck, sofort mitzumachen – Kinder finden ihren Weg in ihrem eigenen Tempo.',
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
    courseFlow: {
      headline: 'Eine Stunde bei den Tanzfüchsen',
      intro: 'Mehr Struktur als bei den Tanzmäusen, aber immer noch voller Spaß – die Tanzfüchse balancieren Lernen und Spiel.',
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
          text: 'Die Aufführung am Semesterende war großartig. Die Kinder waren so stolz. Sarah holt wirklich das Beste aus ihnen heraus.',
          authorName: 'Michael B.',
          authorRole: 'Papa eines 7-Jährigen',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zu den Tanzfüchsen',
      items: [
        {
          question: 'Mein Kind hat keine Erfahrung – geht das?',
          answer: 'Absolut. Wir heißen Anfänger willkommen. Kinder, die bei den Tanzmäusen waren, haben einen kleinen Vorsprung, aber Quereinsteiger holen schnell auf.',
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
    courseFlow: {
      headline: 'Was passiert in der Schnupperstunde',
      steps: [
        {
          phase: 'Willkommen',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Sarah stellt sich und das Studio vor. Alle teilen, was sie hergeführt hat – oder hören einfach zu.',
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
          description: 'Sarah beantwortet Fragen und hilft jedem Teilnehmer, den passenden Kurs für Interessen und Verfügbarkeit zu finden.',
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
          answer: 'Ja. Wir hatten schon Teilnehmer von 6 bis 78 Jahren in derselben Stunde. Sarah passt jede Übung an, damit jeder bequem mitmachen kann.',
        },
        {
          question: 'Was soll ich anziehen?',
          answer: 'Alles Bequeme, worin du dich bewegen kannst. Normale Sportkleidung ist perfekt. Keine spezielle Ausrüstung nötig.',
        },
      ],
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
    courseFlow: {
      headline: 'So läuft eine Stunde ab',
      intro: 'Wir bewegen uns im Tempo der Gruppe. Jede Stunde wird geprägt von denen, die im Raum sind.',
      steps: [
        {
          phase: 'Ankommen & Check-In',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Wir kommen im Kreis zusammen. Jeder wird begrüßt und kann teilen, wie es ihm heute geht – in Worten, Bewegung oder einfach einer Geste.',
        },
        {
          phase: 'Aufwärmen',
          duration: '15 Min.',
          icon: 'sparkle',
          description: 'Sanfte Bewegung für den ganzen Körper. Alle Übungen können im Sitzen, Stehen oder im Rollstuhl gemacht werden.',
        },
        {
          phase: 'Gemeinsam tanzen',
          duration: '25 Min.',
          icon: 'users',
          description: 'Gruppen- und Partnerbewegung, Energie im Kreis weitergeben, kreative Antworten auf Musik.',
        },
        {
          phase: 'Freier Ausdruck',
          duration: '5 Min.',
          icon: 'improvisation',
          description: 'Jeder bewegt sich auf seine eigene Art zu einem selbst gewählten Musikstück.',
        },
        {
          phase: 'Abschlusskreis',
          duration: '5 Min.',
          icon: 'heart',
          description: 'Wir schließen die Stunde gemeinsam – ein geteilter Moment der Stille und Wertschätzung.',
        },
      ],
    },
    socialProof: {
      headline: 'Erfahrungen von Teilnehmenden',
      testimonials: [
        {
          text: 'Zum ersten Mal hatte ich das Gefühl, dass der Rollstuhl nichts war, worum man herumarbeiten muss – er war einfach Teil meines Tanzes. Eine wirklich transformative Erfahrung.',
          authorName: 'Marco D.',
          authorRole: 'Rollstuhlfahrer, Teilnehmer seit 2022',
          rating: 5,
        },
        {
          text: 'Ich begleite meinen Bruder mit Down-Syndrom. Er blüht in diesem Kurs auf. Sarah ist außergewöhnlich – sie sieht jeden Menschen.',
          authorName: 'Susanne T.',
          authorRole: 'Geschwister und Teilnehmerin',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zum inklusiven Tanz',
      items: [
        {
          question: 'Ist das Studio barrierefrei?',
          answer: 'Ja. Das Studio hat stufenfreien Zugang, eine barrierefreie Toilette und breite Türen. Bitte kontaktiere uns bei speziellen Barrierefreiheitsanforderungen, damit wir entsprechend planen können.',
        },
        {
          question: 'Kann meine Betreuungsperson oder Assistenz dabei sein?',
          answer: 'Ja, und kostenfrei. Assistenzen sind während der gesamten Stunde im Raum willkommen.',
        },
        {
          question: 'Mein Familienmitglied hat noch nie getanzt – geht das?',
          answer: 'Dieser Kurs ist speziell für Menschen ohne Tanzerfahrung konzipiert. Die einzige Voraussetzung ist die Bereitschaft, im Raum zu sein.',
        },
        {
          question: 'Gibt es Ermäßigungen?',
          answer: 'Ermäßigte Teilnahmegebühren sind möglich – kontaktiere uns, um deine Situation zu besprechen. Wir möchten nicht, dass finanzielle Hürden jemanden von der Teilnahme abhalten.',
        },
      ],
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
    courseFlow: {
      headline: 'So läuft eine Stunde ab',
      steps: [
        {
          phase: 'Warm-Up im Rollstuhl',
          duration: '15 Min.',
          icon: 'wheelchair',
          description: 'Oberkörper-Mobilisation, Core-Aktivierung und Erkunden des Bewegungsradius des Rollstuhls.',
        },
        {
          phase: 'Technik',
          duration: '20 Min.',
          icon: 'bar-chart',
          description: 'Drehungen, Richtungswechsel, Gewichtsverlagerungen und Rollstuhl-Dynamik – das Vokabular des Rollstuhltanzes.',
        },
        {
          phase: 'Partnerarbeit',
          duration: '15 Min.',
          icon: 'users',
          description: 'Rollstuhltänzer und Fußgänger-Partner erkunden gemeinsam Verbindung, Führen und Folgen.',
        },
        {
          phase: 'Choreografie',
          duration: '15 Min.',
          icon: 'music',
          description: 'Wir bauen gemeinsam eine kurze Phrase – wechselnd durch verschiedene Musikstile.',
        },
        {
          phase: 'Cool-Down',
          duration: '10 Min.',
          icon: 'heart',
          description: 'Stretching und Atemarbeit. Wir schließen mit einer kurzen Reflexion der Stunde.',
        },
      ],
    },
    socialProof: {
      headline: 'Das erleben Teilnehmende',
      testimonials: [
        {
          text: 'Ich benutze seit zwölf Jahren einen Rollstuhl und hätte nie an Tanz gedacht. Jetzt kann ich mir meine Woche ohne diesen Kurs nicht mehr vorstellen.',
          authorName: 'Eva R.',
          authorRole: 'Rollstuhlfahrerin, Teilnehmerin',
          rating: 5,
        },
        {
          text: 'Ich kam als Tanzpartner für meine Frau. Am Ende habe ich etwas völlig Unerwartetes entdeckt – wie viel ich von ihrer Bewegung lernen konnte.',
          authorName: 'Georg N.',
          authorRole: 'Fußgänger-Tanzpartner',
          rating: 5,
        },
      ],
    },
    faq: {
      headline: 'Fragen zum Rollstuhltanz',
      items: [
        {
          question: 'Brauche ich meinen eigenen Rollstuhl?',
          answer: 'Nein. Leih-Rollstühle sind vorhanden. Bitte gib bei der Buchung an, ob du einen brauchst, damit wir ihn für dich bereitstellen können.',
        },
        {
          question: 'Können auch Fußgänger teilnehmen?',
          answer: 'Ja – als Tanzpartner. Der Kurs braucht aktiv sowohl Rollstuhlfahrer als auch Fußgänger-Teilnehmer. Partnerkombinationen können flexibel gestaltet werden.',
        },
        {
          question: 'Ist ein bestimmtes Fitnesslevel nötig?',
          answer: 'Kein spezielles Fitnesslevel erforderlich. Das Warm-Up passt sich der individuellen Kapazität an. Bitte informiere Sarah bei der Anmeldung über eventuelle gesundheitliche Einschränkungen.',
        },
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
          description: 'Optional – Austausch bei Tee mit anderen Müttern. Sarah bleibt für Fragen da.',
        },
      ],
    },
    socialProof: {
      headline: 'Mütter erzählen',
      testimonials: [
        {
          text: 'Ich hatte vergessen, wie es sich anfühlt, in meinem eigenen Körper zu sein. Dieser Kurs gibt mir mich selbst zurück, einmal die Woche. Ich hüte diese Stunde wie einen Schatz.',
          authorName: 'Sarah B.',
          authorRole: 'Mutter von zwei Kindern',
          rating: 5,
        },
        {
          text: 'Ich hatte einen Workout-Kurs erwartet. Was ich gefunden habe, war eine kleine Gemeinschaft von Frauen, die sich verstehen. Das Tanzen ist wunderbar, aber das Gefühl, nicht allein zu sein, ist genauso wichtig.',
          authorName: 'Jana P.',
          authorRole: 'Junge Mutter, Teilnehmerin',
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
          answer: 'Bitte kläre das mit deiner Hebamme oder Ärztin. Sarah hat eine Ausbildung in rückbildungsfreundlicher Bewegung und bietet immer Alternativen an. Im Zweifel sprich sie vor deiner ersten Stunde an.',
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
      ],
    },
    faq: {
      headline: 'Fragen zu Mama & Baby Tanz',
      items: [
        {
          question: 'Mein Baby ist sehr unruhig – stört das?',
          answer: 'Überhaupt nicht. Weinen, Stillen und Quengeln sind völlig normal und erwartet. Jedes Baby im Raum lebt in der gleichen Welt. Sarah strukturiert die Stunde so, dass sie mit den natürlichen Rhythmen der Babys arbeitet.',
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

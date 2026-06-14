import {
  Component,
  signal,
  ChangeDetectionStrategy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FaqAccordionComponent,
  TestimonialSectionComponent,
} from '@tanzmoment/shared/ui';
import { SeoService } from '@tanzmoment/shared/services';

// Section Components
import { KidsHeroComponent } from './sections/kids-hero/kids-hero.component';
import { IntroSectionComponent } from './sections/intro-section/intro-section.component';
import { AgeGroupsSectionComponent } from './sections/age-groups-section/age-groups-section.component';
import { CourseClockComponent } from '../shared/course-clock/course-clock.component';
import { BenefitsSpotlightComponent } from '../shared/benefits-spotlight/benefits-spotlight.component';
import { SafetySectionComponent } from './sections/safety-section/safety-section.component';
import { CtaSectionComponent } from './sections/cta-section/cta-section.component';

// Types
import { KidsHeroData } from './sections/kids-hero/kids-hero.types';
import { IntroSectionData } from './sections/intro-section/intro-section.types';
import { AgeGroupsData } from './sections/age-groups-section/age-groups-section.types';
import { CourseClockData } from '../shared/course-clock/course-clock.types';
import { BenefitsSpotlightData } from '../shared/benefits-spotlight/benefits-spotlight.types';
import { SafetySectionData } from './sections/safety-section/safety-section.types';
import { CtaSectionData } from './sections/cta-section/cta-section.types';
import { FaqData, TestimonialsData } from '@tanzmoment/shared/ui';

@Component({
  selector: 'tm-kids-page',
  standalone: true,
  imports: [
    CommonModule,
    KidsHeroComponent,
    IntroSectionComponent,
    AgeGroupsSectionComponent,
    CourseClockComponent,
    BenefitsSpotlightComponent,
    SafetySectionComponent,
    FaqAccordionComponent,
    TestimonialSectionComponent,
    CtaSectionComponent,
  ],
  templateUrl: './kids-page.component.html',
  styleUrl: './kids-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KidsPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Tanzkurse für Kinder — Spielerisch und kreativ',
      description:
        'Tanzkurse für Kinder in Mössingen. Spielerisches Bewegungslernen in einem sicheren, kreativen Umfeld — altersgerecht und individuell begleitet.',
      url: '/fuer-kinder',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HERO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly heroData = signal<KidsHeroData>({
    backgroundImage: '/assets/images/target-groups/kids-hero.jpg',
    headline: 'Tanzen. Lachen. Wachsen.',
    subheadline:
      'Bei uns entdecken Kinder die Freude an Bewegung – spielerisch, ohne Druck und mit ganz viel Spass. Jedes Kind tanzt auf seine eigene Art.',
    ctaText: 'Schnupperstunde buchen',
    ctaRoute: '/kontakt',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INTRO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly introData = signal<IntroSectionData>({
    headline: 'Wir verstehen, worauf es ankommt',
    paragraphs: [
      '<strong>Sie möchten das Beste für Ihr Kind</strong> – eine Aktivität, die Spass macht, fördert und gleichzeitig nicht überfordert. Vielleicht fragt sich Ihr Kind selbst, ob es "gut genug" ist oder ob es dort Freunde findet.',
      'Bei Tanzmoment glauben wir: <strong>Jedes Kind hat seinen eigenen Rhythmus.</strong> Nicht im Sinne von Takt, sondern im Sinne von Entwicklung. Manche Kinder tanzen von Anfang an wild durch den Raum, andere brauchen Zeit zum Beobachten. <em>Beides ist genau richtig.</em>',
      'Unsere Kurse sind so gestaltet, dass Kinder sich ausprobieren können – <strong>ohne Bewertung, ohne Vergleich, ohne "richtig" oder "falsch".</strong> Denn wenn Kinder sich sicher fühlen, passiert etwas Magisches: Sie beginnen, sich selbst auszudrücken.',
    ],
    highlightQuote:
      'Bewegung ist die <strong>Sprache der Kindheit</strong> – hier lernen Kinder, sich selbst zu verstehen.',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // AGE GROUPS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly ageGroupsData = signal<AgeGroupsData>({
    headline: 'Für jedes Alter das Richtige',
    subheadline:
      'Unsere Kurse sind speziell auf die Entwicklungsstufen von Kindern abgestimmt.',
    groups: [
      {
        id: 'minis',
        name: 'Tanzmäuse',
        ageRange: '3–6 Jahre',
        icon: '🐭',
        description:
          'Spielerische Bewegung für die Kleinsten. Hier steht das Entdecken im Vordergrund – durch Geschichten, Musik und viel Fantasie.',
        highlights: [
          'Grundlegende Koordination',
          'Rhythmusgefühl entwickeln',
          'Soziales Miteinander',
          'Kreativität durch Bewegung',
        ],
      },
      {
        id: 'kids',
        name: 'Tanzentdecker',
        ageRange: '6–10 Jahre',
        icon: '⭐',
        description:
          'Mehr Struktur, mehr Technik – aber immer noch mit viel Spass. Kinder lernen verschiedene Tanzstile kennen und entwickeln ihr eigenes Körpergefühl.',
        highlights: [
          'Verschiedene Tanzstile entdecken',
          'Einfache Choreographien',
          'Teamarbeit und Selbstvertrauen',
          'Ausdruck und Kreativität',
        ],
      },
      {
        id: 'preteens',
        name: 'Tanzprofis',
        ageRange: '10–14 Jahre',
        icon: '🚀',
        description:
          'Für ältere Kinder und Jugendliche, die tiefer eintauchen möchten. Hier werden Choreographien erarbeitet und individuelle Stärken gefördert.',
        highlights: [
          'Anspruchsvollere Choreographien',
          'Stilfindung und Ausdruck',
          'Auftrittsmöglichkeiten',
          'Körperliche Fitness',
        ],
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // WHAT TO EXPECT DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly whatToExpectData = signal<CourseClockData>({
    headline: 'So läuft eine Tanzstunde ab',
    intro:
      'Jede Stunde ist durchdacht strukturiert, lässt aber Raum für Spontanität und Kinderideen.',
    eyebrow: 'Ein typischer Kursablauf',
    phases: [
      {
        name: 'Ankommen & Begrüssung',
        minutes: 5,
        color: 'var(--color-secondary)',
        description:
          'Ritual zum Start: Jedes Kind wird persönlich begrüsst. Zeit zum "Ankommen" im Raum.',
      },
      {
        name: 'Aufwärmen',
        minutes: 10,
        color: 'var(--color-accent-dark)',
        description:
          'Spielerisches Warmup mit Musik. Bewegungsspiele, die den ganzen Körper aktivieren.',
      },
      {
        name: 'Hauptteil',
        minutes: 30,
        color: 'var(--color-brand)',
        description:
          'Tanzspiele, Choreographie-Elemente oder freie Bewegung – je nach Alter und Thema der Stunde.',
      },
      {
        name: 'Abschluss',
        minutes: 10,
        color: 'var(--color-soft-accent)',
        description:
          'Gemeinsamer Abschluss mit Dehnübungen und einem Abschiedsritual.',
      },
      {
        name: 'Verabschiedung',
        minutes: 5,
        color: 'var(--color-primary)',
        description:
          'Eltern werden abgeholt, kurzer Austausch bei Bedarf möglich.',
      },
    ],
    facts: [
      {
        icon: 'group',
        value: 'Max. 12 Kinder',
        label: 'Damit jedes Kind gesehen wird und individuelle Betreuung möglich ist.',
      },
      {
        icon: 'clock',
        value: '45–60 Minuten',
        label: 'Je nach Altersgruppe – optimal für die kindliche Konzentrationsspanne.',
      },
      {
        icon: 'wear',
        value: 'Bequeme Kleidung',
        label: 'Sportkleidung und Turnschläppchen oder Socken. Mehr braucht es nicht.',
      },
      {
        icon: 'level',
        value: 'Einstieg jederzeit',
        label: 'Schnupperstunden sind jederzeit möglich. Keine Vorkenntnisse nötig.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // BENEFITS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly benefitsData = signal<BenefitsSpotlightData>({
    headline: 'Was Tanzen für Ihr Kind bedeutet',
    subheadline:
      'Tanzen fördert die ganzheitliche Entwicklung – körperlich, emotional und sozial.',
    benefits: [
      {
        category: 'physical',
        title: 'Motorische Entwicklung',
        description:
          'Koordination, Balance und Körpergefühl werden spielerisch trainiert. <strong>Grundlage für alle Bewegungsarten</strong> im Leben.',
      },
      {
        category: 'physical',
        title: 'Gesunde Bewegung',
        description:
          'Ausdauer und Kraft entwickeln sich natürlich durch regelmässige Bewegung. <strong>Ohne Leistungsdruck</strong>, mit viel Freude.',
      },
      {
        category: 'emotional',
        title: 'Selbstausdruck',
        description:
          'Kinder lernen, Gefühle durch Bewegung auszudrücken. <strong>Eine Sprache, die keine Worte braucht.</strong>',
      },
      {
        category: 'emotional',
        title: 'Selbstvertrauen',
        description:
          'Jeder kleine Erfolg stärkt das Selbstbewusstsein. <strong>Kinder erleben: "Ich kann das!"</strong>',
      },
      {
        category: 'social',
        title: 'Soziale Kompetenz',
        description:
          'Gemeinsam tanzen bedeutet aufeinander achten, sich absprechen, zusammen etwas schaffen. <strong>Freundschaften entstehen.</strong>',
      },
      {
        category: 'emotional',
        title: 'Musikalität',
        description:
          'Rhythmusgefühl und Musikverständnis entwickeln sich ganz nebenbei. <strong>Ein Geschenk fürs Leben.</strong>',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SAFETY DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly safetyData = signal<SafetySectionData>({
    headline: 'Sicherheit und Vertrauen',
    intro:
      'Die Sicherheit Ihres Kindes steht bei uns an erster Stelle. Hier können Sie Ihr Kind mit gutem Gewissen abgeben.',
    safetyPoints: [
      {
        icon: '👩‍🏫',
        title: 'Qualifizierte Kursleitung',
        description:
          'Unsere Tanzpädagogen haben Erfahrung in der Arbeit mit Kindern und sind in Erster Hilfe geschult.',
      },
      {
        icon: '🔒',
        title: 'Sichere Umgebung',
        description:
          'Unser Studio ist kindersicher gestaltet: Weiche Böden, keine scharfen Kanten, gute Sichtverhältnisse.',
      },
      {
        icon: '👀',
        title: 'Transparenz',
        description:
          'Eltern sind bei Schnupperstunden herzlich willkommen. Regelmässig bieten wir "offene Stunden" zum Zuschauen.',
      },
      {
        icon: '📞',
        title: 'Erreichbarkeit',
        description:
          'Bei Fragen oder Anliegen sind wir jederzeit erreichbar. Offene Kommunikation ist uns wichtig.',
      },
    ],
    methodologyHeadline: 'Unser pädagogischer Ansatz',
    methodologyIntro:
      'Wir arbeiten mit bewährten Methoden, die speziell auf die Bedürfnisse von Kindern abgestimmt sind.',
    methodologyPoints: [
      {
        title: 'Spielerisches Lernen',
        description:
          'Kinder lernen am besten, wenn sie <strong>Spass haben</strong>. Daher verpacken wir Technik in Spiele, Geschichten und kreative Aufgaben. <em>Lernen passiert ganz nebenbei.</em>',
      },
      {
        title: 'Kein Leistungsdruck',
        description:
          'Es gibt kein "zu langsam" oder "nicht gut genug". <strong>Jedes Kind entwickelt sich in seinem eigenen Tempo.</strong> Wir feiern jeden Fortschritt.',
      },
      {
        title: 'Positive Verstärkung',
        description:
          'Wir arbeiten mit <strong>Ermutigung statt Kritik</strong>. Kinder sollen stolz auf sich sein dürfen – egal auf welchem Level sie sind.',
      },
      {
        title: 'Altersgerechte Inhalte',
        description:
          'Musik, Bewegungen und Themen sind <strong>auf das jeweilige Alter abgestimmt</strong>. Was für 4-Jährige funktioniert, ist anders als für 10-Jährige.',
      },
    ],
    certificationNote:
      'Alle Kursleiter haben ein <strong>erweitertes Führungszeugnis</strong> und nehmen regelmässig an <strong>Fortbildungen</strong> teil.',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TESTIMONIALS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly testimonialsData = signal<TestimonialsData>({
    headline: 'Das sagen andere Eltern',
    accentColor: '--color-kids-accent',
    testimonials: [
      {
        id: '1',
        quote:
          'Meine Tochter war anfangs sehr schüchtern. Nach ein paar Wochen tanzte sie strahlend durch den Raum. Das Selbstvertrauen, das sie hier gewonnen hat, ist unbezahlbar.',
        author: 'Familie Müller',
        context: 'Tochter Mia, 5 Jahre',
      },
      {
        id: '2',
        quote:
          'Endlich eine Aktivität ohne Wettkampfdruck! Unser Sohn liebt es, und wir merken, wie gut ihm die Bewegung tut – körperlich und emotional.',
        author: 'Familie Schmidt',
        context: 'Sohn Leon, 8 Jahre',
      },
      {
        id: '3',
        quote:
          'Die Kursleitung geht so liebevoll auf jedes Kind ein. Man merkt, dass hier mit Herzblut gearbeitet wird.',
        author: 'Familie Weber',
        context: 'Tochter Emma, 6 Jahre',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // FAQ DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly faqData = signal<FaqData>({
    headline: 'Häufige Fragen',
    accentColor: '--color-kids-accent',
    items: [
      {
        id: 'age',
        question: 'Ab welchem Alter kann mein Kind teilnehmen?',
        answer:
          '<p>Unsere <strong>Tanzmäuse</strong> starten ab 3 Jahren. In diesem Alter steht spielerische Bewegung im Vordergrund.</p><p>Für jüngere Kinder bieten wir Eltern-Kind-Kurse an, bei denen Sie gemeinsam mit Ihrem Kind tanzen können.</p>',
      },
      {
        id: 'trial',
        question: 'Wie funktioniert eine Schnupperstunde?',
        answer:
          '<p>Schnupperstunden sind <strong>kostenlos und unverbindlich</strong>. Ihr Kind nimmt einfach an einer regulären Kursstunde teil.</p><p>Eltern dürfen gerne dabei sein (besonders bei den Kleinsten) oder im Wartebereich auf ihr Kind warten.</p>',
      },
      {
        id: 'shy',
        question: 'Mein Kind ist eher schüchtern – ist das ein Problem?',
        answer:
          '<p><strong>Überhaupt nicht!</strong> Viele Kinder brauchen Zeit zum Warmwerden. Unsere Kursleitung hat viel Erfahrung damit.</p><p>Wir lassen jedem Kind seinen Raum und sein Tempo. Oft sind es gerade die ruhigeren Kinder, die dann aufblühen.</p>',
      },
      {
        id: 'clothing',
        question: 'Was soll mein Kind anziehen?',
        answer:
          '<p>Bequeme Sportkleidung, in der sich Ihr Kind gut bewegen kann:</p><ul><li>Leggings oder Sporthose</li><li>T-Shirt oder langärmliges Oberteil</li><li>Turnschläppchen, Ballettschuhe oder rutschfeste Socken</li></ul><p><strong>Keine spezielle Ausrüstung erforderlich</strong> – vor allem am Anfang nicht.</p>',
      },
      {
        id: 'experience',
        question: 'Braucht mein Kind Vorerfahrung?',
        answer:
          '<p><strong>Nein, überhaupt nicht.</strong> Unsere Kurse sind für Anfänger konzipiert. Jedes Kind startet dort, wo es gerade steht.</p><p>Kinder mit Vorerfahrung werden individuell gefördert und gefordert.</p>',
      },
      {
        id: 'miss',
        question: 'Was passiert, wenn mein Kind mal fehlt?',
        answer:
          '<p>Kinder werden krank, haben Geburtstage oder Schulausflüge – <strong>das verstehen wir</strong>.</p><p>Verpasste Stunden können in anderen Kursen der gleichen Altersgruppe nachgeholt werden (nach Absprache).</p>',
      },
      {
        id: 'watch',
        question: 'Dürfen Eltern beim Kurs zuschauen?',
        answer:
          '<p>Bei <strong>Schnupperstunden</strong> sind Eltern herzlich willkommen. Im regulären Kursbetrieb bitten wir Eltern, im Wartebereich zu warten.</p><p><strong>Warum?</strong> Ohne Eltern im Raum können sich Kinder oft freier bewegen und trauen sich mehr zu. Regelmässig bieten wir "offene Stunden" an.</p>',
      },
      {
        id: 'performance',
        question: 'Gibt es Aufführungen?',
        answer:
          '<p><strong>Ja, aber ohne Druck.</strong> Einmal im Jahr gibt es eine kleine Präsentation für Familien. Die Teilnahme ist freiwillig.</p><p>Es geht dabei nicht um Perfektion, sondern um das gemeinsame Erlebnis und die Freude am Zeigen, was man gelernt hat.</p>',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CTA DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly ctaData = signal<CtaSectionData>({
    headline: 'Bereit zum Ausprobieren?',
    subheadline:
      'Buchen Sie jetzt eine kostenlose Schnupperstunde und lassen Sie Ihr Kind die Freude am Tanzen entdecken.',
    buttons: [
      {
        text: 'Schnupperstunde buchen',
        variant: 'primary',
        route: '/kontakt',
      },
      {
        text: 'Kurszeiten ansehen',
        variant: 'secondary',
        route: '/courses',
      },
    ],
  });

}

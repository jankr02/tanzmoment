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
import { AccessibleHeroComponent } from './sections/accessible-hero/accessible-hero.component';
import { IntroSectionComponent } from './sections/intro-section/intro-section.component';
import { AccessibilityFeaturesSectionComponent } from './sections/accessibility-features-section/accessibility-features-section.component';
import { TrustRingsComponent } from '../shared/trust-rings/trust-rings.component';
import { MethodologyTimelineComponent } from '../shared/methodology-timeline/methodology-timeline.component';
import { BenefitsSpotlightComponent } from '../shared/benefits-spotlight/benefits-spotlight.component';
import { CtaSectionComponent } from './sections/cta-section/cta-section.component';

// Types
import { AccessibleHeroData } from './sections/accessible-hero/accessible-hero.types';
import { IntroSectionData } from './sections/intro-section/intro-section.types';
import { AccessibilityFeaturesSectionData } from './sections/accessibility-features-section/accessibility-features-section.types';
import { MethodologyTimelineData } from '../shared/methodology-timeline/methodology-timeline.types';
import { BenefitsSpotlightData } from '../shared/benefits-spotlight/benefits-spotlight.types';
import { CtaSectionData } from './sections/cta-section/cta-section.types';
import { FaqData, TestimonialsData } from '@tanzmoment/shared/ui';

@Component({
  selector: 'tm-accessible-page',
  standalone: true,
  imports: [
    CommonModule,
    AccessibleHeroComponent,
    IntroSectionComponent,
    AccessibilityFeaturesSectionComponent,
    TrustRingsComponent,
    MethodologyTimelineComponent,
    BenefitsSpotlightComponent,
    FaqAccordionComponent,
    TestimonialSectionComponent,
    CtaSectionComponent,
  ],
  templateUrl: './accessible-page.component.html',
  styleUrl: './accessible-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessiblePageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Tanz für alle — Inklusiver Tanz für Menschen mit Behinderung',
      description:
        'Barrierefreier Tanzunterricht für Menschen mit und ohne Behinderung. Inklusiv, einfühlsam und mit qualifizierter Begleitung in Mössingen.',
      url: '/fuer-alle',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HERO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly heroData = signal<AccessibleHeroData>({
    backgroundImage: '/assets/images/target-groups/accessible-hero.jpg',
    headline: 'Dein Körper. Deine Bewegung. Deine Art zu tanzen.',
    subheadline:
      'Schalte deinen Kopf aus und tanze dich frei. Tanz kennt keine Grenzen – bei uns zählt nicht, was du nicht kannst, sondern was du ausdrücken möchtest.',
    ctaText: 'Persönliches Gespräch vereinbaren',
    ctaRoute: '/kontakt',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INTRO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly introData = signal<IntroSectionData>({
    headline: 'Wir verstehen, was Barrieren bedeuten',
    paragraphs: [
      'Vielleicht haben Sie schon einmal gedacht: "Tanzen ist nichts für mich." Oder Sie haben nach einem Kursangebot gesucht und sind an Treppen, zu engen Räumen oder mangelnder Erfahrung der Anbieter gescheitert. <strong>Barrieren gibt es viele – aber sie sollten niemals zwischen Ihnen und der Freude an Bewegung stehen.</strong>',
      'Bei Tanzmoment glauben wir: <strong>Jeder Körper kann tanzen.</strong> Nicht trotz seiner Besonderheiten, sondern mit ihnen. Ob Sie im Rollstuhl sitzen, eine Sehbeeinträchtigung haben, mit kognitiven Einschränkungen leben oder chronische Schmerzen haben – <em>Ihr Körper hat seine eigene Sprache, und wir helfen Ihnen, sie zu entdecken.</em>',
      'Wir arbeiten mit <strong>spezialisierten Tanzpädagogen</strong>, die Erfahrung in inklusiver Bewegungsarbeit haben. Unser Studio ist <strong>vollständig barrierefrei</strong>. Und vor allem: Wir passen den Tanz an Sie an – <strong>nicht umgekehrt.</strong>',
    ],
    highlightQuote:
      'Inklusion bedeutet nicht, dass alle das Gleiche tun – sondern dass jeder <strong>auf seine Art teilhaben kann.</strong>',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // ACCESSIBILITY FEATURES DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly accessibilityData = signal<AccessibilityFeaturesSectionData>({
    headline: 'Barrierefreiheit – nicht nur auf dem Papier',
    subheadline:
      'Unser Studio wurde von Grund auf inklusiv gestaltet. Hier die konkreten Details.',
    prompt: 'Was brauchst du? Tippe an – wir zeigen, was passt',
    needs: [
      { label: 'Rollstuhl / Gehhilfe', matches: [0, 1] },
      { label: 'Reizempfindlich', matches: [2, 5] },
      { label: 'Gehörlos / höre eingeschränkt', matches: [2, 3] },
      { label: 'Sehbeeinträchtigt', matches: [3, 0] },
      { label: 'Brauche Begleitung', matches: [4] },
      { label: 'Brauche Pausen', matches: [5] },
    ],
    features: [
      {
        icon: '/assets/icons/features/stufenloser-zugang.svg',
        eyebrow: 'Ankommen ohne Hürden',
        title: 'Stufenloser Zugang',
        color: 'var(--color-brand)',
        description:
          'Rampe vom Eingang, Aufzug zu allen Etagen, breite Türen (min. 90 cm). Rollstuhlgerechte Toiletten und Umkleiden.',
      },
      {
        icon: '/assets/icons/features/raeumliche-anpassung.svg',
        eyebrow: 'Platz, der mitdenkt',
        title: 'Räumliche Anpassung',
        color: 'var(--color-secondary-dark)',
        description:
          'Grosszügiger Tanzraum mit genug Platz für Rollstühle, Gehhilfen oder Assistenzhunde. Variable Raumaufteilung je nach Bedarf.',
      },
      {
        icon: '/assets/icons/features/sensorische-ruecksicht.svg',
        eyebrow: 'Reize nach deinem Maß',
        title: 'Sensorische Rücksicht',
        color: 'var(--color-accent-dark)',
        description:
          'Individuelle Lautstärke-Anpassung möglich. Vibrationsplatten für gehörlose Teilnehmer. Gute Beleuchtung ohne Blendung.',
      },
      {
        icon: '/assets/icons/features/visuelle-unterstuetzung.svg',
        eyebrow: 'Sehen, fühlen, verstehen',
        title: 'Visuelle Unterstützung',
        color: 'var(--color-brand)',
        description:
          'Kontrastreiche Markierungen, taktile Leitsysteme, Gebärdensprach-Dolmetscher auf Anfrage verfügbar.',
      },
      {
        icon: '/assets/icons/features/assistenz-willkommen.svg',
        eyebrow: 'Begleitung tanzt kostenfrei mit',
        title: 'Assistenz willkommen',
        color: 'var(--color-secondary-dark)',
        description:
          'Begleitpersonen und Assistenten sind herzlich willkommen und nehmen kostenfrei teil.',
      },
      {
        icon: '/assets/icons/features/ruheraeume.svg',
        eyebrow: 'Pause, wann du sie brauchst',
        title: 'Ruheräume',
        color: 'var(--color-accent-dark)',
        description:
          'Ruhezone für Pausen bei Erschöpfung, Schmerzen oder Reizüberflutung.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // METHODOLOGY DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly methodologyData = signal<MethodologyTimelineData>({
    kicker: 'So arbeiten wir',
    headline: 'So individuell, wie <em>Sie sich bewegen</em>',
    lede: 'Kein starrer Ablauf, keine zwei gleichen Stunden. Folgen Sie der Linie – vom ersten Gespräch bis in die Gruppe.',
    stations: [
      {
        indexLabel: '01 — Der Anfang',
        title: 'Individuelles Vorgespräch',
        body: 'Vor dem ersten Kurs sprechen wir ausführlich mit Ihnen (und ggf. Ihren Begleitpersonen): <strong>Welche Bewegungen sind möglich?</strong> Was sind Ihre Ziele? Was bereitet Freude, was Unbehagen?',
      },
      {
        indexLabel: '02 — Ihr Körper',
        title: 'Körperliche Anpassung',
        body: 'Bewegungen werden so angepasst, dass sie <strong>für Ihren Körper funktionieren</strong>. Sitztanz für Rollstuhlnutzer. Vereinfachte Bewegungen bei motorischen Einschränkungen. Taktile Anleitungen bei Sehbeeinträchtigung.',
      },
      {
        indexLabel: '03 — Alle Sinne',
        title: 'Multi-sensorischer Ansatz',
        body: 'Musik spüren (Vibration), sehen (Bewegungsanleitung), hören – <em>wir nutzen verschiedene Sinneskanäle</em>, damit jeder teilhaben kann.',
      },
      {
        indexLabel: '04 — Ihre Freiheit',
        title: 'Keine festen Choreographien',
        body: 'Wir arbeiten mit <strong>Bewegungsimpulsen</strong>, nicht mit starren Abläufen. Sie entscheiden, wie Sie den Impuls umsetzen – mit Ihren Möglichkeiten.',
      },
      {
        indexLabel: '05 — Ihr Tempo',
        title: 'Tempo und Pausen',
        body: 'Chronische Schmerzen? Erschöpfung? Sie bestimmen das Tempo. <strong>Pausen sind Teil des Tanzes</strong>, nicht Schwäche.',
      },
      {
        indexLabel: '06 — Gemeinsam',
        title: 'Gruppendynamik',
        body: 'Wir tanzen gemeinsam, aber nicht synchron. <strong>Vielfalt ist unser Programm.</strong> Jeder bewegt sich auf seine Art, und genau das macht die Gruppe reich.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // BENEFITS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly benefitsData = signal<BenefitsSpotlightData>({
    headline: 'Was Tanz für dich tun kann',
    subheadline:
      'Bewegung ist Medizin, Ausdruck und Lebensfreude – gerade für Menschen, die täglich mit Einschränkungen leben.',
    benefits: [
      {
        category: 'physical',
        title: 'Körperliche Selbstwirksamkeit',
        description:
          'Erlebe deinen Körper als <strong>handlungsfähig</strong> statt eingeschränkt. Entdecke Bewegungsmöglichkeiten, von denen du vielleicht nicht wusstest.',
      },
      {
        category: 'physical',
        title: 'Schmerzmanagement',
        description:
          'Sanfte Bewegung kann chronische Schmerzen lindern. Tanz <strong>aktiviert körpereigene Schmerzregulation</strong> und hilft, den Körper neu zu spüren.',
      },
      {
        category: 'emotional',
        title: 'Emotionaler Ausdruck',
        description:
          'Gefühle, die keine Worte finden – Frustration, Freude, Trauer, Kraft – <strong>im Tanz dürfen sie raus.</strong> Ohne Erklärungen.',
      },
      {
        category: 'emotional',
        title: 'Selbstbestimmung erleben',
        description:
          'In einer Welt voller Barrieren ist Tanz ein Raum, in dem <strong>DU entscheidest.</strong> Deine Bewegung, deine Grenzen, deine Art.',
      },
      {
        category: 'social',
        title: 'Gemeinschaft ohne Mitleid',
        description:
          'Hier bist du nicht "der/die mit Behinderung", sondern <strong>Tänzer*in.</strong> Begegnungen auf Augenhöhe, echte Inklusion.',
      },
      {
        category: 'emotional',
        title: 'Lebensqualität',
        description:
          'Studien zeigen: Tanz <strong>verbessert Lebensqualität, Selbstwertgefühl und psychisches Wohlbefinden</strong> bei Menschen mit Behinderung signifikant.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TESTIMONIALS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly testimonialsData = signal<TestimonialsData>({
    headline: 'Stimmen aus unserer Community',
    accentColor: '--color-accessible-accent',
    testimonials: [
      {
        id: '1',
        quote:
          'Ich sitze seit 15 Jahren im Rollstuhl. Hier habe ich zum ersten Mal das Gefühl: Mein Körper ist nicht das Problem – er ist das Instrument.',
        author: 'Maria K.',
        context: 'Rollstuhlnutzerin',
        accent: '--color-brand',
      },
      {
        id: '2',
        quote:
          'Meine Tochter ist Autistin. Nach jeder Tanzstunde kommt sie strahlend heraus. Das ist unbezahlbar.',
        author: 'Familie Schneider',
        context: 'Eltern',
        accent: '--color-accent-dark',
      },
      {
        id: '3',
        quote:
          'Endlich ein Ort, wo ich nicht erklären muss. Wo ich einfach sein darf.',
        author: 'Tom W.',
        context: 'Sehbehinderung',
        accent: '--color-accessible-accent',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // FAQ DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly faqData = signal<FaqData>({
    headline: 'Deine Fragen',
    accentColor: '--color-accessible-accent',
    items: [
      {
        id: 'suitable',
        question: 'Ist das Angebot wirklich für ALLE Behinderungen geeignet?',
        answer:
          '<p>Wir sind offen für <strong>alle Formen von Behinderung</strong> – körperlich, sensorisch, kognitiv oder psychisch. In einem <strong>persönlichen Vorgespräch</strong> klären wir gemeinsam, wie wir den Kurs optimal für Sie gestalten können.</p><p>Sollten wir einmal nicht die richtige Anlaufstelle sein, vermitteln wir gerne an spezialisierte Partner.</p>',
      },
      {
        id: 'experience',
        question: 'Ich habe noch nie getanzt – geht das trotzdem?',
        answer:
          '<p><strong>Absolut!</strong> Vorkenntnisse sind nicht nötig. Unsere Kurse sind so gestaltet, dass jeder dort einsteigen kann, wo er oder sie gerade steht.</p><p>Es geht nicht um Technik, sondern um <strong>Ausdruck und Freude an Bewegung</strong>.</p>',
      },
      {
        id: 'costs',
        question: 'Was kostet die Teilnahme? Übernimmt die Krankenkasse etwas?',
        answer:
          '<p>Die Kursgebühren finden Sie auf unserer <strong>Kursseite</strong>. In manchen Fällen übernehmen Krankenkassen oder Sozialhilfeträger einen Teil der Kosten.</p><p>Wir beraten Sie gerne zu <strong>Fördermöglichkeiten</strong> und stellen bei Bedarf Bescheinigungen aus.</p>',
      },
      {
        id: 'companion',
        question: 'Kann ich eine Begleitperson mitbringen?',
        answer:
          '<p><strong>Ja, selbstverständlich!</strong> Begleitpersonen, Assistenten oder Pflegekräfte sind herzlich willkommen und nehmen <strong>kostenfrei</strong> teil.</p><p>Sie können zuschauen oder aktiv mittanzen – ganz wie es passt.</p>',
      },
      {
        id: 'pain',
        question:
          'Was passiert bei akuten Schmerzen oder Erschöpfung während des Kurses?',
        answer:
          '<p>Sie können <strong>jederzeit pausieren</strong> oder die Intensität anpassen. Unser Ruhebereich steht zur Verfügung.</p><p>Niemand muss sich erklären. <strong>Ihr Wohlbefinden hat Priorität.</strong></p>',
      },
      {
        id: 'consultation',
        question: 'Wie läuft das Vorgespräch ab?',
        answer:
          '<p>Vor dem ersten Kurs führen wir ein <strong>kostenloses Gespräch</strong> (persönlich, telefonisch oder per Video). Dabei besprechen wir:</p><ul><li>Ihre körperlichen Möglichkeiten und Grenzen</li><li>Ihre Wünsche und Ziele</li><li>Praktische Fragen (Anfahrt, Hilfsmittel, Begleitung)</li></ul><p>Das Gespräch ist <strong>unverbindlich</strong> – wir möchten Sie einfach kennenlernen.</p>',
      },
      {
        id: 'dogs',
        question: 'Sind Assistenzhunde erlaubt?',
        answer:
          '<p><strong>Ja!</strong> Assistenzhunde sind bei uns willkommen. Bitte geben Sie uns vorab kurz Bescheid, damit wir andere Teilnehmende informieren können (z.B. bei Allergien).</p>',
      },
      {
        id: 'clothing',
        question: 'Was soll ich anziehen?',
        answer:
          '<p>Bequeme Kleidung, in der Sie sich gut bewegen können. <strong>Orthesen, Korsetts oder Prothesen</strong> können Sie so tragen, wie es für Sie angenehm ist.</p><p>Schuhe oder barfuss – beides ist möglich. Hauptsache, Sie fühlen sich wohl.</p>',
      },
      {
        id: 'trial',
        question: 'Gibt es Schnupperstunden?',
        answer:
          '<p>Ja! Nach dem Vorgespräch können Sie gerne an einer <strong>Probestunde</strong> teilnehmen, um zu schauen, ob unser Angebot zu Ihnen passt.</p><p>Die Probestunde ist <strong>kostenlos und unverbindlich</strong>.</p>',
      },
      {
        id: 'deaf-blind',
        question:
          'Ich bin gehörlos/blind – wie funktioniert die Anleitung?',
        answer:
          '<p>Wir arbeiten mit <strong>verschiedenen Anleitungsmethoden</strong>:</p><ul><li>Für Gehörlose: Visuelle Anleitung, Vibrationsboden, auf Anfrage Gebärdensprach-Dolmetscher</li><li>Für Blinde/Sehbehinderte: Taktile Anleitung, verbale Beschreibungen, Körperkontakt (mit Einverständnis)</li></ul><p>Im Vorgespräch finden wir die beste Methode für Sie.</p>',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CTA DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly ctaData = signal<CtaSectionData>({
    headline: 'Bereit, deinen Körper neu zu entdecken?',
    subheadline:
      'Lass uns gemeinsam herausfinden, wie Tanz für dich funktionieren kann. Unverbindlich, barrierefrei, auf Augenhöhe.',
    buttons: [
      {
        text: 'Persönliches Beratungsgespräch vereinbaren',
        variant: 'primary',
        route: '/kontakt',
      },
      {
        text: 'Ich habe noch Fragen',
        variant: 'secondary',
        route: '/kontakt',
      },
    ],
  });
}

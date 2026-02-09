import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HeaderComponent,
  FooterComponent,
  FaqAccordionComponent,
  TestimonialSectionComponent,
} from '@tanzmoment/shared/ui';

// Section Components
import { AccessibleHeroComponent } from './sections/accessible-hero/accessible-hero.component';
import { IntroSectionComponent } from './sections/intro-section/intro-section.component';
import { AccessibilityFeaturesSectionComponent } from './sections/accessibility-features-section/accessibility-features-section.component';
import { InstructorsSectionComponent } from './sections/instructors-section/instructors-section.component';
import { MethodologySectionComponent } from './sections/methodology-section/methodology-section.component';
import { BenefitsSectionComponent } from './sections/benefits-section/benefits-section.component';
import { CtaSectionComponent } from './sections/cta-section/cta-section.component';

// Types
import { AccessibleHeroData } from './sections/accessible-hero/accessible-hero.types';
import { IntroSectionData } from './sections/intro-section/intro-section.types';
import { AccessibilityFeaturesSectionData } from './sections/accessibility-features-section/accessibility-features-section.types';
import { InstructorsSectionData } from './sections/instructors-section/instructors-section.types';
import { MethodologyData } from './sections/methodology-section/methodology-section.types';
import { BenefitsData } from './sections/benefits-section/benefits-section.types';
import { CtaSectionData } from './sections/cta-section/cta-section.types';
import { FaqData, TestimonialsData } from '@tanzmoment/shared/ui';

@Component({
  selector: 'tm-accessible-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    AccessibleHeroComponent,
    IntroSectionComponent,
    AccessibilityFeaturesSectionComponent,
    InstructorsSectionComponent,
    MethodologySectionComponent,
    BenefitsSectionComponent,
    FaqAccordionComponent,
    TestimonialSectionComponent,
    CtaSectionComponent,
  ],
  templateUrl: './accessible-page.component.html',
  styleUrl: './accessible-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessiblePageComponent {
  // ───────────────────────────────────────────────────────────────────────────
  // HERO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly heroData = signal<AccessibleHeroData>({
    backgroundImage: '/assets/images/target-groups/accessible-hero.jpg',
    headline: 'Dein Körper. Deine Bewegung. Deine Art zu tanzen.',
    subheadline:
      'Tanz kennt keine Grenzen. Bei uns zählt nicht, was du nicht kannst – sondern was du ausdrücken möchtest.',
    highlights: [
      { icon: '♿', text: 'Barrierefrei' },
      { icon: '🎓', text: 'Qualifizierte Trainer' },
      { icon: '✨', text: 'Individuelle Anpassung' },
    ],
    ctaText: 'Persönliches Gespräch vereinbaren',
    ctaRoute: '/kontakt',
    secondaryCtaText: 'Mehr erfahren',
    secondaryCtaRoute: '/fuer-alle#barrierefreiheit',
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
    features: [
      {
        icon: '🚪',
        title: 'Stufenloser Zugang',
        description:
          'Rampe vom Eingang, Aufzug zu allen Etagen, breite Türen (min. 90cm). Rollstuhlgerechte Toiletten und Umkleiden.',
      },
      {
        icon: '🏢',
        title: 'Räumliche Anpassung',
        description:
          'Grosszügiger Tanzraum mit genug Platz für Rollstühle, Gehhilfen oder Assistenzhunde. Variable Raumaufteilung je nach Bedarf.',
      },
      {
        icon: '🔊',
        title: 'Sensorische Rücksicht',
        description:
          'Individuelle Lautstärke-Anpassung möglich. Vibrationsplatten für gehörlose Teilnehmer. Gute Beleuchtung ohne Blendung.',
      },
      {
        icon: '👁️',
        title: 'Visuelle Unterstützung',
        description:
          'Kontrastreiche Markierungen, taktile Leitsysteme, Gebärdensprach-Dolmetscher auf Anfrage verfügbar.',
      },
      {
        icon: '🤝',
        title: 'Assistenz willkommen',
        description:
          'Begleitpersonen und Assistenten sind herzlich willkommen und nehmen kostenfrei teil.',
      },
      {
        icon: '🛋️',
        title: 'Ruheräume',
        description:
          'Ruhezone für Pausen bei Erschöpfung, Schmerzen oder Reizüberflutung.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INSTRUCTORS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly instructorsData = signal<InstructorsSectionData>({
    headline: 'Erfahrung, die zählt',
    intro:
      'Inklusive Tanzarbeit erfordert besonderes Wissen, Empathie und Flexibilität. Unsere Kursleiter bringen all das mit.',
    qualifications: [
      {
        icon: '🎓',
        title: 'Spezialisierte Ausbildung',
        description:
          'Alle unsere Tanzpädagogen haben Fortbildungen in <strong>inklusiver Tanzpädagogik</strong> und <strong>Bewegungsarbeit mit Menschen mit Behinderung</strong> absolviert.',
      },
      {
        icon: '⚕️',
        title: 'Medizinisches Grundwissen',
        description:
          'Kenntnisse über verschiedene Behinderungsformen, Kontraindikationen und sichere Bewegungsausführung. <strong>Erste-Hilfe-Zertifizierung</strong> selbstverständlich.',
      },
      {
        icon: '🔄',
        title: 'Individuelle Anpassung',
        description:
          'Jede Kursstunde wird an die aktuellen Bedürfnisse der Teilnehmenden angepasst. Schmerzen heute? Müdigkeit? Wir reagieren darauf.',
      },
      {
        icon: '💬',
        title: 'Kommunikative Kompetenz',
        description:
          'Grundkenntnisse in Gebärdensprache, Erfahrung mit Unterstützter Kommunikation, sensibel für verschiedene Kommunikationsbedürfnisse.',
      },
    ],
    certificationNote:
      'Unsere Kursleiter nehmen regelmässig an <strong>Fortbildungen</strong> teil und haben ein <strong>erweitertes Führungszeugnis</strong>.',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // METHODOLOGY DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly methodologyData = signal<MethodologyData>({
    headline: 'So passen wir Tanz an dich an',
    intro:
      'Es gibt nicht "den einen" inklusiven Tanzkurs. Jeder Mensch bringt andere Fähigkeiten, Herausforderungen und Ziele mit. Unsere Methode ist so flexibel wie unsere Teilnehmenden vielfältig sind.',
    points: [
      {
        title: 'Individuelles Vorgespräch',
        description:
          'Vor dem ersten Kurs sprechen wir ausführlich mit Ihnen (und ggf. Ihren Begleitpersonen): <strong>Welche Bewegungen sind möglich?</strong> Was sind Ihre Ziele? Was bereitet Freude, was Unbehagen?',
      },
      {
        title: 'Körperliche Anpassung',
        description:
          'Bewegungen werden so angepasst, dass sie <strong>für Ihren Körper funktionieren</strong>. Sitztanz für Rollstuhlnutzer. Vereinfachte Bewegungen bei motorischen Einschränkungen. Taktile Anleitungen bei Sehbeeinträchtigung.',
      },
      {
        title: 'Multi-Sensorischer Ansatz',
        description:
          'Musik spüren (Vibration), sehen (Bewegungsanleitung), hören – <em>wir nutzen verschiedene Sinneskanäle</em>, damit jeder teilhaben kann.',
      },
      {
        title: 'Keine festen Choreographien',
        description:
          'Wir arbeiten mit <strong>Bewegungsimpulsen</strong>, nicht mit starren Abläufen. Sie entscheiden, wie Sie den Impuls umsetzen – mit Ihren Möglichkeiten.',
      },
      {
        title: 'Tempo und Pausen',
        description:
          'Chronische Schmerzen? Erschöpfung? Sie bestimmen das Tempo. <strong>Pausen sind Teil des Tanzes</strong>, nicht Schwäche.',
      },
      {
        title: 'Gruppendynamik',
        description:
          'Wir tanzen gemeinsam, aber nicht synchron. <strong>Vielfalt ist unser Programm.</strong> Jeder bewegt sich auf seine Art, und genau das macht die Gruppe reich.',
      },
    ],
    qualificationNote:
      'Unser Ansatz basiert auf den Prinzipien der <strong>DanceAbility</strong>-Methode und <strong>Contact Improvisation</strong>, angepasst an die individuellen Bedürfnisse.',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // BENEFITS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly benefitsData = signal<BenefitsData>({
    headline: 'Was Tanz für dich tun kann',
    subheadline:
      'Bewegung ist Medizin, Ausdruck und Lebensfreude – gerade für Menschen, die täglich mit Einschränkungen leben.',
    benefits: [
      {
        icon: '💪',
        title: 'Körperliche Selbstwirksamkeit',
        description:
          'Erlebe deinen Körper als <strong>handlungsfähig</strong> statt eingeschränkt. Entdecke Bewegungsmöglichkeiten, von denen du vielleicht nicht wusstest.',
        category: 'physical',
      },
      {
        icon: '🌸',
        title: 'Schmerzmanagement',
        description:
          'Sanfte Bewegung kann chronische Schmerzen lindern. Tanz <strong>aktiviert körpereigene Schmerzregulation</strong> und hilft, den Körper neu zu spüren.',
        category: 'physical',
      },
      {
        icon: '🎭',
        title: 'Emotionaler Ausdruck',
        description:
          'Gefühle, die keine Worte finden – Frustration, Freude, Trauer, Kraft – <strong>im Tanz dürfen sie raus.</strong> Ohne Erklärungen.',
        category: 'emotional',
      },
      {
        icon: '🌟',
        title: 'Selbstbestimmung erleben',
        description:
          'In einer Welt voller Barrieren ist Tanz ein Raum, in dem <strong>DU entscheidest.</strong> Deine Bewegung, deine Grenzen, deine Art.',
        category: 'emotional',
      },
      {
        icon: '👭',
        title: 'Gemeinschaft ohne Mitleid',
        description:
          'Hier bist du nicht "der/die mit Behinderung", sondern <strong>Tänzer*in.</strong> Begegnungen auf Augenhöhe, echte Inklusion.',
        category: 'social',
      },
      {
        icon: '⭐',
        title: 'Lebensqualität',
        description:
          'Studien zeigen: Tanz <strong>verbessert Lebensqualität, Selbstwertgefühl und psychisches Wohlbefinden</strong> bei Menschen mit Behinderung signifikant.',
        category: 'emotional',
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
      },
      {
        id: '2',
        quote:
          'Meine Tochter ist Autistin. Nach jeder Tanzstunde kommt sie strahlend heraus. Das ist unbezahlbar.',
        author: 'Familie Schneider',
        context: 'Eltern',
      },
      {
        id: '3',
        quote:
          'Endlich ein Ort, wo ich nicht erklären muss. Wo ich einfach sein darf.',
        author: 'Tom W.',
        context: 'Sehbehinderung',
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

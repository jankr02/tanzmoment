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
  FaqData,
  TestimonialsData,
} from '@tanzmoment/shared/ui';
import { SeoService } from '@tanzmoment/shared/services';

import { ExpressiveHeroComponent } from './sections/expressive-hero/expressive-hero.component';
import { IntroSectionComponent } from './sections/intro-section/intro-section.component';
import { MethodologyTimelineComponent } from '../shared/methodology-timeline/methodology-timeline.component';
import { BenefitsSpotlightComponent } from '../shared/benefits-spotlight/benefits-spotlight.component';
import { CtaSectionComponent } from './sections/cta-section/cta-section.component';
import { TrustRingsComponent } from '../shared/trust-rings/trust-rings.component';

import { ExpressiveHeroData } from './sections/expressive-hero/expressive-hero.types';
import { IntroSectionData } from './sections/intro-section/intro-section.types';
import { MethodologyTimelineData } from '../shared/methodology-timeline/methodology-timeline.types';
import { BenefitsSpotlightData } from '../shared/benefits-spotlight/benefits-spotlight.types';
import { CtaSectionData } from './sections/cta-section/cta-section.types';

@Component({
  selector: 'tm-expressive-page',
  standalone: true,
  imports: [
    CommonModule,
    ExpressiveHeroComponent,
    IntroSectionComponent,
    MethodologyTimelineComponent,
    BenefitsSpotlightComponent,
    TrustRingsComponent,
    FaqAccordionComponent,
    TestimonialSectionComponent,
    CtaSectionComponent,
  ],
  templateUrl: './expressive-page.component.html',
  styleUrl: './expressive-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpressivePageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Ausdruckstanz — Bewegung als deine Sprache',
      description:
        'Freier, kreativer Ausdruckstanz für Erwachsene in Mössingen. Ohne Schritte, ohne Choreografie — entdecke deinen eigenen Tanz und komme bei dir an.',
      url: '/ausdruckstanz',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HERO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly heroData = signal<ExpressiveHeroData>({
    backgroundImage: '/assets/images/courses/expressive-frei.jpg',
    headline: 'Bewegung, die aus dir kommt.',
    subheadline:
      'Ausdruckstanz kennt keine richtigen Schritte. Hier zählt nicht, wie es aussieht – sondern wie es sich anfühlt.',
    ctaText: 'Schnupperstunde sichern',
    ctaRoute: '/kontakt',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INTRO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly introData = signal<IntroSectionData>({
    headline: 'Tanzen, ohne tanzen zu können',
    paragraphs: [
      'Vielleicht hast du als Kind getanzt – frei, ungehemmt, einfach so. Und irgendwann aufgehört, weil dir jemand erklärt hat, wie es "richtig" geht. <strong>Ausdruckstanz holt genau dieses Gefühl zurück.</strong>',
      'Hier gibt es keine Choreografie zum Auswendiglernen, keine Spiegel, in denen du dich bewertest, und keine Schritte, die du "falsch" machen kannst. <em>Es gibt nur dich, die Musik und den Raum, dich so zu bewegen, wie es sich für dich stimmig anfühlt.</em>',
      'Wir arbeiten mit <strong>Bewegungsimpulsen</strong> statt festen Abläufen – mal sanft und meditativ, mal kraftvoll und wild. In jedem Moment entscheidest du selbst, wie weit du gehst, und wirst dabei einfühlsam begleitet.',
    ],
    highlightQuote:
      'Es geht nicht darum, gut auszusehen. Es geht darum, sich <strong>lebendig zu fühlen.</strong>',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // METHODOLOGY DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly methodologyData = signal<MethodologyTimelineData>({
    kicker: 'So arbeiten wir',
    headline: 'So frei, wie <em>du dich fühlst</em>',
    lede: 'Keine Schritte zum Auswendiglernen. Folge der Linie – vom Ankommen bis ins freie Tanzen.',
    stations: [
      {
        indexLabel: '01 — Ankommen',
        title: 'Ankommen & Spüren',
        body: 'Jede Stunde beginnt mit einem sanften <strong>Body-Scan</strong>: Wo bin ich heute? Was braucht mein Körper? So legst du den Alltag ab und kommst im Hier und Jetzt an.',
      },
      {
        indexLabel: '02 — Impuls',
        title: 'Bewegungsimpulse',
        body: 'Statt Schritten geben wir <strong>Impulse</strong> – ein Bild, ein Gefühl, einen Rhythmus. Du übersetzt sie in deine eigene Bewegung. Es gibt kein Richtig, nur deinen Ausdruck.',
      },
      {
        indexLabel: '03 — Klang',
        title: 'Atem & Musik',
        body: 'Wir nutzen <strong>Atem und Musik</strong> als Wegweiser. Mal trägt dich ein ruhiger Klang, mal fordert dich ein treibender Beat. <em>Du folgst dem, was in dir resoniert.</em>',
      },
      {
        indexLabel: '04 — Freiheit',
        title: 'Freies Tanzen',
        body: 'In offenen Phasen bewegst du dich völlig frei. Niemand schaut, niemand bewertet. <strong>Der Raum gehört in diesem Moment ganz dir.</strong>',
      },
      {
        indexLabel: '05 — Begegnung',
        title: 'Begegnung',
        body: 'In achtsamen Partner- und Gruppensequenzen entsteht <strong>Verbindung ohne Worte</strong> – ganz freiwillig und immer in deinem eigenen Tempo.',
      },
      {
        indexLabel: '06 — Ausklang',
        title: 'Ausklang',
        body: 'Zum Abschluss kommen wir zur Ruhe und spüren nach. <strong>Was hat sich verändert?</strong> Oft bleibt ein Gefühl von Leichtigkeit und Klarheit.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // BENEFITS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly benefitsData = signal<BenefitsSpotlightData>({
    headline: 'Was Ausdruckstanz in dir bewegt',
    subheadline:
      'Freier Tanz wirkt auf Körper, Geist und Seele – ganz ohne Leistungsdruck.',
    benefits: [
      {
        category: 'physical',
        title: 'Stress löst sich',
        description:
          'Bewegung baut <strong>Anspannung und Stresshormone</strong> ab. Nach einer Stunde fühlst du dich gelöst, geerdet und klarer im Kopf.',
      },
      {
        category: 'physical',
        title: 'Neues Körpergefühl',
        description:
          'Du lernst deinen Körper neu kennen – seine Grenzen und seine Möglichkeiten. <strong>Beweglichkeit und Haltung</strong> verbessern sich ganz nebenbei.',
      },
      {
        category: 'emotional',
        title: 'Emotionaler Ausdruck',
        description:
          'Gefühle, die keine Worte finden, dürfen sich <strong>in Bewegung zeigen.</strong> Das befreit, entlastet und schafft Raum.',
      },
      {
        category: 'emotional',
        title: 'Selbstvertrauen',
        description:
          'Wenn nichts falsch sein kann, wächst <strong>Vertrauen in dich selbst.</strong> Diese innere Erlaubnis nimmst du mit in den Alltag.',
      },
      {
        category: 'emotional',
        title: 'Kreativität',
        description:
          'Freie Bewegung öffnet <strong>kreative Kanäle</strong>, die im Alltag oft verschüttet sind. Viele erleben sich danach spielerischer und inspirierter.',
      },
      {
        category: 'social',
        title: 'Gemeinschaft',
        description:
          'Du tanzt in einer <strong>wertfreien Gruppe</strong> Gleichgesinnter. Begegnung ohne Bewertung, auf Augenhöhe.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TESTIMONIALS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly testimonialsData = signal<TestimonialsData>({
    headline: 'Was Tänzer:innen erzählen',
    accentColor: '--color-expressive-accent',
    testimonials: [
      {
        id: '1',
        quote:
          'Ich dachte immer, ich kann nicht tanzen. Hier habe ich gemerkt: Das stimmt gar nicht – ich hatte es nur verlernt.',
        author: 'Sabine R.',
        context: 'seit einem Jahr dabei',
      },
      {
        id: '2',
        quote:
          'Nach einem langen Bürotag ist das meine Insel. Ich gehe rein voller Gedanken und komme raus voller Ruhe.',
        author: 'Markus T.',
        context: 'Teilnehmer',
      },
      {
        id: '3',
        quote:
          'Ohne Spiegel, ohne Schritte zählen – endlich darf ich einfach sein. Das hat etwas in mir gelöst.',
        author: 'Lena B.',
        context: 'Einsteigerin',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // FAQ DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly faqData = signal<FaqData>({
    headline: 'Häufige Fragen',
    accentColor: '--color-expressive-accent',
    items: [
      {
        id: 'experience',
        question: 'Brauche ich Tanzerfahrung?',
        answer:
          '<p><strong>Nein.</strong> Ausdruckstanz braucht keine Vorkenntnisse. Es geht nicht um Technik oder Schritte, sondern um deinen ganz persönlichen Ausdruck. <strong>Jede:r kann sofort einsteigen.</strong></p>',
      },
      {
        id: 'performance',
        question: 'Muss ich vor anderen tanzen?',
        answer:
          '<p>Du bewegst dich vor allem für dich selbst. Es gibt <strong>keine Vorführungen und keine Bewertung.</strong> Partner- und Gruppensequenzen sind immer freiwillig – du bestimmst, wie viel Nähe für dich stimmt.</p>',
      },
      {
        id: 'clothing',
        question: 'Was soll ich anziehen?',
        answer:
          '<p>Bequeme Kleidung, in der du dich frei bewegen kannst. Wir tanzen meist <strong>barfuß oder in Socken</strong>. Bring gerne etwas zu trinken mit.</p>',
      },
      {
        id: 'therapy',
        question: 'Ist Ausdruckstanz ein Sport oder eine Therapie?',
        answer:
          '<p>Weder noch im klassischen Sinn. Ausdruckstanz ist eine <strong>kreative Bewegungspraxis.</strong> Viele erleben ihn als wohltuend und entlastend, er ersetzt aber <strong>keine Psychotherapie.</strong></p>',
      },
      {
        id: 'mobility',
        question: 'Ich bin nicht besonders beweglich – geht das trotzdem?',
        answer:
          '<p><strong>Auf jeden Fall.</strong> Du bewegst dich genau in deinem Rahmen. Ob groß und raumgreifend oder klein und fein – <em>jede Bewegung ist richtig.</em></p>',
      },
      {
        id: 'trial',
        question: 'Gibt es eine Schnupperstunde?',
        answer:
          '<p>Ja! Du kannst jederzeit an einer <strong>unverbindlichen Probestunde</strong> teilnehmen, um zu spüren, ob Ausdruckstanz zu dir passt. Melde dich einfach über unser <strong>Kontaktformular</strong>.</p>',
      },
      {
        id: 'group-size',
        question: 'Wie groß sind die Gruppen?',
        answer:
          '<p>Wir halten die Gruppen bewusst <strong>klein und persönlich</strong>, damit genug Raum für jede:n bleibt und eine vertraute Atmosphäre entsteht.</p>',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CTA DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly ctaData = signal<CtaSectionData>({
    headline: 'Bereit, dich frei zu bewegen?',
    subheadline:
      'Komm vorbei und erlebe, wie sich Tanzen anfühlt, wenn nichts falsch sein kann. Unverbindlich und in deinem Tempo.',
    buttons: [
      {
        text: 'Schnupperstunde vereinbaren',
        variant: 'primary',
        route: '/kontakt',
      },
      {
        text: 'Kurse ansehen',
        variant: 'secondary',
        route: '/courses',
      },
    ],
  });
}

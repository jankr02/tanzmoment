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
import { MothersHeroComponent } from './sections/mothers-hero/mothers-hero.component';
import { EmpathySectionComponent } from './sections/empathy-section/empathy-section.component';
import { WhatToExpectSectionComponent } from './sections/what-to-expect-section/what-to-expect-section.component';
import { MethodologySectionComponent } from './sections/methodology-section/methodology-section.component';
import { BenefitsSectionComponent } from './sections/benefits-section/benefits-section.component';
import { CtaSectionComponent } from './sections/cta-section/cta-section.component';

// Types
import { MothersHeroData } from './sections/mothers-hero/mothers-hero.types';
import { EmpathySectionData } from './sections/empathy-section/empathy-section.types';
import { WhatToExpectData } from './sections/what-to-expect-section/what-to-expect-section.types';
import { MethodologyData } from './sections/methodology-section/methodology-section.types';
import { BenefitsData } from './sections/benefits-section/benefits-section.types';
import { CtaSectionData } from './sections/cta-section/cta-section.types';
import { FaqData, TestimonialsData } from '@tanzmoment/shared/ui';

@Component({
  selector: 'tm-mothers-page',
  standalone: true,
  imports: [
    CommonModule,
    MothersHeroComponent,
    EmpathySectionComponent,
    WhatToExpectSectionComponent,
    MethodologySectionComponent,
    BenefitsSectionComponent,
    FaqAccordionComponent,
    TestimonialSectionComponent,
    CtaSectionComponent,
  ],
  templateUrl: './mothers-page.component.html',
  styleUrl: './mothers-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MothersPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Tanzkurse für Mütter — Zeit für dich',
      description:
        'Sanfte Tanzkurse für Mütter in jeder Lebensphase. Postnatal-gerecht, ohne Leistungsdruck, mit Rücksicht auf Beckenboden und Rückbildung.',
      url: '/fuer-muetter',
      image: '/assets/images/target-groups/mothers-hero.jpg',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HERO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly heroData = signal<MothersHeroData>({
    backgroundImage: '/assets/images/target-groups/mothers-hero.jpg',
    headline: 'Dein Moment. Deine Bewegung.',
    subheadline:
      'Du bist Mutter – und so viel mehr. Hier darfst du für eine Stunde einfach nur du sein. Ohne schlechtes Gewissen. Ohne Zeitdruck. In deinem Tempo.',
    ctaText: 'Kurstermine entdecken',
    ctaRoute: '/courses',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // EMPATHY DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly empathyData = signal<EmpathySectionData>({
    headline: 'Wir verstehen dich',
    paragraphs: [
      '<strong>Muttersein ist wunderschön</strong> – und gleichzeitig kann es überwältigend sein. Zwischen Windeln wechseln, stillen, trösten und den tausend kleinen Aufgaben des Alltags bleibt oft <em>kaum Raum für dich selbst</em>. Dein Körper hat Unglaubliches geleistet, fühlt sich aber vielleicht fremd an. Du liebst dein Kind über alles, aber manchmal vermisst du das Gefühl, einfach nur du zu sein.',
      'Vielleicht hast du ein schlechtes Gewissen, wenn du an "Me-Time" denkst. Vielleicht fragst du dich: <em>"Darf ich mir das überhaupt nehmen?"</em> Die Antwort ist: <strong>Ja. Du darfst.</strong> Mehr noch: <strong>Du brauchst es.</strong> Nicht aus Egoismus, sondern weil du nur dann für deine Familie da sein kannst, wenn du auch für dich selbst da bist.',
      'Bei Tanzmoment schaffen wir einen Raum, der genau das versteht. Hier musst du nicht funktionieren. Hier darfst du spüren, was dein Körper braucht. <strong>Keine Bewertung, kein Vergleich, kein Druck.</strong> Nur Bewegung, Atem und die Freiheit, wieder zu dir zu finden.',
    ],
    highlightQuote: 'Selbstfürsorge ist <strong>kein Egoismus</strong> – sie ist eine <strong>Notwendigkeit</strong>.',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // WHAT TO EXPECT DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly whatToExpectData = signal<WhatToExpectData>({
    headline: 'Das erwartet dich',
    intro:
      'Unser Kurs für Mütter ist bewusst so gestaltet, dass er zu deinem Leben passt. Sanft, flexibel und ohne Leistungsdruck.',
    courseFlow: {
      headline: 'So läuft eine typische Kursstunde ab',
      steps: [
        {
          phase: 'Ankommen',
          duration: '5 Min',
          description: 'Zeit zum Durchatmen. Du darfst erzählen, wie es dir geht – aber du musst nicht.',
        },
        {
          phase: 'Aufwärmen',
          duration: '10 Min',
          description: 'Sanfte Bewegungen, die deinen Körper wecken, ohne zu überfordern. Besondere Rücksicht auf Beckenboden und Rumpfmuskulatur.',
        },
        {
          phase: 'Bewegungsexploration',
          duration: '30 Min',
          description: 'Intuitive Bewegungen zu ruhiger Musik. Jede findet ihre eigene Art zu tanzen. Kein "richtig" oder "falsch".',
        },
        {
          phase: 'Cool Down',
          duration: '10 Min',
          description: 'Entspannung und Dehnung. Zeit, um das Erlebte nachklingen zu lassen.',
        },
        {
          phase: 'Austausch',
          duration: '5 Min',
          description: 'Raum für Fragen oder kurzen Austausch mit den anderen Müttern.',
        },
      ],
    },
    details: [
      {
        icon: '👥',
        title: 'Gruppengröße',
        description:
          'Maximal 10 Mütter, damit jede gesehen wird und Raum für individuelle Betreuung bleibt.',
      },
      {
        icon: '⏱️',
        title: 'Dauer',
        description:
          '60 Minuten pro Kursstunde. Passt gut zwischen Stillzeiten und Kindergarten-Abholungen.',
      },
      {
        icon: '👟',
        title: 'Was du brauchst',
        description:
          'Bequeme Kleidung, in der du dich gut bewegen kannst. Barfuß oder rutschfeste Socken. Mehr nicht.',
      },
      {
        icon: '🌱',
        title: 'Für jedes Level',
        description:
          'Keine Vorkenntnisse nötig. Egal ob du vor der Schwangerschaft getanzt hast oder nicht – du bist willkommen.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // METHODOLOGY DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly methodologyData = signal<MethodologyData>({
    headline: 'So arbeiten wir mit dir',
    intro:
      'Unser Ansatz basiert auf Empathie, Fachwissen und der Überzeugung, dass jeder Körper seine eigene Weisheit hat.',
    points: [
      {
        title: 'Postpartale Rücksicht',
        description:
          'Wir wissen, was dein Körper gerade durchgemacht hat. Besondere Aufmerksamkeit liegt auf <strong>Beckenboden</strong>, <strong>Rektusdiastase</strong> und sanftem Wiederaufbau der Rumpfmuskulatur. <em>Kein Springen, keine abrupten Bewegungen.</em>',
      },
      {
        title: 'Kein Leistungsdruck',
        description:
          'Es gibt kein "gut genug" oder "nicht gut genug". <strong>Dein Körper, deine Grenzen, deine Bewegungen.</strong> Wenn du an einem Tag nur stehen und atmen magst – das ist vollkommen in Ordnung.',
      },
      {
        title: 'Intuitive Bewegung',
        description:
          'Wir arbeiten nicht mit festen Choreographien, sondern mit <strong>Impulsen</strong>. Du entscheidest, wie du dich bewegen möchtest. <em>Dein Körper weiß, was er braucht</em> – wir helfen dir, wieder zuzuhören.',
      },
      {
        title: 'Safe Space',
        description:
          'Der Tanzraum ist ein <strong>geschützter Raum</strong>. Was hier besprochen wird, bleibt hier. Du darfst weinen, lachen, still sein oder dich austoben. <em>Alles hat seinen Platz.</em>',
      },
    ],
    qualificationNote:
      'Unsere Kursleitung hat eine Ausbildung in <strong>prä- und postnataler Fitness</strong> und langjährige Erfahrung in der Arbeit mit Müttern. <em>Deine Gesundheit steht immer an erster Stelle.</em>',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // BENEFITS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly benefitsData = signal<BenefitsData>({
    headline: 'Was Tanz für dich tun kann',
    subheadline: 'Bewegung ist mehr als Fitness. Sie ist ein Weg zurück zu dir selbst.',
    benefits: [
      {
        icon: '💪',
        title: 'Körper neu kennenlernen',
        description:
          'Sanfter Wiederaufbau der Muskulatur, besonders im <strong>Beckenboden und Rumpf</strong>. Dein Körper wird wieder stark – in deinem Tempo.',
        category: 'physical',
      },
      {
        icon: '🌸',
        title: 'Körpergefühl verbessern',
        description:
          'Nach der Schwangerschaft fühlt sich der Körper oft fremd an. Durch Bewegung findest du wieder <strong>Zugang zu dir selbst</strong> und spürst, was dein Körper kann.',
        category: 'physical',
      },
      {
        icon: '🧘‍♀️',
        title: 'Stress abbauen',
        description:
          'Eine Stunde, in der du den Kopf frei bekommst. Tanz <strong>senkt Cortisol</strong> (Stresshormon) und setzt <strong>Endorphine</strong> (Glückshormone) frei.',
        category: 'emotional',
      },
      {
        icon: '💭',
        title: 'Emotionen verarbeiten',
        description:
          'Muttersein bringt viele Gefühle mit sich – Freude, Überforderung, Liebe, Erschöpfung. Im Tanz darfst du <strong>all das ausdrücken</strong>, ohne Worte finden zu müssen.',
        category: 'emotional',
      },
      {
        icon: '👭',
        title: 'Gemeinschaft finden',
        description:
          '<strong>Du bist nicht allein.</strong> Hier triffst du andere Mütter, die ähnliche Herausforderungen durchleben. Austausch, der gut tut.',
        category: 'social',
      },
      {
        icon: '⏰',
        title: 'Zeit für dich',
        description:
          'Eine Stunde in der Woche, die <strong>nur dir gehört</strong>. Keine To-Do-Liste, keine Anforderungen. Nur du und deine Bewegung.',
        category: 'emotional',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TESTIMONIALS DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly testimonialsData = signal<TestimonialsData>({
    headline: 'Was andere Mütter sagen',
    accentColor: '--color-mothers-accent',
    testimonials: [
      {
        id: '1',
        quote:
          'Nach der Geburt meines zweiten Kindes fühlte ich mich völlig verloren in meinem eigenen Körper. Hier habe ich gelernt, dass mein Körper nicht kaputt ist – er ist nur anders. Und das ist okay.',
        author: 'Sarah',
        context: 'Mutter von zwei Kindern, 2 und 4',
      },
      {
        id: '2',
        quote:
          'Ich hatte so viele Schuldgefühle, mir Zeit für mich zu nehmen. Aber nach den ersten Wochen merkte ich: Ich bin eine bessere Mutter, wenn ich auch gut für mich selbst sorge. Diese Stunde ist mein Anker.',
        author: 'Lisa',
        context: 'Mutter eines 8 Monate alten Babys',
      },
      {
        id: '3',
        quote:
          'Das Schönste ist, dass hier niemand perfekt sein muss. Manchmal tanze ich, manchmal stehe ich nur da und atme. Beides ist willkommen. Das ist so heilsam.',
        author: 'Anna',
        context: 'Mutter von einem Kind, 1,5 Jahre',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // FAQ DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly faqData = signal<FaqData>({
    headline: 'Deine Fragen',
    accentColor: '--color-mothers-accent',
    items: [
      {
        id: 'baby',
        question: 'Kann ich mein Baby mitbringen?',
        answer:
          '<p>Der Kurs ist bewusst <strong>eine Zeit nur für dich</strong>, ohne Baby. Das mag sich im ersten Moment hart anhören, aber diese Stunde gehört dir.</p><p>Wenn du Unterstützung bei der Kinderbetreuung brauchst, können wir dir gerne Kontakte in der Nähe des Studios vermitteln.</p>',
      },
      {
        id: 'fitness',
        question: 'Muss ich gut in Form sein?',
        answer:
          '<p><strong>Absolut nicht.</strong> Der Kurs ist für jedes Fitnesslevel geeignet. Wir arbeiten sanft und respektieren die Grenzen deines Körpers.</p><p>Ob du gerade erst anfängst, dich wieder zu bewegen, oder schon aktiver bist – <strong>du bist willkommen</strong>.</p>',
      },
      {
        id: 'postpartum',
        question: 'Wie lange nach der Geburt kann ich anfangen?',
        answer:
          '<p>Das hängt von deiner individuellen Situation ab:</p><ul><li>Nach einer <strong>vaginalen Geburt</strong>: meist 6-8 Wochen warten</li><li>Nach einem <strong>Kaiserschnitt</strong> oder bei Komplikationen: erst das Okay deiner Ärztin/Hebamme einholen</li></ul><p>Im Zweifelsfall sprich uns an – wir finden gemeinsam den richtigen Zeitpunkt.</p>',
      },
      {
        id: 'experience',
        question: 'Brauche ich Tanzerfahrung?',
        answer:
          '<p><strong>Nein, überhaupt nicht.</strong> Es geht nicht um Schritte oder Choreographien, sondern um intuitive Bewegung.</p><p>Jede bewegt sich so, wie es sich für sie richtig anfühlt. Es gibt <strong>kein "richtig" oder "falsch"</strong>.</p>',
      },
      {
        id: 'clothing',
        question: 'Was soll ich anziehen?',
        answer:
          '<p>Bequeme Kleidung, in der du dich gut bewegen kannst:</p><ul><li>Leggings mit T-Shirt</li><li>Lockeres Kleid</li><li>Weite Hose</li></ul><p><strong>Barfuß oder rutschfeste Socken.</strong> Mehr brauchst du nicht.</p>',
      },
      {
        id: 'flexible',
        question: 'Was ist, wenn ich mal nicht kommen kann?',
        answer:
          '<p>Das Leben mit kleinen Kindern ist unberechenbar – <em>kranke Kinder, schlaflose Nächte, unerwartete Termine</em> – wir verstehen das.</p><p><strong>Es gibt keinen Druck</strong>, jede Stunde zu kommen. Du kannst flexibel teilnehmen, so wie es in dein Leben passt.</p>',
      },
      {
        id: 'kaiserschnitt',
        question: 'Ist der Kurs auch nach einem Kaiserschnitt geeignet?',
        answer:
          '<p><strong>Ja, definitiv.</strong> Wir achten besonders auf die Narbenregion und arbeiten mit sanften Bewegungen, die deine Heilung unterstützen.</p><p>Wichtig ist nur, dass du das Okay deiner Ärztin hast und dich bereit fühlst.</p>',
      },
      {
        id: 'alone',
        question: 'Muss ich alleine kommen oder kann ich eine Freundin mitbringen?',
        answer:
          '<p><strong>Beides ist möglich!</strong></p><p>Manche Frauen kommen gerne mit einer Freundin, andere genießen es, einen Raum nur für sich zu haben. Du entscheidest, was sich für dich richtig anfühlt.</p>',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CTA DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly ctaData = signal<CtaSectionData>({
    headline: 'Bist du bereit?',
    subheadline: 'Gib dir die Erlaubnis, diese Zeit für dich zu nehmen. Du hast sie verdient.',
    buttons: [
      {
        text: 'Kurstermine ansehen',
        variant: 'primary',
        route: '/courses',
      },
      {
        text: 'Ich habe noch Fragen',
        variant: 'secondary',
        route: '/kontakt',
      },
    ],
  });

}

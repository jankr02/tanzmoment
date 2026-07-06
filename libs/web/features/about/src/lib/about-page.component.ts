import {
  Component,
  signal,
  ChangeDetectionStrategy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DanceStylesSectionComponent,
  DanceStyleCardData,
  DEFAULT_DANCE_STYLES,
  WaveDividerComponent,
  TestimonialSectionComponent,
  TestimonialsData,
} from '@tanzmoment/shared/ui';
import { SeoService } from '@tanzmoment/shared/services';

import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { StorySectionComponent } from './sections/story-section/story-section.component';
import { MissionVisionSectionComponent } from './sections/mission-vision-section/mission-vision-section.component';
import { ValuesSectionComponent } from './sections/values-section/values-section.component';
import { ApproachSectionComponent } from './sections/approach-section/approach-section.component';
import { SpacesSectionComponent } from './sections/spaces-section/spaces-section.component';
import { FaqSectionComponent } from './sections/faq-section/faq-section.component';
import { ContactSectionComponent } from './sections/contact-section/contact-section.component';
import { AboutHeroData } from './sections/hero-section/hero-section.types';
import { StorySectionData } from './sections/story-section/story-section.types';
import { MissionVisionData } from './sections/mission-vision-section/mission-vision-section.types';
import { ValuesSectionData } from './sections/values-section/values-section.types';
import { ApproachSectionData } from './sections/approach-section/approach-section.types';
import { SpacesSectionData } from './sections/spaces-section/spaces-section.types';
import { FaqSectionData } from './sections/faq-section/faq-section.types';
import { ContactSectionData } from './sections/contact-section/contact-section.types';

const PLACEHOLDER_IMAGE = '/assets/images/about/portrait-placeholder.jpg';

@Component({
  selector: 'tm-about-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    StorySectionComponent,
    MissionVisionSectionComponent,
    ValuesSectionComponent,
    ApproachSectionComponent,
    SpacesSectionComponent,
    TestimonialSectionComponent,
    FaqSectionComponent,
    ContactSectionComponent,
    DanceStylesSectionComponent,
    WaveDividerComponent,
  ],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Über uns — Daniela Savasta & Tanzmoment',
      description:
        'Lerne Daniela Savasta und die Geschichte von Tanzmoment kennen. Inklusiver, ausdrucksstarker Tanz ohne Leistungsdruck in Mössingen.',
      url: '/about',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HERO DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly heroData = signal<AboutHeroData>({
    portraitImage: PLACEHOLDER_IMAGE,
    name: 'Daniela Savasta',
    title: 'Tanzpädagogin & Gründerin von Tanzmoment',
    quote:
      'Tanz ist für mich mehr als Bewegung – er ist Ausdruck, Verbindung und Freiheit.',
    description:
      'Mit über 20 Jahren Erfahrung in der Tanzpädagogik habe ich Tanzmoment gegründet, um einen Raum zu schaffen, in dem jeder Mensch die Freude am Tanzen entdecken kann – unabhängig von Alter, Erfahrung oder körperlichen Voraussetzungen.',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // STORY DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly storyData = signal<StorySectionData>({
    eyebrow: 'Unsere Geschichte',
    sectionTitle: 'Wie alles begann',
    image: PLACEHOLDER_IMAGE,
    imageAlt: 'Daniela Savasta im Tanzstudio',
    paragraphs: [
      'Tanzmoment entstand aus einer einfachen Überzeugung: Tanzen tut jedem Menschen gut – nicht als Leistung, sondern als Erlebnis. Nach vielen Jahren als Tanzpädagogin habe ich immer wieder gespürt, wie sehr Menschen sich nach einem Ort sehnen, an dem sie sich frei bewegen dürfen, ohne bewertet zu werden.',
      'So wurde in Mössingen ein Studio geboren, das bewusst anders ist: warm statt streng, einladend statt fordernd, offen für alle Körper und Lebenssituationen. Ein Ort, an dem der eigene Rhythmus zählt und nicht die perfekte Technik.',
      'Heute ist Tanzmoment ein Zuhause für Menschen jeden Alters – von Kinderkursen über Ausdruckstanz bis hin zu inklusiven Angeboten für Menschen mit Behinderung. Und der Wunsch, der am Anfang stand, trägt bis heute jede Stunde: dass jeder Mensch seinen eigenen Tanzmoment findet.',
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // MISSION & VISION DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly missionVisionData = signal<MissionVisionData>({
    sectionTitle: 'Wofür wir stehen',
    mission: {
      headline: 'Unsere Mission',
      text: 'Tanzmoment steht für inklusiven, ausdrucksstarken Tanz ohne Leistungsdruck. Wir glauben, dass jeder Mensch tanzen kann – unabhängig von Alter, Erfahrung oder körperlichen Voraussetzungen. Tanz ist Ausdruck, Bewegung ist Freiheit, und bei uns hat jeder Körper seine eigene Sprache.',
    },
    vision: {
      headline: 'Unsere Vision',
      text: 'Wir schaffen einen Raum, in dem Menschen sich durch Bewegung ausdrücken, verbinden und wachsen können. Tanz wird zum Medium für Selbstentdeckung und Gemeinschaft. Ein Ort, an dem du nicht perfekt sein musst, sondern einfach du selbst sein darfst.',
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // VALUES DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly valuesData = signal<ValuesSectionData>({
    kicker: 'Tippen & entfalten',
    sectionTitle: 'Unsere Werte',
    subtitle:
      'Diese Haltung trägt jede Stunde bei Tanzmoment – vom ersten Schritt an.',
    values: [
      {
        title: 'Inklusion',
        text: 'Jeder Körper ist willkommen. Wir gestalten unsere Kurse so, dass Menschen mit und ohne Behinderung gemeinsam tanzen können.',
      },
      {
        title: 'Kein Leistungsdruck',
        text: 'Bei uns gibt es kein Richtig oder Falsch. Es geht nicht um Perfektion, sondern um das Erleben von Bewegung.',
      },
      {
        title: 'Achtsamkeit',
        text: 'Wir hören auf den Körper und begegnen jedem Menschen mit Respekt, Geduld und voller Aufmerksamkeit.',
      },
      {
        title: 'Gemeinschaft',
        text: 'Tanzen verbindet. Bei Tanzmoment entsteht ein Miteinander, in dem sich alle gesehen und getragen fühlen.',
      },
      {
        title: 'Freier Ausdruck',
        text: 'Jeder Mensch hat seine eigene Sprache der Bewegung. Wir schaffen Raum, damit sie sich entfalten kann.',
      },
      {
        title: 'Sicherheit',
        text: 'Ein geschützter Rahmen, in dem du dich fallen lassen und ausprobieren darfst – ganz in deinem Tempo.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // APPROACH DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly approachData = signal<ApproachSectionData>({
    kicker: 'Ein Weg in vier Schritten',
    sectionTitle: 'Unsere Herangehensweise',
    subtitle:
      'Jede Stunde folgt einem sanften Bogen — vom Ankommen bis zum Wachsen.',
    hint: 'Tippe dich durch die Phasen — die Linie zeigt, wie weit der Weg getragen hat.',
    steps: [
      {
        title: 'Ankommen',
        text: 'Wir beginnen ohne Druck. Ein bewusster Moment des Ankommens gibt Raum, den Alltag hinter sich zu lassen und im Hier zu sein.',
      },
      {
        title: 'Spüren',
        text: 'Über achtsame Bewegung nehmen wir den eigenen Körper wahr — seine Grenzen, seine Möglichkeiten, seinen Rhythmus.',
      },
      {
        title: 'Ausprobieren',
        text: 'Spielerisch und ohne Bewertung experimentieren wir mit Bewegung, Ausdruck und Begegnung. Neugier zählt mehr als Technik.',
      },
      {
        title: 'Wachsen',
        text: 'Schritt für Schritt entsteht Vertrauen — in den eigenen Körper, in die Gruppe und in die Freude am Tanzen.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SPACES DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly spacesData = signal<SpacesSectionData>({
    overline: 'Unsere Standorte',
    sectionTitle: 'Zwei Räume, ein Gefühl',
    subtitle:
      'Wähle deinen Ort und schau dich in Ruhe um – hell, warm und für alle zugänglich.',
    locations: [
      {
        id: 'bodelshausen',
        name: 'Bodelshausen',
        tagline: 'Unser Heimatstudio',
        description:
          'Hier hat alles angefangen. Ein heller Saal mit schwingendem Boden, bodentiefen Fenstern und viel Platz zum Ausbreiten – mittendrin im Ort und trotzdem ganz ruhig.',
        facts: [
          { label: 'Adresse', value: 'Hauptstraße 24, 72411 Bodelshausen' },
          { label: 'Saalfläche', value: '110 m² · lichtdurchflutet' },
          { label: 'Boden', value: 'Schwingender Parkettboden' },
          { label: 'Anfahrt', value: '5 Min. vom Bahnhof · Bus 826' },
          { label: 'Parken', value: 'Kostenfrei direkt am Haus' },
        ],
        photos: [
          {
            src: '/assets/images/about/spaces/rum46-saal.jpg',
            alt: 'Der große Saal im Studio Bodelshausen',
            caption: 'Der große Saal',
          },
          {
            src: '/assets/images/about/spaces/24177-umkleide.jpg',
            alt: 'Umkleide und Lounge in Bodelshausen',
            caption: 'Umkleide & Lounge',
          },
          {
            src: '/assets/images/about/spaces/10412796-zugang.jpg',
            alt: 'Ebenerdiger, barrierefreier Zugang',
            caption: 'Ebenerdiger Zugang',
          },
        ],
      },
      {
        id: 'moessingen',
        name: 'Mössingen',
        tagline: 'Unser zweites Zuhause',
        description:
          'Zentral und lichtdurchflutet: unser Studio in Mössingen lädt zum Ankommen ein. Warmes Holz, weiche Vorhänge und Raum für Bewegung in jeder Form.',
        facts: [
          { label: 'Adresse', value: 'Bahnhofstraße 9, 72116 Mössingen' },
          { label: 'Saalfläche', value: '95 m² · offener Grundriss' },
          { label: 'Boden', value: 'Schwingender Tanzboden' },
          { label: 'Anfahrt', value: '2 Min. vom Bahnhof Mössingen' },
          { label: 'Parken', value: 'Parkhaus Löwenstein · 3 Min.' },
        ],
        photos: [
          {
            src: '/assets/images/about/spaces/hero-1.jpg',
            alt: 'Tanzkurs im Studio Mössingen',
            caption: 'Mittendrin im Kurs',
          },
          {
            src: '/assets/images/about/spaces/hero-2.jpg',
            alt: 'Tänzerinnen in Bewegung',
            caption: 'In Bewegung',
          },
          {
            src: '/assets/images/about/spaces/10412796-zugang.jpg',
            alt: 'Barrierefreier Eingang',
            caption: 'Barrierefreier Eingang',
          },
        ],
      },
    ],
    accessibilityTitle: 'Für alle da – barrierefrei & zugänglich',
    accessibilityFeatures: [
      { icon: 'entrance', label: 'Ebenerdiger, barrierefreier Zugang' },
      { icon: 'sanitary', label: 'Barrierefreie Sanitärräume' },
      { icon: 'atmosphere', label: 'Reizarme, ruhige Atmosphäre' },
      { icon: 'floor', label: 'Schwingender Tanzboden' },
      { icon: 'assistance', label: 'Begleitung & Assistenz möglich' },
      { icon: 'transit', label: 'Gut mit ÖPNV erreichbar, Parkplätze vor Ort' },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TESTIMONIALS DATA — rendered with the shared dance-style "voices" design
  // ───────────────────────────────────────────────────────────────────────────

  readonly testimonialsData = signal<TestimonialsData>({
    headline: 'Stimmen aus dem Studio',
    accentColor: '--color-brand',
    testimonials: [
      {
        id: '1',
        quote:
          'Zum ersten Mal in meinem Leben hatte ich beim Tanzen keine Angst, etwas falsch zu machen. Hier darf ich einfach ich sein.',
        author: 'Miriam K.',
        context: 'Teilnehmerin Ausdruckstanz',
      },
      {
        id: '2',
        quote:
          'Die Stunde ist mein Moment in der Woche, in dem ich ganz bei mir bin. Daniela schafft eine Wärme, die man selten findet.',
        author: 'Sabine R.',
        context: 'Teilnehmerin Mütter-Programm',
      },
      {
        id: '3',
        quote:
          'Mein Sohn wird hier so angenommen, wie er ist. Zu sehen, wie er beim Tanzen aufblüht, bedeutet mir unglaublich viel.',
        author: 'Familie Berger',
        context: 'Accessible Dance',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // FAQ DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly faqData = signal<FaqSectionData>({
    sectionTitle: 'Häufige Fragen',
    subtitle: 'Alles, was du vor deinem ersten Besuch wissen möchtest.',
    items: [
      {
        question: 'Brauche ich Vorerfahrung im Tanzen?',
        answer:
          'Nein. Unsere Kurse sind für alle offen – ganz gleich, ob du noch nie getanzt hast oder schon Erfahrung mitbringst. Es geht nicht um Technik, sondern um Freude an der Bewegung.',
      },
      {
        question: 'Was soll ich anziehen?',
        answer:
          'Bequeme Kleidung, in der du dich frei bewegen kannst, und rutschfeste Socken oder Gymnastikschuhe. Mehr brauchst du nicht.',
      },
      {
        question: 'Kann ich eine Probestunde besuchen?',
        answer:
          'Ja, sehr gerne. Bei den meisten Kursen kannst du unverbindlich zum Schnuppern vorbeikommen. Melde dich einfach vorab kurz bei uns.',
      },
      {
        question: 'Ist das Studio barrierefrei?',
        answer:
          'Ja. Unser Studio hat einen ebenerdigen, barrierefreien Zugang und barrierefreie Sanitärräume. Für viele Kurse ist auch eine Begleitung oder Assistenz möglich – sprich uns gerne an.',
      },
      {
        question: 'Kann ich jederzeit einsteigen?',
        answer:
          'In den meisten laufenden Kursen ist ein Einstieg jederzeit möglich. Bei Kursen mit festem Aufbau beraten wir dich gerne zum passenden Startzeitpunkt.',
      },
      {
        question: 'Wie melde ich mich an?',
        answer:
          'Am einfachsten über unser Kontaktformular oder telefonisch. Wir melden uns zeitnah zurück und finden gemeinsam den passenden Kurs für dich.',
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CONTACT DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly contactData = signal<ContactSectionData>({
    headline: 'Kontakt aufnehmen',
    subheadline:
      'Hast du Fragen oder möchtest du mehr über unsere Kurse erfahren? Wir freuen uns auf deine Nachricht!',
    address: {
      street: 'Tanzmoment Straße 1',
      city: 'Mössingen',
      postalCode: '72116',
    },
    email: 'tanzmoment@web.de',
    phone: '+49 123 4567890',
    ctaText: 'Zum Kontaktformular',
    ctaLink: '/kontakt',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // DANCE STYLES DATA (routes are already in DEFAULT_DANCE_STYLES)
  // ───────────────────────────────────────────────────────────────────────────

  readonly danceStyles = signal<DanceStyleCardData[]>(DEFAULT_DANCE_STYLES);
}

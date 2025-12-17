import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DanceStylesSectionComponent,
  DanceStyleCardData,
  DEFAULT_DANCE_STYLES,
  HeaderComponent,
  FooterComponent,
} from '@tanzmoment/shared/ui';

import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { MissionVisionSectionComponent } from './sections/mission-vision-section/mission-vision-section.component';
import { ContactSectionComponent } from './sections/contact-section/contact-section.component';
import { AboutHeroData } from './sections/hero-section/hero-section.types';
import { MissionVisionData } from './sections/mission-vision-section/mission-vision-section.types';
import { ContactSectionData } from './sections/contact-section/contact-section.types';

@Component({
  selector: 'tm-about-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    HeroSectionComponent,
    MissionVisionSectionComponent,
    ContactSectionComponent,
    DanceStylesSectionComponent,
  ],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent {
  // ───────────────────────────────────────────────────────────────────────────
  // HERO DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly heroData = signal<AboutHeroData>({
    portraitImage: '/assets/images/about/portrait-placeholder.jpg',
    name: 'Daniela Savasta',
    title: 'Tanzpädagogin & Gründerin von Tanzmoment',
    quote:
      'Tanz ist für mich mehr als Bewegung – er ist Ausdruck, Verbindung und Freiheit.',
    description:
      'Mit über 20 Jahren Erfahrung in der Tanzpädagogik habe ich Tanzmoment gegründet, um einen Raum zu schaffen, in dem jeder Mensch die Freude am Tanzen entdecken kann – unabhängig von Alter, Erfahrung oder körperlichen Voraussetzungen.',
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
    ctaText: 'Schreib uns eine Nachricht',
    ctaLink: 'mailto:tanzmoment@web.de',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // DANCE STYLES DATA (routes are already in DEFAULT_DANCE_STYLES)
  // ───────────────────────────────────────────────────────────────────────────

  readonly danceStyles = signal<DanceStyleCardData[]>(DEFAULT_DANCE_STYLES);
}

import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaveDividerComponent } from '@tanzmoment/shared/ui';

import { ContactFormComponent } from '../contact-form/contact-form.component';
import { ContactInfoComponent } from '../contact-info/contact-info.component';
import { ContactMapComponent } from '../contact-map/contact-map.component';
import { ContactDirectionsComponent } from '../contact-directions/contact-directions.component';
import { ContactInfo } from '../contact-info/contact-info.types';
import { DirectionsInfo } from '../contact-directions/contact-directions.types';

@Component({
  selector: 'tm-contact-page',
  standalone: true,
  imports: [
    CommonModule,
    ContactFormComponent,
    ContactInfoComponent,
    ContactMapComponent,
    ContactDirectionsComponent,
    WaveDividerComponent,
  ],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPageComponent {
  // ───────────────────────────────────────────────────────────────────────────
  // CONTACT INFO DATA
  // ───────────────────────────────────────────────────────────────────────────

  readonly contactInfo = signal<ContactInfo>({
    address: {
      street: 'Tanzmoment Straße 1',
      city: 'Mössingen',
      postalCode: '72116',
    },
    phone: '+49 123 4567890',
    email: 'tanzmoment@web.de',
    openingHours: [
      { days: 'Mo - Fr', hours: '10:00 - 20:00' },
      { days: 'Sa', hours: '10:00 - 16:00' },
      { days: 'So', hours: 'Geschlossen' },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // MAP COORDINATES (Mössingen)
  // ───────────────────────────────────────────────────────────────────────────

  readonly mapCoordinates = signal({
    lat: 48.4047,
    lng: 9.0567,
    zoom: 15,
  });

  // ───────────────────────────────────────────────────────────────────────────
  // DIRECTIONS DATA (Mock)
  // ───────────────────────────────────────────────────────────────────────────

  readonly directionsInfo = signal<DirectionsInfo>({
    parking: {
      available: true,
      description:
        'Kostenlose Parkplätze stehen direkt vor dem Studio zur Verfügung.',
      details: [
        '10 Parkplätze direkt am Gebäude',
        'Weitere Parkmöglichkeiten in der Seitenstraße',
        'Behindertenparkplätze vorhanden',
      ],
    },
    publicTransport: {
      description: 'Das Studio ist gut mit öffentlichen Verkehrsmitteln erreichbar.',
      connections: [
        {
          type: 'bus',
          line: '828',
          stop: 'Mössingen Bahnhof',
          walkingTime: '5 Min',
        },
        {
          type: 'bus',
          line: '7606',
          stop: 'Tanzmoment Straße',
          walkingTime: '2 Min',
        },
        {
          type: 'train',
          line: 'RB 61',
          stop: 'Mössingen Bf',
          walkingTime: '8 Min',
        },
      ],
    },
    accessibility: {
      wheelchairAccessible: true,
      description:
        'Unser Studio ist vollständig barrierefrei zugänglich.',
      features: [
        'Ebenerdiger Eingang',
        'Aufzug zu allen Etagen',
        'Barrierefreie Toiletten',
        'Breite Türen und Flure',
        'Induktive Höranlage im Empfangsbereich',
      ],
    },
    additionalInfo:
      'Bei Fragen zur Anfahrt oder besonderen Bedürfnissen kontaktiere uns gerne vorab. Wir helfen dir gerne weiter!',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // FORM SUBMISSION HANDLER
  // ───────────────────────────────────────────────────────────────────────────

  onFormSubmitted(success: boolean): void {
    if (success) {
      // Optional: Scroll to top or show additional feedback
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactInfo } from './contact-info.types';

@Component({
  selector: 'tm-contact-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-info.component.html',
  styleUrl: './contact-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfoComponent {
  @Input({ required: true }) contactInfo!: ContactInfo;

  /**
   * Format phone number for tel: link
   */
  get phoneLink(): string {
    return `tel:${this.contactInfo.phone.replace(/\s/g, '')}`;
  }

  /**
   * Format email for mailto: link
   */
  get emailLink(): string {
    return `mailto:${this.contactInfo.email}`;
  }

  /**
   * Format full address
   */
  get fullAddress(): string {
    const { street, postalCode, city } = this.contactInfo.address;
    return `${street}, ${postalCode} ${city}`;
  }
}

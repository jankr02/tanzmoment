import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@tanzmoment/shared/ui';
import { ContactSectionData } from './contact-section.types';

@Component({
  selector: 'tm-contact-section',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSectionComponent {
  @Input({ required: true }) data!: ContactSectionData;

  get mailtoLink(): string {
    return `mailto:${this.data.email}`;
  }

  get formattedAddress(): string {
    return `${this.data.address.street}, ${this.data.address.postalCode} ${this.data.address.city}`;
  }
}

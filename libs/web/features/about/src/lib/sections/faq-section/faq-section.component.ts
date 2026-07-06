import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@tanzmoment/shared/ui';
import { FaqSectionData } from './faq-section.types';

@Component({
  selector: 'tm-faq-section',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './faq-section.component.html',
  styleUrl: './faq-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqSectionComponent {
  @Input({ required: true }) data!: FaqSectionData;
}

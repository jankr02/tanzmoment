import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaveDividerComponent } from '@tanzmoment/shared/ui';
import { BenefitsData } from './benefits-section.types';

@Component({
  selector: 'tm-kids-benefits-section',
  standalone: true,
  imports: [CommonModule, WaveDividerComponent],
  templateUrl: './benefits-section.component.html',
  styleUrl: './benefits-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefitsSectionComponent {
  @Input({ required: true }) data!: BenefitsData;
}

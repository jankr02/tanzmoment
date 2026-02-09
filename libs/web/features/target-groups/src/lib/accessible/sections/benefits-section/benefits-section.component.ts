import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BenefitsData } from './benefits-section.types';

@Component({
  selector: 'tm-accessible-benefits-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './benefits-section.component.html',
  styleUrl: './benefits-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefitsSectionComponent {
  @Input({ required: true }) data!: BenefitsData;
}

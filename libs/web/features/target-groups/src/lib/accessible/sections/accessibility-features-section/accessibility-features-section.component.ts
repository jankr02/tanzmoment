import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityFeaturesSectionData } from './accessibility-features-section.types';

@Component({
  selector: 'tm-accessibility-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-features-section.component.html',
  styleUrl: './accessibility-features-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityFeaturesSectionComponent {
  @Input({ required: true }) data!: AccessibilityFeaturesSectionData;
}

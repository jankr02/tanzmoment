import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroSectionData } from './intro-section.types';

/**
 * Landing Page Introduction Section Component
 *
 * Displays a minimalist welcome/intro section with headline and multiple paragraphs.
 * Positioned between the Hero Gallery and Feature Navigation sections.
 */
@Component({
  selector: 'tm-landing-intro-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-section.component.html',
  styleUrl: './intro-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingIntroSectionComponent {
  /**
   * Introduction section data containing headline and paragraphs
   */
  @Input({ required: true }) data!: IntroSectionData;
}

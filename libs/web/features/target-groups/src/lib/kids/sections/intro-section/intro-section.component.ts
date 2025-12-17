import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroSectionData } from './intro-section.types';

@Component({
  selector: 'tm-kids-intro-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-section.component.html',
  styleUrl: './intro-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroSectionComponent {
  @Input({ required: true }) data!: IntroSectionData;
}

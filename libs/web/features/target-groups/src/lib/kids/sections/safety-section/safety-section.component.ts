import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafetySectionData } from './safety-section.types';

@Component({
  selector: 'tm-safety-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './safety-section.component.html',
  styleUrl: './safety-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SafetySectionComponent {
  @Input({ required: true }) data!: SafetySectionData;
}

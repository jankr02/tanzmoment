import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorySectionData } from './story-section.types';

@Component({
  selector: 'tm-story-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-section.component.html',
  styleUrl: './story-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorySectionComponent {
  @Input({ required: true }) data!: StorySectionData;
}

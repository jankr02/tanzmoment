import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionVisionData } from './mission-vision-section.types';

@Component({
  selector: 'tm-mission-vision-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mission-vision-section.component.html',
  styleUrl: './mission-vision-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionVisionSectionComponent {
  @Input({ required: true }) data!: MissionVisionData;
}

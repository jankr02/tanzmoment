import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@tanzmoment/shared/ui';
import { MissionVisionData } from './mission-vision-section.types';

@Component({
  selector: 'tm-mission-vision-section',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './mission-vision-section.component.html',
  styleUrl: './mission-vision-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionVisionSectionComponent {
  @Input({ required: true }) data!: MissionVisionData;
}

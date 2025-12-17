import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgeGroupsData } from './age-groups-section.types';

@Component({
  selector: 'tm-age-groups-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './age-groups-section.component.html',
  styleUrl: './age-groups-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeGroupsSectionComponent {
  @Input({ required: true }) data!: AgeGroupsData;
}

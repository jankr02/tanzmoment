import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorsSectionData } from './instructors-section.types';

@Component({
  selector: 'tm-instructors-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructors-section.component.html',
  styleUrl: './instructors-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorsSectionComponent {
  @Input({ required: true }) data!: InstructorsSectionData;
}

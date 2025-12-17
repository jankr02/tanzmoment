import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpathySectionData } from './empathy-section.types';

@Component({
  selector: 'tm-empathy-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empathy-section.component.html',
  styleUrl: './empathy-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpathySectionComponent {
  @Input({ required: true }) data!: EmpathySectionData;
}

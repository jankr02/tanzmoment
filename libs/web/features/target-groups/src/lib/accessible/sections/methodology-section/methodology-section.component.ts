import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MethodologyData } from './methodology-section.types';

@Component({
  selector: 'tm-accessible-methodology-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './methodology-section.component.html',
  styleUrl: './methodology-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MethodologySectionComponent {
  @Input({ required: true }) data!: MethodologyData;
}

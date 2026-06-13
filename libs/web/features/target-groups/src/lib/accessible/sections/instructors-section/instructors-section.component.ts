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

  // Hand-drawn organic card outlines (viewBox 0 0 600 360), cycled per card
  private readonly shapePaths: readonly string[] = [
    'M 33.8 14 C 208.48 4.85 391.52 4.85 565.7 14 Q 586 14 586 34.3 C 594.34 126.88 594.34 233.12 586 316.47 Q 586 346 556.47 346 C 391.52 354.76 208.48 354.76 40.73 346 Q 14 346 14 319.27 C 6.82 233.12 6.82 126.88 14 33.8 Q 14 14 33.8 14 Z',
    'M 40.46 14 C 208.48 5.58 391.52 5.58 557.89 14 Q 586 14 586 42.11 C 593.92 126.88 593.92 233.12 586 318.76 Q 586 346 558.76 346 C 391.52 352.03 208.48 352.03 34.17 346 Q 14 346 14 325.83 C 1.98 233.12 1.98 126.88 14 40.46 Q 14 14 40.46 14 Z',
    'M 41.11 14 C 208.48 5.23 391.52 5.23 564.28 14 Q 586 14 586 35.72 C 595.74 126.88 595.74 233.12 586 324.92 Q 586 346 564.92 346 C 391.52 353.17 208.48 353.17 40.03 346 Q 14 346 14 319.97 C 4.89 233.12 4.89 126.88 14 41.11 Q 14 14 41.11 14 Z',
  ];

  // Wide organic banner outline (viewBox 0 0 1200 180) for the certification note
  readonly bannerPath =
    'M 43.98 11 C 411.52 5.73 788.48 5.73 1164.05 11 Q 1189 11 1189 35.95 C 1196.67 64.72 1196.67 115.28 1189 132.13 Q 1189 169 1152.13 169 C 788.48 175.15 411.52 175.15 41.04 169 Q 11 169 11 138.96 C 6.34 115.28 6.34 64.72 11 43.98 Q 11 11 43.98 11 Z';

  shapePath(index: number): string {
    return this.shapePaths[index % this.shapePaths.length];
  }

  iconVar(path: string): string {
    return `url('${path}')`;
  }
}

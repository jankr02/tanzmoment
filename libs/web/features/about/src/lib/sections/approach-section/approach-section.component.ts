import {
  Component,
  Input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApproachSectionData } from './approach-section.types';

@Component({
  selector: 'tm-approach-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approach-section.component.html',
  styleUrl: './approach-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproachSectionComponent {
  @Input({ required: true }) data!: ApproachSectionData;

  /** Index of the active phase; steps up to this index count as "reached". */
  readonly active = signal(0);

  select(index: number): void {
    this.active.set(index);
  }
}

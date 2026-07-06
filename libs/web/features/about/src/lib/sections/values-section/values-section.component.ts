import {
  Component,
  Input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValuesSectionData } from './values-section.types';

@Component({
  selector: 'tm-values-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './values-section.component.html',
  styleUrl: './values-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValuesSectionComponent {
  @Input({ required: true }) data!: ValuesSectionData;

  /** Index of the currently open band, or -1 when all are collapsed. */
  readonly openIndex = signal(0);

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? -1 : index));
  }
}

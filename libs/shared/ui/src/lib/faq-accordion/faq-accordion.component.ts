import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqData } from './faq-accordion.types';

@Component({
  selector: 'ui-faq-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-accordion.component.html',
  styleUrl: './faq-accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqAccordionComponent {
  @Input({ required: true }) data!: FaqData;

  openItemId = signal<string | null>(null);

  toggleItem(id: string): void {
    this.openItemId.set(this.openItemId() === id ? null : id);
  }

  isOpen(id: string): boolean {
    return this.openItemId() === id;
  }
}

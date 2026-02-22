// ============================================================================
// FAQ SECTION
// ============================================================================
// Accordion-style FAQ with expand/collapse behavior.
// Uses <dl>/<dt>/<dd> semantics for question-answer pairs.
// Single-open: only one item expanded at a time.
// ============================================================================

import {
  Component,
  Input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@tanzmoment/shared/ui';

import {
  CourseDetailData,
  CourseDetailFaqContent,
  FaqItem,
} from '../../types/course-detail.types';

@Component({
  selector: 'app-faq-section',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './faq-section.component.html',
  styleUrl: './faq-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqSectionComponent {
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailFaqContent;

  // ─── State ──────────────────────────────────────────────────────────────

  readonly openIndex = signal<number | null>(null);

  // ─── Resolved Values ────────────────────────────────────────────────────

  get headline(): string {
    return this.content?.headline ?? 'Häufige Fragen';
  }

  get items(): FaqItem[] {
    return this.content?.items ?? [];
  }

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  toHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p>$1</p>');
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}

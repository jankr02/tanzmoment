// ============================================================================
// COURSE DESCRIPTION SECTION
// ============================================================================
// Detailed course description with markdown support,
// feature highlights, and optional target audience block.
// ============================================================================

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CourseDetailData,
  CourseDetailDescriptionContent,
} from '../../types/course-detail.types';
import { CourseHighlight } from '@tanzmoment/shared/types';

@Component({
  selector: 'app-course-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-description.component.html',
  styleUrl: './course-description.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDescriptionComponent {
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailDescriptionContent;

  // ─── Resolved Values ────────────────────────────────────────────────────

  get headline(): string {
    return this.content?.headline ?? 'About this course';
  }

  /**
   * Body text: CMS override or course description.
   * Simple markdown conversion (bold, paragraphs).
   */
  get bodyHtml(): string {
    const raw = this.content?.body ?? this.course.description;
    return this.simpleMarkdownToHtml(raw);
  }

  get targetAudience(): { headline: string; body: string } | null {
    if (!this.content?.targetAudience?.body) return null;
    return {
      headline: this.content.targetAudience.headline ?? 'Who is this course for?',
      body: this.simpleMarkdownToHtml(this.content.targetAudience.body),
    };
  }

  get highlights(): CourseHighlight[] {
    return this.content?.highlights ?? [];
  }

  get hasHighlights(): boolean {
    return this.highlights.length > 0;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  /**
   * Simple markdown to HTML conversion.
   * Supports: **bold**, paragraphs (\n\n), line breaks (\n).
   *
   * For more complex markdown: add marked.js as dependency.
   */
  private simpleMarkdownToHtml(text: string): string {
    if (!text) return '';

    return text
      // Bold: **text** → <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Paragraphs: Double line break
      .replace(/\n\n/g, '</p><p>')
      // Simple line break
      .replace(/\n/g, '<br>')
      // Wrap in paragraph
      .replace(/^(.+)$/, '<p>$1</p>');
  }
}

// ============================================================================
// COURSE DESCRIPTION SECTION
// ============================================================================
// Detailed course description with markdown support,
// feature highlights, and optional target audience block.
// Supports a split layout (text + atmospheric image) when imageUrl is provided.
// ============================================================================

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DecorativeBlobComponent } from '@tanzmoment/shared/ui';
import {
  CourseDetailData,
  CourseDetailDescriptionContent,
} from '../../types/course-detail.types';
import { CourseHighlight } from '@tanzmoment/shared/types';

@Component({
  selector: 'app-course-description',
  standalone: true,
  imports: [CommonModule, DecorativeBlobComponent],
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
   * Body text. The CMS override is stored as rich HTML (rendered as-is via
   * Angular's auto-sanitizing [innerHTML]); the plain course description
   * fallback still goes through the lightweight markdown conversion.
   */
  get bodyHtml(): string {
    if (this.content?.body) return this.content.body;
    return this.simpleMarkdownToHtml(this.course.description);
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

  get imageUrl(): string | null {
    return this.content?.imageUrl ?? null;
  }

  get imageAlt(): string {
    return this.content?.imageAlt ?? `${this.course.title} – Atmosphere`;
  }

  get imagePosition(): 'left' | 'right' {
    return this.content?.imagePosition ?? 'right';
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  /**
   * Simple markdown to HTML conversion.
   * Supports: **bold**, paragraphs (\n\n), line breaks (\n).
   */
  private simpleMarkdownToHtml(text: string): string {
    if (!text) return '';

    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p>$1</p>');
  }
}

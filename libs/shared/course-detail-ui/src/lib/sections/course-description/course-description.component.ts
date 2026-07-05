// ============================================================================
// COURSE DESCRIPTION SECTION
// ============================================================================
// Editorial, target-group-tinted content block for the course detail page.
// Header → lead/body → "what you learn" callout → wavy divider →
// "who is this for" → highlights panel with a target-group watermark.
// Accent colour is driven by the course's danceStyle.
// ============================================================================

import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CourseDetailData,
  CourseDetailDescriptionContent,
} from '../../types/course-detail.types';
import { CourseHighlight } from '@tanzmoment/shared/types';

type TargetGroup = 'accessible' | 'mothers' | 'kids' | 'expressive';

interface AccentTheme {
  accent: string;
  accentDark: string;
  illustration: string;
}

/**
 * Finalized target-group palette from the design handoff. These are the
 * section's editorial accents and intentionally differ from the page-level
 * dance-style theme (e.g. accessible reads green here, not the page's blue).
 * Kept as a TS map — mirroring COURSE_DETAIL_THEMES — and exposed as host CSS
 * custom properties so the SCSS derives every tint via color-mix().
 */
const ACCENT_THEMES: Record<TargetGroup, AccentTheme> = {
  accessible: {
    accent: '#7a8d5b',
    accentDark: '#5a6b42',
    illustration: 'accessible.svg',
  },
  mothers: {
    accent: '#e5a54f',
    accentDark: '#c9862f',
    illustration: 'mother.svg',
  },
  kids: {
    accent: '#9fb27f',
    accentDark: '#849668',
    illustration: 'kids.svg',
  },
  expressive: {
    accent: '#d98f68',
    accentDark: '#c1734c',
    illustration: 'expressive.svg',
  },
};

const ILLUSTRATION_BASE = '/assets/illustrations/dance-styles/';

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

  // ─── Target-group Accent (host CSS vars) ─────────────────────────────────

  private get accentTheme(): AccentTheme {
    const style = this.course?.danceStyle as TargetGroup;
    return ACCENT_THEMES[style] ?? ACCENT_THEMES['expressive'];
  }

  @HostBinding('style.--tm-accent')
  get accent(): string {
    return this.accentTheme.accent;
  }

  @HostBinding('style.--tm-accent-dark')
  get accentDark(): string {
    return this.accentTheme.accentDark;
  }

  // ─── Resolved Values ────────────────────────────────────────────────────

  /** H2 — the course name, optionally overridden via the CMS headline. */
  get title(): string {
    return this.content?.headline || this.course.title;
  }

  /** Emphasized lead paragraph (optional). */
  get leadHtml(): string | null {
    const raw = this.content?.lead;
    return raw?.trim() ? this.toHtml(raw) : null;
  }

  /**
   * Body text (the course description). Rich HTML from the editor is rendered
   * as-is via Angular's auto-sanitizing [innerHTML]; legacy plain/markdown text
   * still goes through the lightweight markdown conversion.
   */
  get bodyHtml(): string | null {
    const raw = this.content?.body ?? this.course.description ?? '';
    return raw.trim() ? this.toHtml(raw) : null;
  }

  /** "What you learn" callout text (callout hidden when empty). */
  get whatYouLearn(): string | null {
    const raw = this.content?.whatYouLearn;
    return raw?.trim() ? raw : null;
  }

  get targetAudience(): { headline: string; body: string } | null {
    if (!this.content?.targetAudience?.body) return null;
    return {
      headline: this.content.targetAudience.headline ?? 'Für wen ist der Kurs?',
      body: this.simpleMarkdownToHtml(this.content.targetAudience.body),
    };
  }

  get highlights(): CourseHighlight[] {
    return this.content?.highlights ?? [];
  }

  get hasHighlights(): boolean {
    return this.highlights.length > 0;
  }

  get showWatermark(): boolean {
    return this.content?.showWatermark ?? true;
  }

  get watermarkUrl(): string {
    return `${ILLUSTRATION_BASE}${this.accentTheme.illustration}`;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private toHtml(raw: string): string {
    return this.looksLikeHtml(raw) ? raw : this.simpleMarkdownToHtml(raw);
  }

  private looksLikeHtml(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text);
  }

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

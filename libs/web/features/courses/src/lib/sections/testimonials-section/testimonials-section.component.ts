// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================
// Social proof card grid with quotes, star ratings, and author info.
// Builds trust through real participant experiences.
// ============================================================================

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '@tanzmoment/shared/ui';

import {
  CourseDetailData,
  CourseDetailSocialProofContent,
  Testimonial,
} from '../../types/course-detail.types';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './testimonials-section.component.html',
  styleUrl: './testimonials-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsSectionComponent {
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailSocialProofContent;

  // ─── Resolved Values ────────────────────────────────────────────────────

  get headline(): string {
    return this.content?.headline ?? 'Das sagen Teilnehmende';
  }

  get testimonials(): Testimonial[] {
    return this.content?.testimonials ?? [];
  }

  get hasTestimonials(): boolean {
    return this.testimonials.length > 0;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStars(rating: number | undefined): { filled: boolean }[] {
    const r = Math.min(5, Math.max(1, rating ?? 5));
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < r }));
  }
}

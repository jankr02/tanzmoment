// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================
// Social proof for the course detail page. Renders the shared "voices" design
// (ui-testimonial-section) used on the dance-style pages, driven by the course's
// editable socialProof content. Accent follows the active dance-style theme.
// ============================================================================

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import {
  TestimonialSectionComponent,
  TestimonialsData,
} from '@tanzmoment/shared/ui';

import {
  CourseDetailData,
  CourseDetailSocialProofContent,
} from '../../types/course-detail.types';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [TestimonialSectionComponent],
  templateUrl: './testimonials-section.component.html',
  styleUrl: './testimonials-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsSectionComponent {
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailSocialProofContent;

  /** Maps the course socialProof content onto the shared voices data model. */
  get data(): TestimonialsData {
    return {
      headline: this.content?.headline ?? 'Das sagen Teilnehmende',
      accentColor: '--detail-button-bg',
      testimonials: (this.content?.testimonials ?? []).map((t, i) => ({
        id: `voice-${i}`,
        quote: t.text,
        author: t.authorName,
        context: t.authorRole,
        imageUrl: t.imageUrl,
      })),
    };
  }
}

import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CourseDetailContent,
  CourseHighlight,
  CourseFlowStep,
  Testimonial,
  FaqItem,
} from '@tanzmoment/shared/types';

interface SectionState {
  highlights: boolean;
  courseFlow: boolean;
  testimonials: boolean;
  faq: boolean;
}

@Component({
  selector: 'admin-step-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-content.component.html',
  styleUrls: [
    './step-basics.component.scss',
    './step-content.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepContentComponent implements OnInit {
  @Input() detailContent: CourseDetailContent = {};
  @Output() readonly detailContentChanged = new EventEmitter<CourseDetailContent>();

  readonly expandedSections = signal<SectionState>({
    highlights: true,
    courseFlow: true,
    testimonials: true,
    faq: true,
  });

  highlights: CourseHighlight[] = [];
  courseFlowSteps: CourseFlowStep[] = [];
  testimonials: Testimonial[] = [];
  faqItems: FaqItem[] = [];

  ngOnInit(): void {
    this.highlights = (this.detailContent.description?.highlights ?? []).map(h => ({ ...h }));
    this.courseFlowSteps = (this.detailContent.courseFlow?.steps ?? []).map(s => ({ ...s }));
    this.testimonials = (this.detailContent.socialProof?.testimonials ?? []).map(t => ({ ...t }));
    this.faqItems = (this.detailContent.faq?.items ?? []).map(f => ({ ...f }));
  }

  toggleSection(key: keyof SectionState): void {
    this.expandedSections.update(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  // ─── Highlights ──────────────────────────────────────────────────────────

  addHighlight(): void {
    this.highlights = [...this.highlights, { text: '' }];
  }

  removeHighlight(index: number): void {
    this.highlights = this.highlights.filter((_, i) => i !== index);
    this.emitChange();
  }

  onHighlightChange(): void {
    this.emitChange();
  }

  // ─── Course Flow ─────────────────────────────────────────────────────────

  addCourseFlowStep(): void {
    this.courseFlowSteps = [
      ...this.courseFlowSteps,
      { phase: '', duration: '', description: '' },
    ];
  }

  removeCourseFlowStep(index: number): void {
    this.courseFlowSteps = this.courseFlowSteps.filter((_, i) => i !== index);
    this.emitChange();
  }

  onCourseFlowChange(): void {
    this.emitChange();
  }

  // ─── Testimonials ────────────────────────────────────────────────────────

  addTestimonial(): void {
    this.testimonials = [
      ...this.testimonials,
      { text: '', authorName: '', rating: 5 },
    ];
  }

  removeTestimonial(index: number): void {
    this.testimonials = this.testimonials.filter((_, i) => i !== index);
    this.emitChange();
  }

  onTestimonialChange(): void {
    this.emitChange();
  }

  // ─── FAQ ─────────────────────────────────────────────────────────────────

  addFaqItem(): void {
    this.faqItems = [...this.faqItems, { question: '', answer: '' }];
  }

  removeFaqItem(index: number): void {
    this.faqItems = this.faqItems.filter((_, i) => i !== index);
    this.emitChange();
  }

  onFaqChange(): void {
    this.emitChange();
  }

  // ─── Emit ────────────────────────────────────────────────────────────────

  private emitChange(): void {
    const content: CourseDetailContent = {
      ...this.detailContent,
      description: {
        ...this.detailContent.description,
        highlights: this.highlights.filter(h => h.text.trim()),
      },
      courseFlow: {
        ...this.detailContent.courseFlow,
        steps: this.courseFlowSteps.filter(
          s => s.phase.trim() || s.description.trim(),
        ),
      },
      socialProof: {
        ...this.detailContent.socialProof,
        testimonials: this.testimonials.filter(
          t => t.text.trim() && t.authorName.trim(),
        ),
      },
      faq: {
        ...this.detailContent.faq,
        items: this.faqItems.filter(
          f => f.question.trim() && f.answer.trim(),
        ),
      },
    };

    this.detailContentChanged.emit(content);
  }
}

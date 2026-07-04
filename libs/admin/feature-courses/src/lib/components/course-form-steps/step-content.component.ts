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
  CustomFact,
  QuickFactType,
  Testimonial,
  FaqItem,
} from '@tanzmoment/shared/types';
import { AdminSession } from '@tanzmoment/admin/data-access';
import { ImageUploadFieldComponent } from '../image-upload-field/image-upload-field.component';

interface SectionState {
  hero: boolean;
  quickFacts: boolean;
  description: boolean;
  targetAudience: boolean;
  highlights: boolean;
  courseFlow: boolean;
  instructor: boolean;
  schedule: boolean;
  testimonials: boolean;
  faq: boolean;
  booking: boolean;
}

@Component({
  selector: 'admin-step-content',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadFieldComponent],
  templateUrl: './step-content.component.html',
  styleUrls: [
    './step-basics.component.scss',
    './step-content.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepContentComponent implements OnInit {
  @Input() detailContent: CourseDetailContent = {};
  @Input() sessions: AdminSession[] = [];
  @Output() readonly detailContentChanged = new EventEmitter<CourseDetailContent>();

  readonly expandedSections = signal<SectionState>({
    hero: false,
    quickFacts: false,
    description: false,
    targetAudience: false,
    highlights: true,
    courseFlow: true,
    instructor: false,
    schedule: false,
    testimonials: true,
    faq: true,
    booking: false,
  });

  /** Standard quick facts in their default order. */
  readonly allFactTypes: QuickFactType[] = [
    'price',
    'duration',
    'level',
    'location',
    'nextDate',
    'spotsAvailable',
    'maxParticipants',
  ];

  readonly factLabels: Record<QuickFactType, string> = {
    price: 'Preis',
    duration: 'Dauer',
    level: 'Level',
    location: 'Ort',
    nextDate: 'Nächster Termin',
    spotsAvailable: 'Freie Plätze',
    maxParticipants: 'Max. Teilnehmer',
  };

  // ─── Hero ──────────────────────────────────────────────────────────────────
  heroHeadlineOverride = '';
  heroSubHeadline = '';
  heroImageUrl = '';
  heroTextColorOverride = '';

  // ─── Quick Facts ───────────────────────────────────────────────────────────
  factOrder: QuickFactType[] = [];
  hiddenFacts: QuickFactType[] = [];
  customFacts: CustomFact[] = [];

  // ─── Description ───────────────────────────────────────────────────────────
  descriptionHeadline = '';
  descriptionImageUrl = '';
  descriptionImageAlt = '';
  descriptionImagePosition: 'left' | 'right' = 'right';
  targetAudienceHeadline = '';
  targetAudienceBody = '';
  highlights: CourseHighlight[] = [];

  // ─── Course Flow ───────────────────────────────────────────────────────────
  courseFlowHeadline = '';
  courseFlowIntro = '';
  courseFlowSteps: CourseFlowStep[] = [];

  // ─── Instructor ────────────────────────────────────────────────────────────
  instructorBioOverride = '';
  instructorQuote = '';
  instructorQualifications: string[] = [];
  instructorImageOverride = '';

  // ─── Schedule ──────────────────────────────────────────────────────────────
  scheduleHeadline = '';
  scheduleInfoText = '';
  sessionLabels: Record<string, string> = {};

  // ─── Social Proof ──────────────────────────────────────────────────────────
  socialProofHeadline = '';
  testimonials: Testimonial[] = [];

  // ─── FAQ ───────────────────────────────────────────────────────────────────
  faqHeadline = '';
  faqItems: FaqItem[] = [];

  // ─── Booking ───────────────────────────────────────────────────────────────
  bookingCtaText = '';
  bookingPriceNote = '';
  bookingNotice = '';
  bookingIncludes: string[] = [];

  ngOnInit(): void {
    const c = this.detailContent;

    this.heroHeadlineOverride = c.hero?.headlineOverride ?? '';
    this.heroSubHeadline = c.hero?.subHeadline ?? '';
    this.heroImageUrl = c.hero?.imageUrl ?? '';
    this.heroTextColorOverride = c.hero?.textColorOverride ?? '';

    this.customFacts = (c.quickFacts?.customFacts ?? []).map(f => ({ ...f }));
    this.hiddenFacts = [...(c.quickFacts?.hiddenFacts ?? [])];
    this.factOrder = this.normalizeFactOrder(c.quickFacts?.factOrder);

    this.descriptionHeadline = c.description?.headline ?? '';
    this.descriptionImageUrl = c.description?.imageUrl ?? '';
    this.descriptionImageAlt = c.description?.imageAlt ?? '';
    this.descriptionImagePosition = c.description?.imagePosition ?? 'right';
    this.targetAudienceHeadline = c.description?.targetAudience?.headline ?? '';
    this.targetAudienceBody = c.description?.targetAudience?.body ?? '';
    this.highlights = (c.description?.highlights ?? []).map(h => ({ ...h }));

    this.courseFlowHeadline = c.courseFlow?.headline ?? '';
    this.courseFlowIntro = c.courseFlow?.intro ?? '';
    this.courseFlowSteps = (c.courseFlow?.steps ?? []).map(s => ({ ...s }));

    this.instructorBioOverride = c.instructor?.bioOverride ?? '';
    this.instructorQuote = c.instructor?.quote ?? '';
    this.instructorQualifications = [...(c.instructor?.qualifications ?? [])];
    this.instructorImageOverride = c.instructor?.imageOverride ?? '';

    this.scheduleHeadline = c.schedule?.headline ?? '';
    this.scheduleInfoText = c.schedule?.infoText ?? '';
    this.sessionLabels = { ...(c.schedule?.sessionLabels ?? {}) };

    this.socialProofHeadline = c.socialProof?.headline ?? '';
    this.testimonials = (c.socialProof?.testimonials ?? []).map(t => ({ ...t }));

    this.faqHeadline = c.faq?.headline ?? '';
    this.faqItems = (c.faq?.items ?? []).map(f => ({ ...f }));

    this.bookingCtaText = c.booking?.ctaText ?? '';
    this.bookingPriceNote = c.booking?.priceNote ?? '';
    this.bookingNotice = c.booking?.notice ?? '';
    this.bookingIncludes = [...(c.booking?.includes ?? [])];
  }

  /** Ensures every standard fact type appears exactly once, honoring a saved order. */
  private normalizeFactOrder(saved?: QuickFactType[]): QuickFactType[] {
    const order = (saved ?? []).filter(t => this.allFactTypes.includes(t));
    for (const type of this.allFactTypes) {
      if (!order.includes(type)) order.push(type);
    }
    return order;
  }

  toggleSection(key: keyof SectionState): void {
    this.expandedSections.update(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  onFieldChange(): void {
    this.emitChange();
  }

  // ─── Quick Facts ───────────────────────────────────────────────────────────

  isFactVisible(type: QuickFactType): boolean {
    return !this.hiddenFacts.includes(type);
  }

  toggleFactVisibility(type: QuickFactType): void {
    this.hiddenFacts = this.hiddenFacts.includes(type)
      ? this.hiddenFacts.filter(t => t !== type)
      : [...this.hiddenFacts, type];
    this.emitChange();
  }

  moveFact(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.factOrder.length) return;
    const next = [...this.factOrder];
    [next[index], next[target]] = [next[target], next[index]];
    this.factOrder = next;
    this.emitChange();
  }

  addCustomFact(): void {
    this.customFacts = [...this.customFacts, { icon: '', label: '', value: '' }];
  }

  removeCustomFact(index: number): void {
    this.customFacts = this.customFacts.filter((_, i) => i !== index);
    this.emitChange();
  }

  // ─── Highlights ────────────────────────────────────────────────────────────

  addHighlight(): void {
    this.highlights = [...this.highlights, { text: '' }];
  }

  removeHighlight(index: number): void {
    this.highlights = this.highlights.filter((_, i) => i !== index);
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

  // ─── Instructor ────────────────────────────────────────────────────────────

  addQualification(): void {
    this.instructorQualifications = [...this.instructorQualifications, ''];
  }

  removeQualification(index: number): void {
    this.instructorQualifications = this.instructorQualifications.filter(
      (_, i) => i !== index,
    );
    this.emitChange();
  }

  onInstructorImageChange(url: string): void {
    this.instructorImageOverride = url;
    this.emitChange();
  }

  // ─── Schedule ──────────────────────────────────────────────────────────────

  onSessionLabelChange(sessionId: string, label: string): void {
    this.sessionLabels = { ...this.sessionLabels, [sessionId]: label };
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

  onTestimonialImageChange(index: number, url: string): void {
    this.testimonials = this.testimonials.map((t, i) =>
      i === index ? { ...t, imageUrl: url } : t,
    );
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

  // ─── Booking ───────────────────────────────────────────────────────────────

  addInclude(): void {
    this.bookingIncludes = [...this.bookingIncludes, ''];
  }

  removeInclude(index: number): void {
    this.bookingIncludes = this.bookingIncludes.filter((_, i) => i !== index);
    this.emitChange();
  }

  // ─── Image fields ────────────────────────────────────────────────────────

  onHeroImageChange(url: string): void {
    this.heroImageUrl = url;
    this.emitChange();
  }

  onDescriptionImageChange(url: string): void {
    this.descriptionImageUrl = url;
    this.emitChange();
  }

  // ─── Emit ────────────────────────────────────────────────────────────────

  private clean(value: string): string | undefined {
    return value.trim() || undefined;
  }

  private nonEmpty<T extends object>(obj: T): T | undefined {
    const hasValue = Object.values(obj).some(v =>
      Array.isArray(v)
        ? v.length > 0
        : v !== undefined && v !== null && v !== '',
    );
    return hasValue ? obj : undefined;
  }

  private emitChange(): void {
    const content: CourseDetailContent = { ...this.detailContent };

    content.hero = this.nonEmpty({
      ...this.detailContent.hero,
      headlineOverride: this.clean(this.heroHeadlineOverride),
      subHeadline: this.clean(this.heroSubHeadline),
      imageUrl: this.clean(this.heroImageUrl),
      textColorOverride: this.clean(this.heroTextColorOverride),
    });

    const customFacts = this.customFacts
      .filter(f => f.label.trim() && f.value.trim())
      .map(f => ({
        icon: f.icon?.trim() ?? '',
        label: f.label.trim(),
        value: f.value.trim(),
      }));
    const orderChanged = this.factOrder.some(
      (t, i) => t !== this.allFactTypes[i],
    );
    content.quickFacts = this.nonEmpty({
      ...this.detailContent.quickFacts,
      customFacts: customFacts.length ? customFacts : undefined,
      hiddenFacts: this.hiddenFacts.length ? [...this.hiddenFacts] : undefined,
      factOrder: orderChanged ? [...this.factOrder] : undefined,
    });

    const targetAudience = this.targetAudienceBody.trim()
      ? {
          headline: this.clean(this.targetAudienceHeadline),
          body: this.targetAudienceBody.trim(),
        }
      : undefined;
    content.description = this.nonEmpty({
      ...this.detailContent.description,
      headline: this.clean(this.descriptionHeadline),
      imageUrl: this.clean(this.descriptionImageUrl),
      imageAlt: this.clean(this.descriptionImageAlt),
      imagePosition: this.descriptionImageUrl.trim()
        ? this.descriptionImagePosition
        : undefined,
      targetAudience,
      highlights: this.highlights.filter(h => h.text.trim()),
    });

    content.courseFlow = this.nonEmpty({
      ...this.detailContent.courseFlow,
      headline: this.clean(this.courseFlowHeadline),
      intro: this.clean(this.courseFlowIntro),
      steps: this.courseFlowSteps
        .filter(s => s.phase.trim() || s.description.trim())
        .map(s => ({ ...s, icon: s.icon?.trim() || undefined })),
    });

    const qualifications = this.instructorQualifications
      .map(q => q.trim())
      .filter(Boolean);
    content.instructor = this.nonEmpty({
      ...this.detailContent.instructor,
      bioOverride: this.clean(this.instructorBioOverride),
      quote: this.clean(this.instructorQuote),
      qualifications: qualifications.length ? qualifications : undefined,
      imageOverride: this.clean(this.instructorImageOverride),
    });

    const knownSessionIds = new Set(this.sessions.map(s => s.id));
    const sessionLabels: Record<string, string> = {};
    for (const [id, label] of Object.entries(this.sessionLabels)) {
      // Skip labels of sessions that were deleted meanwhile to avoid dead keys.
      if (label?.trim() && knownSessionIds.has(id)) sessionLabels[id] = label.trim();
    }
    content.schedule = this.nonEmpty({
      ...this.detailContent.schedule,
      headline: this.clean(this.scheduleHeadline),
      infoText: this.clean(this.scheduleInfoText),
      sessionLabels: Object.keys(sessionLabels).length
        ? sessionLabels
        : undefined,
    });

    content.socialProof = this.nonEmpty({
      ...this.detailContent.socialProof,
      headline: this.clean(this.socialProofHeadline),
      testimonials: this.testimonials
        .filter(t => t.text.trim() && t.authorName.trim())
        .map(t => ({ ...t, imageUrl: t.imageUrl?.trim() || undefined })),
    });

    content.faq = this.nonEmpty({
      ...this.detailContent.faq,
      headline: this.clean(this.faqHeadline),
      items: this.faqItems.filter(f => f.question.trim() && f.answer.trim()),
    });

    const includes = this.bookingIncludes.map(i => i.trim()).filter(Boolean);
    content.booking = this.nonEmpty({
      ...this.detailContent.booking,
      ctaText: this.clean(this.bookingCtaText),
      priceNote: this.clean(this.bookingPriceNote),
      notice: this.clean(this.bookingNotice),
      includes: includes.length ? includes : undefined,
    });

    this.detailContentChanged.emit(content);
  }
}

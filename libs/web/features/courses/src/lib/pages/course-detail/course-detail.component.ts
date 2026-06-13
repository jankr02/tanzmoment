// ============================================================================
// COURSE DETAIL PAGE COMPONENT
// ============================================================================
// Orchestrator for the course detail page (most important conversion page).
// - Loads course data via CourseDetailService
// - Sets dance style theme as CSS Custom Properties
// - Renders all section components
// - Manages loading/error states
// - Sets SEO meta tags
// ============================================================================

import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  computed,
  effect,
  ChangeDetectionStrategy,
  HostBinding,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { CourseDetailService } from '../../services/course-detail.service';
import { SeoService } from '@tanzmoment/shared/services';

// Types
import {
  CourseDetailTheme,
  COURSE_DETAIL_THEMES,
  CourseDetailContent,
} from '../../types/course-detail.types';

// Sections
import { DetailHeroComponent } from '../../sections/detail-hero/detail-hero.component';
import { QuickFactsComponent } from '../../sections/quick-facts/quick-facts.component';
import { CourseDescriptionComponent } from '../../sections/course-description/course-description.component';
import { CourseFlowComponent } from '../../sections/course-flow/course-flow.component';
import { TestimonialsSectionComponent } from '../../sections/testimonials-section/testimonials-section.component';
import { InstructorSectionComponent } from '../../sections/instructor-section/instructor-section.component';
import { ScheduleSectionComponent } from '../../sections/schedule-section/schedule-section.component';
import { FaqSectionComponent } from '../../sections/faq-section/faq-section.component';
import { StickyBookingBarComponent } from '../../sections/sticky-booking-bar/sticky-booking-bar.component';

// Shared UI
import { ButtonComponent, ScrollRevealDirective, BookingModalComponent } from '@tanzmoment/shared/ui';

// Booking Feature
import { BookingFormComponent, BookingStore } from '@tanzmoment/web/features/booking';
import { CreateBookingApiResponse } from '@tanzmoment/shared/types';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ScrollRevealDirective,
    DetailHeroComponent,
    QuickFactsComponent,
    CourseDescriptionComponent,
    CourseFlowComponent,
    TestimonialsSectionComponent,
    InstructorSectionComponent,
    ScheduleSectionComponent,
    FaqSectionComponent,
    StickyBookingBarComponent,
    BookingModalComponent,
    BookingFormComponent,
  ],
  providers: [BookingStore],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  // ─── Services ───────────────────────────────────────────────────────────
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly ngZone = inject(NgZone);
  private readonly courseDetailService = inject(CourseDetailService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  readonly bookingStore = inject(BookingStore);

  // ─── State (delegated to Service) ───────────────────────────────────────
  readonly course = this.courseDetailService.course;
  readonly loading = this.courseDetailService.loading;
  readonly error = this.courseDetailService.error;

  // ─── Computed ───────────────────────────────────────────────────────────

  /** Active theme based on danceStyle with default fallback */
  readonly currentTheme = computed<CourseDetailTheme>(() => {
    const c = this.course();
    if (!c) return COURSE_DETAIL_THEMES['default'];
    const style = c.danceStyle as keyof typeof COURSE_DETAIL_THEMES;
    return COURSE_DETAIL_THEMES[style] ?? COURSE_DETAIL_THEMES['default'];
  });

  /** CMS detailContent with empty object fallback */
  readonly detailContent = computed<CourseDetailContent>(() => {
    return (this.course()?.detailContent ?? {}) as CourseDetailContent;
  });

  /** Instructor data */
  readonly instructor = computed(() => this.course()?.instructor);

  /** Session list */
  readonly sessions = computed(() => this.course()?.sessions ?? []);

  // ─── Section Visibility ────────────────────────────────────────────────
  // Used to compute correct wave divider colors between optional sections.

  readonly hasCourseFlow = computed(
    () => !!(this.detailContent().courseFlow?.steps?.length),
  );

  readonly hasTestimonials = computed(
    () => !!(this.detailContent().socialProof?.testimonials?.length),
  );

  readonly hasFaq = computed(
    () => !!(this.detailContent().faq?.items?.length),
  );

  // ─── Dynamic Wave Colors ──────────────────────────────────────────────
  // Each wave transitions from the section above (fill) to section below (div bg).
  // When optional sections are skipped, the "section above" changes.

  /** Testimonials wave: show only when CourseFlow is above (themed → white) */
  readonly showTestimonialsWave = this.hasCourseFlow;

  /** Instructor wave: show only when section above is white */
  readonly showInstructorWave = computed(() => {
    if (this.hasTestimonials()) return true;
    return !this.hasCourseFlow();
  });

  /** Fill color for the Instructor wave (section above) */
  readonly instructorWaveFill = computed(() => {
    // Section above Instructor is always white when wave is shown
    return 'var(--color-surface)';
  });

  /** Need a wave before Schedule when Instructor is missing and last section is themed */
  readonly needsPreScheduleWave = computed(() => {
    if (this.instructor()) return false;
    if (this.hasTestimonials()) return false;
    return this.hasCourseFlow();
  });

  /** Error type for template logic */
  readonly isNotFound = computed(() => this.error() === 'NOT_FOUND');

  // ─── Theme Host Binding ─────────────────────────────────────────────────
  // Sets CSS Custom Properties on the host element.
  // All sections read only --detail-* variables.

  @HostBinding('style')
  get themeStyles(): Record<string, string> {
    const theme = this.currentTheme();
    return {
      '--detail-bg': theme.background,
      '--detail-accent': theme.accent,
      '--detail-button-bg': theme.buttonBg,
      '--detail-button-text': theme.buttonText,
      '--detail-text': theme.text,
      '--detail-text-secondary': theme.textSecondary,
      '--detail-border': theme.border,
      '--detail-shadow': theme.shadowColor,
      '--detail-wave-fill': theme.waveFill,
    };
  }

  // Keeps the footer wave's top colour in sync with the last section so there
  // is no white gap. The FAQ section is themed; the fallback (schedule) is white.
  private readonly lastSectionBgEffect = effect(() => {
    if (!isPlatformBrowser(this.platformId)) return;

    const root = this.document.documentElement;
    if (this.hasFaq()) {
      root.style.setProperty('--last-section-bg', this.currentTheme().background);
    } else {
      root.style.removeProperty('--last-section-bg');
    }
  });

  private readonly seoEffect = effect(() => {
    const c = this.course();
    if (!c) return;

    this.seo.setMetadata({
      title: c.metaTitle ?? c.title,
      description:
        c.metaDescription ?? c.shortDescription ?? c.catchPhrase ?? undefined,
      url: `/courses/${c.slug}`,
      image: c.ogImageUrl ?? c.imageUrl ?? undefined,
      type: 'article',
    });
  });

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.router.navigate(['/courses']);
      return;
    }

    this.courseDetailService.loadCourse(slug);

    // Scroll to top on page load
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0 });
    }
  }

  ngOnDestroy(): void {
    // Reset state when leaving the page
    this.courseDetailService.reset();

    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.style.removeProperty('--last-section-bg');
    }
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  /**
   * Opens the booking modal and loads sessions for the course.
   */
  openBookingModal(): void {
    const c = this.course();
    if (!c) return;
    this.bookingStore.loadSessions(c.id);
    this.bookingStore.openModal();
  }

  /**
   * Book session — opens booking modal
   */
  onBookSession(_sessionId: string): void {
    this.openBookingModal();
  }

  /**
   * Sticky bar CTA — opens booking modal
   */
  onBookCourse(): void {
    this.openBookingModal();
  }

  onBookingCompleted(response: CreateBookingApiResponse): void {
    this.bookingStore.setBookingResult(response);

    if (response.isWaitlisted) {
      this.router.navigate(['/buchung/warteliste']);
    }
  }

  onBookingError(_message: string): void {
    // Error is displayed inside the form, no extra handling needed
  }
}

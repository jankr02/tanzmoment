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
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

// Services
import { CourseDetailService } from '../../services/course-detail.service';

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
import { ButtonComponent, ScrollRevealDirective } from '@tanzmoment/shared/ui';

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
  ],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  // ─── Services ───────────────────────────────────────────────────────────
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly ngZone = inject(NgZone);
  private readonly courseDetailService = inject(CourseDetailService);
  private readonly platformId = inject(PLATFORM_ID);

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

  // ─── SEO Effect ─────────────────────────────────────────────────────────
  // Sets meta tags when course data loads.

  private readonly seoEffect = effect(() => {
    const c = this.course();
    if (!c) return;

    const title = c.metaTitle ?? `${c.title} | Tanzmoment`;
    const description =
      c.metaDescription ?? c.shortDescription ?? c.catchPhrase ?? '';

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });

    if (c.ogImageUrl ?? c.imageUrl) {
      this.meta.updateTag({
        property: 'og:image',
        content: c.ogImageUrl ?? c.imageUrl!,
      });
    }
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
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  /**
   * Book session — opens booking window (separate feature)
   */
  onBookSession(sessionId: string): void {
    // TODO: Open booking modal/overlay
    // For now: placeholder
    console.log('[CourseDetail] Book session:', sessionId);
  }

  /**
   * Sticky bar CTA — scroll smooth to schedule section
   */
  onBookCourse(): void {
    if (isPlatformBrowser(this.platformId)) {
      const el = document.getElementById('schedule-section');
      if (el) {
        this.ngZone.runOutsideAngular(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  }
}

// ============================================================================
// COURSE DETAIL UI — presentational sections + types
// ============================================================================
// Pure, input-driven section components rendering a course detail page.
// Shared by the public course detail page and the admin course editor canvas.
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & THEME
// ─────────────────────────────────────────────────────────────────────────────

export type {
  CourseDetailData,
  CourseDetailSession,
  CourseDetailInstructor,
  CourseDetailTheme,
} from './lib/types/course-detail.types';
export { COURSE_DETAIL_THEMES } from './lib/types/course-detail.types';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export { DetailHeroComponent } from './lib/sections/detail-hero/detail-hero.component';
export { QuickFactsComponent } from './lib/sections/quick-facts/quick-facts.component';
export { CourseDescriptionComponent } from './lib/sections/course-description/course-description.component';
export { CourseFlowComponent } from './lib/sections/course-flow/course-flow.component';
export { TestimonialsSectionComponent } from './lib/sections/testimonials-section/testimonials-section.component';
export { InstructorSectionComponent } from './lib/sections/instructor-section/instructor-section.component';
export { ScheduleSectionComponent } from './lib/sections/schedule-section/schedule-section.component';
export { FaqSectionComponent } from './lib/sections/faq-section/faq-section.component';
export { StickyBookingBarComponent } from './lib/sections/sticky-booking-bar/sticky-booking-bar.component';

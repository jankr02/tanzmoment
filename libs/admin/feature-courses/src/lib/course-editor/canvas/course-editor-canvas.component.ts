import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CourseDetailData,
  CourseDetailTheme,
  COURSE_DETAIL_THEMES,
  DetailHeroComponent,
  QuickFactsComponent,
  CourseDescriptionComponent,
  CourseFlowComponent,
  TestimonialsSectionComponent,
  InstructorSectionComponent,
  ScheduleSectionComponent,
  FaqSectionComponent,
  StickyBookingBarComponent,
} from '@tanzmoment/shared/course-detail-ui';
import { CourseDetailContent } from '@tanzmoment/shared/types';
import { EditableSectionComponent } from '../editors/shared/editable-section.component';

/**
 * Renders the shared course-detail section components in the exact order and
 * wave-divider logic of the public course detail page, but driven by live
 * editor state instead of an HTTP response. Read-only: no booking behaviour.
 */
@Component({
  selector: 'admin-course-editor-canvas',
  standalone: true,
  imports: [
    CommonModule,
    DetailHeroComponent,
    QuickFactsComponent,
    CourseDescriptionComponent,
    CourseFlowComponent,
    TestimonialsSectionComponent,
    InstructorSectionComponent,
    ScheduleSectionComponent,
    FaqSectionComponent,
    StickyBookingBarComponent,
    EditableSectionComponent,
  ],
  templateUrl: './course-editor-canvas.component.html',
  styleUrl: './course-editor-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseEditorCanvasComponent {
  readonly course = input.required<CourseDetailData>();
  readonly activeSection = input<string | null>(null);
  readonly editSection = output<string>();

  readonly detailContent = computed<CourseDetailContent>(
    () => this.course().detailContent ?? {},
  );

  readonly instructor = computed(() => this.course().instructor);
  readonly sessions = computed(() => this.course().sessions ?? []);

  readonly currentTheme = computed<CourseDetailTheme>(() => {
    const style = this.course()
      .danceStyle as keyof typeof COURSE_DETAIL_THEMES;
    return COURSE_DETAIL_THEMES[style] ?? COURSE_DETAIL_THEMES['default'];
  });

  readonly hasCourseFlow = computed(
    () => !!this.detailContent().courseFlow?.steps?.length,
  );
  readonly hasTestimonials = computed(
    () => !!this.detailContent().socialProof?.testimonials?.length,
  );

  readonly showTestimonialsWave = this.hasCourseFlow;

  readonly showInstructorWave = computed(() => {
    if (this.hasTestimonials()) return true;
    return !this.hasCourseFlow();
  });

  readonly needsPreScheduleWave = computed(() => {
    if (this.instructor()) return false;
    if (this.hasTestimonials()) return false;
    return this.hasCourseFlow();
  });

  @HostBinding('style')
  get themeStyles(): Record<string, string> {
    const theme = this.currentTheme();
    return {
      '--detail-bg': theme.background,
      '--detail-section-bg': 'var(--color-neutral-extra-light)',
      '--detail-accent': theme.accent,
      '--detail-button-bg': theme.buttonBg,
      '--detail-button-text': theme.buttonText,
      '--detail-text': 'var(--color-text-primary)',
      '--detail-text-secondary': 'var(--color-text-secondary)',
      '--detail-border': theme.border,
      '--detail-shadow': theme.shadowColor,
    };
  }
}

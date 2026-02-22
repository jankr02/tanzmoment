// ============================================================================
// COURSE FLOW SECTION
// ============================================================================
// Vertical timeline/stepper showing what a typical session looks like.
// Steps with numbered markers, connecting line, phase/duration/description.
// ============================================================================

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@tanzmoment/shared/ui';

import {
  CourseDetailData,
  CourseDetailCourseFlowContent,
  CourseFlowStep,
} from '../../types/course-detail.types';

@Component({
  selector: 'app-course-flow',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './course-flow.component.html',
  styleUrl: './course-flow.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFlowComponent {
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailCourseFlowContent;

  // ─── Resolved Values ────────────────────────────────────────────────────

  get headline(): string {
    return this.content?.headline ?? 'So läuft eine Stunde ab';
  }

  get intro(): string | undefined {
    return this.content?.intro;
  }

  get steps(): CourseFlowStep[] {
    return this.content?.steps ?? [];
  }

  get hasSteps(): boolean {
    return this.steps.length > 0;
  }
}

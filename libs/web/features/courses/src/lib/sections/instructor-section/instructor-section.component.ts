// ============================================================================
// INSTRUCTOR SECTION
// ============================================================================
// Trust-building section: portrait, bio, qualifications, personal quote.
// CMS overrides allow course-specific bio and qualifications.
// ============================================================================

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CourseDetailInstructor,
  CourseDetailInstructorContent,
} from '../../types/course-detail.types';

@Component({
  selector: 'app-instructor-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-section.component.html',
  styleUrl: './instructor-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorSectionComponent {
  @Input({ required: true }) instructor!: CourseDetailInstructor;
  @Input() content?: CourseDetailInstructorContent;

  // ─── Resolved Values ────────────────────────────────────────────────────

  get fullName(): string {
    return `${this.instructor.firstName} ${this.instructor.lastName}`;
  }

  get bio(): string {
    return this.content?.bioOverride ?? this.instructor.bio ?? '';
  }

  get imageUrl(): string {
    return (
      this.content?.imageOverride ??
      this.instructor.imageUrl ??
      '/assets/images/placeholder-instructor.jpg'
    );
  }

  get quote(): string | undefined {
    return this.content?.quote;
  }

  get qualifications(): string[] {
    return this.content?.qualifications ?? this.instructor.expertise ?? [];
  }

  get hasQualifications(): boolean {
    return this.qualifications.length > 0;
  }
}

// ============================================================================
// INSTRUCTOR SECTION
// ============================================================================
// Poster-style instructor card: organic portrait, name, role, personal quote
// and photo credit. Purely presentational, self-contained warm palette
// (not dance-style themed). CMS overrides drive the content.
// ============================================================================

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
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

  /** Kicker chip label overlapping the portrait. */
  readonly kicker = 'Deine Kursleiterin';

  // ─── Resolved Values ────────────────────────────────────────────────────

  get fullName(): string {
    return `${this.instructor.firstName} ${this.instructor.lastName}`;
  }

  get role(): string | undefined {
    return this.content?.role ?? this.instructor.expertise?.[0];
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

  get photoCredit(): string | undefined {
    return this.content?.photoCredit;
  }
}

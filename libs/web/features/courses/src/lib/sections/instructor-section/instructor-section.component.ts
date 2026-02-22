import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailInstructor, CourseDetailInstructorContent } from '../../types/course-detail.types';

@Component({
  selector: 'app-instructor-section',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Instructor Section — Placeholder</div>`,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorSectionComponent {
  @Input() instructor!: CourseDetailInstructor;
  @Input() content?: CourseDetailInstructorContent;
}

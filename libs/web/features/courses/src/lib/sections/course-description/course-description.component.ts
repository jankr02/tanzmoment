import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailData, CourseDetailDescriptionContent } from '../../types/course-detail.types';

@Component({
  selector: 'app-course-description',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Course Description Section — Placeholder</div>`,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDescriptionComponent {
  @Input() course!: CourseDetailData;
  @Input() content?: CourseDetailDescriptionContent;
}

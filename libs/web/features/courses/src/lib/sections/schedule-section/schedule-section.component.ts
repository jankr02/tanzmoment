import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailData, CourseDetailSession, CourseDetailScheduleContent } from '../../types/course-detail.types';

@Component({
  selector: 'app-schedule-section',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Schedule Section — Placeholder</div>`,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleSectionComponent {
  @Input() course!: CourseDetailData;
  @Input() sessions!: CourseDetailSession[];
  @Input() content?: CourseDetailScheduleContent;
  @Output() bookSession = new EventEmitter<string>();
}

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailData, CourseDetailQuickFactsContent } from '../../types/course-detail.types';

@Component({
  selector: 'app-quick-facts',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Quick Facts Section — Placeholder</div>`,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickFactsComponent {
  @Input() course!: CourseDetailData;
  @Input() content?: CourseDetailQuickFactsContent;
}

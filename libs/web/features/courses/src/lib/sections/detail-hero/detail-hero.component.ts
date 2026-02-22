import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailData, CourseDetailHeroContent } from '../../types/course-detail.types';

@Component({
  selector: 'app-detail-hero',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Hero Section — Placeholder</div>`,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailHeroComponent {
  @Input() course!: CourseDetailData;
  @Input() content?: CourseDetailHeroContent;
}

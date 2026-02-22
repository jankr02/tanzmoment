import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailData, CourseDetailBookingContent } from '../../types/course-detail.types';

@Component({
  selector: 'app-sticky-booking-bar',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Sticky Booking Bar — Placeholder</div>`,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickyBookingBarComponent {
  @Input() course!: CourseDetailData;
  @Input() content?: CourseDetailBookingContent;
  @Output() bookClick = new EventEmitter<void>();
}

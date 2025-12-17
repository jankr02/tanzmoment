import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsData } from './testimonial-section.types';

@Component({
  selector: 'ui-testimonial-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-section.component.html',
  styleUrl: './testimonial-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialSectionComponent {
  @Input({ required: true }) data!: TestimonialsData;
}

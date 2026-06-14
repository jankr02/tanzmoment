import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  signal,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsData, Testimonial } from './testimonial-section.types';

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

  readonly activeIndex = signal(0);

  private readonly tabRefs =
    viewChildren<ElementRef<HTMLButtonElement>>('tab');

  select(index: number): void {
    this.activeIndex.set(index);
  }

  /** Resolved accent for a voice: its own accent, else the section accent, else brand. */
  accentVar(testimonial: Testimonial): string {
    const token = testimonial.accent ?? this.data.accentColor ?? '--color-brand';
    return `var(${token})`;
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.data.testimonials.length;
    let next = index;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % count;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.select(next);
    this.tabRefs()[next]?.nativeElement.focus();
  }
}

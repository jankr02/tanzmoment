import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { 
  CourseCardData, 
  DANCE_STYLE_COLORS, 
  DANCE_STYLE_ICONS 
} from './course-card.types';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent {
  @Input({ required: true }) course!: CourseCardData;
  @Input() variant: 'list' | 'detail' = 'list';

  @Output() cardClicked = new EventEmitter<string>();
  @Output() registerClicked = new EventEmitter<string>();

  /**
   * Get color scheme for the dance style
   */
  get colorScheme() {
    return DANCE_STYLE_COLORS[this.course.danceStyle] || DANCE_STYLE_COLORS['Contemporary'];
  }

  /**
   * Get icon path for the dance style
   */
  get danceStyleIcon(): string {
    return DANCE_STYLE_ICONS[this.course.danceStyle] || DANCE_STYLE_ICONS['Contemporary'];
  }

  /**
   * Get CSS custom properties for the card
   */
  get cardStyles(): Record<string, string> {
    return {
      '--card-bg-color': this.colorScheme.bg,
      '--card-border-color': this.colorScheme.border,
      '--card-text-color': this.colorScheme.text,
    };
  }

  /**
   * Format price
   */
  get formattedPrice(): string {
    if (this.course.priceFormatted) {
      return this.course.priceFormatted;
    }
    return this.course.price === 0 
      ? 'Kostenlos' 
      : `${this.course.price} €`;
  }

  /**
   * Get CTA button text
   */
  get ctaText(): string {
    return this.course.ctaText || 'Jetzt anmelden';
  }

  /**
   * Handle card click
   */
  onCardClick(): void {
    this.cardClicked.emit(this.course.id);
  }

  /**
   * Handle register button click
   */
  onRegisterClick(event: MouseEvent): void {
    event.stopPropagation();
    this.registerClicked.emit(this.course.id);
  }
}

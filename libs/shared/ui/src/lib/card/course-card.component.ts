import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { CoursePlaceholderComponent } from '../course-placeholder/course-placeholder.component';
import {
  CourseCardData,
  DANCE_STYLE_CARD_LABELS,
  DANCE_STYLE_COLORS,
  DANCE_STYLE_ICONS,
} from './course-card.types';

export type CourseAvailabilityState = 'available' | 'low' | 'sold-out';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CoursePlaceholderComponent],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent {
  @Input({ required: true }) course!: CourseCardData;
  @Input() variant: 'list' | 'detail' = 'list';

  @Output() cardClicked = new EventEmitter<string>();
  @Output() registerClicked = new EventEmitter<string>();

  readonly imageError = signal(false);

  onImageError(): void {
    this.imageError.set(true);
  }

  /**
   * Get color scheme for the dance style
   */
  get colorScheme() {
    return DANCE_STYLE_COLORS[this.course.danceStyle] || DANCE_STYLE_COLORS['expressive'];
  }

  /**
   * Get icon path for the dance style
   */
  get danceStyleIcon(): string {
    return DANCE_STYLE_ICONS[this.course.danceStyle] || DANCE_STYLE_ICONS['expressive'];
  }

  /**
   * Group label for the mobile eyebrow (e.g. "Mama tanzt").
   */
  get groupLabel(): string {
    return DANCE_STYLE_CARD_LABELS[this.course.danceStyle] ?? this.course.danceStyle;
  }

  /**
   * Three-way availability state derived from `availableSpots`.
   * `undefined` is treated as available (we don't have a count).
   */
  get availabilityState(): CourseAvailabilityState {
    const spots = this.course.availableSpots;
    if (spots === 0) return 'sold-out';
    if (spots !== undefined && spots <= 2) return 'low';
    return 'available';
  }

  get isSoldOut(): boolean {
    return this.availabilityState === 'sold-out';
  }

  /**
   * German pill label following the handoff spec.
   */
  get availabilityLabel(): string {
    const spots = this.course.availableSpots;
    if (this.availabilityState === 'sold-out') return 'Ausgebucht';
    if (this.availabilityState === 'low') return `Noch ${spots} frei`;
    return 'Frei';
  }

  /**
   * Get CSS custom properties for the card
   */
  get cardStyles(): Record<string, string> {
    return {
      '--card-bg-color': this.colorScheme.bg,
      '--card-border-color': this.colorScheme.border,
      '--card-accent-color': this.colorScheme.accent,
      '--card-text-color': this.colorScheme.text,
      '--card-text-secondary': this.colorScheme.textSecondary,
      '--card-button-bg': this.colorScheme.buttonBg,
      '--card-shadow-color': this.colorScheme.shadowColor,
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

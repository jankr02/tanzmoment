import { Component, input, output, HostBinding, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelperCardComponent } from '../helper-card/helper-card.component';
import {
  HelperCardData,
  HelperCardClickEvent,
  HELPER_CARDS_DATA,
} from '../helper-card/helper-card.types';

/**
 * Helper Section Component
 *
 * Container component that displays all helper cards in a responsive grid.
 * Used in the Course Overview page to provide quick access to:
 * - Course Plan / Schedule
 * - Contact / Message
 * - Newsletter signup
 *
 * @example
 * ```html
 * <!-- Basic usage with default cards -->
 * <ui-helper-section
 *   headline="Brauchst du Hilfe?"
 *   subheadline="Wir sind für dich da"
 *   (cardClick)="onHelperClick($event)"
 * />
 *
 * <!-- Custom cards data -->
 * <ui-helper-section
 *   [cards]="customCards"
 *   headline="Deine Optionen"
 * />
 * ```
 *
 * @selector ui-helper-section
 * @standalone true
 */
@Component({
  selector: 'ui-helper-section',
  standalone: true,
  imports: [CommonModule, HelperCardComponent],
  templateUrl: './helper-section.component.html',
  styleUrl: './helper-section.component.scss',
})
export class HelperSectionComponent {
  // ==========================================================================
  // Inputs (Signal-based)
  // ==========================================================================

  /** Section headline */
  readonly headline = input<string>('Noch Fragen?');

  /** Section subheadline (optional) */
  readonly subheadline = input<string | undefined>(undefined);

  /** Helper cards to display (defaults to predefined cards) */
  readonly cards = input<HelperCardData[]>(HELPER_CARDS_DATA);

  /** Use compact card variant (horizontal layout) */
  readonly compact = input<boolean>(false);

  /** Show card subtitles */
  readonly showSubtitles = input<boolean>(true);

  /** Background variant */
  readonly variant = input<'default' | 'muted'>('default');

  // ==========================================================================
  // Outputs
  // ==========================================================================

  /** Emitted when a card with actionType 'action' is clicked */
  readonly cardClick = output<HelperCardClickEvent>();

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

  @HostBinding('class.helper-section') readonly hostClass = true;

  @HostBinding('class.helper-section--muted')
  get isMuted(): boolean {
    return this.variant() === 'muted';
  }

  @HostBinding('class.helper-section--compact')
  get isCompact(): boolean {
    return this.compact();
  }

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  /** Check if subheadline should be displayed */
  readonly hasSubheadline = computed(() => {
    const sub = this.subheadline();
    return sub !== undefined && sub.length > 0;
  });

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  /**
   * Forward card click events
   */
  onCardClick(event: HelperCardClickEvent): void {
    this.cardClick.emit(event);
  }

  // ==========================================================================
  // Template Helpers
  // ==========================================================================

  /**
   * Track cards by ID for ngFor optimization
   */
  trackByCardId(_index: number, card: HelperCardData): string {
    return card.id;
  }
}

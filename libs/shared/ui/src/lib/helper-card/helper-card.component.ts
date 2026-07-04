import {
  Component,
  input,
  output,
  inject,
  HostBinding,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  HelperCardData,
  HelperCardClickEvent,
  HelperActionType,
} from './helper-card.types';

/**
 * Helper Card Component
 *
 * A single "stop" on the helper section's path: a large, slightly rotated
 * hand-drawn illustration with a title, description and an understated CTA link.
 * Supports three action types:
 * - 'route': Internal Angular navigation
 * - 'link': External URL (new tab)
 * - 'action': Custom event emission
 *
 * @example
 * ```html
 * <ui-helper-card
 *   [card]="courseplanCard"
 *   (cardClick)="onCardClick($event)"
 * />
 * ```
 *
 * @selector ui-helper-card
 * @standalone true
 */
@Component({
  selector: 'ui-helper-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './helper-card.component.html',
  styleUrl: './helper-card.component.scss',
})
export class HelperCardComponent {
  // ==========================================================================
  // Dependencies
  // ==========================================================================

  private readonly router = inject(Router);

  // ==========================================================================
  // Inputs (Signal-based)
  // ==========================================================================

  /** Card configuration data */
  readonly card = input.required<HelperCardData>();

  /** Show subtitle below title */
  readonly showSubtitle = input<boolean>(true);

  /** Custom aria-label override */
  readonly ariaLabel = input<string | undefined>(undefined);

  // ==========================================================================
  // Outputs
  // ==========================================================================

  /** Emitted when card with actionType 'action' is clicked */
  readonly cardClick = output<HelperCardClickEvent>();

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

  @HostBinding('class.helper-card') readonly hostClass = true;

  @HostBinding('attr.role') readonly role = 'button';

  @HostBinding('attr.tabindex') readonly tabindex = 0;

  @HostBinding('attr.aria-label')
  get ariaLabelValue(): string {
    const data = this.card();
    return (
      this.ariaLabel() ??
      `${data.title}: ${data.subtitle ?? data.ctaText ?? 'Mehr erfahren'}`
    );
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  @HostListener('click')
  @HostListener('keydown.enter')
  @HostListener('keydown.space', ['$event'])
  onActivate(event?: Event): void {
    // Prevent scroll on space key
    if (event?.type === 'keydown') {
      event.preventDefault();
    }

    const data = this.card();
    this.handleAction(data.actionType, data.target, data.id);
  }

  // ==========================================================================
  // Action Handling
  // ==========================================================================

  /**
   * Handle card action based on type
   */
  private handleAction(
    type: HelperActionType,
    target: string,
    cardId: string
  ): void {
    switch (type) {
      case 'route':
        this.router.navigate([target]);
        break;

      case 'link':
        window.open(target, '_blank', 'noopener,noreferrer');
        break;

      case 'action':
        this.cardClick.emit({
          cardId: cardId as HelperCardClickEvent['cardId'],
          action: target,
        });
        break;
    }
  }

  // ==========================================================================
  // Template Helpers
  // ==========================================================================

  /**
   * Get display text for CTA
   */
  get ctaText(): string {
    const data = this.card();
    return data.ctaText ?? data.title;
  }
}

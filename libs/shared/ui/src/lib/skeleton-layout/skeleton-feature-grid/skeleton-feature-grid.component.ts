import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';
import { SkeletonAnimation, SkeletonVariant } from '../../skeleton/skeleton.types';

/**
 * Skeleton Feature Grid Component
 * 
 * Pre-composed grid of skeleton cards matching the Feature Navigation layout.
 * Displays three skeleton cards in a responsive grid, eliminating the need
 * to manually compose multiple cards.
 * 
 * Structure mirrors feature-navigation__grid:
 * - Responsive grid (1 column mobile, 3 columns tablet+)
 * - Three skeleton cards
 * - Proper spacing and max-width
 * 
 * Features:
 * - One-tag solution for feature navigation skeleton
 * - Configurable number of cards
 * - Inherits all skeleton features
 * - Perfect match to real feature navigation layout
 * 
 * @example
 * ```html
 * <!-- Simple usage (3 cards by default) -->
 * <tm-skeleton-feature-grid></tm-skeleton-feature-grid>
 * 
 * <!-- Custom card count -->
 * <tm-skeleton-feature-grid [cardCount]="4"></tm-skeleton-feature-grid>
 * 
 * <!-- Different animation -->
 * <tm-skeleton-feature-grid animation="pulse"></tm-skeleton-feature-grid>
 * ```
 */
@Component({
  selector: 'tm-skeleton-feature-grid',
  standalone: true,
  imports: [CommonModule, SkeletonCardComponent],
  templateUrl: './skeleton-feature-grid.component.html',
  styleUrl: './skeleton-feature-grid.component.scss',
})
export class SkeletonFeatureGridComponent {
  // ==========================================================================
  // Configuration Inputs
  // ==========================================================================

  /** Number of skeleton cards to display (default: 3) */
  @Input() cardCount = 3;

  /** Animation style for all skeleton cards */
  @Input() animation: SkeletonAnimation = SkeletonAnimation.WAVE;

  /** Visual variant for all skeleton cards */
  @Input() variant: SkeletonVariant = SkeletonVariant.LIGHT;

  /** Show decorative borders on cards (default: true) */
  @Input() showBorders = true;

  /** Accessibility label for the grid */
  @Input() ariaLabel = 'Loading feature cards';

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

  @HostBinding('class.skeleton-feature-grid') readonly hostClass = true;

  @HostBinding('attr.role') readonly role = 'status';

  @HostBinding('attr.aria-label') get ariaLabelBinding(): string {
    return this.ariaLabel;
  }

  @HostBinding('attr.aria-live') readonly ariaLive = 'polite';

  @HostBinding('attr.aria-busy') readonly ariaBusy = 'true';

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Generate array for card count
   */
  get cardArray(): number[] {
    return Array.from({ length: this.cardCount }, (_, i) => i);
  }
}
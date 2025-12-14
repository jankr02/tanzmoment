import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonBoxComponent } from '../skeleton-box/skeleton-box.component';
import { SkeletonAnimation, SkeletonVariant } from '../skeleton.types';

/**
 * Skeleton Text Component
 * 
 * Displays multiple text line placeholders with configurable line count and width.
 * Built on top of SkeletonBox for consistency.
 * 
 * Features:
 * - Configurable number of lines
 * - Last line can have different width (typical text pattern)
 * - Inherits all SkeletonBox features (animation, variants)
 * - Responsive line heights based on design system
 * 
 * @example
 * ```html
 * <!-- Three lines of text, last line 60% width -->
 * <tm-skeleton-text></tm-skeleton-text>
 * 
 * <!-- Custom configuration -->
 * <tm-skeleton-text 
 *   [lines]="5" 
 *   lastLineWidth="40%"
 *   lineHeight="1.8rem"
 *   gap="0.75rem"
 * ></tm-skeleton-text>
 * ```
 */
@Component({
  selector: 'tm-skeleton-text',
  standalone: true,
  imports: [CommonModule, SkeletonBoxComponent],
  templateUrl: './skeleton-text.component.html',
  styleUrl: './skeleton-text.component.scss',
})
export class SkeletonTextComponent {
  // ==========================================================================
  // Configuration Inputs
  // ==========================================================================

  /** Number of text lines to display */
  @Input() lines = 3;

  /** Width of the last line (creates natural text pattern) */
  @Input() lastLineWidth = '60%';

  /** Line height (default matches body text) */
  @Input() lineHeight = '1.5rem';

  /** Gap between lines */
  @Input() gap = 'var(--space-2)';

  /** Animation style (passed to SkeletonBox) */
  @Input() animation: SkeletonAnimation = SkeletonAnimation.WAVE;

  /** Visual variant (passed to SkeletonBox) */
  @Input() variant: SkeletonVariant = SkeletonVariant.LIGHT;

  /** Border radius for each line */
  @Input() borderRadius = 'var(--radius-sm)';

  /** Accessibility label */
  @Input() ariaLabel = 'Loading text content';

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

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
   * Generate array for *ngFor based on lines count
   */
  get lineArray(): number[] {
    return Array.from({ length: this.lines }, (_, i) => i);
  }

  /**
   * Determine if this is the last line
   */
  isLastLine(index: number): boolean {
    return index === this.lines - 1;
  }

  /**
   * Get width for a specific line
   */
  getLineWidth(index: number): string {
    return this.isLastLine(index) ? this.lastLineWidth : '100%';
  }
}
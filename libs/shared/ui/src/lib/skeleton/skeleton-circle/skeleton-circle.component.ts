import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonBoxComponent } from '../skeleton-box/skeleton-box.component';
import { SkeletonAnimation, SkeletonVariant } from '../skeleton.types';

/**
 * Skeleton Circle Component
 * 
 * Circular placeholder for avatars, icons, buttons, or indicators.
 * Built on SkeletonBox with fixed circular border-radius.
 * 
 * Features:
 * - Perfect circle (width === height)
 * - Configurable size
 * - Inherits all SkeletonBox features
 * - Perfect for hero gallery indicators, avatars, icon placeholders
 * 
 * @example
 * ```html
 * <!-- Avatar placeholder -->
 * <tm-skeleton-circle size="48px"></tm-skeleton-circle>
 * 
 * <!-- Small indicator dot -->
 * <tm-skeleton-circle size="12px" animation="pulse"></tm-skeleton-circle>
 * 
 * <!-- Large profile picture -->
 * <tm-skeleton-circle size="120px"></tm-skeleton-circle>
 * ```
 */
@Component({
  selector: 'tm-skeleton-circle',
  standalone: true,
  imports: [CommonModule, SkeletonBoxComponent],
  templateUrl: './skeleton-circle.component.html',
  styleUrl: './skeleton-circle.component.scss',
})
export class SkeletonCircleComponent {
  // ==========================================================================
  // Configuration Inputs
  // ==========================================================================

  /** Size of the circle (width and height) */
  @Input() size = '48px';

  /** Animation style */
  @Input() animation: SkeletonAnimation = SkeletonAnimation.WAVE;

  /** Visual variant */
  @Input() variant: SkeletonVariant = SkeletonVariant.LIGHT;

  /** Accessibility label */
  @Input() ariaLabel = 'Loading icon';

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

  @HostBinding('style.width') get hostWidth(): string {
    return this.size;
  }

  @HostBinding('style.height') get hostHeight(): string {
    return this.size;
  }

  @HostBinding('attr.role') readonly role = 'status';
  
  @HostBinding('attr.aria-label') get ariaLabelBinding(): string {
    return this.ariaLabel;
  }

  @HostBinding('attr.aria-live') readonly ariaLive = 'polite';
  
  @HostBinding('attr.aria-busy') readonly ariaBusy = 'true';

  // ==========================================================================
  // Computed Properties
  // ==========================================================================

  /**
   * Border radius is always 50% for perfect circle
   */
  readonly borderRadius = '50%';
}
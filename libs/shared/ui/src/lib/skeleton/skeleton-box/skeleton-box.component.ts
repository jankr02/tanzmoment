import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonAnimation, SkeletonVariant } from '../skeleton.types';

/**
 * Skeleton Box Component
 * 
 * Universal rectangular placeholder component with configurable dimensions and animation.
 * This is the base primitive used by other skeleton components.
 * 
 * Features:
 * - Configurable width, height, and border-radius
 * - Wave or pulse animation
 * - Light/dark variants matching design system
 * - Accessibility-ready with ARIA attributes
 * - GPU-accelerated animations (transform, opacity)
 * - Respects prefers-reduced-motion
 * 
 * @example
 * ```html
 * <!-- Simple box -->
 * <tm-skeleton-box width="100%" height="200px"></tm-skeleton-box>
 * 
 * <!-- Rounded box with pulse animation -->
 * <tm-skeleton-box 
 *   width="300px" 
 *   height="400px" 
 *   borderRadius="var(--radius-lg)"
 *   animation="pulse"
 * ></tm-skeleton-box>
 * ```
 */
@Component({
  selector: 'tm-skeleton-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-box.component.html',
  styleUrl: './skeleton-box.component.scss',
})
export class SkeletonBoxComponent {
  // ==========================================================================
  // Configuration Inputs
  // ==========================================================================

  /** Width of the box (default: '100%') */
  @Input() width = '100%';

  /** Height of the box (default: '100px') */
  @Input() height = '100px';

  /** Border radius (can use design tokens like 'var(--radius-md)') */
  @Input() borderRadius = 'var(--radius-md)';

  /** Animation style */
  @Input() animation: SkeletonAnimation = SkeletonAnimation.WAVE;

  /** Visual variant */
  @Input() variant: SkeletonVariant = SkeletonVariant.LIGHT;

  /** Accessibility label */
  @Input() ariaLabel = 'Loading content';

  // ==========================================================================
  // Host Bindings for Dynamic Styling
  // ==========================================================================

  @HostBinding('style.width') get hostWidth(): string {
    return this.width;
  }

  @HostBinding('style.height') get hostHeight(): string {
    return this.height;
  }

  @HostBinding('style.border-radius') get hostBorderRadius(): string {
    return this.borderRadius;
  }

  @HostBinding('class.skeleton-box--wave')
  get isWaveAnimation(): boolean {
    return this.animation === SkeletonAnimation.WAVE;
  }

  @HostBinding('class.skeleton-box--pulse')
  get isPulseAnimation(): boolean {
    return this.animation === SkeletonAnimation.PULSE;
  }

  @HostBinding('class.skeleton-box--light')
  get isLightVariant(): boolean {
    return this.variant === SkeletonVariant.LIGHT;
  }

  @HostBinding('class.skeleton-box--dark')
  get isDarkVariant(): boolean {
    return this.variant === SkeletonVariant.DARK;
  }

  @HostBinding('attr.role') readonly role = 'status';
  
  @HostBinding('attr.aria-label') get ariaLabelBinding(): string {
    return this.ariaLabel;
  }

  @HostBinding('attr.aria-live') readonly ariaLive = 'polite';
  
  @HostBinding('attr.aria-busy') readonly ariaBusy = 'true';
}
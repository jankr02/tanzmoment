import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonBoxComponent } from '../skeleton-box/skeleton-box.component';
import { SkeletonAnimation, SkeletonVariant } from '../skeleton.types';

/**
 * Skeleton Image Component
 * 
 * Specialized placeholder for image areas with aspect-ratio support.
 * Prevents layout shift by maintaining proper dimensions before image loads.
 * 
 * Features:
 * - CSS aspect-ratio for maintaining proportions
 * - Configurable dimensions and border-radius
 * - Perfect for hero images, thumbnails, and galleries
 * - Built on SkeletonBox for consistency
 * 
 * @example
 * ```html
 * <!-- Hero image (16:9 ratio) -->
 * <tm-skeleton-image aspectRatio="16/9"></tm-skeleton-image>
 * 
 * <!-- Square thumbnail -->
 * <tm-skeleton-image 
 *   aspectRatio="1/1" 
 *   width="200px"
 *   borderRadius="var(--radius-lg)"
 * ></tm-skeleton-image>
 * 
 * <!-- Custom dimensions without aspect-ratio -->
 * <tm-skeleton-image 
 *   width="300px" 
 *   height="400px"
 * ></tm-skeleton-image>
 * ```
 */
@Component({
  selector: 'tm-skeleton-image',
  standalone: true,
  imports: [CommonModule, SkeletonBoxComponent],
  templateUrl: './skeleton-image.component.html',
  styleUrl: './skeleton-image.component.scss',
})
export class SkeletonImageComponent {
  // ==========================================================================
  // Configuration Inputs
  // ==========================================================================

  /** CSS aspect-ratio (e.g., '16/9', '4/3', '1/1') */
  @Input() aspectRatio?: string;

  /** Width (default: '100%') */
  @Input() width = '100%';

  /** Height (if not using aspect-ratio) */
  @Input() height?: string;

  /** Border radius */
  @Input() borderRadius = 'var(--radius-md)';

  /** Animation style */
  @Input() animation: SkeletonAnimation = SkeletonAnimation.WAVE;

  /** Visual variant */
  @Input() variant: SkeletonVariant = SkeletonVariant.LIGHT;

  /** Accessibility label */
  @Input() ariaLabel = 'Loading image';

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

  @HostBinding('style.width') get hostWidth(): string {
    return this.width;
  }

  @HostBinding('style.aspect-ratio') get hostAspectRatio(): string | undefined {
    return this.aspectRatio;
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
   * Computed height based on whether aspect-ratio is used
   */
  get computedHeight(): string | undefined {
    // If aspect-ratio is set, don't set explicit height
    if (this.aspectRatio) {
      return undefined;
    }
    // Otherwise use provided height or default
    return this.height || '200px';
  }
}
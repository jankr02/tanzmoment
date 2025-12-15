import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SkeletonBoxComponent,
  SkeletonTextComponent,
  SkeletonImageComponent,
  SkeletonCircleComponent,
} from '../../skeleton';
import { SkeletonAnimation, SkeletonVariant } from '../../skeleton/skeleton.types';

/**
 * Skeleton Hero Component
 * 
 * Pre-composed skeleton layout that matches the Hero Gallery structure exactly.
 * This component eliminates the need to manually compose primitives every time
 * you need a hero gallery loading state.
 * 
 * Structure mirrors hero-gallery.component.html:
 * - Fullscreen background image (16:9 aspect-ratio)
 * - Text overlay (top-right) with title and tagline
 * - Navigation buttons (left/right circles)
 * - Slide indicators (bottom center, 5 dots)
 * - Optional quote container
 * - Wave border decoration
 * 
 * Features:
 * - Perfect structural match to real hero gallery
 * - Configurable number of indicator dots
 * - Optional quote skeleton
 * - Inherits all primitive component features (animation, variants)
 * - Responsive behavior matching real component
 * 
 * @example
 * ```html
 * <!-- Simple usage -->
 * <tm-skeleton-hero></tm-skeleton-hero>
 * 
 * <!-- With quote -->
 * <tm-skeleton-hero [showQuote]="true"></tm-skeleton-hero>
 * 
 * <!-- Custom indicators -->
 * <tm-skeleton-hero [indicatorCount]="3"></tm-skeleton-hero>
 * ```
 */
@Component({
  selector: 'tm-skeleton-hero',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonBoxComponent,
    SkeletonTextComponent,
    SkeletonImageComponent,
    SkeletonCircleComponent,
  ],
  templateUrl: './skeleton-hero.component.html',
  styleUrl: './skeleton-hero.component.scss',
})
export class SkeletonHeroComponent {
  // ==========================================================================
  // Configuration Inputs
  // ==========================================================================

  /** Number of slide indicator dots (default: 5) */
  @Input() indicatorCount = 5;

  /** Show quote skeleton below text overlay (default: false) */
  @Input() showQuote = false;

  /** Animation style for all skeletons */
  @Input() animation: SkeletonAnimation = SkeletonAnimation.WAVE;

  /** Visual variant for all skeletons */
  @Input() variant: SkeletonVariant = SkeletonVariant.LIGHT;

  /** Accessibility label for the entire skeleton */
  @Input() ariaLabel = 'Loading hero gallery';

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

  @HostBinding('class.skeleton-hero') readonly hostClass = true;

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
   * Generate array for indicator dots
   */
  get indicatorArray(): number[] {
    return Array.from({ length: this.indicatorCount }, (_, i) => i);
  }
}
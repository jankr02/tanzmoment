import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SkeletonBoxComponent,
  SkeletonTextComponent,
  SkeletonCircleComponent,
} from '../../skeleton';
import { SkeletonAnimation, SkeletonVariant } from '../../skeleton/skeleton.types';

/**
 * Skeleton Card Component
 * 
 * Pre-composed skeleton layout that matches the Feature Navigation Card structure.
 * This component provides a loading state for feature cards without manual composition.
 * 
 * Structure mirrors feature-card:
 * - Illustration container (centered circle placeholder)
 * - Title text (2 lines, centered)
 * - Decorative border at bottom
 * 
 * Features:
 * - Perfect structural match to real feature card
 * - Configurable illustration size
 * - Inherits all primitive component features
 * - Responsive behavior matching real component
 * 
 * @example
 * ```html
 * <!-- Simple usage -->
 * <tm-skeleton-card></tm-skeleton-card>
 * 
 * <!-- Custom illustration size -->
 * <tm-skeleton-card illustrationSize="120px"></tm-skeleton-card>
 * 
 * <!-- Without border decoration -->
 * <tm-skeleton-card [showBorder]="false"></tm-skeleton-card>
 * ```
 */
@Component({
  selector: 'tm-skeleton-card',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonBoxComponent,
    SkeletonTextComponent,
    SkeletonCircleComponent,
  ],
  templateUrl: './skeleton-card.component.html',
  styleUrls: ['./skeleton-card.component.scss'],
})
export class SkeletonCardComponent {
  // ==========================================================================
  // Configuration Inputs
  // ==========================================================================

  /** Size of the illustration circle (default: 120px) */
  @Input() illustrationSize = '120px';

  /** Show decorative border at bottom (default: true) */
  @Input() showBorder = true;

  /** Animation style for all skeletons */
  @Input() animation: SkeletonAnimation = SkeletonAnimation.WAVE;

  /** Visual variant for all skeletons */
  @Input() variant: SkeletonVariant = SkeletonVariant.LIGHT;

  /** Accessibility label for the card */
  @Input() ariaLabel = 'Loading feature card';

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

  @HostBinding('class.skeleton-card') readonly hostClass = true;

  @HostBinding('attr.role') readonly role = 'status';

  @HostBinding('attr.aria-label') get ariaLabelBinding(): string {
    return this.ariaLabel;
  }

  @HostBinding('attr.aria-live') readonly ariaLive = 'polite';

  @HostBinding('attr.aria-busy') readonly ariaBusy = 'true';
}
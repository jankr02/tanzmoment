// ============================================================================
// WAVE DIVIDER COMPONENT (Extended for Landing Page)
// ============================================================================
// A reusable component that creates smooth, organic transitions between
// page sections. Includes special 'hero' mode for positioning within
// image-based sections like hero galleries.
//
// Usage:
// <tm-wave-divider from="background" to="surface" />
// <tm-wave-divider from="transparent" to="neutral" variant="hero" [overlay]="true" />
// ============================================================================

import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';

import {
  SectionBackground,
  WaveVariant,
  WaveHeight,
  WaveDirection,
  WAVE_PATHS,
  resolveBackgroundColor,
} from './wave-divider.types';

@Component({
  selector: 'tm-wave-divider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Wave Divider Structure:
      - Outer container has the "from" color as background
      - SVG wave shape is filled with the "to" color
      - This creates the illusion of one section flowing into another

      When overlay=true (for hero sections):
      - Uses absolute positioning to overlay parent section
      - 'from' color is typically transparent
      - Wave sits at the bottom of the parent container
    -->
    <div
      class="wave-divider"
      [class.wave-divider--sm]="height() === 'sm'"
      [class.wave-divider--md]="height() === 'md'"
      [class.wave-divider--lg]="height() === 'lg'"
      [class.wave-divider--xl]="height() === 'xl'"
      [class.wave-divider--up]="direction() === 'up'"
      [class.wave-divider--shadow]="shadow()"
      [class.wave-divider--overlay]="overlay()"
      [style.--wave-from]="fromColor()"
      [style.--wave-to]="toColor()"
      aria-hidden="true"
      role="presentation"
    >
      <svg
        class="wave-divider__svg"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          class="wave-divider__path"
          [attr.d]="wavePath()"
        />
      </svg>
    </div>
  `,
  styles: [`
    // ==========================================================================
    // WAVE DIVIDER STYLES
    // ==========================================================================
    // The wave creates a smooth transition between two section backgrounds.
    // The container background matches the section ABOVE, while the SVG fill
    // matches the section BELOW, creating a seamless visual flow.
    // ==========================================================================

    :host {
      display: block;
      width: 100%;

      // Prevent any gaps between sections
      margin: 0;
      padding: 0;

      // Remove from document flow calculations
      line-height: 0;
      font-size: 0;
    }

    .wave-divider {
      position: relative;
      width: 100%;

      // Background color of the section ABOVE the wave
      background-color: var(--wave-from);

      // Prevent 1px gaps from subpixel rendering
      margin-top: -1px;
      padding-top: 1px;

      // Ensure wave overlaps properly
      overflow: hidden;

      // Disable pointer events (decorative element)
      pointer-events: none;

      // ────────────────────────────────────────────────────────────────────────
      // SIZE VARIANTS
      // ────────────────────────────────────────────────────────────────────────
      // Heights are set via CSS custom properties for easy responsive adjustment.

      &--sm {
        --wave-height: 60px;

        @media (max-width: 1024px) {
          --wave-height: 50px;
        }

        @media (max-width: 768px) {
          --wave-height: 40px;
        }
      }

      &--md {
        --wave-height: 80px;

        @media (max-width: 1024px) {
          --wave-height: 70px;
        }

        @media (max-width: 768px) {
          --wave-height: 60px;
        }
      }

      &--lg {
        --wave-height: 100px;

        @media (max-width: 1024px) {
          --wave-height: 80px;
        }

        @media (max-width: 768px) {
          --wave-height: 60px;
        }
      }

      &--xl {
        --wave-height: 120px;

        @media (max-width: 1024px) {
          --wave-height: 100px;
        }

        @media (max-width: 768px) {
          --wave-height: 80px;
        }
      }

      // ────────────────────────────────────────────────────────────────────────
      // OVERLAY MODE (for hero sections with image backgrounds)
      // ────────────────────────────────────────────────────────────────────────
      // When overlay=true, the wave is positioned absolutely at the bottom
      // of its parent container, floating over the content below.

      &--overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        margin-top: 0;
        padding-top: 0;
        z-index: 8; // Above hero images, below interactive elements

        // Remove background in overlay mode (transparent by default)
        background-color: transparent;
      }

      // ────────────────────────────────────────────────────────────────────────
      // DIRECTION MODIFIER
      // ────────────────────────────────────────────────────────────────────────
      // Flips the wave vertically for inverted transitions.

      &--up {
        transform: scaleY(-1);
      }

      // ────────────────────────────────────────────────────────────────────────
      // SHADOW MODIFIER
      // ────────────────────────────────────────────────────────────────────────
      // Adds a subtle shadow along the wave edge for depth.

      &--shadow {
        .wave-divider__svg {
          filter: drop-shadow(0 -3px 4px rgba(0, 0, 0, 0.08));
        }
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SVG ELEMENT
    // ──────────────────────────────────────────────────────────────────────────
    // The SVG stretches to fill the container while maintaining the wave shape.

    .wave-divider__svg {
      display: block;
      width: 100%;
      height: var(--wave-height, 80px);

      // Smooth rendering for the curves
      shape-rendering: geometricPrecision;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // WAVE PATH
    // ──────────────────────────────────────────────────────────────────────────
    // The actual wave shape, filled with the color of the section BELOW.

    .wave-divider__path {
      fill: var(--wave-to);

      // Smooth transitions if colors change dynamically
      transition: fill 0.3s ease;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // REDUCED MOTION
    // ──────────────────────────────────────────────────────────────────────────
    // Respects user preference for reduced motion.

    @media (prefers-reduced-motion: reduce) {
      .wave-divider__path {
        transition: none;
      }
    }
  `],
})
export class WaveDividerComponent {
  // ──────────────────────────────────────────────────────────────────────────
  // INPUTS
  // ──────────────────────────────────────────────────────────────────────────
  // All inputs use Angular's new signal-based input() API for better
  // performance and type safety.

  /**
   * Background color of the section ABOVE the wave.
   * This becomes the container's background color.
   * Use 'transparent' for overlay mode on image-based sections.
   */
  readonly from = input.required<SectionBackground | string>();

  /**
   * Background color of the section BELOW the wave.
   * This becomes the SVG wave's fill color.
   */
  readonly to = input.required<SectionBackground | string>();

  /**
   * Wave shape variant. Each creates a different visual feel:
   * - 'default': Classic balanced wave with two peaks
   * - 'gentle': Subtle, low-amplitude for minimal transitions
   * - 'organic': Asymmetric, hand-drawn feeling
   * - 'dynamic': Higher amplitude, more energy
   * - 'hero': Matches the existing landing page hero wave
   */
  readonly variant = input<WaveVariant>('default');

  /**
   * Height of the wave divider:
   * - 'sm': 60px desktop / 40px mobile
   * - 'md': 80px desktop / 60px mobile (default)
   * - 'lg': 100px desktop / 60px mobile
   * - 'xl': 120px desktop / 80px mobile
   */
  readonly height = input<WaveHeight>('md');

  /**
   * Direction of the wave curve:
   * - 'down': Wave curves downward (default, most common)
   * - 'up': Wave curves upward (inverted)
   */
  readonly direction = input<WaveDirection>('down');

  /**
   * Whether to add a subtle shadow along the wave edge.
   * Useful for adding depth when transitioning to lighter backgrounds.
   */
  readonly shadow = input<boolean>(false);

  /**
   * Overlay mode for hero sections with image backgrounds.
   * When true:
   * - Uses absolute positioning at parent's bottom
   * - Ignores 'from' color (becomes transparent)
   * - Wave floats over the parent content
   *
   * The parent section must have `position: relative`.
   */
  readonly overlay = input<boolean>(false);

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Resolves the 'from' background to a CSS color value.
   * In overlay mode, this is always transparent.
   */
  protected readonly fromColor = computed(() => {
    if (this.overlay()) {
      return 'transparent';
    }
    return resolveBackgroundColor(this.from());
  });

  /**
   * Resolves the 'to' background to a CSS color value.
   */
  protected readonly toColor = computed(() =>
    resolveBackgroundColor(this.to())
  );

  /**
   * Gets the SVG path data for the current wave variant.
   */
  protected readonly wavePath = computed(() =>
    WAVE_PATHS[this.variant()] ?? WAVE_PATHS.default
  );
}

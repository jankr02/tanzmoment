// ============================================================================
// WAVE DIVIDER - TYPE DEFINITIONS (Extended for Landing Page)
// ============================================================================
// Defines all types, configurations and presets for the Wave Divider component.
// Extended to support transparent backgrounds for hero sections with images.
// ============================================================================

/**
 * Semantic background tokens that map to CSS custom properties.
 * These represent the most common section backgrounds in the design system.
 *
 * Special values:
 * - 'transparent': Fully transparent (for overlaying image backgrounds)
 * - 'hero-overlay': Semi-transparent dark overlay (for hero-to-content transitions)
 */
export type SectionBackground =
  | 'background'      // --color-background (cream/off-white)
  | 'surface'         // --color-surface (white)
  | 'brand'           // --color-brand (primary green)
  | 'brand-light'     // --color-primary-light
  | 'neutral'         // --color-neutral-xl
  | 'accent'          // --color-accent
  | 'transparent'     // Fully transparent
  | 'hero-overlay';   // Semi-transparent for hero transitions

/**
 * Wave shape variants - each creates a different visual feeling.
 * The SVG paths are carefully crafted to feel organic and hand-drawn.
 */
export type WaveVariant =
  | 'default'    // Classic balanced wave with two peaks
  | 'gentle'     // Subtle, low-amplitude wave for minimal transitions
  | 'organic'    // Asymmetric, more natural-looking wave
  | 'dynamic'    // Higher amplitude, more energetic feel
  | 'hero';      // Special variant matching the existing landing page wave

/**
 * Height presets for different visual weights.
 * Responsive values are applied via CSS.
 */
export type WaveHeight = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Wave direction controls how the wave is rendered.
 * - 'down': Wave curves down (section above flows into section below)
 * - 'up': Wave curves up (inverted, less common)
 */
export type WaveDirection = 'down' | 'up';

/**
 * Configuration object for programmatic wave creation.
 * Useful when waves are generated from a page configuration array.
 */
export interface WaveConfig {
  from: SectionBackground;
  to: SectionBackground;
  variant?: WaveVariant;
  height?: WaveHeight;
  direction?: WaveDirection;
  shadow?: boolean;
}

// ============================================================================
// SVG PATH DEFINITIONS
// ============================================================================
// These paths are designed for a viewBox of "0 0 1440 120".
// The wave fills the bottom portion, leaving the top as the "from" color.
// ============================================================================

/**
 * SVG path data for each wave variant.
 * All paths are designed to:
 * - Start at top-left (0,Y)
 * - Create organic curves across the width
 * - End at bottom-right corner
 * - Fill the entire bottom area
 */
export const WAVE_PATHS: Record<WaveVariant, string> = {
  // Classic wave: Two balanced peaks, symmetric feel
  default: 'M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z',

  // Gentle wave: Low amplitude, subtle transition
  gentle: 'M0,80 C360,100 720,60 1080,80 C1260,90 1380,70 1440,75 L1440,120 L0,120 Z',

  // Organic wave: Asymmetric, hand-drawn feeling
  organic: 'M0,70 C180,40 360,90 540,55 C720,20 900,85 1080,50 C1260,15 1380,60 1440,35 L1440,120 L0,120 Z',

  // Dynamic wave: Higher amplitude, more energy
  dynamic: 'M0,40 C200,100 400,0 600,80 C800,160 1000,20 1200,90 C1350,130 1400,50 1440,70 L1440,120 L0,120 Z',

  // Hero wave: Matches the existing landing page hero wave exactly
  // Original viewBox was 1140x100, scaled to 1440x120 for consistency
  hero: 'M0,58 C365,108 989,0 1440,71 L1440,120 L0,120 Z',
};

// ============================================================================
// HEIGHT CONFIGURATION
// ============================================================================

/**
 * Height values in pixels for each size preset.
 * The component uses CSS custom properties for responsive adjustments.
 */
export const WAVE_HEIGHTS: Record<WaveHeight, { desktop: number; tablet: number; mobile: number }> = {
  sm: { desktop: 60, tablet: 50, mobile: 40 },
  md: { desktop: 80, tablet: 70, mobile: 60 },
  lg: { desktop: 100, tablet: 80, mobile: 60 },
  xl: { desktop: 120, tablet: 100, mobile: 80 },
};

// ============================================================================
// COLOR MAPPING
// ============================================================================

/**
 * Maps semantic background tokens to CSS custom property names.
 * This allows the component to work with both semantic tokens and direct values.
 */
export const BACKGROUND_COLOR_MAP: Record<SectionBackground, string> = {
  background: 'var(--color-background)',
  surface: 'var(--color-surface)',
  brand: 'var(--color-brand)',
  'brand-light': 'var(--color-primary-light)',
  neutral: 'var(--color-neutral-xl)',
  accent: 'var(--color-accent)',
  transparent: 'transparent',
  'hero-overlay': 'rgba(0, 0, 0, 0.05)',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Resolves a SectionBackground token to its CSS value.
 * If the input is already a CSS value (starts with # or var), returns as-is.
 */
export function resolveBackgroundColor(bg: SectionBackground | string): string {
  // Check if it's a known semantic token
  if (bg in BACKGROUND_COLOR_MAP) {
    return BACKGROUND_COLOR_MAP[bg as SectionBackground];
  }
  // Otherwise, assume it's a direct CSS value
  return bg;
}

/**
 * Gets the SVG path for a given wave variant.
 * Falls back to 'default' if variant is unknown.
 */
export function getWavePath(variant: WaveVariant): string {
  return WAVE_PATHS[variant] ?? WAVE_PATHS.default;
}

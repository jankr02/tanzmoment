// ============================================================================
// SKELETON COMPONENT TYPES
// ============================================================================

/**
 * Animation style for skeleton screens
 * 
 * WAVE: Organic, flowing animation (recommended for Tanzmoment brand)
 * PULSE: Subtle breathing effect
 * NONE: Static skeleton (for accessibility/reduced motion)
 */
export enum SkeletonAnimation {
  WAVE = 'wave',
  PULSE = 'pulse',
  NONE = 'none',
}

/**
 * Visual variant affects color scheme
 * 
 * LIGHT: Cream background with subtle shimmer (default)
 * DARK: Darker variant for contrast areas
 */
export enum SkeletonVariant {
  LIGHT = 'light',
  DARK = 'dark',
}

/**
 * Base configuration shared by all skeleton components
 */
export interface SkeletonConfig {
  /** Animation style (default: WAVE) */
  animation?: SkeletonAnimation;
  
  /** Color variant (default: LIGHT) */
  variant?: SkeletonVariant;
  
  /** Accessibility label for screen readers */
  ariaLabel?: string;
}

/**
 * Configuration for skeleton text component
 */
export interface SkeletonTextConfig extends SkeletonConfig {
  /** Number of text lines to display (default: 3) */
  lines?: number;
  
  /** Width of the last line as percentage string (default: '60%') */
  lastLineWidth?: string;
  
  /** Line height in rem or px (default: '1.5rem') */
  lineHeight?: string;
  
  /** Gap between lines (default: '0.5rem') */
  gap?: string;
}

/**
 * Configuration for skeleton image/box component
 */
export interface SkeletonImageConfig extends SkeletonConfig {
  /** CSS aspect-ratio value (e.g., '16/9', '4/3', '1/1') */
  aspectRatio?: string;
  
  /** Border radius using design tokens or custom value */
  borderRadius?: string;
  
  /** Width (default: '100%') */
  width?: string;
  
  /** Height (if not using aspect-ratio) */
  height?: string;
}

/**
 * Configuration for skeleton circle component
 */
export interface SkeletonCircleConfig extends SkeletonConfig {
  /** Size of the circle (width and height) */
  size?: string;
}
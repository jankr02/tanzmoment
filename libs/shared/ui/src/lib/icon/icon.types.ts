// ============================================================================
// ICON REGISTRY TYPES
// ============================================================================

/**
 * Available icon names in the Tanzmoment icon library
 */
export type IconName =
  // Navigation & UI
  | 'calendar'
  | 'heart'
  | 'mail'
  | 'phone'
  | 'map-pin'
  | 'search'
  | 'bell'
  | 'user'
  | 'users'
  | 'settings'
  | 'log-out'
  | 'chevron-down'
  | 'chevron-up'
  | 'x'
  | 'check-circle'
  | 'filter'
  // Social Media
  | 'instagram'
  | 'facebook'
  | 'contemporary'
  | 'modern'
  | 'jazz'
  | 'ballet'
  | 'improvisation'
  | 'ausdruckstanz';

/**
 * Icon size variants
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon color variants (uses CSS custom properties)
 */
export type IconColor = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'text-primary'
  | 'text-secondary'
  | 'current';

/**
 * Icon configuration
 */
export interface IconConfig {
  name: IconName;
  size?: IconSize;
  color?: IconColor;
  className?: string;
  ariaLabel?: string;
}

/**
 * Icon size mapping (in pixels)
 */
export const ICON_SIZES: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Icon color mapping (CSS custom properties)
 */
export const ICON_COLORS: Record<IconColor, string> = {
  primary: 'var(--color-brand)',
  secondary: 'var(--color-secondary)',
  accent: 'var(--color-accent-dark)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  'text-primary': 'var(--color-text-primary)',
  'text-secondary': 'var(--color-text-secondary)',
  current: 'currentColor',
};

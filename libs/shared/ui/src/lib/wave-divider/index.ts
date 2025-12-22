// ============================================================================
// WAVE DIVIDER - PUBLIC API
// ============================================================================
// Barrel export for the Wave Divider component and all related types.
//
// Usage:
// ```typescript
// import {
//   WaveDividerComponent,
//   SectionBackground,
//   WaveVariant,
//   WaveHeight,
//   WaveConfig,
// } from '@tanzmoment/shared/ui';
// ```
// ============================================================================

// Main Component
export { WaveDividerComponent } from './wave-divider.component';

// Types
export type {
  SectionBackground,
  WaveVariant,
  WaveHeight,
  WaveDirection,
  WaveConfig,
} from './wave-divider.types';

// Constants & Utilities
export {
  WAVE_PATHS,
  WAVE_HEIGHTS,
  BACKGROUND_COLOR_MAP,
  resolveBackgroundColor,
  getWavePath,
} from './wave-divider.types';

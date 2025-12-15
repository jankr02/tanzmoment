// ============================================================================
// SPLASH SCREEN TYPES - TYPE DEFINITIONS
// ============================================================================

// Import and re-export types from shared services for convenience
import {
  type PreloadAsset,
  type PreloadResult,
  AssetType,
  PreloadPriority,
  LoadingStatus,
} from '@tanzmoment/shared/services';

export type {
  PreloadAsset,
  PreloadResult,
};

export {
  AssetType,
  PreloadPriority,
  LoadingStatus,
};

/**
 * Visit Tracking for LocalStorage
 * 
 * Tracks whether user has seen the splash screen before to enable
 * smart duration handling (full animation vs. shortened).
 */
export interface SplashScreenVisitData {
  /** Whether user has visited before */
  hasVisited: boolean;
  
  /** Timestamp of first visit (ISO string) */
  firstVisit: string;
  
  /** Timestamp of last visit (ISO string) */
  lastVisit: string;
  
  /** Total number of visits */
  visitCount: number;
}

/**
 * Splash Screen State
 * 
 * Tracks the current state of the splash screen lifecycle,
 * including loading progress and visibility.
 */
export enum SplashScreenState {
  /** Initial state before any loading */
  IDLE = 'IDLE',
  
  /** Currently loading assets */
  LOADING = 'LOADING',
  
  /** All assets loaded successfully */
  LOADED = 'LOADED',
  
  /** Asset loading completed but splash animation still running */
  WAITING = 'WAITING',
  
  /** User clicked skip button */
  SKIPPED = 'SKIPPED',
  
  /** Splash is fading out */
  FADING_OUT = 'FADING_OUT',
  
  /** Splash is completely hidden */
  HIDDEN = 'HIDDEN',
  
  /** Error occurred during loading */
  ERROR = 'ERROR',
}

/**
 * Preload Configuration for Splash Screen
 * 
 * Defines which critical assets should be preloaded during the
 * splash screen animation.
 */
export interface SplashScreenPreloadConfig {
  /** Critical assets to preload (HIGH priority) */
  criticalAssets: import('@tanzmoment/shared/services').PreloadAsset[];
  
  /** Whether to continue if some assets fail */
  continueOnError?: boolean;
  
  /** Minimum display duration in ms (even if loading finishes earlier) */
  minDisplayDuration?: number;
  
  /** Maximum wait time for assets before proceeding (timeout) */
  maxLoadDuration?: number;
}

/**
 * Splash Screen Loading Progress
 * 
 * Real-time progress information for the preloading process,
 * combining both asset loading and animation timing.
 */
export interface SplashScreenProgress {
  /** Current loading state */
  state: SplashScreenState;
  
  /** Total number of assets to load */
  totalAssets: number;
  
  /** Number of successfully loaded assets */
  loadedAssets: number;
  
  /** Number of failed assets */
  failedAssets: number;
  
  /** Overall progress percentage (0-100) */
  percentage: number;
  
  /** Time elapsed since loading started (ms) */
  elapsedTime: number;
  
  /** Estimated time remaining (ms), null if unknown */
  estimatedTimeRemaining: number | null;
  
  /** Whether minimum display duration has been met */
  minDurationMet: boolean;
  
  /** Whether assets are ready (loading complete or timed out) */
  assetsReady: boolean;
}

/**
 * Splash Screen Completion Event
 * 
 * Emitted when splash screen is ready to be hidden.
 * Provides information about the loading results.
 */
export interface SplashScreenCompleted {
  /** How the splash screen was completed */
  completionType: 'auto' | 'skip' | 'timeout' | 'error';
  
  /** Total duration splash was visible (ms) */
  duration: number;
  
  /** Results of preloaded assets */
  preloadResults: import('@tanzmoment/shared/services').PreloadResult[];
  
  /** Number of successfully loaded assets */
  successCount: number;
  
  /** Number of failed assets */
  failureCount: number;
  
  /** Whether user is a returning visitor */
  isReturningVisitor: boolean;
  
  /** Any errors that occurred */
  errors?: string[];
}

/**
 * Splash Screen Display Strategy
 * 
 * Determines how long the splash screen should be displayed
 * based on user visit history.
 */
export enum SplashScreenStrategy {
  /** Full animation for first-time visitors (3000ms default) */
  FULL = 'FULL',
  
  /** Shortened version for returning visitors (500ms default) */
  SHORTENED = 'SHORTENED',
  
  /** Skip entirely (instant, 0ms) - for development or user preference */
  SKIP = 'SKIP',
}

/**
 * Splash Screen Configuration
 * 
 * Complete configuration object for splash screen behavior,
 * including animation timings and preload settings.
 */
export interface SplashScreenConfig {
  /** Display strategy (determines duration) */
  strategy: SplashScreenStrategy;
  
  /** Duration for FULL strategy (ms) */
  fullDuration: number;
  
  /** Duration for SHORTENED strategy (ms) */
  shortenedDuration: number;
  
  /** Preload configuration */
  preloadConfig: SplashScreenPreloadConfig;
  
  /** Whether to show skip button */
  showSkipButton: boolean;
  
  /** Whether to show progress bar */
  showProgress: boolean;
  
  /** LocalStorage key for visit tracking */
  storageKey: string;
  
  /** Brand intro text fade-out delay (ms) */
  brandIntroDelay: number;
  
  /** Enable development mode logging */
  enableLogging: boolean;
}

/**
 * Default Splash Screen Configuration
 * 
 * Sensible defaults that work for most use cases.
 */
export const DEFAULT_SPLASH_CONFIG: SplashScreenConfig = {
  strategy: SplashScreenStrategy.FULL,
  fullDuration: 3000,
  shortenedDuration: 500,
  preloadConfig: {
    criticalAssets: [],
    continueOnError: true,
    minDisplayDuration: 3500,
    maxLoadDuration: 5000,
  },
  showSkipButton: true,
  showProgress: true,
  storageKey: 'tanzmoment_splash_visits',
  brandIntroDelay: 1500,
  enableLogging: false,
};

/**
 * Asset Priority Definitions
 *
 * Helper constants for defining which assets are most critical.
 * Maps semantic priorities to PreloadPriority enum values.
 */
export const SPLASH_ASSET_PRIORITY = {
  /** First hero image (must load) */
  HERO_IMAGE_FIRST: PreloadPriority.HIGH,

  /** Feature navigation SVGs (critical for interaction) */
  FEATURE_SVGS: PreloadPriority.HIGH,

  /** Logo and brand assets */
  BRAND_ASSETS: PreloadPriority.MEDIUM,

  /** Additional hero images (nice to have) */
  HERO_IMAGES_ADDITIONAL: PreloadPriority.MEDIUM,
} as const;
// ============================================================================
// PRELOAD SERVICE - TYPE DEFINITIONS
// ============================================================================

/**
 * Asset types that can be preloaded by the PreloadService.
 * Each type may require different loading strategies.
 */
export enum AssetType {
  /** Standard image formats (JPEG, PNG, WebP, AVIF) */
  IMAGE = 'image',
  /** SVG files (can be loaded as text or image) */
  SVG = 'svg',
  /** Font files (WOFF, WOFF2) */
  FONT = 'font',
  /** Generic data files (JSON, etc.) */
  DATA = 'data',
}

/**
 * Priority levels for asset preloading.
 * Higher priority assets are loaded first.
 */
export enum PreloadPriority {
  /** Critical assets needed for initial render */
  HIGH = 'high',
  /** Important assets for above-the-fold content */
  MEDIUM = 'medium',
  /** Non-critical assets that enhance experience */
  LOW = 'low',
}

/**
 * Loading status for individual assets.
 */
export enum LoadingStatus {
  /** Asset is queued but not yet started */
  PENDING = 'pending',
  /** Asset is currently being loaded */
  LOADING = 'loading',
  /** Asset loaded successfully */
  SUCCESS = 'success',
  /** Asset failed to load */
  ERROR = 'error',
}

/**
 * Configuration for a single asset to be preloaded.
 */
export interface PreloadAsset {
  /** Unique identifier for this asset */
  id: string;
  /** Type of asset (determines loading strategy) */
  type: AssetType;
  /** URL or path to the asset */
  url: string;
  /** Loading priority (default: MEDIUM) */
  priority?: PreloadPriority;
  /** Optional metadata for the asset */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a preload operation for a single asset.
 */
export interface PreloadResult {
  /** The asset that was loaded */
  asset: PreloadAsset;
  /** Loading status */
  status: LoadingStatus;
  /** Loaded data (varies by asset type) */
  data?: unknown;
  /** Error message if loading failed */
  error?: string;
  /** Time taken to load in milliseconds */
  loadTime?: number;
}

/**
 * Overall progress of the preload operation.
 */
export interface PreloadProgress {
  /** Total number of assets to load */
  total: number;
  /** Number of assets successfully loaded */
  loaded: number;
  /** Number of assets that failed to load */
  failed: number;
  /** Number of assets still pending or loading */
  pending: number;
  /** Overall progress percentage (0-100) */
  percentage: number;
  /** Current asset being loaded (if any) */
  currentAsset?: PreloadAsset;
}

/**
 * Configuration options for the PreloadService.
 */
export interface PreloadServiceConfig {
  /** Maximum number of concurrent loads (default: 3) */
  maxConcurrent?: number;
  /** Timeout in milliseconds for individual asset loads (default: 10000) */
  loadTimeout?: number;
  /** Whether to continue loading after errors (default: true) */
  continueOnError?: boolean;
  /** Whether to log loading progress in dev mode (default: true) */
  enableLogging?: boolean;
}
/**
 * Type definitions for the Image Preload Service
 * 
 * This module provides specialized types for intelligent image preloading
 * in galleries and slideshows. Unlike the generic PreloadService which handles
 * all asset types with priority queues, the ImagePreloadService focuses on
 * context-aware loading strategies based on user navigation patterns.
 * 
 * @module ImagePreloadTypes
 */

/**
 * Loading strategy for individual images
 * 
 * These strategies determine WHEN and HOW an image should be loaded:
 * 
 * - EAGER: Load immediately, blocking other operations if necessary.
 *   Used for the first visible image that must be ready instantly.
 *   Example: The initial hero gallery image shown on page load.
 * 
 * - PREFETCH: Load in the background when the browser is idle.
 *   Uses requestIdleCallback to avoid blocking main thread work.
 *   Example: The next 1-2 images in a gallery that the user will likely view soon.
 * 
 * - LAZY: Load only when explicitly requested (on-demand).
 *   No preloading happens until the image is actually needed.
 *   Example: Images far ahead in the gallery or unlikely to be viewed.
 */
export enum ImageLoadStrategy {
  EAGER = 'eager',
  PREFETCH = 'prefetch',
  LAZY = 'lazy',
}

/**
 * Request descriptor for preloading a single image
 * 
 * This interface describes everything needed to preload an image intelligently.
 * The combination of strategy and optional priority gives fine-grained control
 * over loading behavior.
 */
export interface ImagePreloadRequest {
  /**
   * Unique identifier for this preload request
   * Used for tracking, cancellation, and deduplication
   * 
   * Example: 'hero-image-1' or 'gallery-slide-3'
   */
  id: string;

  /**
   * Full URL of the image to preload
   * Must be an absolute or relative URL that can be loaded via Image constructor
   * 
   * Example: '/assets/images/hero/dance-1.jpg' or 'https://cdn.example.com/image.jpg'
   */
  url: string;

  /**
   * Loading strategy determining when/how to load this image
   * See ImageLoadStrategy enum for detailed explanation of each strategy
   */
  strategy: ImageLoadStrategy;

  /**
   * Optional numeric priority for fine-tuning load order within the same strategy
   * 
   * Higher numbers = higher priority (loaded first)
   * Lower numbers = lower priority (loaded later)
   * 
   * This is useful when multiple images share the same strategy but some
   * are more important than others. For example, within PREFETCH images,
   * the immediate next slide might have priority 100 while the slide after
   * that has priority 50.
   * 
   * If omitted, images within the same strategy are loaded in order of registration.
   * 
   * @default undefined (no explicit priority)
   */
  priority?: number;
}

/**
 * Result of a completed image preload operation
 * 
 * Contains success/failure information, timing data, and cache status.
 * This allows consumers to make informed decisions about showing placeholders,
 * logging performance metrics, or implementing fallback strategies.
 */
export interface ImagePreloadResult {
  /**
   * The URL that was preloaded (matches the request URL)
   */
  url: string;

  /**
   * Whether the image loaded successfully
   * 
   * true = Image loaded and is ready for display
   * false = Image failed to load (see error property for reason)
   */
  loaded: boolean;

  /**
   * Error message if loading failed
   * 
   * Common errors include:
   * - Network errors: 'Failed to fetch'
   * - 404 errors: 'Image not found'
   * - CORS errors: 'Cross-origin request blocked'
   * - Timeout errors: 'Load timeout exceeded'
   * 
   * @default undefined (no error occurred)
   */
  error?: string;

  /**
   * Time taken to load the image in milliseconds
   * 
   * Measured from the start of the preload request to the image load event.
   * Useful for performance monitoring and optimization decisions.
   * 
   * Note: This does NOT include time spent waiting in a queue or idle callback.
   * It only measures the actual network transfer time.
   * 
   * @default undefined (timing not measured or load failed)
   */
  loadTime?: number;

  /**
   * Whether the image was already in the browser cache
   * 
   * true = Image loaded instantly from cache (loadTime will be very low, ~0-5ms)
   * false = Image was downloaded from network (loadTime reflects network speed)
   * 
   * This is detected by measuring load time. If an image loads in less than
   * 10ms, it's almost certainly from cache since network requests take longer.
   * 
   * Useful for:
   * - Understanding cache effectiveness
   * - Deciding whether to show loading states
   * - Performance analytics
   * 
   * @default undefined (cache status unknown)
   */
  fromCache?: boolean;
}

/**
 * Configuration options for the ImagePreloadService
 * 
 * These settings control the global behavior of image preloading across
 * all requests. They can be set once when initializing the service and
 * affect all subsequent preload operations.
 */
export interface ImagePreloadConfig {
  /**
   * Number of images to prefetch ahead of the current position
   * 
   * This controls the "lookahead window" in gallery scenarios.
   * 
   * Example with lookaheadCount = 2:
   * If user is at slide 3, we prefetch slides 4 and 5
   * 
   * Higher values = More images preloaded = Smoother navigation but more bandwidth
   * Lower values = Fewer images preloaded = Less bandwidth but potential loading delays
   * 
   * @default 2 (prefetch next 2 images)
   */
  lookaheadCount?: number;

  /**
   * Maximum number of concurrent image loads
   * 
   * Limits how many images can load simultaneously to avoid overwhelming
   * the browser's connection pool and blocking other resources.
   * 
   * Most browsers have a per-domain connection limit (typically 6-8).
   * Setting this too high can cause queuing at the browser level.
   * Setting this too low can underutilize available bandwidth.
   * 
   * @default 2 (conservative but effective)
   */
  maxConcurrent?: number;

  /**
   * Whether to use requestIdleCallback for PREFETCH strategy
   * 
   * When true, PREFETCH images are loaded during browser idle time,
   * ensuring they don't interfere with critical rendering or user interactions.
   * 
   * When false, PREFETCH images load immediately (like EAGER but lower priority).
   * 
   * Set to false if:
   * - You need faster preloading regardless of idle state
   * - You're testing in an environment without requestIdleCallback
   * - You want deterministic loading behavior for testing
   * 
   * @default true (use idle callbacks when available)
   */
  useIdleCallback?: boolean;

  /**
   * Timeout for requestIdleCallback in milliseconds
   * 
   * If the browser doesn't become idle within this time, the callback
   * is forced to run anyway. This prevents images from being delayed
   * indefinitely on busy pages.
   * 
   * Lower values = More aggressive loading (may impact performance)
   * Higher values = More patient loading (may delay image availability)
   * 
   * @default 2000 (2 seconds - good balance for most use cases)
   */
  idleTimeout?: number;
}

/**
 * Progress information for ongoing preload operations
 * 
 * Emitted through the progress$ Observable to provide real-time feedback
 * about loading status. Useful for showing progress bars, loading indicators,
 * or logging detailed metrics.
 */
export interface ImagePreloadProgress {
  /**
   * Number of images currently being loaded
   * These are actively downloading right now
   */
  loading: number;

  /**
   * Number of images successfully loaded
   * These are ready for display
   */
  loaded: number;

  /**
   * Number of images that failed to load
   * These encountered errors during loading
   */
  failed: number;

  /**
   * Number of images still waiting to load
   * These are queued but haven't started downloading yet
   */
  pending: number;

  /**
   * Total number of images in the current operation
   * Sum of all statuses: loading + loaded + failed + pending
   */
  total: number;

  /**
   * Completion percentage (0-100)
   * Calculated as: ((loaded + failed) / total) * 100
   * 
   * Note: Failed images count as "complete" because they're finished processing,
   * even though they didn't load successfully. This prevents the percentage
   * from getting stuck below 100% when some images fail.
   */
  percentage: number;
}
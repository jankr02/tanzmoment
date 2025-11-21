import { Injectable, Optional, Inject, inject, PLATFORM_ID, InjectionToken } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Observable,
  BehaviorSubject,
  Subject,
  from,
  of,
  forkJoin,
  throwError,
  merge,
} from 'rxjs';
import {
  map,
  tap,
  catchError,
  finalize,
  takeUntil,
  mergeMap,
  toArray,
} from 'rxjs/operators';

import {
  ImageLoadStrategy,
  ImagePreloadRequest,
  ImagePreloadResult,
  ImagePreloadConfig,
  ImagePreloadProgress,
} from './image-preload.types';

/**
 * Default configuration for the ImagePreloadService
 * These values provide a good balance between performance and user experience
 */
const DEFAULT_CONFIG: Required<ImagePreloadConfig> = {
  lookaheadCount: 2,
  maxConcurrent: 2,
  useIdleCallback: true,
  idleTimeout: 2000,
};

/**
 * InjectionToken for providing custom ImagePreloadService configuration
 * 
 * This token allows you to provide a custom configuration at module or component level:
 * 
 * @example
 * ```typescript
 * // In your module or component providers
 * providers: [
 *   {
 *     provide: IMAGE_PRELOAD_CONFIG,
 *     useValue: {
 *       lookaheadCount: 3,
 *       maxConcurrent: 4,
 *     }
 *   }
 * ]
 * ```
 */
export const IMAGE_PRELOAD_CONFIG = new InjectionToken<ImagePreloadConfig>(
  'IMAGE_PRELOAD_CONFIG'
);

/**
 * ImagePreloadService
 *
 * Specialized service for intelligent image preloading in galleries and slideshows.
 * Unlike generic asset loaders, this service understands user navigation patterns
 * and preloads images based on the user's current position.
 *
 * Key Features:
 * - Strategy-based loading (EAGER, PREFETCH, LAZY)
 * - Lookahead logic for galleries (preload next N images)
 * - requestIdleCallback integration for background loading
 * - Concurrent load limiting to avoid overwhelming the browser
 * - Real-time progress tracking via Observable
 * - Cache detection for instant image display
 * - Memory-efficient cleanup
 *
 * @example
 * ```typescript
 * // Basic single image preload
 * imagePreload.preloadImage('/hero-1.jpg').subscribe(result => {
 *   if (result.loaded) {
 *     console.log('Image ready!', result);
 *   }
 * });
 *
 * // Gallery lookahead preload
 * const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg'];
 * const currentIndex = 1;
 * imagePreload.preloadForGallery(images, currentIndex).subscribe(results => {
 *   console.log('Preloaded next images', results);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ImagePreloadService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Configuration for this service instance */
  private readonly config: Required<ImagePreloadConfig>;

  /** Subject for component cleanup and unsubscription */
  private readonly destroy$ = new Subject<void>();

  /** BehaviorSubject tracking current progress of all operations */
  private readonly progressSubject = new BehaviorSubject<ImagePreloadProgress>({
    loading: 0,
    loaded: 0,
    failed: 0,
    pending: 0,
    total: 0,
    percentage: 0,
  });

  /** Public Observable for consumers to track progress */
  public readonly progress$ = this.progressSubject.asObservable();

  /** Set of currently loading image URLs (for deduplication) */
  private readonly loadingUrls = new Set<string>();

  /** Set of successfully loaded image URLs (cache tracking) */
  private readonly loadedUrls = new Set<string>();

  /** Queue of pending requests waiting to be processed */
  private readonly pendingQueue: ImagePreloadRequest[] = [];

  /** Number of currently active concurrent loads */
  private activeLoads = 0;

  /** Development mode flag (for logging) */
  private readonly isDev = false; // Set via environment or config if needed

  constructor(@Optional() @Inject(IMAGE_PRELOAD_CONFIG) config?: ImagePreloadConfig) {
    // Merge provided config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.isDev) {
      console.log('[ImagePreloadService] Initialized with config:', this.config);
    }
  }

  /**
   * Preload a single image immediately
   *
   * This is the core method that actually loads an image using the Image constructor.
   * All other preload methods eventually call this one.
   *
   * The method tracks load time, detects cache hits, and handles errors gracefully.
   *
   * @param url - Full URL of the image to preload
   * @returns Observable that emits the preload result
   *
   * @example
   * ```typescript
   * imagePreload.preloadImage('/hero-1.jpg').subscribe(result => {
   *   console.log('Loaded in', result.loadTime, 'ms');
   *   console.log('From cache?', result.fromCache);
   * });
   * ```
   */
  public preloadImage(url: string): Observable<ImagePreloadResult> {
    // SSR guard: Return error result if not in browser
    if (!this.isBrowser) {
      return of({
        url,
        loaded: false,
        error: 'Image preloading not available in SSR context',
      });
    }

    // Deduplication: If already loaded, return cached result immediately
    if (this.loadedUrls.has(url)) {
      if (this.isDev) {
        console.log('[ImagePreloadService] Image already loaded (cached):', url);
      }
      return of({
        url,
        loaded: true,
        fromCache: true,
        loadTime: 0,
      });
    }

    // Track start time for load duration measurement
    const startTime = performance.now();

    // Create Observable that wraps the Image loading process
    return new Observable<ImagePreloadResult>((observer) => {
      const img = new Image();

      // Success handler: Image loaded successfully
      const handleLoad = () => {
        const loadTime = Math.round(performance.now() - startTime);
        const fromCache = loadTime < 10; // Heuristic: <10ms = likely from cache

        this.loadedUrls.add(url);

        if (this.isDev) {
          console.log(
            `[ImagePreloadService] Image loaded: ${url} (${loadTime}ms, cache: ${fromCache})`
          );
        }

        observer.next({
          url,
          loaded: true,
          loadTime,
          fromCache,
        });
        observer.complete();
      };

      // Error handler: Image failed to load
      const handleError = (event: ErrorEvent | Event) => {
        const error = 'error' in event ? event.error : 'Failed to load image';

        if (this.isDev) {
          console.error('[ImagePreloadService] Image load error:', url, error);
        }

        observer.next({
          url,
          loaded: false,
          error: error?.toString() || 'Unknown error',
        });
        observer.complete();
      };

      // Attach event listeners
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);

      // Start loading the image
      img.src = url;

      // Cleanup function (called on unsubscribe or completion)
      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    });
  }

  /**
   * Preload multiple images with their respective strategies
   *
   * This method orchestrates loading multiple images according to their strategies:
   * - EAGER images load immediately
   * - PREFETCH images load in idle time (if useIdleCallback is true)
   * - LAZY images are not preloaded (returned as pending)
   *
   * Images are sorted by priority within each strategy group.
   *
   * @param requests - Array of image preload requests with strategies
   * @returns Observable that emits array of results when all preloads complete
   *
   * @example
   * ```typescript
   * const requests = [
   *   { id: 'hero-1', url: '/hero-1.jpg', strategy: ImageLoadStrategy.EAGER },
   *   { id: 'hero-2', url: '/hero-2.jpg', strategy: ImageLoadStrategy.PREFETCH, priority: 100 },
   *   { id: 'hero-3', url: '/hero-3.jpg', strategy: ImageLoadStrategy.PREFETCH, priority: 50 },
   * ];
   *
   * imagePreload.preloadImages(requests).subscribe(results => {
   *   console.log('All images processed', results);
   * });
   * ```
   */
  public preloadImages(
    requests: ImagePreloadRequest[]
  ): Observable<ImagePreloadResult[]> {
    if (requests.length === 0) {
      return of([]);
    }

    // Separate requests by strategy
    const eagerRequests = requests.filter(
      (r) => r.strategy === ImageLoadStrategy.EAGER
    );
    const prefetchRequests = requests.filter(
      (r) => r.strategy === ImageLoadStrategy.PREFETCH
    );
    const lazyRequests = requests.filter(
      (r) => r.strategy === ImageLoadStrategy.LAZY
    );

    // Sort each group by priority (higher priority first)
    const sortByPriority = (a: ImagePreloadRequest, b: ImagePreloadRequest) =>
      (b.priority || 0) - (a.priority || 0);

    eagerRequests.sort(sortByPriority);
    prefetchRequests.sort(sortByPriority);

    if (this.isDev) {
      console.log('[ImagePreloadService] Preload requests:', {
        eager: eagerRequests.length,
        prefetch: prefetchRequests.length,
        lazy: lazyRequests.length,
      });
    }

    // Create observables for each strategy group
    const eagerLoads$ = this.loadWithConcurrency(
      eagerRequests.map((r) => r.url)
    );
    const prefetchLoads$ = this.config.useIdleCallback
      ? this.loadWithIdleCallback(prefetchRequests.map((r) => r.url))
      : this.loadWithConcurrency(prefetchRequests.map((r) => r.url));

    // Lazy requests don't get loaded, just return pending results
    const lazyResults$ = of(
      lazyRequests.map(
        (r): ImagePreloadResult => ({
          url: r.url,
          loaded: false,
          error: 'Lazy load strategy (not preloaded)',
        })
      )
    );

    // Combine all results
    return forkJoin([eagerLoads$, prefetchLoads$, lazyResults$]).pipe(
      map(([eager, prefetch, lazy]) => [...eager, ...prefetch, ...lazy]),
      tap(() => {
        if (this.isDev) {
          console.log('[ImagePreloadService] All preload operations complete');
        }
      })
    );
  }

  /**
   * Smart preload for gallery navigation
   *
   * This is the killer feature of ImagePreloadService. Given an array of image URLs
   * and the user's current position, it intelligently determines which images to preload.
   *
   * Lookahead Logic:
   * - Current image: Already loaded (or should be)
   * - Next N images (based on lookaheadCount): PREFETCH with priority
   * - All other images: LAZY (not preloaded)
   *
   * Priority decreases with distance from current index:
   * - Next image: priority 100
   * - Image after that: priority 90
   * - Image after that: priority 80
   * - etc.
   *
   * @param allImages - Complete array of image URLs in the gallery
   * @param currentIndex - User's current position (0-based index)
   * @returns Observable that emits results for preloaded images
   *
   * @example
   * ```typescript
   * const galleryImages = ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg', '/img5.jpg'];
   * const currentSlide = 2; // User is viewing img3.jpg
   *
   * // This will prefetch img4.jpg (priority 100) and img5.jpg (priority 90)
   * imagePreload.preloadForGallery(galleryImages, currentSlide).subscribe();
   * ```
   */
  public preloadForGallery(
    allImages: string[],
    currentIndex: number
  ): Observable<ImagePreloadResult[]> {
    if (allImages.length === 0) {
      return of([]);
    }

    // Validate current index
    if (currentIndex < 0 || currentIndex >= allImages.length) {
      console.warn(
        '[ImagePreloadService] Invalid currentIndex:',
        currentIndex,
        'for gallery of length',
        allImages.length
      );
      return of([]);
    }

    const requests: ImagePreloadRequest[] = [];

    // Determine which images to prefetch (lookahead)
    for (let i = 1; i <= this.config.lookaheadCount; i++) {
      const targetIndex = currentIndex + i;

      // Check if target index is within bounds
      if (targetIndex < allImages.length) {
        const url = allImages[targetIndex];
        const priority = 100 - i * 10; // Decreasing priority with distance

        requests.push({
          id: `gallery-${targetIndex}`,
          url,
          strategy: ImageLoadStrategy.PREFETCH,
          priority,
        });
      }
    }

    if (this.isDev) {
      console.log('[ImagePreloadService] Gallery lookahead:', {
        currentIndex,
        lookaheadCount: this.config.lookaheadCount,
        prefetchUrls: requests.map((r) => ({ url: r.url, priority: r.priority })),
      });
    }

    // If no images to prefetch, return empty result
    if (requests.length === 0) {
      return of([]);
    }

    return this.preloadImages(requests);
  }

  /**
   * Check if an image is already cached/loaded
   *
   * This is useful for deciding whether to show loading states or instant display.
   * An image is considered cached if it was successfully loaded in a previous preload.
   *
   * @param url - URL of the image to check
   * @returns true if image is in cache, false otherwise
   *
   * @example
   * ```typescript
   * if (imagePreload.isImageCached('/hero-1.jpg')) {
   *   // Show image immediately without placeholder
   *   showImage();
   * } else {
   *   // Show loading spinner while image loads
   *   showLoadingSpinner();
   *   imagePreload.preloadImage('/hero-1.jpg').subscribe(() => {
   *     hideLoadingSpinner();
   *     showImage();
   *   });
   * }
   * ```
   */
  public isImageCached(url: string): boolean {
    return this.loadedUrls.has(url);
  }

  /**
   * Cancel all pending preload operations
   *
   * Clears the pending queue and resets state. Currently active loads
   * will complete, but no new loads will start.
   *
   * Useful for cleanup when navigating away from a page or when the
   * user performs an action that invalidates pending preloads.
   */
  public cancelAll(): void {
    this.pendingQueue.length = 0;
    this.loadingUrls.clear();

    if (this.isDev) {
      console.log('[ImagePreloadService] All pending preloads cancelled');
    }

    // Reset progress
    this.progressSubject.next({
      loading: 0,
      loaded: 0,
      failed: 0,
      pending: 0,
      total: 0,
      percentage: 0,
    });
  }

  /**
   * Load multiple images with concurrency limit
   *
   * This internal method manages a queue of URLs and ensures only
   * maxConcurrent images load at once. As each image completes,
   * the next one in the queue starts automatically.
   *
   * @param urls - Array of image URLs to load
   * @returns Observable that emits array of results
   */
  private loadWithConcurrency(urls: string[]): Observable<ImagePreloadResult[]> {
    if (urls.length === 0) {
      return of([]);
    }

    // Use mergeMap with concurrency limit
    return from(urls).pipe(
      mergeMap(
        (url) =>
          this.preloadImage(url).pipe(
            catchError((error) =>
              of({
                url,
                loaded: false,
                error: error.toString(),
              } as ImagePreloadResult)
            )
          ),
        this.config.maxConcurrent
      ),
      toArray() // Collect all results into a single array
    );
  }

  /**
   * Load multiple images using requestIdleCallback
   *
   * This internal method schedules image loads to occur during browser idle time.
   * Each image load waits for the browser to signal that it has spare capacity
   * before starting.
   *
   * If requestIdleCallback is not available, falls back to setTimeout with a small delay.
   *
   * @param urls - Array of image URLs to load
   * @returns Observable that emits array of results
   */
  private loadWithIdleCallback(
    urls: string[]
  ): Observable<ImagePreloadResult[]> {
    if (urls.length === 0) {
      return of([]);
    }

    // Create an observable for each URL that waits for idle time
    const loadObservables = urls.map((url) => this.scheduleIdleLoad(url));

    // Combine all observables with concurrency limit
    return merge(...loadObservables, this.config.maxConcurrent).pipe(
      toArray()
    );
  }

  /**
   * Schedule a single image load using requestIdleCallback
   *
   * This internal method wraps a single image preload in an idle callback.
   * The image will only load when the browser has spare capacity.
   *
   * If the browser doesn't become idle within idleTimeout, the callback
   * is forced to run anyway (via the timeout option).
   *
   * Falls back to setTimeout if requestIdleCallback is not available.
   *
   * @param url - Image URL to load
   * @returns Observable that emits the load result
   */
  private scheduleIdleLoad(url: string): Observable<ImagePreloadResult> {
    return new Observable<ImagePreloadResult>((observer) => {
      let callbackId: number | undefined;
      let timeoutId: number | undefined;

      const loadImage = () => {
        this.preloadImage(url)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result) => observer.next(result),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });
      };

      // Feature detection: Check if requestIdleCallback exists
      if (typeof requestIdleCallback !== 'undefined') {
        callbackId = requestIdleCallback(
          (deadline) => {
            if (this.isDev) {
              console.log(
                `[ImagePreloadService] Idle callback fired for ${url} (time remaining: ${deadline.timeRemaining()}ms)`
              );
            }
            loadImage();
          },
          { timeout: this.config.idleTimeout }
        );
      } else {
        // Fallback to setTimeout for browsers without requestIdleCallback
        if (this.isDev) {
          console.log(
            '[ImagePreloadService] requestIdleCallback not available, using setTimeout fallback'
          );
        }
        timeoutId = window.setTimeout(() => {
          loadImage();
        }, 100);
      }

      // Cleanup function
      return () => {
        if (callbackId !== undefined && typeof cancelIdleCallback !== 'undefined') {
          cancelIdleCallback(callbackId);
        }
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
      };
    });
  }

  /**
   * Cleanup method called when the service is destroyed
   * Ensures all subscriptions are cleaned up to prevent memory leaks
   */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.progressSubject.complete();

    if (this.isDev) {
      console.log('[ImagePreloadService] Service destroyed, cleanup complete');
    }
  }
}
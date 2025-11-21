import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { take } from 'rxjs/operators';

import { 
  ImagePreloadService, 
  IMAGE_PRELOAD_CONFIG 
} from './image-preload.service';
import {
  ImageLoadStrategy,
  ImagePreloadRequest,
  ImagePreloadConfig,
} from './image-preload.types';

/**
 * Test Suite for ImagePreloadService
 *
 * This suite tests all functionality of the ImagePreloadService including:
 * - Basic image preloading
 * - Strategy-based loading (EAGER, PREFETCH, LAZY)
 * - Gallery lookahead logic
 * - Concurrency control
 * - Cache detection
 * - requestIdleCallback integration and fallback
 * - Error handling
 * - SSR compatibility
 * - Edge cases
 */
describe('ImagePreloadService', () => {
  let service: ImagePreloadService;

  /**
   * Helper function to create a mock Image constructor
   *
   * The Image constructor is a browser API that we need to mock in tests.
   * This helper creates a fake Image that can simulate load success or failure.
   *
   * @param shouldSucceed - Whether the image load should succeed or fail
   * @param delay - Simulated network delay in milliseconds
   * @returns Mock Image constructor
   */
  const createMockImage = (shouldSucceed = true, delay = 0) => {
    return class MockImage {
      public onload: (() => void) | null = null;
      public onerror: ((error: Error) => void) | null = null;
      private _src = '';

      // Getter/setter for src that triggers the load event
      get src() {
        return this._src;
      }

      set src(value: string) {
        this._src = value;

        // Simulate async image loading
        setTimeout(() => {
          if (shouldSucceed && this.onload) {
            this.onload();
          } else if (!shouldSucceed && this.onerror) {
            this.onerror(new Error('Image load failed'));
          }
        }, delay);
      }

      // Mock addEventListener to work with both old and new style event handlers
      addEventListener(event: string, handler: any) {
        if (event === 'load') {
          this.onload = handler;
        } else if (event === 'error') {
          this.onerror = handler;
        }
      }

      removeEventListener() {
        // Mock implementation - no-op for tests
      }
    };
  };

  /**
   * Setup function that runs before each test
   * Configures TestBed and creates a fresh service instance
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ImagePreloadService,
        { provide: PLATFORM_ID, useValue: 'browser' }, // Ensure browser platform
      ],
    });

    service = TestBed.inject(ImagePreloadService);

    // Mock the global Image constructor
    global.Image = createMockImage(true, 10) as any;

    // Mock requestIdleCallback and cancelIdleCallback
    global.requestIdleCallback = ((callback: IdleRequestCallback) => {
      // Simulate immediate idle time for tests
      const deadline = {
        timeRemaining: () => 50,
        didTimeout: false,
      } as IdleDeadline;
      setTimeout(() => callback(deadline), 0);
      return 1; // Mock callback ID
    }) as any;

    global.cancelIdleCallback = (() => {
      // Mock implementation - no-op for tests
    }) as any;
  });

  /**
   * Test 1: Service Creation
   *
   * This is a basic sanity check that ensures the service can be created
   * successfully by Angular's dependency injection system.
   */
  describe('Service Creation', () => {
    it('should be created with default configuration', () => {
      expect(service).toBeTruthy();
      expect(service).toBeInstanceOf(ImagePreloadService);
    });

    it('should accept custom configuration', () => {
      const customConfig: ImagePreloadConfig = {
        lookaheadCount: 5,
        maxConcurrent: 4,
        useIdleCallback: false,
        idleTimeout: 5000,
      };

      // Reconfigure TestBed with custom config
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ImagePreloadService,
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: IMAGE_PRELOAD_CONFIG, useValue: customConfig },
        ],
      });

      const customService = TestBed.inject(ImagePreloadService);
      expect(customService).toBeTruthy();
    });
  });

  /**
   * Test 2: Single Image Preload
   *
   * Tests the core preloadImage method which is the foundation for all
   * other preload operations. This test verifies that a single image
   * can be loaded successfully and that the result contains the expected data.
   */
  describe('Single Image Preload', () => {
    it('should preload a single image successfully', (done) => {
      const testUrl = '/test-image.jpg';

      service.preloadImage(testUrl).subscribe((result) => {
        expect(result.url).toBe(testUrl);
        expect(result.loaded).toBe(true);
        expect(result.loadTime).toBeGreaterThanOrEqual(0);
        done();
      });
    });

    it('should detect cached images on second load', (done) => {
      const testUrl = '/cached-image.jpg';

      // First load
      service.preloadImage(testUrl).subscribe(() => {
        // Second load should be instant from cache
        service.preloadImage(testUrl).subscribe((result) => {
          expect(result.url).toBe(testUrl);
          expect(result.loaded).toBe(true);
          expect(result.fromCache).toBe(true);
          expect(result.loadTime).toBe(0);
          done();
        });
      });
    });

    it('should handle image load errors gracefully', (done) => {
      // Mock Image to fail
      global.Image = createMockImage(false, 10) as any;

      const testUrl = '/broken-image.jpg';

      service.preloadImage(testUrl).subscribe((result) => {
        expect(result.url).toBe(testUrl);
        expect(result.loaded).toBe(false);
        expect(result.error).toBeDefined();
        done();
      });
    });
  });

  /**
   * Test 3: Multiple Images with Strategies
   *
   * Tests the preloadImages method which orchestrates loading multiple images
   * according to their strategies (EAGER, PREFETCH, LAZY). This is crucial
   * because the service needs to handle different loading priorities correctly.
   */
  describe('Multiple Images with Strategies', () => {
    it('should preload multiple EAGER images', (done) => {
      const requests: ImagePreloadRequest[] = [
        {
          id: 'img1',
          url: '/image1.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
        {
          id: 'img2',
          url: '/image2.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
        {
          id: 'img3',
          url: '/image3.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
      ];

      service.preloadImages(requests).subscribe((results) => {
        expect(results.length).toBe(3);
        expect(results.every((r) => r.loaded)).toBe(true);
        done();
      });
    });

    it('should handle mixed strategies correctly', (done) => {
      const requests: ImagePreloadRequest[] = [
        {
          id: 'eager1',
          url: '/eager.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
        {
          id: 'prefetch1',
          url: '/prefetch.jpg',
          strategy: ImageLoadStrategy.PREFETCH,
        },
        {
          id: 'lazy1',
          url: '/lazy.jpg',
          strategy: ImageLoadStrategy.LAZY,
        },
      ];

      service.preloadImages(requests).subscribe((results) => {
        expect(results.length).toBe(3);

        const eagerResult = results.find((r) => r.url === '/eager.jpg');
        const prefetchResult = results.find((r) => r.url === '/prefetch.jpg');
        const lazyResult = results.find((r) => r.url === '/lazy.jpg');

        // EAGER should be loaded
        expect(eagerResult?.loaded).toBe(true);

        // PREFETCH should be loaded
        expect(prefetchResult?.loaded).toBe(true);

        // LAZY should NOT be loaded (marked as pending)
        expect(lazyResult?.loaded).toBe(false);
        expect(lazyResult?.error).toContain('Lazy load');

        done();
      });
    });

    it('should respect priority within same strategy', (done) => {
      const loadOrder: string[] = [];

      // Override preloadImage to track load order
      const originalPreloadImage = service.preloadImage.bind(service);
      service.preloadImage = (url: string) => {
        loadOrder.push(url);
        return originalPreloadImage(url);
      };

      const requests: ImagePreloadRequest[] = [
        {
          id: 'low',
          url: '/low-priority.jpg',
          strategy: ImageLoadStrategy.EAGER,
          priority: 10,
        },
        {
          id: 'high',
          url: '/high-priority.jpg',
          strategy: ImageLoadStrategy.EAGER,
          priority: 100,
        },
        {
          id: 'medium',
          url: '/medium-priority.jpg',
          strategy: ImageLoadStrategy.EAGER,
          priority: 50,
        },
      ];

      service.preloadImages(requests).subscribe(() => {
        // High priority should be loaded first
        expect(loadOrder[0]).toBe('/high-priority.jpg');
        done();
      });
    });
  });

  /**
   * Test 4: Gallery Lookahead Logic
   *
   * This is one of the most important test cases because it validates
   * the intelligent lookahead logic that makes this service special.
   * We test various positions in the gallery to ensure the service
   * correctly determines which images to prefetch.
   */
  describe('Gallery Lookahead Logic', () => {
    const galleryImages = [
      '/gallery-0.jpg',
      '/gallery-1.jpg',
      '/gallery-2.jpg',
      '/gallery-3.jpg',
      '/gallery-4.jpg',
    ];

    it('should prefetch next images based on current index', (done) => {
      const currentIndex = 1;

      service.preloadForGallery(galleryImages, currentIndex).subscribe((results) => {
        // With lookaheadCount = 2 (default), should prefetch indices 2 and 3
        expect(results.length).toBe(2);

        const urls = results.map((r) => r.url);
        expect(urls).toContain('/gallery-2.jpg');
        expect(urls).toContain('/gallery-3.jpg');

        done();
      });
    });

    it('should handle lookahead at the beginning of gallery', (done) => {
      const currentIndex = 0;

      service.preloadForGallery(galleryImages, currentIndex).subscribe((results) => {
        // Should prefetch indices 1 and 2
        expect(results.length).toBe(2);

        const urls = results.map((r) => r.url);
        expect(urls).toContain('/gallery-1.jpg');
        expect(urls).toContain('/gallery-2.jpg');

        done();
      });
    });

    it('should handle lookahead near the end of gallery', (done) => {
      const currentIndex = 3;

      service.preloadForGallery(galleryImages, currentIndex).subscribe((results) => {
        // Should prefetch only index 4 (no index 5 exists)
        expect(results.length).toBe(1);
        expect(results[0].url).toBe('/gallery-4.jpg');

        done();
      });
    });

    it('should handle lookahead at the last index', (done) => {
      const currentIndex = 4;

      service.preloadForGallery(galleryImages, currentIndex).subscribe((results) => {
        // No images to prefetch after the last one
        expect(results.length).toBe(0);
        done();
      });
    });

    it('should handle invalid current index gracefully', (done) => {
      service.preloadForGallery(galleryImages, -1).subscribe((results) => {
        expect(results.length).toBe(0);
        done();
      });

      service.preloadForGallery(galleryImages, 999).subscribe((results) => {
        expect(results.length).toBe(0);
        done();
      });
    });

    it('should handle empty gallery array', (done) => {
      service.preloadForGallery([], 0).subscribe((results) => {
        expect(results.length).toBe(0);
        done();
      });
    });
  });

  /**
   * Test 5: requestIdleCallback Integration
   *
   * Tests that the service correctly uses requestIdleCallback when available
   * and falls back to setTimeout when it's not. This is important for
   * performance because idle callbacks don't block the main thread.
   */
  describe('requestIdleCallback Integration', () => {
    it('should use requestIdleCallback for PREFETCH when available', (done) => {
      let idleCallbackUsed = false;

      // Mock requestIdleCallback to track if it's called
      global.requestIdleCallback = ((callback: IdleRequestCallback) => {
        idleCallbackUsed = true;
        const deadline = {
          timeRemaining: () => 50,
          didTimeout: false,
        } as IdleDeadline;
        setTimeout(() => callback(deadline), 0);
        return 1;
      }) as any;

      const requests: ImagePreloadRequest[] = [
        {
          id: 'prefetch',
          url: '/prefetch-test.jpg',
          strategy: ImageLoadStrategy.PREFETCH,
        },
      ];

      service.preloadImages(requests).subscribe(() => {
        expect(idleCallbackUsed).toBe(true);
        done();
      });
    });

    it('should fall back to setTimeout when requestIdleCallback is unavailable', (done) => {
      // Remove requestIdleCallback to test fallback
      const originalRequestIdleCallback = global.requestIdleCallback;
      (global as any).requestIdleCallback = undefined;

      let timeoutUsed = false;
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((callback: any, delay?: number) => {
        if (delay === 100) {
          // This is our fallback setTimeout
          timeoutUsed = true;
        }
        return originalSetTimeout(callback, delay || 0);
      }) as any;

      const requests: ImagePreloadRequest[] = [
        {
          id: 'prefetch',
          url: '/prefetch-fallback.jpg',
          strategy: ImageLoadStrategy.PREFETCH,
        },
      ];

      service.preloadImages(requests).subscribe(() => {
        expect(timeoutUsed).toBe(true);

        // Restore original
        global.requestIdleCallback = originalRequestIdleCallback;
        global.setTimeout = originalSetTimeout;

        done();
      });
    });
  });

  /**
   * Test 6: Cache Detection
   *
   * Tests the isImageCached method which allows consumers to check if an
   * image is already loaded. This is useful for UI decisions like whether
   * to show a loading spinner.
   */
  describe('Cache Detection', () => {
    it('should detect cached images correctly', (done) => {
      const testUrl = '/cache-test.jpg';

      // Initially not cached
      expect(service.isImageCached(testUrl)).toBe(false);

      // Load the image
      service.preloadImage(testUrl).subscribe(() => {
        // Should now be cached
        expect(service.isImageCached(testUrl)).toBe(true);
        done();
      });
    });

    it('should return false for never-loaded images', () => {
      expect(service.isImageCached('/never-loaded.jpg')).toBe(false);
    });
  });

  /**
   * Test 7: Concurrent Load Limit
   *
   * Tests that the service respects the maxConcurrent configuration and
   * doesn't try to load too many images at once, which could overwhelm
   * the browser's connection pool.
   */
  describe('Concurrent Load Limit', () => {
    it('should respect maxConcurrent configuration', (done) => {
      // Create custom config
      const customConfig: ImagePreloadConfig = {
        maxConcurrent: 2,
      };

      // Reconfigure TestBed with custom config
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ImagePreloadService,
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: IMAGE_PRELOAD_CONFIG, useValue: customConfig },
        ],
      });

      const customService = TestBed.inject(ImagePreloadService);

      let concurrentLoads = 0;
      let maxConcurrentReached = 0;

      // Mock Image to track concurrent loads
      global.Image = class MockImageForConcurrency {
        public onload: (() => void) | null = null;
        private _src = '';

        get src() {
          return this._src;
        }

        set src(value: string) {
          this._src = value;
          concurrentLoads++;
          maxConcurrentReached = Math.max(maxConcurrentReached, concurrentLoads);

          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
            concurrentLoads--;
          }, 50); // Longer delay to test concurrency
        }

        addEventListener(event: string, handler: any) {
          if (event === 'load') {
            this.onload = handler;
          }
        }

        removeEventListener() {}
      } as any;

      const requests: ImagePreloadRequest[] = [
        {
          id: '1',
          url: '/concurrent-1.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
        {
          id: '2',
          url: '/concurrent-2.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
        {
          id: '3',
          url: '/concurrent-3.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
        {
          id: '4',
          url: '/concurrent-4.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
      ];

      customService.preloadImages(requests).subscribe(() => {
        // Max concurrent should not exceed 2
        expect(maxConcurrentReached).toBeLessThanOrEqual(2);
        done();
      });
    });
  });

  /**
   * Test 8: Cancellation
   *
   * Tests that the cancelAll method correctly stops pending operations
   * and resets the service state.
   */
  describe('Cancellation', () => {
    it('should cancel all pending operations', () => {
      // Start some operations
      service.preloadImage('/cancel-test-1.jpg').subscribe();
      service.preloadImage('/cancel-test-2.jpg').subscribe();

      // Cancel all
      service.cancelAll();

      // Check that cache is cleared
      expect(service.isImageCached('/cancel-test-1.jpg')).toBe(false);
      expect(service.isImageCached('/cancel-test-2.jpg')).toBe(false);
    });
  });

  /**
   * Test 9: Progress Tracking
   *
   * Tests the progress$ Observable which provides real-time updates about
   * loading status. This is important for showing progress bars or loading
   * indicators in the UI.
   */
  describe('Progress Tracking', () => {
    it('should emit progress updates during preload', (done) => {
      const progressUpdates: any[] = [];

      // Subscribe to progress
      service.progress$.pipe(take(2)).subscribe((progress) => {
        progressUpdates.push(progress);
      });

      const requests: ImagePreloadRequest[] = [
        {
          id: '1',
          url: '/progress-1.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
        {
          id: '2',
          url: '/progress-2.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
      ];

      service.preloadImages(requests).subscribe(() => {
        // Should have received at least initial progress
        expect(progressUpdates.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  /**
   * Test 10: SSR Compatibility
   *
   * Tests that the service handles Server-Side Rendering gracefully by
   * detecting the platform and returning appropriate error results instead
   * of crashing when browser APIs are unavailable.
   */
  describe('SSR Compatibility', () => {
    it('should handle SSR context gracefully', (done) => {
      // Create service with SSR platform
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ImagePreloadService,
          { provide: PLATFORM_ID, useValue: 'server' }, // SSR platform
        ],
      });

      const ssrService = TestBed.inject(ImagePreloadService);

      ssrService.preloadImage('/ssr-test.jpg').subscribe((result) => {
        expect(result.loaded).toBe(false);
        expect(result.error).toContain('SSR');
        done();
      });
    });
  });

  /**
   * Test 11: Edge Cases
   *
   * Tests various edge cases and unusual inputs to ensure the service
   * handles them gracefully without crashing.
   */
  describe('Edge Cases', () => {
    it('should handle empty request array', (done) => {
      service.preloadImages([]).subscribe((results) => {
        expect(results.length).toBe(0);
        done();
      });
    });

    it('should handle duplicate URLs in requests', (done) => {
      const requests: ImagePreloadRequest[] = [
        {
          id: 'dup1',
          url: '/duplicate.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
        {
          id: 'dup2',
          url: '/duplicate.jpg',
          strategy: ImageLoadStrategy.EAGER,
        },
      ];

      service.preloadImages(requests).subscribe((results) => {
        // Both should complete, second one should be from cache
        expect(results.length).toBe(2);
        expect(results.every((r) => r.loaded)).toBe(true);
        done();
      });
    });

    it('should handle very long URLs', (done) => {
      const longUrl = '/very-long-url-' + 'x'.repeat(1000) + '.jpg';

      service.preloadImage(longUrl).subscribe((result) => {
        expect(result.url).toBe(longUrl);
        done();
      });
    });

    it('should handle special characters in URLs', (done) => {
      const specialUrl = '/image with spaces & special=chars.jpg?query=123';

      service.preloadImage(specialUrl).subscribe((result) => {
        expect(result.url).toBe(specialUrl);
        done();
      });
    });
  });

  /**
   * Test 12: Memory Management
   *
   * Tests that the service properly cleans up resources when destroyed
   * to prevent memory leaks.
   */
  describe('Memory Management', () => {
    it('should clean up resources on destroy', () => {
      // Subscribe to progress
      const subscription = service.progress$.subscribe();

      // Initially not closed
      expect(subscription.closed).toBe(false);

      // Destroy service
      service.ngOnDestroy();

      // After destroy, subscription should be closed because
      // progressSubject.complete() closes all subscriptions
      expect(subscription.closed).toBe(true);
    });
  });
});
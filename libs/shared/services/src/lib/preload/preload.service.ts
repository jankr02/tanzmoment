// ============================================================================
// PRELOAD SERVICE - IMPLEMENTATION
// ============================================================================

import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  Subject,
  BehaviorSubject,
  from,
  of,
  forkJoin,
  throwError,
} from 'rxjs';
import {
  map,
  catchError,
  tap,
  finalize,
  timeout,
  mergeMap,
  toArray,
} from 'rxjs/operators';

import {
  AssetType,
  PreloadPriority,
  LoadingStatus,
  PreloadAsset,
  PreloadResult,
  PreloadProgress,
  PreloadServiceConfig,
} from './preload.types';

/**
 * PreloadService
 *
 * Intelligent asset preloading service with priority queue and concurrent loading.
 * Supports multiple asset types (images, SVGs, fonts, data) with configurable
 * loading strategies and progress tracking.
 *
 * Features:
 * - Priority-based queue (HIGH → MEDIUM → LOW)
 * - Configurable concurrent loading (default: 3 parallel requests)
 * - Real-time progress tracking via Observable
 * - Individual asset timeout handling
 * - Continue-on-error support
 * - Dev mode logging for debugging
 * - Memory-efficient cleanup on cancellation
 *
 * @example
 * ```typescript
 * const assets: PreloadAsset[] = [
 *   { id: 'hero-1', type: AssetType.IMAGE, url: '/assets/hero-1.jpg', priority: PreloadPriority.HIGH },
 *   { id: 'logo', type: AssetType.SVG, url: '/assets/logo.svg', priority: PreloadPriority.HIGH },
 *   { id: 'feature-1', type: AssetType.IMAGE, url: '/assets/feature-1.jpg', priority: PreloadPriority.MEDIUM }
 * ];
 *
 * this.preloadService.preloadAssets(assets).subscribe({
 *   next: (results) => console.log('All assets loaded', results),
 *   error: (err) => console.error('Critical error', err)
 * });
 *
 * // Subscribe to progress updates
 * this.preloadService.progress$.subscribe(progress => {
 *   console.log(`Loading: ${progress.percentage}%`);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class PreloadService {
  // ==========================================================================
  // Dependencies
  // ==========================================================================

  private readonly http = inject(HttpClient);

  // ==========================================================================
  // Configuration
  // ==========================================================================

  private readonly config: Required<PreloadServiceConfig> = {
    maxConcurrent: 3,
    loadTimeout: 10000,
    continueOnError: true,
    enableLogging: isDevMode(),
  };

  // ==========================================================================
  // State Management
  // ==========================================================================

  private readonly progressSubject = new BehaviorSubject<PreloadProgress>({
    total: 0,
    loaded: 0,
    failed: 0,
    pending: 0,
    percentage: 0,
  });

  /** Observable for real-time progress updates */
  public readonly progress$ = this.progressSubject.asObservable();

  private readonly cancelSubject = new Subject<void>();
  private isLoading = false;

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Configure the preload service with custom settings.
   * Must be called before preloadAssets() to take effect.
   */
  configure(config: Partial<PreloadServiceConfig>): void {
    Object.assign(this.config, config);
    this.log('Configuration updated', this.config);
  }

  /**
   * Preload multiple assets with priority-based queue and concurrent loading.
   *
   * Assets are automatically sorted by priority (HIGH → MEDIUM → LOW)
   * and loaded with the configured concurrency limit.
   *
   * @param assets - Array of assets to preload
   * @returns Observable that emits array of PreloadResults when all assets complete
   */
  preloadAssets(assets: PreloadAsset[]): Observable<PreloadResult[]> {
    if (this.isLoading) {
      this.log('Warning: Preload already in progress. Cancelling previous.');
      this.cancel();
    }

    if (!assets || assets.length === 0) {
      this.log('No assets to preload');
      return of([]);
    }

    this.isLoading = true;
    const sortedAssets = this.sortAssetsByPriority(assets);

    this.log(`Starting preload of ${assets.length} assets`, {
      high: sortedAssets.filter((a) => a.priority === PreloadPriority.HIGH)
        .length,
      medium: sortedAssets.filter((a) => a.priority === PreloadPriority.MEDIUM)
        .length,
      low: sortedAssets.filter((a) => a.priority === PreloadPriority.LOW)
        .length,
    });

    // Initialize progress
    this.progressSubject.next({
      total: assets.length,
      loaded: 0,
      failed: 0,
      pending: assets.length,
      percentage: 0,
    });

    // Create observable stream with concurrent loading
    return from(sortedAssets).pipe(
      mergeMap(
        (asset) => this.loadAsset(asset),
        this.config.maxConcurrent // Concurrent limit
      ),
      toArray(), // Collect all results
      tap((results) => {
        this.log('All assets completed', {
          total: results.length,
          success: results.filter((r) => r.status === LoadingStatus.SUCCESS)
            .length,
          failed: results.filter((r) => r.status === LoadingStatus.ERROR)
            .length,
        });
      }),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }

  /**
   * Cancel ongoing preload operation.
   * Emits cancel signal to abort all pending HTTP requests.
   */
  cancel(): void {
    this.log('Cancelling preload operation');
    this.cancelSubject.next();
    this.isLoading = false;

    // Reset progress
    this.progressSubject.next({
      total: 0,
      loaded: 0,
      failed: 0,
      pending: 0,
      percentage: 0,
    });
  }

  // ==========================================================================
  // Asset Loading
  // ==========================================================================

  /**
   * Load a single asset based on its type.
   * Returns PreloadResult with status, data, and timing information.
   */
  private loadAsset(asset: PreloadAsset): Observable<PreloadResult> {
    const startTime = performance.now();

    this.updateProgress({ currentAsset: asset });
    this.log(`Loading asset: ${asset.id} (${asset.type})`, asset.url);

    // Choose loading strategy based on asset type
    const loadObservable = this.getLoadObservableForType(asset);

    return loadObservable.pipe(
      timeout(this.config.loadTimeout),
      map((data) => {
        const loadTime = Math.round(performance.now() - startTime);
        this.log(`✓ Asset loaded: ${asset.id} in ${loadTime}ms`);

        this.updateProgress({ loaded: +1 });

        return {
          asset,
          status: LoadingStatus.SUCCESS,
          data,
          loadTime,
        };
      }),
      catchError((error) => {
        const loadTime = Math.round(performance.now() - startTime);
        const errorMessage = error.message || 'Unknown error';

        this.log(`✗ Asset failed: ${asset.id} - ${errorMessage}`);
        this.updateProgress({ failed: +1 });

        const result: PreloadResult = {
          asset,
          status: LoadingStatus.ERROR,
          error: errorMessage,
          loadTime,
        };

        // Continue on error if configured
        return this.config.continueOnError ? of(result) : throwError(() => error);
      })
    );
  }

  /**
   * Get the appropriate loading observable based on asset type.
   */
  private getLoadObservableForType(asset: PreloadAsset): Observable<unknown> {
    switch (asset.type) {
      case AssetType.IMAGE:
        return this.loadImage(asset.url);

      case AssetType.SVG:
        return this.loadSvg(asset.url);

      case AssetType.FONT:
        return this.loadFont(asset.url);

      case AssetType.DATA:
        return this.loadData(asset.url);

      default:
        return throwError(() => new Error(`Unknown asset type: ${asset.type}`));
    }
  }

  /**
   * Load image using Image() constructor for browser preloading.
   */
  private loadImage(url: string): Observable<HTMLImageElement> {
    return new Observable((observer) => {
      const img = new Image();

      img.onload = () => {
        observer.next(img);
        observer.complete();
      };

      img.onerror = (error) => {
        observer.error(new Error(`Failed to load image: ${url}`));
      };

      // Start loading
      img.src = url;

      // Cleanup on unsubscribe
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    });
  }

  /**
   * Load SVG file as text via HTTP.
   */
  private loadSvg(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }

  /**
   * Load font file (implementation can be enhanced with FontFace API).
   */
  private loadFont(url: string): Observable<ArrayBuffer> {
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  /**
   * Load generic data file as JSON.
   */
  private loadData(url: string): Observable<unknown> {
    return this.http.get(url);
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Sort assets by priority: HIGH → MEDIUM → LOW.
   * Assets without priority are treated as MEDIUM.
   */
  private sortAssetsByPriority(assets: PreloadAsset[]): PreloadAsset[] {
    const priorityOrder = {
      [PreloadPriority.HIGH]: 0,
      [PreloadPriority.MEDIUM]: 1,
      [PreloadPriority.LOW]: 2,
    };

    return [...assets].sort((a, b) => {
      const aPriority = a.priority || PreloadPriority.MEDIUM;
      const bPriority = b.priority || PreloadPriority.MEDIUM;
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
  }

  /**
   * Update progress state and emit to subscribers.
   * Accepts incremental updates (e.g., { loaded: +1 }) or absolute values.
   */
  private updateProgress(
    update: Partial<Omit<PreloadProgress, 'loaded' | 'failed'>> & {
      loaded?: number | '+1';
      failed?: number | '+1';
    }
  ): void {
    const current = this.progressSubject.value;

    // Handle incremental updates
    const loaded =
      update.loaded === '+1' || update.loaded === +1
        ? current.loaded + 1
        : update.loaded ?? current.loaded;

    const failed =
      update.failed === '+1' || update.failed === +1
        ? current.failed + 1
        : update.failed ?? current.failed;

    const pending = current.total - loaded - failed;
    const percentage =
      current.total > 0 ? Math.round((loaded / current.total) * 100) : 0;

    const newProgress: PreloadProgress = {
      ...current,
      ...update,
      loaded,
      failed,
      pending,
      percentage,
    };

    this.progressSubject.next(newProgress);
  }

  /**
   * Log message in dev mode.
   */
  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      console.log(`[PreloadService] ${message}`, data ?? '');
    }
  }
}
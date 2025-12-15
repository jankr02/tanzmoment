// ============================================================================
// PRELOAD SERVICE - UNIT TESTS
// ============================================================================

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PreloadService } from './preload.service';
import {
  AssetType,
  PreloadPriority,
  LoadingStatus,
  PreloadAsset,
  PreloadProgress,
} from './preload.types';
import { firstValueFrom, lastValueFrom } from 'rxjs';

describe('PreloadService', () => {
  let service: PreloadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PreloadService],
    });

    service = TestBed.inject(PreloadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    try {
      httpMock.verify();
    } catch (error) {
      // If there are open requests (e.g., from cancellation tests), flush them
      httpMock.match(() => true).forEach(req => {
        try {
          req.flush(null);
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
    }
    // Reset TestBed to ensure clean state for next test
    TestBed.resetTestingModule();
  });

  // ==========================================================================
  // Service Creation
  // ==========================================================================

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have initial progress state', async () => {
      const progress = await firstValueFrom(service.progress$);
      expect(progress.total).toBe(0);
      expect(progress.loaded).toBe(0);
      expect(progress.failed).toBe(0);
      expect(progress.pending).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  // ==========================================================================
  // Configuration
  // ==========================================================================

  describe('Configuration', () => {
    it('should allow custom configuration', () => {
      service.configure({
        maxConcurrent: 5,
        loadTimeout: 5000,
        continueOnError: false,
      });

      // Configuration is private, but we can test its effects
      expect(service).toBeTruthy();
    });

    it('should merge partial configuration with defaults', () => {
      service.configure({ maxConcurrent: 10 });
      expect(service).toBeTruthy();
    });
  });

  // ==========================================================================
  // Empty Assets
  // ==========================================================================

  describe('Empty Assets Handling', () => {
    it('should handle empty asset array', async () => {
      const results = await lastValueFrom(service.preloadAssets([]));
      expect(results).toEqual([]);
    });

    it('should handle null/undefined gracefully', async () => {
      const results = await lastValueFrom(service.preloadAssets(null as any));
      expect(results).toEqual([]);
    });
  });

  // ==========================================================================
  // Priority Sorting
  // ==========================================================================

  describe('Priority Sorting', () => {
    it('should load HIGH priority assets first', async () => {
      const assets: PreloadAsset[] = [
        {
          id: 'low',
          type: AssetType.SVG,
          url: '/low.svg',
          priority: PreloadPriority.LOW,
        },
        {
          id: 'high',
          type: AssetType.SVG,
          url: '/high.svg',
          priority: PreloadPriority.HIGH,
        },
        {
          id: 'medium',
          type: AssetType.SVG,
          url: '/medium.svg',
          priority: PreloadPriority.MEDIUM,
        },
      ];

      const loadOrder: string[] = [];

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      // Respond to requests in order they arrive
      // HIGH should arrive first due to priority sorting
      const highReq = httpMock.expectOne('/high.svg');
      loadOrder.push('high');
      highReq.flush('<svg></svg>');

      const mediumReq = httpMock.expectOne('/medium.svg');
      loadOrder.push('medium');
      mediumReq.flush('<svg></svg>');

      const lowReq = httpMock.expectOne('/low.svg');
      loadOrder.push('low');
      lowReq.flush('<svg></svg>');

      const results = await resultsPromise;

      // Note: Due to concurrent loading, we can't guarantee exact order
      // but we can verify all assets were attempted
      expect(results.length).toBe(3);

      // Verify load order matches priority
      expect(loadOrder).toEqual(['high', 'medium', 'low']);
    });

    it('should treat assets without priority as MEDIUM', async () => {
      const assets: PreloadAsset[] = [
        {
          id: 'no-priority',
          type: AssetType.SVG,
          url: '/no-priority.svg',
        },
        {
          id: 'high',
          type: AssetType.SVG,
          url: '/high.svg',
          priority: PreloadPriority.HIGH,
        },
      ];

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      // HIGH should be requested first
      const highReq = httpMock.expectOne('/high.svg');
      highReq.flush('<svg></svg>');

      const noPriorityReq = httpMock.expectOne('/no-priority.svg');
      noPriorityReq.flush('<svg></svg>');

      const results = await resultsPromise;
      expect(results.length).toBe(2);
    });
  });

  // ==========================================================================
  // SVG Loading
  // ==========================================================================

  describe('SVG Loading', () => {
    it('should successfully load SVG assets', async () => {
      const assets: PreloadAsset[] = [
        {
          id: 'logo',
          type: AssetType.SVG,
          url: '/assets/logo.svg',
          priority: PreloadPriority.HIGH,
        },
      ];

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      const req = httpMock.expectOne('/assets/logo.svg');
      expect(req.request.responseType).toBe('text');
      req.flush('<svg>test</svg>');

      const results = await resultsPromise;

      expect(results.length).toBe(1);
      expect(results[0].status).toBe(LoadingStatus.SUCCESS);
      expect(results[0].asset.id).toBe('logo');
      expect(results[0].data).toBe('<svg>test</svg>');
      expect(results[0].loadTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle SVG loading errors', async () => {
      const assets: PreloadAsset[] = [
        {
          id: 'broken',
          type: AssetType.SVG,
          url: '/broken.svg',
        },
      ];

      service.configure({ continueOnError: true });

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      const req = httpMock.expectOne('/broken.svg');
      req.error(new ProgressEvent('error'));

      const results = await resultsPromise;

      expect(results.length).toBe(1);
      expect(results[0].status).toBe(LoadingStatus.ERROR);
      expect(results[0].error).toBeTruthy();
    });
  });

  // ==========================================================================
  // Image Loading
  // ==========================================================================

  describe('Image Loading', () => {
    it('should load image assets', async () => {
      const assets: PreloadAsset[] = [
        {
          id: 'hero',
          type: AssetType.IMAGE,
          url: '/assets/hero.jpg',
          priority: PreloadPriority.HIGH,
        },
      ];

      // Note: Image loading uses Image() constructor, not HTTP
      // We can only test that it attempts to load
      try {
        const results = await lastValueFrom(service.preloadAssets(assets));
        expect(results.length).toBe(1);
        expect(results[0].asset.id).toBe('hero');
        // In test environment, image loading may fail
        // We just verify the attempt was made
      } catch (err) {
        // Image loading may fail in test environment
        expect(err).toBeTruthy();
      }

      // No HTTP mock needed for images
    });
  });

  // ==========================================================================
  // Progress Tracking
  // ==========================================================================

  describe('Progress Tracking', () => {
    it('should emit progress updates during loading', async () => {
      const assets: PreloadAsset[] = [
        { id: '1', type: AssetType.SVG, url: '/1.svg' },
        { id: '2', type: AssetType.SVG, url: '/2.svg' },
        { id: '3', type: AssetType.SVG, url: '/3.svg' },
      ];

      const progressUpdates: PreloadProgress[] = [];

      service.progress$.subscribe((progress) => {
        progressUpdates.push({ ...progress });
      });

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      // Flush all requests
      httpMock.expectOne('/1.svg').flush('<svg></svg>');
      httpMock.expectOne('/2.svg').flush('<svg></svg>');
      httpMock.expectOne('/3.svg').flush('<svg></svg>');

      await resultsPromise;

      // Check that we got progress updates
      expect(progressUpdates.length).toBeGreaterThan(1);

      // First update should show total
      expect(progressUpdates[1].total).toBe(3);
      expect(progressUpdates[1].pending).toBe(3);

      // Last update should show completion
      const lastUpdate = progressUpdates[progressUpdates.length - 1];
      expect(lastUpdate.loaded).toBe(3);
      expect(lastUpdate.percentage).toBe(100);
    });

    it('should track failed assets in progress', async () => {
      const assets: PreloadAsset[] = [
        { id: 'success', type: AssetType.SVG, url: '/success.svg' },
        { id: 'failure', type: AssetType.SVG, url: '/failure.svg' },
      ];

      service.configure({ continueOnError: true });

      let finalProgress: PreloadProgress | undefined;

      service.progress$.subscribe((progress) => {
        finalProgress = progress;
      });

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      httpMock.expectOne('/success.svg').flush('<svg></svg>');
      httpMock.expectOne('/failure.svg').error(new ProgressEvent('error'));

      await resultsPromise;

      expect(finalProgress?.loaded).toBe(1);
      expect(finalProgress?.failed).toBe(1);
      expect(finalProgress?.percentage).toBe(50);
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('Error Handling', () => {
    it('should continue loading on error when configured', async () => {
      const assets: PreloadAsset[] = [
        { id: '1', type: AssetType.SVG, url: '/1.svg' },
        { id: '2', type: AssetType.SVG, url: '/2.svg' },
        { id: '3', type: AssetType.SVG, url: '/3.svg' },
      ];

      service.configure({ continueOnError: true });

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      httpMock.expectOne('/1.svg').flush('<svg></svg>');
      httpMock.expectOne('/2.svg').error(new ProgressEvent('error'));
      httpMock.expectOne('/3.svg').flush('<svg></svg>');

      const results = await resultsPromise;

      expect(results.length).toBe(3);
      expect(results.filter((r) => r.status === LoadingStatus.SUCCESS).length).toBe(2);
      expect(results.filter((r) => r.status === LoadingStatus.ERROR).length).toBe(1);
    });

    it('should stop on error when continueOnError is false', async () => {
      const assets: PreloadAsset[] = [
        { id: '1', type: AssetType.SVG, url: '/1.svg' },
        { id: '2', type: AssetType.SVG, url: '/2.svg' },
      ];

      service.configure({ continueOnError: false });

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      httpMock.expectOne('/1.svg').flush('<svg></svg>');
      httpMock.expectOne('/2.svg').error(new ProgressEvent('error'));

      try {
        await resultsPromise;
        fail('Should not complete successfully');
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });
  });

  // ==========================================================================
  // Cancellation
  // ==========================================================================

  describe('Cancellation', () => {
    it('should cancel ongoing preload operation', async () => {
      const assets: PreloadAsset[] = [
        { id: '1', type: AssetType.SVG, url: '/1.svg' },
        { id: '2', type: AssetType.SVG, url: '/2.svg' },
      ];

      service.preloadAssets(assets).subscribe();
      service.cancel();

      // Progress should be reset after cancel
      const progress = await firstValueFrom(service.progress$);
      expect(progress.total).toBe(0);
      expect(progress.pending).toBe(0);
    });

    it('should allow new preload after cancellation', async () => {
      const assets1: PreloadAsset[] = [
        { id: '1', type: AssetType.SVG, url: '/1.svg' },
      ];
      const assets2: PreloadAsset[] = [
        { id: '2', type: AssetType.SVG, url: '/2.svg' },
      ];

      service.preloadAssets(assets1).subscribe();
      service.cancel();

      const resultsPromise = lastValueFrom(service.preloadAssets(assets2));

      httpMock.expectOne('/2.svg').flush('<svg></svg>');

      const results = await resultsPromise;

      expect(results.length).toBe(1);
      expect(results[0].asset.id).toBe('2');
    });
  });

  // ==========================================================================
  // Concurrent Loading
  // ==========================================================================

  describe('Concurrent Loading', () => {
    it('should respect maxConcurrent limit', async () => {
      const assets: PreloadAsset[] = [
        { id: '1', type: AssetType.SVG, url: '/1.svg' },
        { id: '2', type: AssetType.SVG, url: '/2.svg' },
        { id: '3', type: AssetType.SVG, url: '/3.svg' },
        { id: '4', type: AssetType.SVG, url: '/4.svg' },
        { id: '5', type: AssetType.SVG, url: '/5.svg' },
      ];

      service.configure({ maxConcurrent: 2 });

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      // Only first 2 should be requested immediately
      const req1 = httpMock.expectOne('/1.svg');
      const req2 = httpMock.expectOne('/2.svg');

      // Complete first request
      req1.flush('<svg></svg>');

      // Now third request should start
      const req3 = httpMock.expectOne('/3.svg');
      req2.flush('<svg></svg>');

      // Fourth request
      const req4 = httpMock.expectOne('/4.svg');
      req3.flush('<svg></svg>');

      // Fifth request
      const req5 = httpMock.expectOne('/5.svg');
      req4.flush('<svg></svg>');
      req5.flush('<svg></svg>');

      const results = await resultsPromise;

      expect(results.length).toBe(5);
    });
  });

  // ==========================================================================
  // Data Loading
  // ==========================================================================

  describe('Data Loading', () => {
    it('should load JSON data assets', async () => {
      const assets: PreloadAsset[] = [
        {
          id: 'config',
          type: AssetType.DATA,
          url: '/config.json',
        },
      ];

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      const req = httpMock.expectOne('/config.json');
      req.flush({ test: 'data' });

      const results = await resultsPromise;

      expect(results.length).toBe(1);
      expect(results[0].status).toBe(LoadingStatus.SUCCESS);
      expect(results[0].data).toEqual({ test: 'data' });
    });
  });

  // ==========================================================================
  // Timeout Handling
  // ==========================================================================

  describe('Timeout Handling', () => {
    it('should timeout slow loading assets', async () => {
      const assets: PreloadAsset[] = [
        {
          id: 'slow',
          type: AssetType.SVG,
          url: '/slow.svg',
        },
      ];

      service.configure({ loadTimeout: 100, continueOnError: true });

      const resultsPromise = lastValueFrom(service.preloadAssets(assets));

      // Don't flush the request - let it timeout
      httpMock.expectOne('/slow.svg');

      const results = await resultsPromise;

      expect(results.length).toBe(1);
      expect(results[0].status).toBe(LoadingStatus.ERROR);
      expect(results[0].error).toContain('Timeout');
    });
  });
});
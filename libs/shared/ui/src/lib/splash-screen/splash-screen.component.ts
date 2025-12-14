import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
  isDevMode,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, timer } from 'rxjs';
import { takeUntil, delay, tap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { PreloadService } from '@tanzmoment/shared/services';
import {
  SplashScreenState,
  SplashScreenConfig,
  SplashScreenProgress,
  SplashScreenCompleted,
  SplashScreenVisitData,
  DEFAULT_SPLASH_CONFIG,
} from './splash-screen.types';

/**
 * Animation timing constants (in milliseconds)
 */
const ANIMATION_TIMINGS = {
  /** Initial state transition delay */
  INITIAL_STATE: 50,
  /** Brand fade-out animation duration */
  BRAND_FADE_OUT: 500,
  /** Splash screen fade-out duration */
  SPLASH_FADE_OUT: 800,
  /** SVG verification delay */
  SVG_VERIFY: 100,
} as const;

/**
 * Animation state type for accessibility and lifecycle tracking
 */
type AnimationState = 'entering' | 'visible' | 'leaving' | 'hidden';

/**
 * Enhanced Splash Screen Component with Preloading
 *
 * Full-screen intro sequence featuring an organic illustration, brand messaging,
 * and intelligent asset preloading during the animation.
 *
 * New Features:
 * - PreloadService integration for critical assets
 * - Real-time progress bar (0-100%)
 * - LocalStorage visit tracking (first-time vs. returning)
 * - Smart duration adjustment based on visit history
 * - Rich completion event with preload results
 * - Skip button with fallback to skeleton screens
 * - GPU-accelerated animations
 * - Accessibility optimized (ARIA, reduced motion)
 *
 * @example
 * ```typescript
 * <tm-splash-screen
 *   [config]="splashConfig"
 *   (completed)="onSplashCompleted($event)"
 *   (progressChange)="onProgressChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'tm-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
})
export class SplashScreenComponent implements OnInit, OnDestroy, AfterViewInit {
  // ==========================================================================
  // Dependencies
  // ==========================================================================

  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly preloadService = inject(PreloadService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly ngZone = inject(NgZone);

  // ==========================================================================
  // View References
  // ==========================================================================

  @ViewChild('illustrationContainer', { static: false })
  illustrationContainer?: ElementRef<HTMLDivElement>;

  // ==========================================================================
  // Configuration
  // ==========================================================================

  /** Complete splash screen configuration */
  @Input() config: SplashScreenConfig = DEFAULT_SPLASH_CONFIG;

  /** Path to SVG illustration */
  @Input() svgPath = 'assets/images/intro-sequence-animated.svg';

  // ==========================================================================
  // Events
  // ==========================================================================

  /** Emitted when splash screen completes with detailed results */
  @Output() completed = new EventEmitter<SplashScreenCompleted>();

  /** Emitted on progress updates (for external progress displays) */
  @Output() progressChange = new EventEmitter<SplashScreenProgress>();

  // ==========================================================================
  // State - Visibility & Animation
  // ==========================================================================

  /** Splash screen visibility */
  visible = signal(true);

  /** Fade-out animation active */
  fadingOut = signal(false);

  /** SVG loaded and injected */
  svgLoaded = signal(false);

  /** Brand name hidden (triggers text sequence) */
  brandHidden = signal(false);

  /** Brand name fading out (triggers exit animation) */
  brandFadingOut = signal(false);

  /** Animation state for accessibility */
  animationState: AnimationState = 'entering';

  /** Sanitized SVG content for template */
  svgContent: SafeHtml = '';

  // ==========================================================================
  // State - Preloading
  // ==========================================================================

  /** Current splash screen state */
  currentState = signal<SplashScreenState>(SplashScreenState.IDLE);

  /** Loading progress (0-100) */
  loadingProgress = signal<number>(0);

  /** Assets ready flag */
  assetsReady = signal<boolean>(false);

  /** Minimum duration met flag */
  minDurationMet = signal<boolean>(false);

  /** Visit data from LocalStorage */
  visitData = signal<SplashScreenVisitData | null>(null);

  /** Actual display duration being used */
  activeDuration = signal<number>(DEFAULT_SPLASH_CONFIG.fullDuration);

  /** Timestamp when splash screen started */
  private startTime = 0;

  /** Timestamp when minimum duration timer started */
  private minDurationStartTime = 0;

  /** Preload results for completion event */
  private preloadResults: any[] = [];

  // ==========================================================================
  // Computed
  // ==========================================================================

  /** Whether skip button should be shown */
  showSkipButton = computed(() => this.config.showSkipButton);

  /** Whether progress bar should be shown */
  showProgress = computed(() => this.config.showProgress);

  /** Whether splash can complete (assets + min duration ready) */
  canComplete = computed(() => {
    return this.assetsReady() && this.minDurationMet();
  });

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /** Subject for managing subscription cleanup */
  private readonly destroy$ = new Subject<void>();

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  constructor() {
    // Auto-complete effect when ready
    effect(() => {
      if (
        this.canComplete() &&
        this.currentState() !== SplashScreenState.HIDDEN &&
        this.currentState() !== SplashScreenState.FADING_OUT
      ) {
        this.log('All conditions met, completing splash screen');
        this.ngZone.run(() => {
          this.completeSplash('auto');
        });
      }
    });
  }

  ngOnInit(): void {
    this.startTime = performance.now();

    // Initialize visit tracking
    this.initializeVisitTracking();

    // Load SVG illustration
    this.loadSvg();

    // Setup animation timings
    this.setupAnimationTimings();

    // Start preloading if assets are configured
    if (this.config.preloadConfig.criticalAssets.length > 0) {
      this.startPreloading();
    } else {
      // No assets to load, mark as ready immediately
      this.assetsReady.set(true);
    }

    // Start minimum duration timer
    this.startMinDurationTimer();
  }

  ngAfterViewInit(): void {
    if (this.svgLoaded() && this.illustrationContainer && isDevMode()) {
      this.verifyInlineSvg();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================================
  // Visit Tracking
  // ==========================================================================

  /**
   * Initialize visit tracking from LocalStorage.
   * Determines if user is first-time or returning visitor.
   */
  private initializeVisitTracking(): void {
    if (!this.isBrowser) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      const now = new Date().toISOString();

      if (stored) {
        const data: SplashScreenVisitData = JSON.parse(stored);
        data.lastVisit = now;
        data.visitCount += 1;
        this.visitData.set(data);
        localStorage.setItem(this.config.storageKey, JSON.stringify(data));

        this.log('Returning visitor detected', data);
      } else {
        const newData: SplashScreenVisitData = {
          hasVisited: true,
          firstVisit: now,
          lastVisit: now,
          visitCount: 1,
        };
        this.visitData.set(newData);
        localStorage.setItem(this.config.storageKey, JSON.stringify(newData));

        this.log('First-time visitor');
      }
    } catch (error) {
      console.warn('Failed to access localStorage for visit tracking:', error);
    }
  }

  // ==========================================================================
  // Preloading
  // ==========================================================================

  /**
   * Start preloading critical assets via PreloadService.
   * Updates progress signal as assets load.
   */
  private startPreloading(): void {
    this.currentState.set(SplashScreenState.LOADING);

    // Subscribe to progress updates
    this.preloadService.progress$
      .pipe(takeUntil(this.destroy$))
      .subscribe((progress) => {
        this.ngZone.run(() => {
          this.loadingProgress.set(progress.percentage);
          this.emitProgress();
        });
      });

    // Start preloading
    this.preloadService
      .preloadAssets(this.config.preloadConfig.criticalAssets)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.ngZone.run(() => {
            this.preloadResults = results;
            this.assetsReady.set(true);
            this.currentState.set(SplashScreenState.LOADED);

            this.log('Assets loaded', {
              total: results.length,
              success: results.filter((r: any) => r.status === 'SUCCESS')
                .length,
              failed: results.filter((r: any) => r.status === 'ERROR').length,
            });
          });
        },
        error: (error) => {
          console.error('Critical preload error:', error);
          this.ngZone.run(() => {
            this.assetsReady.set(true); // Allow completion even on error
            this.currentState.set(SplashScreenState.ERROR);
          });
        },
      });
  }

  /**
   * Start minimum duration timer.
   * Ensures splash screen shows for at least minDisplayDuration.
   */
  private startMinDurationTimer(): void {
    const minDuration = this.config.preloadConfig.minDisplayDuration || 1500;
    this.minDurationStartTime = performance.now();

    timer(minDuration)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.minDurationMet.set(true);
          this.log('Minimum duration met');
        });
      });
  }

  /**
   * Emit progress update event.
   */
  private emitProgress(): void {
    const elapsed = Math.round(performance.now() - this.startTime);

    const progress: SplashScreenProgress = {
      state: this.currentState(),
      totalAssets: this.config.preloadConfig.criticalAssets.length,
      loadedAssets: Math.round(
        (this.loadingProgress() / 100) *
          this.config.preloadConfig.criticalAssets.length
      ),
      failedAssets: 0, // Updated from preload results
      percentage: this.loadingProgress(),
      elapsedTime: elapsed,
      estimatedTimeRemaining: null,
      minDurationMet: this.minDurationMet(),
      assetsReady: this.assetsReady(),
    };

    this.progressChange.emit(progress);
  }

  // ==========================================================================
  // Animation Timings
  // ==========================================================================

  /**
   * Sets up RxJS-based animation timings.
   * Replaces setTimeout for better cleanup and testability.
   */
  private setupAnimationTimings(): void {
    // Initial animation state change
    timer(ANIMATION_TIMINGS.INITIAL_STATE)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.animationState = 'visible';
        });
      });

    // Brand fade-out sequence
    timer(this.config.brandIntroDelay)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.ngZone.run(() => {
            this.brandFadingOut.set(true);
          });
        }),
        delay(ANIMATION_TIMINGS.BRAND_FADE_OUT)
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.brandHidden.set(true);
        });
      });
  }

  // ==========================================================================
  // SVG Loading
  // ==========================================================================

  /**
   * Loads SVG file and injects it inline into the template.
   * This allows CSS to access internal SVG elements (e.g., #woman, #plant).
   */
  private loadSvg(): void {
    this.http
      .get(this.svgPath, { responseType: 'text' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (svgText) => {
          const cleanedSvg = this.cleanSvgForInline(svgText);
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(cleanedSvg);
          this.svgLoaded.set(true);
        },
        error: (err) => {
          console.error('Failed to load SVG illustration:', err);
          this.svgLoaded.set(true);
        },
      });
  }

  /**
   * Cleans SVG for inline use by removing XML declarations.
   */
  private cleanSvgForInline(svgText: string): string {
    return svgText.replace(/<\?xml[^>]*\?>/g, '').trim();
  }

  /**
   * Verifies that SVG elements are accessible in the DOM.
   * Used for development debugging only.
   */
  private verifyInlineSvg(): void {
    timer(ANIMATION_TIMINGS.SVG_VERIFY)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const woman = document.querySelector('#woman');
        const plant = document.querySelector('#plant');

        if (!woman || !plant) {
          console.warn(
            'SVG animation elements not found. Ensure SVG is properly inline.'
          );
        }
      });
  }

  // ==========================================================================
  // Completion
  // ==========================================================================

  /**
   * Complete splash screen and emit detailed completion event.
   */
  private completeSplash(
    completionType: 'auto' | 'skip' | 'timeout' | 'error'
  ): void {
    if (
      this.currentState() === SplashScreenState.FADING_OUT ||
      this.currentState() === SplashScreenState.HIDDEN
    ) {
      return;
    }

    this.currentState.set(SplashScreenState.FADING_OUT);

    const duration = Math.round(performance.now() - this.startTime);
    const successCount = this.preloadResults.filter(
      (r: any) => r.status === 'SUCCESS'
    ).length;
    const failureCount = this.preloadResults.filter(
      (r: any) => r.status === 'ERROR'
    ).length;

    const completedEvent: SplashScreenCompleted = {
      completionType,
      duration,
      preloadResults: this.preloadResults,
      successCount,
      failureCount,
      isReturningVisitor: this.visitData()?.hasVisited || false,
      errors: this.preloadResults
        .filter((r: any) => r.status === 'ERROR')
        .map((r: any) => r.error),
    };

    this.log('Splash screen completing', completedEvent);

    // Trigger fade-out animation
    this.hide();

    timer(ANIMATION_TIMINGS.SPLASH_FADE_OUT)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.completed.emit(completedEvent);
          this.currentState.set(SplashScreenState.HIDDEN);
        });
      });
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Hides the splash screen with fade-out animation.
   * Triggers dance animation for SVG elements.
   */
  private hide(): void {
    if (this.fadingOut()) return;

    this.animationState = 'leaving';
    this.fadingOut.set(true);

    this.triggerDanceAnimation();

    timer(ANIMATION_TIMINGS.SPLASH_FADE_OUT)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.visible.set(false);
          this.animationState = 'hidden';
        });
      });
  }

  /**
   * Triggers CSS animations for SVG elements by adding animation class.
   */
  private triggerDanceAnimation(): void {
    if (this.illustrationContainer) {
      this.illustrationContainer.nativeElement.classList.add(
        'splash-screen__illustration--dancing'
      );
    }
  }

  /**
   * Handles skip button click.
   * Cancels all pending timers and immediately triggers completion.
   */
  onSkip(): void {
    this.log('Skip button clicked');
    this.currentState.set(SplashScreenState.SKIPPED);

    // Mark everything as ready to allow immediate completion
    this.minDurationMet.set(true);
    this.assetsReady.set(true);

    // Complete immediately
    this.completeSplash('skip');
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Log message if logging is enabled.
   */
  private log(message: string, data?: any): void {
    if (this.config.enableLogging || isDevMode()) {
      console.log(`[SplashScreen] ${message}`, data || '');
    }
  }
}

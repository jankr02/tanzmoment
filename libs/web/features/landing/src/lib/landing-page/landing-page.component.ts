import {
  Component,
  signal,
  computed,
  inject,
  effect,
  OnInit,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  HeaderComponent,
  FooterComponent,
  SplashScreenComponent,
  SplashScreenConfig,
  SplashScreenStrategy,
  SplashScreenCompleted,
  SplashScreenProgress,
  SPLASH_ASSET_PRIORITY,
  AssetType,
  SkeletonFeatureGridComponent,
  NavItem,
} from '@tanzmoment/shared/ui';
import { HeroGalleryComponent } from '../hero-gallery/hero-gallery.component';
import { FeatureNavigationComponent } from '../feature-navigation/feature-navigation.component';
import {
  LandingPageStateService,
  LandingPageSection,
} from './landing-page-state.service';

@Component({
  selector: 'tm-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    SplashScreenComponent,
    HeaderComponent,
    FooterComponent,
    HeroGalleryComponent,
    FeatureNavigationComponent,
    SkeletonFeatureGridComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class LandingPageComponent implements OnInit {
  /**
   * Landing Page Container Component with Orchestration
   *
   * Phase 3.3 - Step 3 Enhancements:
   * - Centralized state management via LandingPageStateService
   * - Sequential loading coordination (Splash → Hero → Features)
   * - Error handling with skeleton fallbacks
   * - Progress tracking and analytics
   * - Smooth transitions between states
   *
   * This component orchestrates the layout and composition of:
   * - Splash Screen (with asset preloading)
   * - Header (from shared UI)
   * - Hero Gallery Section (image slider with smart preloading)
   * - Feature Navigation Section (three linked feature cards)
   * - Footer (from shared UI)
   */

  // ==========================================================================
  // Dependencies
  // ==========================================================================

  private readonly landingPageState = inject(LandingPageStateService);
  private readonly ngZone = inject(NgZone);

  // ==========================================================================
  // State Management - Visibility
  // ==========================================================================

  /** Controls splash screen visibility */
  showSplash = signal(true);

  /** Controls hero gallery visibility */
  showHero = signal(false);

  /** Controls features section visibility */
  showFeatures = signal(false);

  /** Whether features are loading */
  featuresLoading = signal(false);

  /** Whether features had error */
  featuresError = signal(false);

  // ==========================================================================
  // Header Navigation
  // ==========================================================================

  /** Navigation items for the header */
  navItems: NavItem[] = [
    {
      label: 'Kurse',
      route: '/courses',
    },
    {
      label: 'Über uns',
      route: '/about',
    },
    {
      label: 'Kontakt',
      route: '/contact',
    },
  ];

  // ==========================================================================
  // State Management - Analytics
  // ==========================================================================

  /** Tracks number of successfully preloaded assets */
  assetsPreloaded = signal(0);

  /** Visitor type (first-time or returning) */
  visitorType = signal<string>('unknown');

  // ==========================================================================
  // Computed State
  // ==========================================================================

  /** Overall landing page state */
  pageState = computed(() => this.landingPageState.state());

  /** Whether page is fully loaded */
  isPageReady = computed(() => this.pageState().isFullyLoaded);

  /** Overall progress percentage */
  overallProgress = computed(() => this.pageState().overallProgress);

  // ==========================================================================
  // Splash Screen Configuration
  // ==========================================================================

  splashConfig: SplashScreenConfig = {
    strategy: SplashScreenStrategy.FULL,
    fullDuration: 3000,
    shortenedDuration: 500,

    preloadConfig: {
      criticalAssets: [
        {
          id: 'hero-1',
          type: AssetType.IMAGE,
          url: 'assets/images/hero/dance-1.jpg',
          priority: SPLASH_ASSET_PRIORITY.HERO_IMAGE_FIRST,
        },

        {
          id: 'feature-about',
          type: AssetType.SVG,
          url: 'assets/images/illustrations/About Me.svg',
          priority: SPLASH_ASSET_PRIORITY.FEATURE_SVGS,
        },
        {
          id: 'feature-bird',
          type: AssetType.SVG,
          url: 'assets/images/illustrations/Bird.svg',
          priority: SPLASH_ASSET_PRIORITY.FEATURE_SVGS,
        },
        {
          id: 'feature-flower',
          type: AssetType.SVG,
          url: 'assets/images/illustrations/flower.svg',
          priority: SPLASH_ASSET_PRIORITY.FEATURE_SVGS,
        },

        {
          id: 'logo-with-name',
          type: AssetType.SVG,
          url: 'assets/images/logo-with-name.svg',
          priority: SPLASH_ASSET_PRIORITY.BRAND_ASSETS,
        },

        {
          id: 'hero-2',
          type: AssetType.IMAGE,
          url: 'assets/images/hero/dance-2.jpg',
          priority: SPLASH_ASSET_PRIORITY.HERO_IMAGES_ADDITIONAL,
        },
      ],
      continueOnError: true,
      minDisplayDuration: 3500,
      maxLoadDuration: 5000,
    },

    showSkipButton: true,
    showProgress: true,
    storageKey: 'tanzmoment_splash_visits',
    brandIntroDelay: 1500,
    enableLogging: true, // ⚠️ Set to false in production
  };

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  constructor() {
    // Effect: Watch for hero ready, then load features
    effect(() => {
      // Must read the signal directly for Angular to track the dependency
      const state = this.landingPageState.state();
      const heroReady = state.hero.status === 'READY';

      if (heroReady && !this.showFeatures() && !this.featuresLoading()) {
        this.log('Hero ready, loading features sequentially');
        this.loadFeatures();
      }
    });

    // Effect: Log page state changes
    effect(() => {
      const state = this.pageState();
      this.log('Page state updated', {
        progress: state.overallProgress + '%',
        splash: state.splash.status,
        hero: state.hero.status,
        features: state.features.status,
      });
    });
  }

  ngOnInit(): void {
    this.log('Landing page initializing');

    // Subscribe to analytics events
    this.landingPageState.analytics$.subscribe((event) => {
      this.log('Analytics event', event);
      // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
    });

    // Mark splash as loading
    this.landingPageState.setSectionLoading(LandingPageSection.SPLASH);
  }

  // ==========================================================================
  // Event Handlers - Splash Screen
  // ==========================================================================

  /**
   * Handle splash screen completion.
   * Marks splash as ready and triggers hero display.
   */
  onSplashCompleted(event: SplashScreenCompleted): void {
    this.ngZone.run(() => {
      this.log('Splash completed', event);

      // Update analytics state
      this.assetsPreloaded.set(event.successCount);
      this.visitorType.set(
        event.isReturningVisitor ? 'Returning Visitor' : 'First-time Visitor'
      );

      // Mark splash as ready
      this.landingPageState.setSectionReady(LandingPageSection.SPLASH, {
        completionType: event.completionType,
        assetsLoaded: event.successCount,
        assetsFailed: event.failureCount,
        isReturningVisitor: event.isReturningVisitor,
      });

      // Hide splash screen
      this.showSplash.set(false);

      // Show hero gallery
      this.showHero.set(true);

      // Mark hero as loading
      this.landingPageState.setSectionLoading(LandingPageSection.HERO);

      this.log('📊 Splash Screen Stats:', {
        completionType: event.completionType,
        duration: event.duration + 'ms',
        assetsLoaded: event.successCount,
        assetsFailed: event.failureCount,
        visitorType: this.visitorType(),
      });

      if (event.errors && event.errors.length > 0) {
        console.warn('⚠️ Some assets failed to load:', event.errors);
      }
    });
  }

  /**
   * Handle splash screen progress updates.
   */
  onSplashProgressChange(progress: SplashScreenProgress): void {
    // Log progress milestones
    if (progress.percentage % 25 === 0 && progress.percentage > 0) {
      this.log(
        `Splash loading: ${progress.percentage}% (${progress.loadedAssets}/${progress.totalAssets})`
      );
    }
  }

  // ==========================================================================
  // Event Handlers - Hero Gallery
  // ==========================================================================

  /**
   * Called by hero gallery when it's ready.
   * This is triggered via a custom event or timer after first image loads.
   */
  onHeroReady(): void {
    this.ngZone.run(() => {
      this.log('Hero gallery ready');

      this.landingPageState.setSectionReady(LandingPageSection.HERO, {
        firstImageCached: true, // Preloaded via splash
      });

      // Features will load automatically via effect
    });
  }

  /**
   * Called by hero gallery if there's an error.
   */
  onHeroError(error: ErrorEvent): void {
    const errorMessage = error.message || 'Unknown error loading hero gallery';
    console.error('[LandingPage] Hero gallery error:', errorMessage, error);

    this.ngZone.run(() => {
      this.landingPageState.setSectionError(
        LandingPageSection.HERO,
        errorMessage
      );

      // Still try to load features despite hero error
      this.loadFeatures();
    });
  }

  // ==========================================================================
  // Features Loading
  // ==========================================================================

  /**
   * Load features section sequentially after hero is ready.
   * Uses a simulated delay to demonstrate sequential loading.
   */
  private loadFeatures(): void {
    this.featuresLoading.set(true);
    this.landingPageState.setSectionLoading(LandingPageSection.FEATURES);

    this.log('Loading features section...');

    // Simulate feature loading (in reality, this might be an API call)
    // or just waiting for images/SVGs to be ready
    setTimeout(() => {
      this.ngZone.run(() => {
        try {
          // Check if feature SVGs were preloaded
          const allFeaturesReady = true; // In reality, check ImagePreloadService

          if (allFeaturesReady) {
            this.showFeatures.set(true);
            this.featuresLoading.set(false);
            this.featuresError.set(false);

            this.landingPageState.setSectionReady(LandingPageSection.FEATURES, {
              svgsPreloaded: true,
            });

            this.log('Features loaded successfully');
          } else {
            throw new Error('Feature SVGs not ready');
          }
        } catch (error) {
          console.error('[LandingPage] Features loading error:', error);

          this.featuresLoading.set(false);
          this.featuresError.set(true);

          this.landingPageState.setSectionError(
            LandingPageSection.FEATURES,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      });
    }, 500); // Small delay to demonstrate sequential loading
  }

  /**
   * Retry loading features (called from error state)
   */
  retryFeatures(): void {
    this.log('Retrying features load');
    this.landingPageState.resetSection(LandingPageSection.FEATURES);
    this.loadFeatures();
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Log message with context
   */
  private log(message: string, data?: unknown): void {
    console.log(`[LandingPage] ${message}`, data ?? '');
  }

  /**
   * Public method for hero gallery to signal readiness
   * (Called via ViewChild or EventEmitter from hero component)
   */
  public notifyHeroReady(): void {
    this.onHeroReady();
  }
}

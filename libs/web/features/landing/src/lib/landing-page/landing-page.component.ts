// ==============================================================================
// LANDING PAGE COMPONENT (Migriert zu Wave-Divider)
// ==============================================================================
// Die manuelle Wave-SVG wurde durch die tm-wave-divider Komponente ersetzt.
// ==============================================================================

import {
  Component,
  signal,
  inject,
  NgZone,
  isDevMode,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

// Shared UI Components
import {
  SplashScreenComponent,
  SplashScreenConfig,
  SplashScreenStrategy,
  SplashScreenCompleted,
  SplashScreenProgress,
  SPLASH_ASSET_PRIORITY,
  AssetType,
  SkeletonFeatureGridComponent,
  WaveDividerComponent,  // ✅ NEU: Wave-Divider Import
} from '@tanzmoment/shared/ui';

// Feature Components
import { HeroGalleryComponent } from '../hero-gallery/hero-gallery.component';
import { FeatureNavigationComponent } from '../feature-navigation/feature-navigation.component';
import { LandingIntroSectionComponent } from '../intro-section/intro-section.component';
import { IntroSectionData } from '../intro-section/intro-section.types';

// Services
import {
  LandingPageStateService,
  LandingPageSection,
} from './landing-page-state.service';

import { SplashScreenVisibilityService } from '../services/splash-screen-visibility.service';
import { LandingPageColorService } from '../services/landing-page-color.service';

@Component({
  selector: 'tm-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    SplashScreenComponent,
    HeroGalleryComponent,
    LandingIntroSectionComponent,
    FeatureNavigationComponent,
    SkeletonFeatureGridComponent,
    WaveDividerComponent,  // ✅ NEU: Wave-Divider hinzugefügt
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
export class LandingPageComponent implements OnInit, OnDestroy {
  /**
   * Landing Page Container Component with Orchestration
   *
   * Migration zu Wave-Divider (Phase 4):
   * - Manuelle Wave-SVG im Template durch tm-wave-divider ersetzt
   * - Wave-Styles aus SCSS entfernt
   * - Overlay-Modus für Hero-Section mit Bild-Hintergrund
   *
   * Features:
   * - Centralized state management via LandingPageStateService
   * - Sequential loading coordination (Splash → Hero → Features)
   * - Error handling with skeleton fallbacks
   * - Progress tracking and analytics
   * - Smooth transitions between states
   * - Footer Wave color synchronization
   *
   * This component orchestrates the layout and composition of:
   * - Splash Screen (with asset preloading)
   * - Hero Gallery Section (image slider with smart preloading)
   * - Wave Divider (Hero → Intro transition)
   * - Introduction Section
   * - Feature Navigation Section (three linked feature cards)
   */

  // ==========================================================================
  // Services
  // ==========================================================================

  private readonly stateService = inject(LandingPageStateService);
  private readonly ngZone = inject(NgZone);
  private readonly splashVisibility = inject(SplashScreenVisibilityService);
  private readonly colorService = inject(LandingPageColorService);

  // ==========================================================================
  // Splash Screen Configuration
  // ==========================================================================

  readonly splashConfig: SplashScreenConfig = {
    strategy: SplashScreenStrategy.FULL,
    fullDuration: 3000,
    shortenedDuration: 500,
    preloadConfig: {
      criticalAssets: [
        // Hero images - highest priority
        {
          id: 'hero-hero-1',
          url: 'assets/images/hero/hero-1.webp',
          type: AssetType.IMAGE,
          priority: SPLASH_ASSET_PRIORITY.HERO_IMAGE_FIRST,
        },
        // Additional hero images can be added here
      ],
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

  // ==========================================================================
  // State Signals
  // ==========================================================================

  /** Whether to show splash screen */
  readonly showSplash = signal(true);

  /** Whether hero section is ready to display */
  readonly showHero = signal(false);

  /** Whether features section is ready to display */
  readonly showFeatures = signal(false);

  /** Features loading state */
  readonly featuresLoading = signal(false);

  /** Features error state */
  readonly featuresError = signal(false);

  // ==========================================================================
  // Intro Section Data
  // ==========================================================================

  readonly introData = signal<IntroSectionData>({
    headline: 'Willkommen bei Tanzmoment',
    paragraphs: [
      'Tanz ist mehr als Bewegung – er ist Ausdruck, Verbindung und ein Moment ganz für dich.',
      'Bei Tanzmoment findest du einen Raum, in dem du dich entfalten kannst, unabhängig von Alter, Erfahrung oder körperlichen Voraussetzungen.',
    ],
  });

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  ngOnInit(): void {
    // Set the footer wave pre-color to match this page's last section
    this.colorService.setLandingPageColor();
  }

  ngOnDestroy(): void {
    // Reset to default color when leaving this page
    this.colorService.resetToDefault();
  }

  // ==========================================================================
  // Splash Screen Handlers
  // ==========================================================================

  /**
   * Handle splash screen completion
   */
  onSplashCompleted(event: SplashScreenCompleted): void {
    if (isDevMode()) {
      console.log('[LandingPage] Splash completed:', event);
    }

    this.ngZone.run(() => {
      this.showSplash.set(false);
      this.showHero.set(true);
      this.splashVisibility.setSplashVisible(false);

      // Update state service
      this.stateService.setSectionReady(LandingPageSection.SPLASH);
    });
  }

  /**
   * Handle splash screen progress updates
   */
  onSplashProgressChange(progress: SplashScreenProgress): void {
    if (isDevMode()) {
      console.log('[LandingPage] Splash progress:', progress.percentage);
    }
  }

  // ==========================================================================
  // Hero Section Handlers
  // ==========================================================================

  /**
   * Handle hero gallery ready event
   */
  onHeroReady(): void {
    if (isDevMode()) {
      console.log('[LandingPage] Hero ready');
    }

    this.ngZone.run(() => {
      this.stateService.setSectionReady(LandingPageSection.HERO);
      this.loadFeatures();
    });
  }

  /**
   * Handle hero gallery error
   */
  onHeroError(error: ErrorEvent): void {
    console.error('[LandingPage] Hero error:', error);
    this.stateService.setSectionError(LandingPageSection.HERO, error.message);

    // Still try to load features
    this.loadFeatures();
  }

  // ==========================================================================
  // Features Section Handlers
  // ==========================================================================

  /**
   * Load features section
   */
  private loadFeatures(): void {
    this.featuresLoading.set(true);
    this.stateService.setSectionLoading(LandingPageSection.FEATURES);

    // Simulate async loading (in real app, this would fetch data)
    setTimeout(() => {
      this.ngZone.run(() => {
        this.featuresLoading.set(false);
        this.showFeatures.set(true);
        this.stateService.setSectionReady(LandingPageSection.FEATURES);
      });
    }, 300);
  }

  /**
   * Retry loading features after error
   */
  retryFeatures(): void {
    this.featuresError.set(false);
    this.loadFeatures();
  }
}

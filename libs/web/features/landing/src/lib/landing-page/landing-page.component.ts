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
import { HeroComponent } from '../hero/hero.component';
import { FeatureNavigationComponent } from '../feature-navigation/feature-navigation.component';
import { LandingIntroSectionComponent } from '../intro-section/intro-section.component';
import { IntroSectionData } from '../intro-section/intro-section.types';

// Services
import {
  LandingPageStateService,
  LandingPageSection,
} from './landing-page-state.service';

import { LandingPageColorService } from '../services/landing-page-color.service';
import {
  SeoService,
  SplashScreenVisibilityService,
} from '@tanzmoment/shared/services';

@Component({
  selector: 'tm-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    SplashScreenComponent,
    HeroComponent,
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
  private readonly seo = inject(SeoService);

  // ==========================================================================
  // Splash Screen Configuration
  // ==========================================================================

  readonly splashConfig: SplashScreenConfig = {
    strategy: SplashScreenStrategy.FULL,
    fullDuration: 3000,
    shortenedDuration: 500,
    preloadConfig: {
      criticalAssets: [
        // Hero illustration - highest priority so it is ready when the splash ends
        {
          id: 'hero-dancer',
          url: 'assets/illustrations/hero/hero-dancer.svg',
          type: AssetType.IMAGE,
          priority: SPLASH_ASSET_PRIORITY.HERO_IMAGE_FIRST,
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
    enableLogging: false,
  };

  // ==========================================================================
  // State Signals
  // ==========================================================================

  private readonly splashAlreadyShown = !this.splashVisibility.showSplash();

  /** Whether to show splash screen */
  readonly showSplash = signal(!this.splashAlreadyShown);

  /** Whether hero section is ready to display */
  readonly showHero = signal(this.splashAlreadyShown);

  /** Whether features section is ready to display */
  readonly showFeatures = signal(this.splashAlreadyShown);

  /** Features loading state */
  readonly featuresLoading = signal(false);

  /** Features error state */
  readonly featuresError = signal(false);

  // ==========================================================================
  // Intro Section Data
  // ==========================================================================

  readonly introData = signal<IntroSectionData>({
    headline: 'Lebensfreude, Kreativität, Selbstentfaltung',
    paragraphs: [
      'Tanzen ist Freude, Tanzen ist Freiheit – und mehr als Schritte lernen. Es ist eine Auszeit vom Alltag, ein Raum, in dem du dich neu spüren kannst.',
      'Tanz weckt Fantasie und Kreativität, stärkt Herz und Selbstbewusstsein. Ich lade dich ein zu einer kreativen und fantasievollen Reise der Selbstentfaltung.',
    ],
  });

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  ngOnInit(): void {
    this.seo.setMetadata({ url: '/' });

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

      this.stateService.setSectionReady(LandingPageSection.SPLASH);
      this.stateService.setSectionReady(LandingPageSection.HERO);

      this.loadFeatures();
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

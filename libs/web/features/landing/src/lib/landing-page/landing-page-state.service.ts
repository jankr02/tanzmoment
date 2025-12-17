// ============================================================================
// LANDING PAGE STATE SERVICE
// ============================================================================

import { Injectable, signal, computed, isDevMode } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

/**
 * Loading states for different sections of the landing page
 */
export enum LandingPageSection {
  SPLASH = 'SPLASH',
  HERO = 'HERO',
  FEATURES = 'FEATURES',
}

/**
 * Loading status for a section
 */
export enum LoadingStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  READY = 'READY',
  ERROR = 'ERROR',
}

/**
 * Section loading state
 */
export interface SectionState {
  section: LandingPageSection;
  status: LoadingStatus;
  error?: string;
  loadTime?: number;
}

/**
 * Complete landing page state
 */
export interface LandingPageState {
  splash: SectionState;
  hero: SectionState;
  features: SectionState;
  overallProgress: number; // 0-100
  isFullyLoaded: boolean;
  hasErrors: boolean;
}

/**
 * Analytics event for tracking
 */
export interface LandingPageAnalyticsEvent {
  eventType: 'section_loaded' | 'section_error' | 'page_ready';
  section?: LandingPageSection;
  timestamp: number;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Landing Page State Service
 *
 * Central coordination service for managing loading states across
 * all sections of the landing page (splash, hero, features).
 *
 * Features:
 * - Centralized state management with Signals
 * - Sequential loading coordination (splash → hero → features)
 * - Error handling and recovery
 * - Progress tracking (0-100%)
 * - Analytics event emission
 * - Dev mode logging
 *
 * @example
 * ```typescript
 * // In Splash Screen component
 * landingPageState.setSectionReady(LandingPageSection.SPLASH);
 *
 * // In Hero Gallery component
 * landingPageState.setSectionLoading(LandingPageSection.HERO);
 * // ... after load
 * landingPageState.setSectionReady(LandingPageSection.HERO);
 *
 * // Subscribe to state changes
 * landingPageState.state$.subscribe(state => {
 *   console.log('Overall progress:', state.overallProgress);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class LandingPageStateService {
  // ==========================================================================
  // State Signals
  // ==========================================================================

  /** Splash screen state */
  private readonly splashState = signal<SectionState>({
    section: LandingPageSection.SPLASH,
    status: LoadingStatus.IDLE,
  });

  /** Hero gallery state */
  private readonly heroState = signal<SectionState>({
    section: LandingPageSection.HERO,
    status: LoadingStatus.IDLE,
  });

  /** Features section state */
  private readonly featuresState = signal<SectionState>({
    section: LandingPageSection.FEATURES,
    status: LoadingStatus.IDLE,
  });

  // ==========================================================================
  // Computed State
  // ==========================================================================

  /** Overall landing page state */
  readonly state = computed<LandingPageState>(() => {
    const splash = this.splashState();
    const hero = this.heroState();
    const features = this.featuresState();

    // Calculate overall progress (weighted)
    const splashWeight = 30; // 30% of total
    const heroWeight = 50; // 50% of total
    const featuresWeight = 20; // 20% of total

    const splashProgress = this.getProgressForStatus(splash.status) * splashWeight / 100;
    const heroProgress = this.getProgressForStatus(hero.status) * heroWeight / 100;
    const featuresProgress = this.getProgressForStatus(features.status) * featuresWeight / 100;

    const overallProgress = Math.round(splashProgress + heroProgress + featuresProgress);

    const isFullyLoaded =
      splash.status === LoadingStatus.READY &&
      hero.status === LoadingStatus.READY &&
      features.status === LoadingStatus.READY;

    const hasErrors =
      splash.status === LoadingStatus.ERROR ||
      hero.status === LoadingStatus.ERROR ||
      features.status === LoadingStatus.ERROR;

    return {
      splash,
      hero,
      features,
      overallProgress,
      isFullyLoaded,
      hasErrors,
    };
  });

  // ==========================================================================
  // Observables (for RxJS compatibility)
  // ==========================================================================

  private readonly stateSubject = new BehaviorSubject<LandingPageState>(
    this.state()
  );

  /** Observable state for RxJS subscriptions */
  readonly state$ = this.stateSubject.asObservable();

  /** Analytics events stream */
  private readonly analyticsSubject = new Subject<LandingPageAnalyticsEvent>();
  readonly analytics$ = this.analyticsSubject.asObservable();

  // ==========================================================================
  // Timing
  // ==========================================================================

  private readonly sectionStartTimes = new Map<LandingPageSection, number>();
  private readonly pageStartTime = performance.now();

  // ==========================================================================
  // Public API - State Updates
  // ==========================================================================

  /**
   * Mark a section as loading
   */
  setSectionLoading(section: LandingPageSection): void {
    this.log(`Section loading: ${section}`);
    this.sectionStartTimes.set(section, performance.now());

    this.updateSectionState(section, {
      status: LoadingStatus.LOADING,
    });
  }

  /**
   * Mark a section as ready (successfully loaded)
   */
  setSectionReady(section: LandingPageSection, metadata?: Record<string, unknown>): void {
    const loadTime = this.calculateLoadTime(section);
    this.log(`Section ready: ${section} (${loadTime}ms)`, metadata);

    this.updateSectionState(section, {
      status: LoadingStatus.READY,
      loadTime,
    });

    // Emit analytics event
    this.emitAnalyticsEvent({
      eventType: 'section_loaded',
      section,
      timestamp: Date.now(),
      duration: loadTime,
      metadata,
    });

    // Check if page is fully loaded
    if (this.state().isFullyLoaded) {
      const totalTime = Math.round(performance.now() - this.pageStartTime);
      this.log(`🎉 Page fully loaded (${totalTime}ms)`);

      this.emitAnalyticsEvent({
        eventType: 'page_ready',
        timestamp: Date.now(),
        duration: totalTime,
        metadata: {
          splashTime: this.splashState().loadTime,
          heroTime: this.heroState().loadTime,
          featuresTime: this.featuresState().loadTime,
        },
      });
    }
  }

  /**
   * Mark a section as error
   */
  setSectionError(section: LandingPageSection, error: string): void {
    const loadTime = this.calculateLoadTime(section);
    console.error(`[LandingPageState] Section error: ${section}`, error);

    this.updateSectionState(section, {
      status: LoadingStatus.ERROR,
      error,
      loadTime,
    });

    // Emit analytics event
    this.emitAnalyticsEvent({
      eventType: 'section_error',
      section,
      timestamp: Date.now(),
      duration: loadTime,
      error,
    });
  }

  /**
   * Reset a section to IDLE state (for retry)
   */
  resetSection(section: LandingPageSection): void {
    this.log(`Section reset: ${section}`);
    this.sectionStartTimes.delete(section);

    this.updateSectionState(section, {
      status: LoadingStatus.IDLE,
      error: undefined,
      loadTime: undefined,
    });
  }

  /**
   * Reset entire landing page state
   */
  resetAll(): void {
    this.log('Resetting all sections');
    this.resetSection(LandingPageSection.SPLASH);
    this.resetSection(LandingPageSection.HERO);
    this.resetSection(LandingPageSection.FEATURES);
  }

  // ==========================================================================
  // Public API - Queries
  // ==========================================================================

  /**
   * Check if a specific section is ready
   */
  isSectionReady(section: LandingPageSection): boolean {
    return this.getSectionState(section).status === LoadingStatus.READY;
  }

  /**
   * Check if a specific section has error
   */
  hasSectionError(section: LandingPageSection): boolean {
    return this.getSectionState(section).status === LoadingStatus.ERROR;
  }

  /**
   * Get state for a specific section
   */
  getSectionState(section: LandingPageSection): SectionState {
    switch (section) {
      case LandingPageSection.SPLASH:
        return this.splashState();
      case LandingPageSection.HERO:
        return this.heroState();
      case LandingPageSection.FEATURES:
        return this.featuresState();
    }
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Update state for a specific section
   */
  private updateSectionState(
    section: LandingPageSection,
    updates: Partial<SectionState>
  ): void {
    switch (section) {
      case LandingPageSection.SPLASH:
        this.splashState.update((state) => ({ ...state, ...updates }));
        break;
      case LandingPageSection.HERO:
        this.heroState.update((state) => ({ ...state, ...updates }));
        break;
      case LandingPageSection.FEATURES:
        this.featuresState.update((state) => ({ ...state, ...updates }));
        break;
    }

    // Update observable for RxJS subscribers
    this.stateSubject.next(this.state());
  }

  /**
   * Calculate load time for a section
   */
  private calculateLoadTime(section: LandingPageSection): number {
    const startTime = this.sectionStartTimes.get(section);
    if (!startTime) return 0;

    return Math.round(performance.now() - startTime);
  }

  /**
   * Get progress percentage for a loading status
   */
  private getProgressForStatus(status: LoadingStatus): number {
    switch (status) {
      case LoadingStatus.IDLE:
        return 0;
      case LoadingStatus.LOADING:
        return 50;
      case LoadingStatus.READY:
        return 100;
      case LoadingStatus.ERROR:
        return 100; // Treat error as "done" for progress calculation
    }
  }

  /**
   * Emit analytics event
   */
  private emitAnalyticsEvent(event: LandingPageAnalyticsEvent): void {
    this.analyticsSubject.next(event);
  }

  /**
   * Log message in dev mode
   */
  private log(message: string, data?: unknown): void {
    if (isDevMode()) {
      console.log(`[LandingPageState] ${message}`, data ?? '');
    }
  }
}
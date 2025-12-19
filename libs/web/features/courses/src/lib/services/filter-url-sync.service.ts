// ============================================================================
// FILTER URL SYNC SERVICE
// ============================================================================
// Synchronizes filter state with URL query parameters
// Enables shareable/bookmarkable filter links
// ============================================================================

import { Injectable, inject, effect, DestroyRef, Injector, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, skip, debounceTime, distinctUntilChanged } from 'rxjs';

import { CourseFilterService } from './course-filter.service';
import {
  CourseFilterState,
  DanceStyleId,
  LocationId,
  DANCE_STYLE_OPTIONS,
  LOCATION_OPTIONS,
} from '@tanzmoment/shared/ui';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * URL query parameter names
 * Short names for compact URLs
 */
export const URL_PARAM_KEYS = {
  danceStyle: 'style',
  location: 'loc',
  dateFrom: 'from',
  dateTo: 'to',
  page: 'page',
} as const;

/**
 * Inverse Mapping (URL → State Key)
 */
const PARAM_TO_STATE_KEY: Record<string, keyof CourseFilterState> = {
  [URL_PARAM_KEYS.danceStyle]: 'danceStyle',
  [URL_PARAM_KEYS.location]: 'location',
  [URL_PARAM_KEYS.dateFrom]: 'dateFrom',
  [URL_PARAM_KEYS.dateTo]: 'dateTo',
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class FilterUrlSyncService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly filterService = inject(CourseFilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);

  /** Flag um Ping-Pong zwischen URL und State zu verhindern */
  private isUpdatingFromUrl = false;
  private isUpdatingFromState = false;

  /** Ist der Sync aktiv? */
  private isActive = false;

  /** Nur im Browser ausführen */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Aktiviert die URL-Synchronisation
   * Sollte in der Page-Component aufgerufen werden
   */
  activate(): void {
    if (this.isActive) {
      return;
    }

    // SSR: Nur im Browser aktivieren
    if (!this.isBrowser) {
      // Im SSR-Kontext nur Initial Load triggern
      this.filterService.init();
      return;
    }

    this.isActive = true;

    // 1. Initial: URL → State (falls URL Parameter vorhanden)
    this.syncFromUrl();

    // 2. URL-Änderungen beobachten → State aktualisieren
    this.watchUrlChanges();

    // 3. State-Änderungen beobachten → URL aktualisieren
    this.watchStateChanges();
  }

  /**
   * Deaktiviert die URL-Synchronisation
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Erstellt eine shareable URL mit aktuellen Filtern
   */
  getShareableUrl(): string {
    if (!this.isBrowser) {
      return '';
    }

    const baseUrl = window.location.origin + this.router.url.split('?')[0];
    const params = this.stateToParams(this.filterService.filterState());

    if (Object.keys(params).length === 0) {
      return baseUrl;
    }

    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return `${baseUrl}?${queryString}`;
  }

  /**
   * Kopiert die shareable URL in die Zwischenablage
   */
  async copyShareableUrl(): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }

    try {
      const url = this.getShareableUrl();
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - Sync Logic
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Liest URL-Parameter und setzt Filter-State
   */
  private syncFromUrl(): void {
    const params = this.route.snapshot.queryParams;

    if (Object.keys(params).length === 0) {
      // Keine URL-Parameter → Initial Load triggern
      this.filterService.init();
      return;
    }

    const filter = this.paramsToState(params);

    this.isUpdatingFromUrl = true;
    this.filterService.setFilter(filter);

    // Flag nach kurzer Verzögerung zurücksetzen
    setTimeout(() => {
      this.isUpdatingFromUrl = false;
    }, 100);
  }

  /**
   * Beobachtet URL-Änderungen und aktualisiert State
   */
  private watchUrlChanges(): void {
    this.route.queryParams
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        // Erste Emission überspringen (initiale Sync)
        skip(1),
        // Debounce für schnelle Änderungen
        debounceTime(50),
        // Nur wenn sich wirklich etwas geändert hat
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        // Nur wenn nicht gerade vom State aktualisiert
        filter(() => !this.isUpdatingFromState && this.isActive)
      )
      .subscribe((params) => {
        this.isUpdatingFromUrl = true;

        const filter = this.paramsToState(params);
        this.filterService.setFilter(filter);

        setTimeout(() => {
          this.isUpdatingFromUrl = false;
        }, 100);
      });
  }

  /**
   * Beobachtet State-Änderungen und aktualisiert URL
   */
  private watchStateChanges(): void {
    // Effect für State-Änderungen (mit gespeichertem Injector)
    effect(
      () => {
        const state = this.filterService.filterState();

        // Nur wenn nicht gerade von URL aktualisiert
        if (this.isUpdatingFromUrl || !this.isActive) {
          return;
        }

        this.updateUrl(state);
      },
      { injector: this.injector }
    );
  }

  /**
   * Aktualisiert die URL basierend auf State
   * Behält die aktuelle Scroll-Position
   */
  private updateUrl(state: CourseFilterState): void {
    this.isUpdatingFromState = true;

    // Aktuelle Scroll-Position speichern
    const scrollY = this.isBrowser ? window.scrollY : 0;

    const params = this.stateToParams(state);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: '', // Ersetzt alle Query Params
      replaceUrl: true, // Kein neuer History-Eintrag
    });

    // Scroll-Position nach Navigation wiederherstellen
    setTimeout(() => {
      if (this.isBrowser) {
        window.scrollTo(0, scrollY);
      }
      this.isUpdatingFromState = false;
    }, 0);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - Conversion
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Konvertiert URL-Parameter zu Filter-State
   */
  private paramsToState(params: Params): CourseFilterState {
    return {
      danceStyle: this.validateDanceStyle(params[URL_PARAM_KEYS.danceStyle]),
      location: this.validateLocation(params[URL_PARAM_KEYS.location]),
      dateFrom: this.validateDate(params[URL_PARAM_KEYS.dateFrom]),
      dateTo: this.validateDate(params[URL_PARAM_KEYS.dateTo]),
    };
  }

  /**
   * Konvertiert Filter-State zu URL-Parametern
   */
  private stateToParams(state: CourseFilterState): Params {
    const params: Params = {};

    if (state.danceStyle) {
      params[URL_PARAM_KEYS.danceStyle] = state.danceStyle;
    }

    if (state.location) {
      params[URL_PARAM_KEYS.location] = state.location;
    }

    if (state.dateFrom) {
      params[URL_PARAM_KEYS.dateFrom] = state.dateFrom;
    }

    if (state.dateTo) {
      params[URL_PARAM_KEYS.dateTo] = state.dateTo;
    }

    return params;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - Validation
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Validiert und gibt DanceStyleId zurück
   */
  private validateDanceStyle(value: unknown): DanceStyleId | null {
    if (typeof value !== 'string') {
      return null;
    }

    const isValid = DANCE_STYLE_OPTIONS.some((opt) => opt.id === value);
    return isValid ? (value as DanceStyleId) : null;
  }

  /**
   * Validiert und gibt LocationId zurück
   */
  private validateLocation(value: unknown): LocationId | null {
    if (typeof value !== 'string') {
      return null;
    }

    const isValid = LOCATION_OPTIONS.some((opt) => opt.id === value);
    return isValid ? (value as LocationId) : null;
  }

  /**
   * Validiert und gibt ISO-Datum zurück
   */
  private validateDate(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    // Versuche als ISO-Datum zu parsen
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return null;
    }

    // Nur YYYY-MM-DD Format erlauben
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Versuche zu konvertieren
      return date.toISOString().split('T')[0];
    }

    return value;
  }
}

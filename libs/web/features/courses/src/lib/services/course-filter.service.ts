// ============================================================================
// COURSE FILTER SERVICE
// ============================================================================
// Central service for filter state management
// Uses Angular Signals for reactive updates
// Shared between FilterBar, FilterModal and FilterSidebar
// ============================================================================

import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  of,
} from 'rxjs';

import {
  CourseFilterState,
  DanceStyleId,
  DanceStyleOption,
  LocationId,
  LocationOption,
  EMPTY_FILTER_STATE,
  hasActiveFilters,
  countActiveFilters,
  filterStateToTags,
  ActiveFilterTag,
  DANCE_STYLE_OPTIONS,
  LOCATION_OPTIONS,
} from '@tanzmoment/shared/ui';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pagination meta from the API
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * API response structure
 */
export interface CourseListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Kurs-Daten (vereinfacht für Liste)
 */
export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  danceStyle: DanceStyleId;
  imageUrl?: string;
  price: number;
  priceFormatted: string;
  isHighlighted: boolean;
  nextSession?: {
    startsAt: string;
    location: string;
  };
  availableSpots?: number;
}

/**
 * Loading States
 */
export type LoadingState = 'idle' | 'loading' | 'refreshing' | 'loading-more';

/**
 * Error State
 */
export interface FilterError {
  message: string;
  code?: string;
  retryable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class CourseFilterService {
  private readonly http = inject(HttpClient);

  // API Base URL (kann über Environment konfiguriert werden)
  private readonly apiUrl = '/api/courses';

  // ───────────────────────────────────────────────────────────────────────────
  // STATE (Private Signals)
  // ───────────────────────────────────────────────────────────────────────────

  /** Aktueller Filter-State */
  private readonly _filterState = signal<CourseFilterState>(EMPTY_FILTER_STATE);

  /** Aktuelle Seite für Pagination */
  private readonly _currentPage = signal(1);

  /** Anzahl Kurse pro Seite */
  private readonly _pageSize = signal(5);

  /** Geladene Kurse (akkumuliert für Load More) */
  private readonly _courses = signal<CourseListItem[]>([]);

  /** Pagination Meta von API */
  private readonly _meta = signal<PaginationMeta | null>(null);

  /** Loading State */
  private readonly _loadingState = signal<LoadingState>('idle');

  /** Error State */
  private readonly _error = signal<FilterError | null>(null);

  /** Highlighted Kurse */
  private readonly _highlightedCourses = signal<CourseListItem[]>([]);

  /** Loading State für Highlighted Kurse */
  private readonly _highlightedLoading = signal(false);

  /** Trigger für API Requests */
  private readonly loadTrigger$ = new Subject<{
    reset: boolean;
    page: number;
    filter: CourseFilterState;
  }>();

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC SIGNALS (Read-only)
  // ───────────────────────────────────────────────────────────────────────────

  /** Aktueller Filter-State */
  readonly filterState = this._filterState.asReadonly();

  /** Geladene Kurse */
  readonly courses = this._courses.asReadonly();

  /** Pagination Meta */
  readonly meta = this._meta.asReadonly();

  /** Loading State */
  readonly loadingState = this._loadingState.asReadonly();

  /** Fehler */
  readonly error = this._error.asReadonly();

  /** Highlighted Kurse */
  readonly highlightedCourses = this._highlightedCourses.asReadonly();

  /** Loading State für Highlighted Kurse */
  readonly highlightedLoading = this._highlightedLoading.asReadonly();

  // ───────────────────────────────────────────────────────────────────────────
  // COMPUTED SIGNALS
  // ───────────────────────────────────────────────────────────────────────────

  /** Hat aktive Filter */
  readonly hasFilters = computed(() => hasActiveFilters(this._filterState()));

  /** Anzahl aktiver Filter */
  readonly filterCount = computed(() =>
    countActiveFilters(this._filterState())
  );

  /** Aktive Filter als Tags */
  readonly filterTags = computed(() => filterStateToTags(this._filterState()));

  /** Ist gerade am Laden */
  readonly isLoading = computed(() =>
    ['loading', 'refreshing', 'loading-more'].includes(this._loadingState())
  );

  /** Ist initial am Laden */
  readonly isInitialLoading = computed(
    () => this._loadingState() === 'loading'
  );

  /** Lädt mehr Kurse */
  readonly isLoadingMore = computed(
    () => this._loadingState() === 'loading-more'
  );

  /** Gibt es mehr Kurse zu laden */
  readonly hasMore = computed(() => this._meta()?.hasMore ?? false);

  /** Gesamtanzahl Kurse */
  readonly totalCourses = computed(() => this._meta()?.total ?? 0);

  /** Aktuelle Seite */
  readonly currentPage = this._currentPage.asReadonly();

  /** Keine Ergebnisse */
  readonly isEmpty = computed(
    () => !this.isLoading() && this._courses().length === 0
  );

  /** Ausgewählter Tanzstil Label */
  readonly selectedDanceStyleLabel = computed(() => {
    const id = this._filterState().danceStyle;
    if (!id) return null;
    return DANCE_STYLE_OPTIONS.find((o: DanceStyleOption) => o.id === id)?.label ?? null;
  });

  /** Ausgewählter Standort Label */
  readonly selectedLocationLabel = computed(() => {
    const id = this._filterState().location;
    if (!id) return null;
    return LOCATION_OPTIONS.find((o: LocationOption) => o.id === id)?.label ?? null;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CONSTRUCTOR
  // ───────────────────────────────────────────────────────────────────────────

  constructor() {
    this.setupLoadPipeline();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS - Filter Updates
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Setzt den kompletten Filter-State
   */
  setFilter(filter: CourseFilterState): void {
    this._filterState.set(filter);
    this.triggerLoad(true);
  }

  /**
   * Aktualisiert einzelne Filter-Eigenschaften
   */
  updateFilter(partial: Partial<CourseFilterState>): void {
    this._filterState.update((current) => ({
      ...current,
      ...partial,
    }));
    this.triggerLoad(true);
  }

  /**
   * Setzt Tanzstil-Filter
   */
  setDanceStyle(danceStyle: DanceStyleId | null): void {
    this.updateFilter({ danceStyle });
  }

  /**
   * Setzt Standort-Filter
   */
  setLocation(location: LocationId | null): void {
    this.updateFilter({ location });
  }

  /**
   * Setzt Datumsbereich
   */
  setDateRange(dateFrom: string | null, dateTo: string | null): void {
    this.updateFilter({ dateFrom, dateTo });
  }

  /**
   * Entfernt einen einzelnen Filter
   */
  removeFilter(type: keyof CourseFilterState): void {
    this.updateFilter({ [type]: null });
  }

  /**
   * Setzt alle Filter zurück
   */
  clearFilters(): void {
    this._filterState.set(EMPTY_FILTER_STATE);
    this.triggerLoad(true);
  }

  /**
   * Entfernt Filter anhand eines Tags
   */
  removeFilterByTag(tag: ActiveFilterTag): void {
    this.removeFilter(tag.type);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS - Pagination
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Lädt die nächste Seite (Load More)
   */
  loadMore(): void {
    if (!this.hasMore() || this.isLoading()) {
      return;
    }

    const nextPage = this._currentPage() + 1;
    this._currentPage.set(nextPage);
    this.triggerLoad(false);
  }

  /**
   * Lädt die Kurse neu (Refresh)
   */
  refresh(): void {
    this.triggerLoad(true);
  }

  /**
   * Initialer Load
   */
  init(): void {
    if (this._courses().length === 0) {
      this.triggerLoad(true);
    }
  }

  /**
   * Lädt Highlighted Kurse
   */
  loadHighlightedCourses(): void {
    if (this._highlightedCourses().length > 0 || this._highlightedLoading()) {
      return;
    }

    this._highlightedLoading.set(true);

    this.fetchHighlightedCourses().subscribe({
      next: (response) => {
        this._highlightedCourses.set(response.data);
        this._highlightedLoading.set(false);
      },
      error: () => {
        this._highlightedLoading.set(false);
      },
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Triggert einen API-Load
   */
  private triggerLoad(reset: boolean): void {
    if (reset) {
      this._currentPage.set(1);
    }

    this.loadTrigger$.next({
      reset,
      page: this._currentPage(),
      filter: this._filterState(),
    });
  }

  /**
   * Setzt die Load-Pipeline auf
   */
  private setupLoadPipeline(): void {
    this.loadTrigger$
      .pipe(
        // Debounce für schnelle Filter-Änderungen
        debounceTime(150),

        // Nur wenn sich etwas geändert hat
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),

        // Loading State setzen
        tap(({ reset }) => {
          this._error.set(null);
          this._loadingState.set(reset ? 'loading' : 'loading-more');
        }),

        // API Request
        switchMap(({ reset, page, filter }) =>
          this.fetchCourses(filter, page).pipe(
            tap((response) => {
              if (reset) {
                // Ersetze alle Kurse
                this._courses.set(response.data);
              } else {
                // Füge zu bestehenden hinzu
                this._courses.update((current) => [
                  ...current,
                  ...response.data,
                ]);
              }

              this._meta.set(response.meta);
              this._loadingState.set('idle');
            }),
            catchError((error) => {
              this._error.set({
                message: error.message || 'Kurse konnten nicht geladen werden',
                code: error.status?.toString(),
                retryable: true,
              });
              this._loadingState.set('idle');
              return of(null);
            })
          )
        )
      )
      .subscribe();
  }

  /**
   * API Request für Kurse
   */
  private fetchCourses(
    filter: CourseFilterState,
    page: number
  ): Observable<CourseListResponse<CourseListItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', this._pageSize().toString());

    // Filter hinzufügen
    if (filter.danceStyle) {
      params = params.set('danceStyle', filter.danceStyle);
    }

    if (filter.location) {
      params = params.set('location', filter.location);
    }

    if (filter.dateFrom) {
      params = params.set('dateFrom', filter.dateFrom);
    }

    if (filter.dateTo) {
      params = params.set('dateTo', filter.dateTo);
    }

    return this.http.get<CourseListResponse<CourseListItem>>(this.apiUrl, {
      params,
    });
  }

  /**
   * API Request für Highlighted Kurse
   * Nutzt den dedizierten /api/courses/highlighted Endpoint
   */
  private fetchHighlightedCourses(): Observable<CourseListResponse<CourseListItem>> {
    const params = new HttpParams().set('limit', '6');

    // Der Highlighted Endpoint gibt direkt ein Array zurück, daher mappen wir zu CourseListResponse
    return this.http
      .get<CourseListItem[]>(`${this.apiUrl}/highlighted`, { params })
      .pipe(
        switchMap((data) =>
          of({
            data,
            meta: {
              total: data.length,
              page: 1,
              limit: data.length,
              totalPages: 1,
              hasMore: false,
            },
          })
        )
      );
  }
}

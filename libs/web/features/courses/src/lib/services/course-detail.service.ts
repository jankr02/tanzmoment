// ============================================================================
// COURSE DETAIL SERVICE
// ============================================================================
// Manages the data layer for the Course Detail Page.
// Loads course data via HTTP, caches it, provides it as Angular Signals.
// ============================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap, finalize } from 'rxjs';

import { CourseDetailData } from '@tanzmoment/shared/course-detail-ui';

@Injectable({ providedIn: 'root' })
export class CourseDetailService {
  private readonly http = inject(HttpClient);

  // ─── State (Signals) ────────────────────────────────────────────────────
  readonly course = signal<CourseDetailData | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // ─── Computed ───────────────────────────────────────────────────────────
  readonly hasData = computed(() => this.course() !== null);
  readonly isNotFound = computed(() => this.error() === 'NOT_FOUND');

  // ─── Cache ──────────────────────────────────────────────────────────────
  private cache = new Map<string, CourseDetailData>();

  /**
   * Load course data with simple in-memory caching.
   *
   * @param slug - URL slug of the course
   * @param forceRefresh - Skip cache and reload from API
   */
  loadCourse(slug: string, forceRefresh = false): void {
    this.error.set(null);

    if (!forceRefresh) {
      const cached = this.cache.get(slug);
      if (cached) {
        this.course.set(cached);
        return;
      }
    }

    this.loading.set(true);

    this.http
      .get<CourseDetailData>(`/api/courses/${slug}`)
      .pipe(
        tap((data) => {
          this.cache.set(slug, data);
          this.course.set(data);
        }),
        catchError((err) => {
          const errorMsg =
            err.status === 404 ? 'NOT_FOUND' : 'LOAD_ERROR';
          this.error.set(errorMsg);
          this.course.set(null);
          return of(null);
        }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Reset current course and loading state.
   * Used when navigating away from the detail page.
   */
  reset(): void {
    this.course.set(null);
    this.loading.set(false);
    this.error.set(null);
  }

  /**
   * Invalidate cache entries.
   *
   * @param slug - Optional slug to clear specific cache entry.
   * If omitted, clears entire cache.
   */
  invalidateCache(slug?: string): void {
    if (slug) {
      this.cache.delete(slug);
    } else {
      this.cache.clear();
    }
  }
}

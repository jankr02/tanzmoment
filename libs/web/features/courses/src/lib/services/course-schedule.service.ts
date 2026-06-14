// ============================================================================
// COURSE SCHEDULE SERVICE
// ============================================================================
// Fetches calendar sessions for the Kursplan page within a date range.
// Plain HttpClient + Signals (matches CourseFilterService conventions).
// ============================================================================

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';

import { CalendarSession } from '../pages/course-schedule/course-schedule.types';

@Injectable({ providedIn: 'root' })
export class CourseScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/courses/sessions';

  private readonly _sessions = signal<CalendarSession[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly sessions = this._sessions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /** Load all scheduled sessions whose start falls within [dateFrom, dateTo]. */
  loadRange(dateFrom: Date, dateTo: Date): void {
    const params = new HttpParams()
      .set('dateFrom', dateFrom.toISOString())
      .set('dateTo', dateTo.toISOString());

    this._isLoading.set(true);
    this._error.set(null);

    this.http
      .get<CalendarSession[]>(this.apiUrl, { params })
      .pipe(
        tap((sessions) => this._sessions.set(sessions)),
        catchError(() => {
          this._error.set('Kurstermine konnten nicht geladen werden.');
          this._sessions.set([]);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false)),
      )
      .subscribe();
  }
}

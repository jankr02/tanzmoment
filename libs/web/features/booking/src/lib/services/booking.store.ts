// ============================================================================
// BOOKING STORE
// ============================================================================
// Signal-based state for the booking flow.
// Manages session loading, modal state, and post-booking results.
// ============================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import { BookingApiService } from '@tanzmoment/shared/services';
import {
  SessionAvailability,
  BookingDetail,
  CreateBookingApiResponse,
} from '@tanzmoment/shared/types';

export type BookingFlowState =
  | 'idle'
  | 'loading-sessions'
  | 'ready'
  | 'submitting'
  | 'success'
  | 'error';

@Injectable()
export class BookingStore {
  private readonly bookingApi = inject(BookingApiService);

  private readonly _state = signal<BookingFlowState>('idle');
  private readonly _sessions = signal<SessionAvailability[]>([]);
  private readonly _bookingResult = signal<CreateBookingApiResponse | null>(null);
  private readonly _bookingDetail = signal<BookingDetail | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _isModalOpen = signal(false);

  readonly state = this._state.asReadonly();
  readonly sessions = this._sessions.asReadonly();
  readonly bookingResult = this._bookingResult.asReadonly();
  readonly bookingDetail = this._bookingDetail.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isModalOpen = this._isModalOpen.asReadonly();

  readonly isLoading = computed(() => this._state() === 'loading-sessions');

  // ──────────────────────────────────────────────────────────────────────────
  // MODAL
  // ──────────────────────────────────────────────────────────────────────────

  openModal(): void {
    this._isModalOpen.set(true);
  }

  closeModal(): void {
    this._isModalOpen.set(false);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SESSIONS
  // ──────────────────────────────────────────────────────────────────────────

  loadSessions(courseId: string): void {
    this._state.set('loading-sessions');
    this._error.set(null);

    this.bookingApi.getSessionsForCourse(courseId).subscribe({
      next: (sessions) => {
        this._sessions.set(sessions);
        this._state.set('ready');
      },
      error: () => {
        this._error.set('Termine konnten nicht geladen werden.');
        this._state.set('error');
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BOOKING VERIFICATION (post Stripe redirect)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Fetches the latest booking/payment status for the post-Stripe success page.
   * Only stores the detail (and flags HTTP errors) — the success page decides
   * whether the payment has cleared and re-polls until it has, because the
   * Stripe webhook can arrive after the browser redirect.
   */
  verifyPayment(bookingId: string, sessionId: string): void {
    this.bookingApi.verifyBookingPayment(bookingId, sessionId).subscribe({
      next: (detail) => this._bookingDetail.set(detail),
      error: () => {
        this._error.set('Zahlungsstatus konnte nicht verifiziert werden.');
        this._state.set('error');
      },
    });
  }

  setBookingResult(result: CreateBookingApiResponse): void {
    this._bookingResult.set(result);
    this._state.set('success');
    this.closeModal();
  }

  reset(): void {
    this._state.set('idle');
    this._sessions.set([]);
    this._bookingResult.set(null);
    this._bookingDetail.set(null);
    this._error.set(null);
    this._isModalOpen.set(false);
  }
}

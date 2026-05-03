import { Injectable, computed, inject, signal } from '@angular/core';
import { BookingApiService } from '@tanzmoment/shared/services';
import { BookingDetail, CancellationPreview } from '@tanzmoment/shared/types';
import {
  BookingTab,
  BOOKING_TAB_ORDER,
  groupByTab,
} from '../utils/booking-grouping';

export type MyBookingsState = 'idle' | 'loading' | 'ready' | 'error';

@Injectable({ providedIn: 'root' })
export class MyBookingsStore {
  private readonly bookingApi = inject(BookingApiService);

  private readonly _state = signal<MyBookingsState>('idle');
  private readonly _bookings = signal<BookingDetail[]>([]);
  private readonly _activeTab = signal<BookingTab>('upcoming');
  private readonly _error = signal<string | null>(null);
  private readonly _cancellingId = signal<string | null>(null);

  readonly state = this._state.asReadonly();
  readonly bookings = this._bookings.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly error = this._error.asReadonly();
  readonly cancellingId = this._cancellingId.asReadonly();

  readonly grouped = computed(() => groupByTab(this._bookings()));

  readonly tabCounts = computed(() => {
    const grouped = this.grouped();
    return BOOKING_TAB_ORDER.reduce(
      (acc, tab) => {
        acc[tab] = grouped[tab].length;
        return acc;
      },
      { upcoming: 0, past: 0, cancelled: 0 } as Record<BookingTab, number>,
    );
  });

  readonly visibleBookings = computed(() => this.grouped()[this._activeTab()]);

  readonly isLoading = computed(() => this._state() === 'loading');
  readonly isReady = computed(() => this._state() === 'ready');
  readonly isEmpty = computed(
    () => this._state() === 'ready' && this._bookings().length === 0,
  );

  loadBookings(): void {
    this._state.set('loading');
    this._error.set(null);

    this.bookingApi.getMyBookings({ limit: 50 }).subscribe({
      next: (res) => {
        this._bookings.set(res.data);
        this._state.set('ready');
      },
      error: () => {
        this._error.set(
          'Deine Buchungen konnten nicht geladen werden. Bitte versuche es erneut.',
        );
        this._state.set('error');
      },
    });
  }

  setActiveTab(tab: BookingTab): void {
    this._activeTab.set(tab);
  }

  cancel(bookingId: string, reason?: string): Promise<void> {
    this._cancellingId.set(bookingId);

    return new Promise((resolve, reject) => {
      this.bookingApi.cancelBooking(bookingId, reason).subscribe({
        next: () => {
          this._cancellingId.set(null);
          this.loadBookings();
          resolve();
        },
        error: (err) => {
          this._cancellingId.set(null);
          reject(err);
        },
      });
    });
  }

  fetchCancellationPreview(bookingId: string): Promise<CancellationPreview> {
    return new Promise((resolve, reject) => {
      this.bookingApi.getCancellationPreview(bookingId).subscribe({
        next: resolve,
        error: reject,
      });
    });
  }

  resumeCheckout(bookingId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.bookingApi.resumeCheckout(bookingId).subscribe({
        next: (res) => resolve(res.checkoutUrl),
        error: reject,
      });
    });
  }

  reset(): void {
    this._state.set('idle');
    this._bookings.set([]);
    this._activeTab.set('upcoming');
    this._error.set(null);
    this._cancellingId.set(null);
  }
}

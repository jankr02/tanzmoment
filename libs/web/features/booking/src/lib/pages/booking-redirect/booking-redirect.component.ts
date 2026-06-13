// ============================================================================
// BOOKING REDIRECT COMPONENT
// ============================================================================
// Handles return from Stripe Checkout.
// Works for both authenticated and guest users.
// ============================================================================

import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent, ButtonComponent } from '@tanzmoment/shared/ui';
import { BookingStore } from '../../services/booking.store';
import { AuthStateService } from '@tanzmoment/shared/services';

type RedirectState = 'verifying' | 'success' | 'error' | 'cancelled' | 'processing';

@Component({
  selector: 'app-booking-redirect',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  providers: [BookingStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-redirect.component.html',
  styleUrl: './booking-redirect.component.scss',
})
export class BookingRedirectComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly bookingStore = inject(BookingStore);
  readonly authState = inject(AuthStateService);

  readonly state = signal<RedirectState>('verifying');

  private checkInterval?: ReturnType<typeof setInterval>;
  private timeoutId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const bookingId = this.route.snapshot.queryParamMap.get('bookingId');
    const isCancelled = this.router.url.includes('abgebrochen');

    if (isCancelled) {
      this.state.set('cancelled');
      return;
    }

    if (!bookingId) {
      this.state.set('error');
      return;
    }

    this.bookingStore.verifyPayment(bookingId);

    // The checkout.session.completed webhook can arrive after the browser
    // redirect, so re-poll until the payment has actually cleared rather than
    // declaring success on the first response.
    this.checkInterval = setInterval(() => {
      if (this.bookingStore.state() === 'error') {
        this.state.set('error');
        this.clearTimers();
        return;
      }

      const detail = this.bookingStore.bookingDetail();
      if (detail?.payment?.status === 'paid' || detail?.status === 'confirmed') {
        this.state.set('success');
        this.clearTimers();
        return;
      }

      this.bookingStore.verifyPayment(bookingId);
    }, 2000);

    this.timeoutId = setTimeout(() => {
      this.clearTimers();
      // Payment not confirmed in time — most likely a slow webhook or an async
      // SEPA debit still settling. Reassure rather than show an error.
      if (this.state() === 'verifying') this.state.set('processing');
    }, 30_000);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  goToMyBookings(): void {
    this.router.navigate(['/mein-bereich/buchungen']);
  }

  goToCourses(): void {
    this.router.navigate(['/courses']);
  }

  private clearTimers(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}

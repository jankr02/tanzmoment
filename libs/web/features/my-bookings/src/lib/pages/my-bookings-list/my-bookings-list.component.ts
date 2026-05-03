import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingDetail } from '@tanzmoment/shared/types';
import {
  ButtonComponent,
  EmptyStateComponent,
  SkeletonBoxComponent,
} from '@tanzmoment/shared/ui';
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';
import { CancelBookingModalComponent } from '../../components/cancel-booking-modal/cancel-booking-modal.component';
import { MyBookingsStore } from '../../services/my-bookings.store';
import {
  BOOKING_TAB_LABELS,
  BOOKING_TAB_ORDER,
  BookingTab,
} from '../../utils/booking-grouping';

const EMPTY_MESSAGES: Record<BookingTab, { title: string; message: string }> = {
  upcoming: {
    title: 'Noch keine kommenden Buchungen',
    message: 'Sobald du einen Kurs buchst, erscheint er hier.',
  },
  past: {
    title: 'Hier wird deine Tanz-Geschichte sichtbar',
    message: 'Vergangene Termine landen hier — schön, dass du dabei warst.',
  },
  cancelled: {
    title: 'Keine stornierten Buchungen',
    message: 'Hier siehst du Buchungen, die du oder das Studio storniert haben.',
  },
};

@Component({
  selector: 'lib-my-bookings-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    SkeletonBoxComponent,
    EmptyStateComponent,
    BookingCardComponent,
    CancelBookingModalComponent,
  ],
  templateUrl: './my-bookings-list.component.html',
  styleUrl: './my-bookings-list.component.scss',
})
export class MyBookingsListComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly store = inject(MyBookingsStore);

  protected readonly tabs = BOOKING_TAB_ORDER;
  protected readonly tabLabels = BOOKING_TAB_LABELS;

  protected readonly cancellingBooking = signal<BookingDetail | null>(null);
  protected readonly resumeError = signal<string | null>(null);

  protected readonly emptyMessage = computed(
    () => EMPTY_MESSAGES[this.store.activeTab()],
  );

  protected readonly hasNoVisibleBookings = computed(
    () =>
      this.store.isReady() &&
      this.store.bookings().length > 0 &&
      this.store.visibleBookings().length === 0,
  );

  ngOnInit(): void {
    if (this.store.state() === 'idle') {
      this.store.loadBookings();
    }
  }

  selectTab(tab: BookingTab): void {
    this.store.setActiveTab(tab);
  }

  onCancelRequested(booking: BookingDetail): void {
    this.cancellingBooking.set(booking);
  }

  onCancelClosed(): void {
    this.cancellingBooking.set(null);
  }

  onCancelCompleted(): void {
    this.cancellingBooking.set(null);
  }

  onResumeCheckout(booking: BookingDetail): void {
    this.resumeError.set(null);
    this.store
      .resumeCheckout(booking.id)
      .then((url) => {
        window.location.href = url;
      })
      .catch(() => {
        this.resumeError.set(
          'Die Zahlung konnte nicht fortgesetzt werden. Bitte versuche es erneut.',
        );
      });
  }

  onRebook(booking: BookingDetail): void {
    this.router.navigate(['/courses', booking.course.slug]);
  }

  retry(): void {
    this.store.loadBookings();
  }
}

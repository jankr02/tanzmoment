import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingApiService } from '@tanzmoment/shared/services';
import { BookingDetail } from '@tanzmoment/shared/types';
import {
  ButtonComponent,
  EmptyStateComponent,
  SkeletonBoxComponent,
} from '@tanzmoment/shared/ui';
import { BookingStatusBadgeComponent } from '../../components/booking-status-badge/booking-status-badge.component';
import { CancelBookingModalComponent } from '../../components/cancel-booking-modal/cancel-booking-modal.component';
import { MyBookingsStore } from '../../services/my-bookings.store';

const MONEY_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const DATE_FORMATTER = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

@Component({
  selector: 'lib-my-booking-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    SkeletonBoxComponent,
    EmptyStateComponent,
    BookingStatusBadgeComponent,
    CancelBookingModalComponent,
  ],
  templateUrl: './my-booking-detail.component.html',
  styleUrl: './my-booking-detail.component.scss',
})
export class MyBookingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingApi = inject(BookingApiService);
  private readonly store = inject(MyBookingsStore);

  protected readonly booking = signal<BookingDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly resumeError = signal<string | null>(null);
  protected readonly receiptError = signal<string | null>(null);
  protected readonly cancelOpen = signal(false);

  protected readonly isResuming = signal(false);
  protected readonly isDownloadingReceipt = signal(false);

  protected readonly sessionInfo = computed(() => {
    const b = this.booking();
    if (!b?.session) return null;

    const start = new Date(b.session.startTime);
    const end = new Date(b.session.endTime);
    if (Number.isNaN(start.getTime())) return null;

    return {
      date: DATE_FORMATTER.format(start),
      time: `${TIME_FORMATTER.format(start)}–${TIME_FORMATTER.format(end)} Uhr`,
    };
  });

  protected readonly priceLabel = computed(() => {
    const payment = this.booking()?.payment;
    if (!payment) return null;
    return MONEY_FORMATTER.format(payment.amountInCents / 100);
  });

  protected readonly paidAtLabel = computed(() => {
    const paidAt = this.booking()?.payment?.paidAt;
    if (!paidAt) return null;
    return DATE_FORMATTER.format(new Date(paidAt));
  });

  protected readonly canCancel = computed(() => {
    const status = this.booking()?.status.toLowerCase() ?? '';
    return ['pending', 'confirmed', 'waitlist', 'waitlisted'].includes(status);
  });

  protected readonly canResumeCheckout = computed(() => {
    const b = this.booking();
    if (!b) return false;
    const status = b.status.toLowerCase();
    const paymentStatus = b.payment?.status?.toLowerCase();
    return status === 'pending' && !!b.payment && paymentStatus !== 'paid';
  });

  protected readonly canDownloadReceipt = computed(() => {
    return this.booking()?.payment?.status?.toLowerCase() === 'paid';
  });

  protected readonly canRebook = computed(() => {
    const status = this.booking()?.status.toLowerCase() ?? '';
    return ['completed', 'cancelled', 'attended'].includes(status);
  });

  protected readonly waitlistPosition = computed(() => {
    const b = this.booking();
    const status = b?.status.toLowerCase();
    if (status !== 'waitlist' && status !== 'waitlisted') return null;
    return b?.waitlistPosition ?? null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError.set('Buchung nicht gefunden.');
      this.isLoading.set(false);
      return;
    }
    this.fetch(id);
  }

  fetch(id: string): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.bookingApi.getBooking(id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.isLoading.set(false);
      },
      error: (err) => {
        const status = err?.status;
        if (status === 403) {
          this.loadError.set(
            'Du hast keinen Zugriff auf diese Buchung.',
          );
        } else if (status === 404) {
          this.loadError.set('Buchung nicht gefunden.');
        } else {
          this.loadError.set(
            'Buchung konnte nicht geladen werden. Bitte versuche es erneut.',
          );
        }
        this.isLoading.set(false);
      },
    });
  }

  openCancel(): void {
    this.cancelOpen.set(true);
  }

  closeCancel(): void {
    this.cancelOpen.set(false);
  }

  onCancelCompleted(): void {
    this.cancelOpen.set(false);
    const id = this.booking()?.id;
    if (id) {
      this.fetch(id);
    }
  }

  resumeCheckout(): void {
    const b = this.booking();
    if (!b) return;
    this.resumeError.set(null);
    this.isResuming.set(true);
    this.store
      .resumeCheckout(b.id)
      .then((url) => {
        window.location.href = url;
      })
      .catch(() => {
        this.resumeError.set(
          'Die Zahlung konnte nicht fortgesetzt werden. Bitte versuche es erneut.',
        );
        this.isResuming.set(false);
      });
  }

  downloadReceipt(): void {
    const b = this.booking();
    if (!b) return;

    this.receiptError.set(null);
    this.isDownloadingReceipt.set(true);

    this.bookingApi.downloadReceipt(b.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quittung-${b.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.isDownloadingReceipt.set(false);
      },
      error: () => {
        this.receiptError.set(
          'Die Quittung konnte nicht geladen werden. Bitte versuche es erneut.',
        );
        this.isDownloadingReceipt.set(false);
      },
    });
  }

  rebook(): void {
    const slug = this.booking()?.course.slug;
    if (slug) {
      this.router.navigate(['/courses', slug]);
    }
  }
}

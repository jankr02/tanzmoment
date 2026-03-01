import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  AdminApiService,
  AdminBookingListItem,
  BookingListFilters,
  BookingListMeta,
} from '@tanzmoment/admin/data-access';
import { BookingStatusBadgeComponent } from '../booking-status-badge/booking-status-badge.component';

interface ConfirmAction {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
}

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'admin-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BookingStatusBadgeComponent],
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingListComponent implements OnInit, OnDestroy {
  private readonly adminApi = inject(AdminApiService);
  private readonly destroy$ = new Subject<void>();
  private readonly filterSubject$ = new Subject<void>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly bookings = signal<AdminBookingListItem[]>([]);
  readonly meta = signal<BookingListMeta | null>(null);

  readonly statusFilter = signal('');
  readonly paymentStatusFilter = signal('');
  readonly courseFilter = signal('');
  readonly fromFilter = signal('');
  readonly toFilter = signal('');
  readonly currentPage = signal(1);

  readonly confirmAction = signal<ConfirmAction | null>(null);

  readonly isEmpty = computed(
    () => !this.loading() && this.bookings().length === 0
  );

  readonly hasActiveFilters = computed(
    () =>
      !!(
        this.statusFilter() ||
        this.paymentStatusFilter() ||
        this.courseFilter() ||
        this.fromFilter() ||
        this.toFilter()
      )
  );

  readonly statusOptions: FilterOption[] = [
    { value: '', label: 'Alle Status' },
    { value: 'PENDING', label: 'Ausstehend' },
    { value: 'CONFIRMED', label: 'Bestätigt' },
    { value: 'CANCELLED', label: 'Storniert' },
    { value: 'WAITLISTED', label: 'Warteliste' },
    { value: 'ATTENDED', label: 'Erschienen' },
    { value: 'NO_SHOW', label: 'Nicht erschienen' },
    { value: 'COMPLETED', label: 'Abgeschlossen' },
  ];

  readonly paymentStatusOptions: FilterOption[] = [
    { value: '', label: 'Alle Zahlungen' },
    { value: 'PENDING', label: 'Offen' },
    { value: 'PAID', label: 'Bezahlt' },
    { value: 'REFUNDED', label: 'Erstattet' },
    { value: 'FAILED', label: 'Fehlgeschlagen' },
  ];

  ngOnInit(): void {
    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.loadBookings());

    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: BookingListFilters = {
      page: this.currentPage(),
      limit: 20,
    };

    const status = this.statusFilter();
    if (status) filters.status = status;

    const paymentStatus = this.paymentStatusFilter();
    if (paymentStatus) filters.paymentStatus = paymentStatus;

    const courseId = this.courseFilter();
    if (courseId) filters.courseId = courseId;

    const from = this.fromFilter();
    if (from) filters.from = from;

    const to = this.toFilter();
    if (to) filters.to = to;

    this.adminApi.getBookings(filters).subscribe({
      next: (response) => {
        this.bookings.set(response.data);
        this.meta.set(response.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Buchungen konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadBookings();
  }

  onPaymentStatusChange(event: Event): void {
    this.paymentStatusFilter.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadBookings();
  }

  onFromChange(event: Event): void {
    this.fromFilter.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.filterSubject$.next();
  }

  onToChange(event: Event): void {
    this.toFilter.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.filterSubject$.next();
  }

  onResetFilters(): void {
    this.statusFilter.set('');
    this.paymentStatusFilter.set('');
    this.courseFilter.set('');
    this.fromFilter.set('');
    this.toFilter.set('');
    this.currentPage.set(1);
    this.loadBookings();
  }

  onPreviousPage(): void {
    const page = this.currentPage();
    if (page > 1) {
      this.currentPage.set(page - 1);
      this.loadBookings();
    }
  }

  onNextPage(): void {
    const m = this.meta();
    if (m && this.currentPage() < m.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadBookings();
    }
  }

  onConfirmBooking(booking: AdminBookingListItem): void {
    this.showConfirmDialog({
      title: 'Buchung bestätigen',
      message: `Möchtest du die Buchung von ${this.getParticipantName(booking)} für "${booking.course.title}" bestätigen?`,
      confirmLabel: 'Bestätigen',
      variant: 'primary',
      onConfirm: () => {
        this.adminApi.updateBookingStatus(booking.id, 'CONFIRMED').subscribe({
          next: () => this.loadBookings(),
          error: () => this.error.set('Status konnte nicht geändert werden.'),
        });
      },
    });
  }

  getParticipantName(booking: AdminBookingListItem): string {
    if (booking.user?.name) return booking.user.name;
    if (booking.guestName) return booking.guestName;
    return booking.guestEmail ?? booking.user?.email ?? 'Unbekannt';
  }

  getParticipantEmail(booking: AdminBookingListItem): string {
    return booking.user?.email ?? booking.guestEmail ?? '';
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  formatRelativeDate(date: string | Date | null | undefined): string {
    if (!date) return '—';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`;

    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }

  getDanceStyleLabel(style: string): string {
    const labels: Record<string, string> = {
      accessible: 'Accessible Dance',
      expressive: 'Ausdruckstanz',
      kids: 'Kinderkurse',
      mothers: 'Mütterkurse',
    };
    return labels[style] ?? style;
  }

  trackBooking(_index: number, booking: AdminBookingListItem): string {
    return booking.id;
  }

  showConfirmDialog(action: ConfirmAction): void {
    this.confirmAction.set(action);
  }

  onConfirmAction(): void {
    const action = this.confirmAction();
    if (action) {
      action.onConfirm();
      this.confirmAction.set(null);
    }
  }

  onCancelAction(): void {
    this.confirmAction.set(null);
  }
}

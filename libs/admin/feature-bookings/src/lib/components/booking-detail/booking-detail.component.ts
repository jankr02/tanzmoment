import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AdminApiService,
  AdminBookingDetail,
} from '@tanzmoment/admin/data-access';
import { BookingStatusBadgeComponent } from '../booking-status-badge/booking-status-badge.component';

interface ConfirmAction {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
}

interface StatusOption {
  value: string;
  label: string;
}

@Component({
  selector: 'admin-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BookingStatusBadgeComponent],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly booking = signal<AdminBookingDetail | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal<string | null>(null);

  readonly selectedStatus = signal('');
  readonly confirmAction = signal<ConfirmAction | null>(null);

  readonly allowedStatusTransitions = computed<StatusOption[]>(() => {
    const b = this.booking();
    if (!b) return [];
    return this.getStatusOptions(b.status);
  });

  readonly participantName = computed(() => {
    const b = this.booking();
    if (!b) return '';
    if (b.user?.name) return b.user.name;
    if (b.guestName) return b.guestName;
    return b.guestEmail ?? b.user?.email ?? 'Unbekannt';
  });

  readonly participantEmail = computed(() => {
    const b = this.booking();
    if (!b) return '';
    return b.user?.email ?? b.guestEmail ?? '';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Ungültige Buchungs-ID.');
      this.loading.set(false);
      return;
    }
    this.loadBooking(id);
  }

  loadBooking(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminApi.getBooking(id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Buchung konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  onStatusChange(event: Event): void {
    this.selectedStatus.set((event.target as HTMLSelectElement).value);
  }

  onApplyStatus(): void {
    const booking = this.booking();
    const newStatus = this.selectedStatus();
    if (!booking || !newStatus) return;

    const isCancellation = newStatus === 'CANCELLED';

    this.showConfirmDialog({
      title: isCancellation ? 'Buchung stornieren' : 'Status ändern',
      message: isCancellation
        ? `Möchtest du die Buchung von ${this.participantName()} für "${booking.course.title}" wirklich stornieren?`
        : `Status der Buchung von ${this.participantName()} auf "${this.getStatusLabel(newStatus)}" ändern?`,
      confirmLabel: isCancellation ? 'Stornieren' : 'Ändern',
      variant: isCancellation ? 'danger' : 'primary',
      onConfirm: () => {
        this.saving.set(true);
        this.saveError.set(null);
        this.adminApi
          .updateBookingStatus(booking.id, newStatus)
          .subscribe({
            next: () => {
              this.saveSuccess.set('Status erfolgreich geändert.');
              this.selectedStatus.set('');
              this.loadBooking(booking.id);
              this.saving.set(false);
              setTimeout(() => this.saveSuccess.set(null), 3000);
            },
            error: () => {
              this.saveError.set('Status konnte nicht geändert werden.');
              this.saving.set(false);
            },
          });
      },
    });
  }

  onMarkAttended(): void {
    const booking = this.booking();
    if (!booking) return;

    this.showConfirmDialog({
      title: 'Als erschienen markieren',
      message: `${this.participantName()} als erschienen markieren?`,
      confirmLabel: 'Erschienen',
      variant: 'primary',
      onConfirm: () => {
        this.saving.set(true);
        this.adminApi.markAttended(booking.id).subscribe({
          next: () => {
            this.saveSuccess.set('Als erschienen markiert.');
            this.loadBooking(booking.id);
            this.saving.set(false);
            setTimeout(() => this.saveSuccess.set(null), 3000);
          },
          error: () => {
            this.saveError.set('Fehler beim Markieren.');
            this.saving.set(false);
          },
        });
      },
    });
  }

  onMarkNoShow(): void {
    const booking = this.booking();
    if (!booking) return;

    this.showConfirmDialog({
      title: 'Als nicht erschienen markieren',
      message: `${this.participantName()} als nicht erschienen (No-Show) markieren?`,
      confirmLabel: 'No-Show',
      variant: 'warning',
      onConfirm: () => {
        this.saving.set(true);
        this.adminApi.markNoShow(booking.id).subscribe({
          next: () => {
            this.saveSuccess.set('Als No-Show markiert.');
            this.loadBooking(booking.id);
            this.saving.set(false);
            setTimeout(() => this.saveSuccess.set(null), 3000);
          },
          error: () => {
            this.saveError.set('Fehler beim Markieren.');
            this.saving.set(false);
          },
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/admin/buchungen']);
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  formatCurrency(amountInCents: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amountInCents / 100);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Ausstehend',
      CONFIRMED: 'Bestätigt',
      CANCELLED: 'Storniert',
      WAITLISTED: 'Warteliste',
      ATTENDED: 'Erschienen',
      NO_SHOW: 'Nicht erschienen',
      COMPLETED: 'Abgeschlossen',
      REJECTED: 'Abgelehnt',
    };
    return labels[status] ?? status;
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      CREDIT_CARD: 'Kreditkarte',
      SEPA_DEBIT: 'SEPA-Lastschrift',
      BANK_TRANSFER: 'Banküberweisung',
      CASH: 'Bar',
      PAYPAL: 'PayPal',
      VOUCHER: 'Gutschein',
      FREE: 'Kostenlos',
    };
    return labels[method] ?? method;
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

  private getStatusOptions(currentStatus: string): StatusOption[] {
    const transitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED', 'REJECTED', 'WAITLISTED'],
      CONFIRMED: ['CANCELLED', 'COMPLETED', 'NO_SHOW', 'ATTENDED'],
      WAITLISTED: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      ATTENDED: ['COMPLETED'],
      CANCELLED: [],
      COMPLETED: [],
      REJECTED: [],
      NO_SHOW: [],
    };

    return (transitions[currentStatus] ?? []).map((s) => ({
      value: s,
      label: this.getStatusLabel(s),
    }));
  }
}

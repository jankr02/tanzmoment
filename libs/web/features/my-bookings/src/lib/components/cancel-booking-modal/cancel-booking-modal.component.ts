import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingDetail, CancellationPreview } from '@tanzmoment/shared/types';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { MyBookingsStore } from '../../services/my-bookings.store';

const MONEY_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

@Component({
  selector: 'lib-cancel-booking-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './cancel-booking-modal.component.html',
  styleUrl: './cancel-booking-modal.component.scss',
})
export class CancelBookingModalComponent {
  private readonly store = inject(MyBookingsStore);

  readonly booking = input.required<BookingDetail>();

  readonly closed = output<void>();
  readonly cancelled = output<void>();

  readonly preview = signal<CancellationPreview | null>(null);
  readonly previewError = signal<string | null>(null);
  readonly isLoadingPreview = signal(true);
  readonly reason = signal('');
  readonly submitError = signal<string | null>(null);

  readonly isSubmitting = computed(
    () => this.store.cancellingId() === this.booking().id,
  );

  readonly refundAmountLabel = computed(() => {
    const p = this.preview();
    if (!p) return '';
    return MONEY_FORMATTER.format(p.refundAmountInCents / 100);
  });

  readonly originalAmountLabel = computed(() => {
    const p = this.preview();
    if (!p) return '';
    return MONEY_FORMATTER.format(p.originalAmountInCents / 100);
  });

  constructor() {
    effect(() => {
      const id = this.booking().id;
      this.loadPreview(id);
    });
  }

  private loadPreview(bookingId: string): void {
    this.isLoadingPreview.set(true);
    this.previewError.set(null);
    this.store
      .fetchCancellationPreview(bookingId)
      .then((res) => {
        this.preview.set(res);
        this.isLoadingPreview.set(false);
      })
      .catch(() => {
        this.previewError.set(
          'Die Erstattungsdetails konnten nicht geladen werden.',
        );
        this.isLoadingPreview.set(false);
      });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  onConfirm(): void {
    const preview = this.preview();
    if (!preview?.canCancel || this.isSubmitting()) return;

    this.submitError.set(null);
    this.store
      .cancel(this.booking().id, this.reason().trim() || undefined)
      .then(() => {
        this.cancelled.emit();
      })
      .catch(() => {
        this.submitError.set(
          'Die Stornierung konnte nicht abgeschlossen werden. Bitte versuche es erneut.',
        );
      });
  }
}

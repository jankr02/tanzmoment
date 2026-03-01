import {
  Component,
  ChangeDetectionStrategy,
  Input,
  computed,
  signal,
} from '@angular/core';

interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
}

const BOOKING_STATUS_MAP: Record<string, StatusMeta> = {
  PENDING: { label: 'Ausstehend', color: '#D97706', bgColor: '#FEF3C7' },
  CONFIRMED: { label: 'Bestätigt', color: '#059669', bgColor: '#D1FAE5' },
  CANCELLED: { label: 'Storniert', color: '#DC2626', bgColor: '#FEE2E2' },
  WAITLISTED: { label: 'Warteliste', color: '#2563EB', bgColor: '#DBEAFE' },
  ATTENDED: { label: 'Erschienen', color: '#059669', bgColor: '#D1FAE5' },
  NO_SHOW: { label: 'Nicht erschienen', color: '#6B7280', bgColor: '#F3F4F6' },
  COMPLETED: { label: 'Abgeschlossen', color: '#6B7280', bgColor: '#F3F4F6' },
  REJECTED: { label: 'Abgelehnt', color: '#DC2626', bgColor: '#FEE2E2' },
};

const PAYMENT_STATUS_MAP: Record<string, StatusMeta> = {
  PENDING: { label: 'Offen', color: '#D97706', bgColor: '#FEF3C7' },
  PROCESSING: { label: 'In Bearbeitung', color: '#2563EB', bgColor: '#DBEAFE' },
  PAID: { label: 'Bezahlt', color: '#059669', bgColor: '#D1FAE5' },
  FAILED: { label: 'Fehlgeschlagen', color: '#DC2626', bgColor: '#FEE2E2' },
  REFUNDED: { label: 'Erstattet', color: '#7C3AED', bgColor: '#EDE9FE' },
  PARTIAL_REFUND: { label: 'Teilerstattung', color: '#7C3AED', bgColor: '#EDE9FE' },
  FREE: { label: 'Kostenlos', color: '#059669', bgColor: '#D1FAE5' },
};

const FALLBACK: StatusMeta = { label: 'Unbekannt', color: '#6B7280', bgColor: '#F3F4F6' };

@Component({
  selector: 'admin-booking-status-badge',
  standalone: true,
  templateUrl: './booking-status-badge.component.html',
  styleUrls: ['./booking-status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingStatusBadgeComponent {
  private readonly _status = signal('');
  private readonly _type = signal<'booking' | 'payment'>('booking');

  @Input({ required: true })
  set status(value: string) {
    this._status.set(value ?? '');
  }

  @Input()
  set type(value: 'booking' | 'payment') {
    this._type.set(value);
  }

  readonly meta = computed<StatusMeta>(() => {
    const map = this._type() === 'payment' ? PAYMENT_STATUS_MAP : BOOKING_STATUS_MAP;
    return map[this._status()] ?? FALLBACK;
  });
}

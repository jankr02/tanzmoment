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

const COURSE_STATUS_MAP: Record<string, StatusMeta> = {
  DRAFT: { label: 'Entwurf', color: '#6B7280', bgColor: '#F3F4F6' },
  ACTIVE: { label: 'Aktiv', color: '#059669', bgColor: '#D1FAE5' },
  FULL: { label: 'Ausgebucht', color: '#2563EB', bgColor: '#DBEAFE' },
  PAUSED: { label: 'Pausiert', color: '#D97706', bgColor: '#FEF3C7' },
  COMPLETED: { label: 'Abgeschlossen', color: '#6B7280', bgColor: '#F3F4F6' },
  ARCHIVED: { label: 'Archiviert', color: '#9CA3AF', bgColor: '#F9FAFB' },
  CANCELLED: { label: 'Abgesagt', color: '#DC2626', bgColor: '#FEE2E2' },
};

const SESSION_STATUS_MAP: Record<string, StatusMeta> = {
  SCHEDULED: { label: 'Geplant', color: '#059669', bgColor: '#D1FAE5' },
  IN_PROGRESS: { label: 'Läuft', color: '#2563EB', bgColor: '#DBEAFE' },
  COMPLETED: { label: 'Abgeschlossen', color: '#6B7280', bgColor: '#F3F4F6' },
  CANCELLED: { label: 'Abgesagt', color: '#DC2626', bgColor: '#FEE2E2' },
  POSTPONED: { label: 'Verschoben', color: '#D97706', bgColor: '#FEF3C7' },
};

const FALLBACK: StatusMeta = { label: 'Unbekannt', color: '#6B7280', bgColor: '#F3F4F6' };

@Component({
  selector: 'admin-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  private readonly _status = signal('');
  private readonly _type = signal<'course' | 'session'>('course');

  @Input({ required: true })
  set status(value: string) {
    this._status.set(value);
  }

  @Input()
  set type(value: 'course' | 'session') {
    this._type.set(value);
  }

  readonly meta = computed<StatusMeta>(() => {
    const map = this._type() === 'session' ? SESSION_STATUS_MAP : COURSE_STATUS_MAP;
    return map[this._status()] ?? FALLBACK;
  });
}

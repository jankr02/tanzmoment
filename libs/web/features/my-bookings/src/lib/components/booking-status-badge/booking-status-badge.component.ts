import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

interface BadgeConfig {
  label: string;
  tone: 'confirmed' | 'pending' | 'waitlisted' | 'cancelled' | 'completed' | 'neutral';
}

const STATUS_CONFIG: Record<string, BadgeConfig> = {
  confirmed: { label: 'Bestätigt', tone: 'confirmed' },
  pending: { label: 'Zahlung ausstehend', tone: 'pending' },
  waitlist: { label: 'Warteliste', tone: 'waitlisted' },
  waitlisted: { label: 'Warteliste', tone: 'waitlisted' },
  cancelled: { label: 'Storniert', tone: 'cancelled' },
  rejected: { label: 'Abgelehnt', tone: 'cancelled' },
  completed: { label: 'Abgeschlossen', tone: 'completed' },
  attended: { label: 'Teilgenommen', tone: 'completed' },
  no_show: { label: 'Nicht erschienen', tone: 'neutral' },
};

@Component({
  selector: 'lib-booking-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [class]="'badge--' + config().tone">
      {{ config().label }}
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
        border-radius: 999px;
        letter-spacing: 0.02em;
      }

      .badge--confirmed {
        background: color-mix(in srgb, var(--color-primary-dark) 15%, transparent);
        color: var(--color-primary-dark);
      }

      .badge--pending {
        background: color-mix(in srgb, var(--color-secondary) 25%, transparent);
        color: color-mix(in srgb, var(--color-secondary-dark) 90%, black);
      }

      .badge--waitlisted {
        background: color-mix(in srgb, var(--color-soft-accent) 30%, transparent);
        color: color-mix(in srgb, var(--color-soft-accent) 35%, var(--color-text-primary));
      }

      .badge--cancelled {
        background: var(--color-border);
        color: var(--color-text-secondary);
      }

      .badge--completed {
        background: color-mix(in srgb, var(--color-primary-dark) 18%, transparent);
        color: var(--color-primary-dark);
      }

      .badge--neutral {
        background: var(--color-primary-light);
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class BookingStatusBadgeComponent {
  readonly status = input.required<string>();

  readonly config = computed<BadgeConfig>(
    () =>
      STATUS_CONFIG[this.status().toLowerCase()] ?? {
        label: this.status(),
        tone: 'neutral',
      },
  );
}

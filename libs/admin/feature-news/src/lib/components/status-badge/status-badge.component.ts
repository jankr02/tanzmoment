import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  NewsArticleStatus,
  NewsletterCampaignStatus,
} from '@tanzmoment/admin/data-access';

type AnyStatus = NewsArticleStatus | NewsletterCampaignStatus;

const LABELS: Record<AnyStatus, string> = {
  DRAFT: 'Entwurf',
  PUBLISHED: 'Veröffentlicht',
  NOT_SENT: 'Nicht gesendet',
  SCHEDULED: 'Geplant',
  SENDING: 'Sendet…',
  SENT: 'Versendet',
  FAILED: 'Fehlgeschlagen',
  CANCELLED: 'Storniert',
};

const TONES: Record<AnyStatus, string> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  NOT_SENT: 'neutral',
  SCHEDULED: 'info',
  SENDING: 'info',
  SENT: 'success',
  FAILED: 'danger',
  CANCELLED: 'warn',
};

@Component({
  selector: 'admin-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [attr.data-tone]="tone()">{{ label() }}</span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        background: var(--color-primary-light, #f2ece3);
        color: var(--color-text-secondary, #5e5a55);
      }
      .badge[data-tone='success'] { background: #dcf2dc; color: #2f6f2f; }
      .badge[data-tone='info'] { background: #d9eef2; color: #1f5f6c; }
      .badge[data-tone='warn'] { background: #fbe7c1; color: #8a5a1c; }
      .badge[data-tone='danger'] { background: #fde0e0; color: #9b1c1c; }
    `,
  ],
})
export class StatusBadgeComponent {
  readonly status = input.required<AnyStatus>();

  readonly label = computed(() => LABELS[this.status()] ?? this.status());
  readonly tone = computed(() => TONES[this.status()] ?? 'neutral');
}

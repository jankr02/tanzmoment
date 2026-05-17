import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tm-notifications-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card" aria-labelledby="notifications-title">
      <header class="card__header">
        <h2 id="notifications-title">Benachrichtigungen</h2>
        <p class="card__subtitle">
          Steuere Erinnerungs- und Marketing-E-Mails. Bald verfügbar.
        </p>
      </header>
      <p class="placeholder">
        Hier kannst du in Kürze festlegen, welche E-Mails du von uns erhältst —
        z.&nbsp;B. Erinnerungen vor Sessions oder Newsletter.
      </p>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .card {
        background: var(--color-accent);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-5);
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        max-width: 640px;
      }
      .card__header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: var(--font-weight-heading, 900);
        color: var(--color-text-primary);
      }
      .card__subtitle {
        margin: var(--space-1) 0 0;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
      }
      .placeholder {
        margin: 0;
        padding: var(--space-4);
        background: var(--color-primary-light);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        font-size: 0.95rem;
      }
    `,
  ],
})
export class NotificationsTabComponent {}

// ============================================================================
// WAITLIST CONFIRMATION PAGE
// ============================================================================
// Shown after a user is placed on the waitlist.
// ============================================================================

import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent, ButtonComponent } from '@tanzmoment/shared/ui';

@Component({
  selector: 'app-waitlist-confirmation',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="waitlist-confirmation">
      <div class="waitlist-confirmation__content">
        <app-icon name="users" size="xl" />
        <h1>Auf der Warteliste!</h1>
        <p>
          Du wurdest auf die Warteliste gesetzt. Sobald ein Platz frei wird,
          wirst du automatisch per E-Mail benachrichtigt.
        </p>
        <div class="waitlist-confirmation__actions">
          <app-button variant="primary" (clicked)="goToCourses()">Weitere Kurse entdecken</app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .waitlist-confirmation {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: var(--space-8) var(--space-4);

      &__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        max-width: 480px;
        text-align: center;

        h1 {
          font-family: var(--font-headline);
          font-size: 1.75rem;
          color: var(--color-text-primary);
          margin: 0;
        }

        p {
          color: var(--color-text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        app-icon {
          color: #7c3aed;
          font-size: 3rem;
        }
      }

      &__actions {
        margin-top: var(--space-2);
      }
    }
  `],
})
export class WaitlistConfirmationComponent {
  private readonly router = inject(Router);

  goToCourses(): void {
    this.router.navigate(['/courses']);
  }
}

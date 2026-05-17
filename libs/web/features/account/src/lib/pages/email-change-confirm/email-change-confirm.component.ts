import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AuthStateService,
  UserApiService,
} from '@tanzmoment/shared/services';
import { ButtonComponent } from '@tanzmoment/shared/ui';

type ConfirmState = 'pending' | 'success' | 'error';

@Component({
  selector: 'tm-email-change-confirm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <main class="page">
      <div class="card">
        @switch (state()) {
          @case ('pending') {
            <h1>E-Mail wird bestätigt…</h1>
            <p>Einen Moment bitte.</p>
          }
          @case ('success') {
            <h1>Neue E-Mail-Adresse bestätigt</h1>
            <p>{{ message() }}</p>
            <div class="actions">
              @if (isAuthenticated()) {
                <app-button variant="primary" routerLink="/mein-konto/profil">
                  Zurück zum Konto
                </app-button>
              } @else {
                <app-button variant="primary" routerLink="/auth/login">
                  Jetzt anmelden
                </app-button>
              }
            </div>
          }
          @case ('error') {
            <h1>Bestätigung fehlgeschlagen</h1>
            <p>{{ message() }}</p>
            <div class="actions">
              <app-button variant="ghost" routerLink="/">
                Zur Startseite
              </app-button>
            </div>
          }
        }
      </div>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .page {
        min-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-6) var(--space-4);
      }
      .card {
        background: var(--color-accent);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        max-width: 480px;
        width: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: var(--space-3);

        h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: var(--font-weight-heading, 900);
          color: var(--color-text-primary);
        }
        p {
          margin: 0;
          color: var(--color-text-secondary);
        }
      }
      .actions {
        display: flex;
        justify-content: center;
        margin-top: var(--space-3);
      }
    `,
  ],
})
export class EmailChangeConfirmComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userApi = inject(UserApiService);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly state = signal<ConfirmState>('pending');
  protected readonly message = signal<string>('');
  protected readonly isAuthenticated = this.authState.isAuthenticated;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error');
      this.message.set('Es wurde kein Bestätigungstoken übergeben.');
      return;
    }

    this.userApi
      .confirmEmailChange(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.state.set('success');
          this.message.set(res.message);
          if (this.authState.isAuthenticated()) {
            this.authState.clearAuth(false);
            void this.router.navigate(['/auth/login'], {
              queryParams: { 'email-changed': '1' },
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.state.set('error');
          this.message.set(
            err.error?.message ??
              'Der Bestätigungslink ist ungültig oder abgelaufen.',
          );
        },
      });
  }
}

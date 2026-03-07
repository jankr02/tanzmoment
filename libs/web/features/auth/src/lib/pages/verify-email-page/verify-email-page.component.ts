import { Component, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStateService, AuthApiService } from '@tanzmoment/shared/services';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';

type VerifyState = 'loading' | 'success' | 'error' | 'no-token';

@Component({
  selector: 'tm-verify-email-page',
  standalone: true,
  imports: [RouterLink, AuthLayoutComponent, ButtonComponent],
  templateUrl: './verify-email-page.component.html',
  styleUrl: './verify-email-page.component.scss',
})
export class VerifyEmailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);
  readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = signal<VerifyState>('loading');
  readonly message = signal('');
  readonly resending = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.state.set('no-token');
      return;
    }

    this.authApi
      .verifyEmail(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.state.set('success');
          this.message.set(res.message);
        },
        error: (err: HttpErrorResponse) => {
          this.state.set('error');
          this.message.set(
            err.error?.message || 'Der Verifizierungslink ist ungültig oder abgelaufen.',
          );
        },
      });
  }

  resendVerification(): void {
    this.resending.set(true);
    this.authApi
      .resendVerification()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.resending.set(false);
          this.message.set(res.message);
          this.state.set('success');
        },
        error: () => {
          this.resending.set(false);
        },
      });
  }
}

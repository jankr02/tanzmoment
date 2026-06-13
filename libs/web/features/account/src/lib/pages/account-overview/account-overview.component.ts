import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AuthApiService,
  AuthStateService,
} from '@tanzmoment/shared/services';
import { ButtonComponent, InputComponent } from '@tanzmoment/shared/ui';
import { AccountApiService } from '../../services/account-api.service';

@Component({
  selector: 'lib-account-overview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOverviewComponent {
  private readonly accountApi = inject(AccountApiService);
  private readonly authApi = inject(AuthApiService);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = this.authState.user;

  readonly saving = signal(false);
  readonly profileError = signal<string | null>(null);
  readonly profileSuccess = signal<string | null>(null);

  readonly resending = signal(false);
  readonly resendMessage = signal<string | null>(null);

  readonly form = new FormGroup({
    firstName: new FormControl(this.user()?.firstName ?? '', [
      Validators.required,
      Validators.minLength(2),
    ]),
    lastName: new FormControl(this.user()?.lastName ?? '', [
      Validators.required,
      Validators.minLength(2),
    ]),
    phone: new FormControl(this.user()?.phone ?? ''),
  });

  get firstNameControl() {
    return this.form.get('firstName')!;
  }
  get lastNameControl() {
    return this.form.get('lastName')!;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    const { firstName, lastName, phone } = this.form.getRawValue();

    this.accountApi
      .updateProfile({
        firstName: firstName!,
        lastName: lastName!,
        phone: phone?.trim() ? phone.trim() : undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.profileSuccess.set('Deine Daten wurden gespeichert.');
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.profileError.set(
            err.error?.message ||
              'Speichern fehlgeschlagen. Bitte versuche es erneut.',
          );
        },
      });
  }

  resendVerification(): void {
    this.resending.set(true);
    this.resendMessage.set(null);

    this.authApi
      .resendVerification()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.resending.set(false);
          this.resendMessage.set(res.message);
        },
        error: () => {
          this.resending.set(false);
          this.resendMessage.set(
            'Die E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.',
          );
        },
      });
  }
}

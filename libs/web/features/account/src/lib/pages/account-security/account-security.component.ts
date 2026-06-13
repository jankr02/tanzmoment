import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent, InputComponent } from '@tanzmoment/shared/ui';
import { AccountApiService } from '../../services/account-api.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { mismatch: true };
}

@Component({
  selector: 'lib-account-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './account-security.component.html',
  styleUrls: ['./account-security.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSecurityComponent {
  private readonly accountApi = inject(AccountApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly passwordSaving = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal<string | null>(null);

  readonly emailSaving = signal(false);
  readonly emailError = signal<string | null>(null);
  readonly emailSuccess = signal<string | null>(null);

  readonly passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordsMatch },
  );

  readonly emailForm = new FormGroup({
    newEmail: new FormControl('', [Validators.required, Validators.email]),
    currentPassword: new FormControl('', [Validators.required]),
  });

  get newPasswordControl() {
    return this.passwordForm.get('newPassword')!;
  }
  get confirmPasswordControl() {
    return this.passwordForm.get('confirmPassword')!;
  }
  get newEmailControl() {
    return this.emailForm.get('newEmail')!;
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordSaving.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.accountApi
      .changePassword({ currentPassword: currentPassword!, newPassword: newPassword! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.passwordSaving.set(false);
          this.passwordSuccess.set(res.message);
          this.passwordForm.reset();
        },
        error: (err: HttpErrorResponse) => {
          this.passwordSaving.set(false);
          this.passwordError.set(
            err.error?.message ||
              'Das Passwort konnte nicht geändert werden. Bitte versuche es erneut.',
          );
        },
      });
  }

  onSubmitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.emailSaving.set(true);
    this.emailError.set(null);
    this.emailSuccess.set(null);

    const { newEmail, currentPassword } = this.emailForm.getRawValue();

    this.accountApi
      .changeEmail({ newEmail: newEmail!, currentPassword: currentPassword! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.emailSaving.set(false);
          this.emailSuccess.set(
            'E-Mail geändert. Wir haben dir einen Bestätigungslink an die neue Adresse gesendet.',
          );
          this.emailForm.reset();
        },
        error: (err: HttpErrorResponse) => {
          this.emailSaving.set(false);
          this.emailError.set(
            err.error?.message ||
              'Die E-Mail-Adresse konnte nicht geändert werden. Bitte versuche es erneut.',
          );
        },
      });
  }
}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthStateService } from '@tanzmoment/shared/services';
import { ButtonComponent, InputComponent } from '@tanzmoment/shared/ui';
import { AccountStore } from '../../services/account.store';

function matchPasswordValidator(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPassword && confirm && newPassword !== confirm
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'tm-password-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './password-tab.component.html',
  styleUrl: './password-tab.component.scss',
})
export class PasswordTabComponent {
  private readonly store = inject(AccountStore);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  protected readonly form = new FormGroup(
    {
      currentPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])/),
        ],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: matchPasswordValidator },
  );

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly currentControl = computed(
    () => this.form.controls.currentPassword,
  );
  protected readonly newControl = computed(
    () => this.form.controls.newPassword,
  );
  protected readonly confirmControl = computed(
    () => this.form.controls.confirmPassword,
  );

  protected onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    this.store
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      .then(() => {
        this.authState.clearAuth(false);
        void this.router.navigate(['/auth/login'], {
          queryParams: { 'password-changed': '1' },
        });
      })
      .catch((err: HttpErrorResponse) => {
        this.error.set(
          err.error?.message ?? 'Passwort konnte nicht geändert werden.',
        );
        this.saving.set(false);
      });
  }
}

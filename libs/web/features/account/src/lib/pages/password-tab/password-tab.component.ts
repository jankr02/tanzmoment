import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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
  protected readonly success = signal<string | null>(null);
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
    this.success.set(null);

    const value = this.form.getRawValue();
    this.store
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      .then(() => {
        this.success.set('Dein Passwort wurde geändert.');
        this.form.reset();
      })
      .catch((err: HttpErrorResponse) => {
        this.error.set(
          err.error?.message ?? 'Passwort konnte nicht geändert werden.',
        );
      })
      .finally(() => this.saving.set(false));
  }
}

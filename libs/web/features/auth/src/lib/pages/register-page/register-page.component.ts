import { Component, inject, signal, DestroyRef } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStateService, AuthApiService } from '@tanzmoment/shared/services';
import { InputComponent, ButtonComponent, CheckboxComponent } from '@tanzmoment/shared/ui';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';

function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const password = group.get('password')?.value;
    const confirm = group.get('passwordConfirm')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordsMismatch: true };
    }
    return null;
  };
}

@Component({
  selector: 'tm-register-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    InputComponent,
    ButtonComponent,
    CheckboxComponent,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = new FormGroup(
    {
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.pattern(/^[+\d][\d\s\-()]{6,19}$/)]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])/),
      ]),
      passwordConfirm: new FormControl('', [Validators.required]),
      privacy: new FormControl(false, [Validators.requiredTrue]),
    },
    { validators: passwordsMatchValidator() },
  );

  get firstNameControl() { return this.form.get('firstName')!; }
  get lastNameControl() { return this.form.get('lastName')!; }
  get emailControl() { return this.form.get('email')!; }
  get phoneControl() { return this.form.get('phone')!; }
  get passwordControl() { return this.form.get('password')!; }
  get passwordConfirmControl() { return this.form.get('passwordConfirm')!; }
  get privacyControl() { return this.form.get('privacy')!; }

  get passwordConfirmError(): string | null {
    if (this.passwordConfirmControl.touched && this.form.hasError('passwordsMismatch')) {
      return 'Die Passwörter stimmen nicht überein.';
    }
    if (this.passwordConfirmControl.invalid && this.passwordConfirmControl.touched) {
      return 'Bitte bestätige dein Passwort.';
    }
    return null;
  }

  get passwordError(): string | null {
    const ctrl = this.passwordControl;
    if (!ctrl.invalid || !ctrl.touched) return null;
    if (ctrl.hasError('minlength')) return 'Passwort muss mindestens 8 Zeichen lang sein.';
    if (ctrl.hasError('pattern')) return 'Passwort braucht mindestens 1 Großbuchstaben und 1 Zahl.';
    return 'Bitte gib ein Passwort ein.';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password, firstName, lastName, phone } = this.form.getRawValue();

    this.authApi
      .register(email!, password!, firstName!, lastName!, phone || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.authState.setAuth(response);
          this.router.navigate(['/auth/verify-email']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(
            err.error?.message || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.',
          );
        },
      });
  }
}

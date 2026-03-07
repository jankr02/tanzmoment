import { Component, inject, signal, DestroyRef, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthApiService } from '@tanzmoment/shared/services';
import { InputComponent, ButtonComponent } from '@tanzmoment/shared/ui';
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
  selector: 'tm-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent, InputComponent, ButtonComponent],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss',
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly authApi = inject(AuthApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly token = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = new FormGroup(
    {
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])/),
      ]),
      passwordConfirm: new FormControl('', [Validators.required]),
    },
    { validators: passwordsMatchValidator() },
  );

  get passwordControl() { return this.form.get('password')!; }
  get passwordConfirmControl() { return this.form.get('passwordConfirm')!; }

  get passwordError(): string | null {
    const ctrl = this.passwordControl;
    if (!ctrl.invalid || !ctrl.touched) return null;
    if (ctrl.hasError('minlength')) return 'Passwort muss mindestens 8 Zeichen lang sein.';
    if (ctrl.hasError('pattern')) return 'Passwort braucht mindestens 1 Großbuchstaben und 1 Zahl.';
    return 'Bitte gib ein Passwort ein.';
  }

  get passwordConfirmError(): string | null {
    if (this.passwordConfirmControl.touched && this.form.hasError('passwordsMismatch')) {
      return 'Die Passwörter stimmen nicht überein.';
    }
    return null;
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    this.token.set(token || null);
    if (!token) {
      this.errorMessage.set('Ungültiger Link. Bitte fordere einen neuen Reset-Link an.');
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { password } = this.form.getRawValue();

    this.authApi
      .resetPassword(this.token()!, password!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(
            err.error?.message || 'Der Link ist ungültig oder abgelaufen.',
          );
        },
      });
  }
}

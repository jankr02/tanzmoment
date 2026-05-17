import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent, InputComponent } from '@tanzmoment/shared/ui';
import { AccountStore } from '../../services/account.store';

@Component({
  selector: 'tm-profile-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './profile-tab.component.html',
  styleUrl: './profile-tab.component.scss',
})
export class ProfileTabComponent {
  protected readonly store = inject(AccountStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly profileForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(30)],
    }),
  });

  protected readonly emailForm = new FormGroup({
    newEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    currentPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  protected readonly profileSaving = signal(false);
  protected readonly profileSuccess = signal<string | null>(null);
  protected readonly profileError = signal<string | null>(null);

  protected readonly emailSaving = signal(false);
  protected readonly emailSuccess = signal<string | null>(null);
  protected readonly emailError = signal<string | null>(null);
  protected readonly emailFormOpen = signal(false);
  protected readonly cancellingEmailChange = signal(false);

  protected readonly hasPendingEmailChange = computed(
    () => !!this.store.profile()?.pendingEmail,
  );

  protected readonly pendingEmail = computed(
    () => this.store.profile()?.pendingEmail ?? '',
  );

  protected readonly profileFirstName = computed(
    () => this.profileForm.controls.firstName,
  );
  protected readonly profileLastName = computed(
    () => this.profileForm.controls.lastName,
  );
  protected readonly profilePhone = computed(
    () => this.profileForm.controls.phone,
  );
  protected readonly emailNewEmail = computed(
    () => this.emailForm.controls.newEmail,
  );
  protected readonly emailPassword = computed(
    () => this.emailForm.controls.currentPassword,
  );

  constructor() {
    effect(() => {
      const profile = this.store.profile();
      if (!profile) return;
      this.profileForm.reset(
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone ?? '',
        },
        { emitEvent: false },
      );
    });

    this.profileForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.profileSuccess()) this.profileSuccess.set(null);
        if (this.profileError()) this.profileError.set(null);
      });

    this.emailForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.emailSuccess()) this.emailSuccess.set(null);
        if (this.emailError()) this.emailError.set(null);
      });
  }

  protected onProfileSubmit(): void {
    if (this.profileForm.invalid || this.profileSaving()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileSaving.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    const value = this.profileForm.getRawValue();
    this.store
      .updateProfile({
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        phone: value.phone.trim() || null,
      })
      .then(() => {
        this.profileSuccess.set('Deine Daten wurden aktualisiert.');
      })
      .catch((err: HttpErrorResponse) => {
        this.profileError.set(
          err.error?.message ?? 'Speichern fehlgeschlagen. Bitte versuche es erneut.',
        );
      })
      .finally(() => this.profileSaving.set(false));
  }

  protected openEmailForm(): void {
    this.emailFormOpen.set(true);
    this.emailError.set(null);
    this.emailSuccess.set(null);
    this.emailForm.reset();
  }

  protected closeEmailForm(): void {
    this.emailFormOpen.set(false);
    this.emailForm.reset();
  }

  protected onEmailSubmit(): void {
    if (this.emailForm.invalid || this.emailSaving()) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.emailSaving.set(true);
    this.emailError.set(null);

    const value = this.emailForm.getRawValue();
    this.store
      .requestEmailChange({
        newEmail: value.newEmail.trim(),
        currentPassword: value.currentPassword,
      })
      .then(() => {
        this.emailSuccess.set(
          'Wir haben dir einen Bestätigungslink an die neue Adresse gesendet.',
        );
        this.closeEmailForm();
      })
      .catch((err: HttpErrorResponse) => {
        this.emailError.set(
          err.error?.message ?? 'Die E-Mail konnte nicht geändert werden.',
        );
      })
      .finally(() => this.emailSaving.set(false));
  }

  protected cancelEmailChange(): void {
    if (this.cancellingEmailChange()) return;
    this.cancellingEmailChange.set(true);
    this.emailError.set(null);

    this.store
      .cancelEmailChange()
      .then(() => {
        this.emailSuccess.set('Die E-Mail-Änderung wurde abgebrochen.');
      })
      .catch(() => {
        this.emailError.set(
          'Die Änderung konnte nicht abgebrochen werden. Bitte versuche es erneut.',
        );
      })
      .finally(() => this.cancellingEmailChange.set(false));
  }
}

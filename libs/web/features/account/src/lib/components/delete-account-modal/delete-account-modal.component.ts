import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent, InputComponent } from '@tanzmoment/shared/ui';
import { AccountStore } from '../../services/account.store';

const CONFIRMATION_PHRASE = 'KONTO LÖSCHEN';

@Component({
  selector: 'tm-delete-account-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './delete-account-modal.component.html',
  styleUrl: './delete-account-modal.component.scss',
})
export class DeleteAccountModalComponent {
  private readonly store = inject(AccountStore);

  readonly closed = output<void>();
  readonly deleted = output<void>();

  protected readonly confirmationPhrase = CONFIRMATION_PHRASE;

  protected readonly form = new FormGroup({
    currentPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmation: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly passwordControl = computed(
    () => this.form.controls.currentPassword,
  );
  protected readonly confirmationControl = computed(
    () => this.form.controls.confirmation,
  );

  protected readonly canSubmit = computed(() => {
    const v = this.form.getRawValue();
    return (
      !this.submitting() &&
      v.confirmation === CONFIRMATION_PHRASE &&
      v.currentPassword.length >= 8
    );
  });

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.submitting()) {
      this.closed.emit();
    }
  }

  protected onCancel(): void {
    if (this.submitting()) return;
    this.closed.emit();
  }

  protected onConfirm(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const value = this.form.getRawValue();
    this.store
      .deleteAccount({
        currentPassword: value.currentPassword,
        confirmation: value.confirmation,
      })
      .then(() => {
        this.deleted.emit();
      })
      .catch((err: HttpErrorResponse) => {
        this.submitError.set(
          err.error?.message ?? 'Löschen fehlgeschlagen. Bitte versuche es erneut.',
        );
        this.submitting.set(false);
      });
  }
}

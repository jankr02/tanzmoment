import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '@tanzmoment/admin/data-access';

@Component({
  selector: 'tm-tab-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tab-account.component.html',
  styleUrls: ['./tab-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabAccountComponent {
  private readonly api = inject(AdminApiService);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.update((v) => !v);
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update((v) => !v);
  }

  get passwordMismatch(): boolean {
    const np = this.newPassword();
    const cp = this.confirmPassword();
    return cp.length > 0 && np !== cp;
  }

  get newPasswordTooShort(): boolean {
    return this.newPassword().length > 0 && this.newPassword().length < 8;
  }

  get formValid(): boolean {
    return (
      this.currentPassword().length > 0 &&
      this.newPassword().length >= 8 &&
      this.newPassword() === this.confirmPassword()
    );
  }

  getStrengthClass(): string {
    const pw = this.newPassword();
    if (pw.length < 8) return 'weak';
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
    const score = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    if (score === 3 && pw.length >= 12) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  }

  getStrengthLabel(): string {
    switch (this.getStrengthClass()) {
      case 'strong': return 'Sicher';
      case 'medium': return 'Mittel';
      default: return 'Schwach';
    }
  }

  save(): void {
    if (!this.formValid || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.api
      .changePassword({
        currentPassword: this.currentPassword(),
        newPassword: this.newPassword(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Passwort erfolgreich geändert.');
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');
          setTimeout(() => this.successMessage.set(null), 4000);
        },
        error: (err) => {
          this.saving.set(false);
          if (err?.status === 401) {
            this.error.set('Das aktuelle Passwort ist falsch.');
          } else {
            this.error.set('Passwort konnte nicht geändert werden.');
          }
        },
      });
  }
}

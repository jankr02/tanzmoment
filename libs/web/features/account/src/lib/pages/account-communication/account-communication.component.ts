import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AuthStateService,
  NewsletterApiService,
  NewsletterSubscriberStatus,
} from '@tanzmoment/shared/services';
import { ButtonComponent, InputComponent } from '@tanzmoment/shared/ui';
import { AccountApiService } from '../../services/account-api.service';

@Component({
  selector: 'lib-account-communication',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './account-communication.component.html',
  styleUrls: ['./account-communication.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCommunicationComponent implements OnInit {
  private readonly newsletterApi = inject(NewsletterApiService);
  private readonly accountApi = inject(AccountApiService);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly newsletterStatus = signal<NewsletterSubscriberStatus | null>(null);
  readonly newsletterLoading = signal(true);
  readonly newsletterSaving = signal(false);
  readonly newsletterMessage = signal<string | null>(null);

  readonly exporting = signal(false);
  readonly exportError = signal<string | null>(null);

  readonly showDeleteModal = signal(false);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);
  readonly deletePassword = new FormControl('', [Validators.required]);

  get isSubscribed(): boolean {
    const status = this.newsletterStatus();
    return status === 'CONFIRMED' || status === 'PENDING';
  }

  ngOnInit(): void {
    this.newsletterApi
      .getMyStatus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.newsletterStatus.set(res.status);
          this.newsletterLoading.set(false);
        },
        error: () => {
          this.newsletterStatus.set('UNSUBSCRIBED');
          this.newsletterLoading.set(false);
        },
      });
  }

  toggleNewsletter(): void {
    const subscribed = !this.isSubscribed;

    this.newsletterSaving.set(true);
    this.newsletterMessage.set(null);

    this.newsletterApi
      .updatePreference({ subscribed })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.newsletterStatus.set(res.status);
          this.newsletterSaving.set(false);
          this.newsletterMessage.set(
            res.status === 'PENDING'
              ? 'Bitte bestätige die Anmeldung über den Link in deiner E-Mail.'
              : subscribed
                ? 'Du erhältst jetzt unseren Newsletter.'
                : 'Du wurdest vom Newsletter abgemeldet.',
          );
        },
        error: () => {
          this.newsletterSaving.set(false);
          this.newsletterMessage.set(
            'Die Einstellung konnte nicht gespeichert werden. Bitte versuche es erneut.',
          );
        },
      });
  }

  exportData(): void {
    this.exporting.set(true);
    this.exportError.set(null);

    this.accountApi
      .exportData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'tanzmoment-export.json';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          this.exporting.set(false);
        },
        error: () => {
          this.exportError.set(
            'Der Export konnte nicht erstellt werden. Bitte versuche es erneut.',
          );
          this.exporting.set(false);
        },
      });
  }

  openDeleteModal(): void {
    this.deleteError.set(null);
    this.deletePassword.reset('');
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  confirmDelete(): void {
    if (this.deletePassword.invalid) {
      this.deletePassword.markAsTouched();
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);

    this.accountApi
      .deleteAccount({ currentPassword: this.deletePassword.value! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
          this.authState.clearAuth(true);
        },
        error: (err: HttpErrorResponse) => {
          this.deleting.set(false);
          this.deleteError.set(
            err.error?.message ||
              'Das Konto konnte nicht gelöscht werden. Bitte versuche es erneut.',
          );
        },
      });
  }
}

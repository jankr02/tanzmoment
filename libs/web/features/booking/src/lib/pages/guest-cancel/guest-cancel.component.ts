// ============================================================================
// GUEST CANCELLATION PAGE
// ============================================================================
// Route: /buchung/stornieren?token=...
// Allows guests to cancel their booking via a unique token.
// ============================================================================

import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent, ButtonComponent } from '@tanzmoment/shared/ui';
import { BookingApiService } from '@tanzmoment/shared/services';

type CancelState = 'confirming' | 'processing' | 'success' | 'error';

@Component({
  selector: 'app-guest-cancel',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="guest-cancel">
      @if (state() === 'confirming') {
        <div class="guest-cancel__content">
          <app-icon name="alert-circle" size="xl" />
          <h1>Buchung stornieren?</h1>
          <p>Möchtest du deine Buchung wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.</p>
          <div class="guest-cancel__actions">
            <app-button variant="primary" (clicked)="confirmCancel()">Ja, stornieren</app-button>
            <app-button variant="ghost" (clicked)="goToCourses()">Nein, behalten</app-button>
          </div>
        </div>
      }

      @if (state() === 'processing') {
        <div class="guest-cancel__content">
          <div class="guest-cancel__spinner" aria-hidden="true"></div>
          <p>Stornierung wird verarbeitet...</p>
        </div>
      }

      @if (state() === 'success') {
        <div class="guest-cancel__content">
          <app-icon name="check-circle" size="xl" />
          <h1>Buchung storniert</h1>
          <p>Deine Buchung wurde erfolgreich storniert. Falls eine Erstattung fällig ist, erhältst du diese innerhalb von 5–10 Werktagen.</p>
          <app-button variant="primary" (clicked)="goToCourses()">Zurück zu Kursen</app-button>
        </div>
      }

      @if (state() === 'error') {
        <div class="guest-cancel__content">
          <app-icon name="x-circle" size="xl" />
          <h1>Stornierung fehlgeschlagen</h1>
          <p>{{ errorMessage() }}</p>
          <app-button variant="ghost" (clicked)="goToCourses()">Zurück zu Kursen</app-button>
        </div>
      }
    </div>
  `,
  styleUrl: './guest-cancel.component.scss',
})
export class GuestCancelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingApi = inject(BookingApiService);

  readonly state = signal<CancelState>('confirming');
  readonly errorMessage = signal('Der Stornierungslink ist ungültig oder abgelaufen.');

  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage.set('Kein Stornierungstoken vorhanden.');
      this.state.set('error');
    }
  }

  confirmCancel(): void {
    this.state.set('processing');

    this.bookingApi.cancelByToken(this.token).subscribe({
      next: () => this.state.set('success'),
      error: (err: { status: number }) => {
        if (err.status === 404) {
          this.errorMessage.set('Diese Buchung wurde nicht gefunden oder bereits storniert.');
        } else if (err.status === 400) {
          this.errorMessage.set('Diese Buchung kann nicht mehr storniert werden.');
        }
        this.state.set('error');
      },
    });
  }

  goToCourses(): void {
    this.router.navigate(['/courses']);
  }
}

// ============================================================================
// BOOKING FORM COMPONENT
// ============================================================================
// Multi-step booking form supporting both guests and authenticated users.
//
// Steps:
//   1. Select session (SessionSelectorComponent)
//   2. Contact details (guest) or skip (authenticated)
//   3. Confirm + submit
//
// Guest users provide email + name inline.
// Authenticated users see their info pre-filled.
// No login redirect – booking is always accessible.
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ButtonComponent,
  InputComponent,
  SessionSelectorComponent,
  IconComponent,
} from '@tanzmoment/shared/ui';
import { BookingApiService, AuthStateService } from '@tanzmoment/shared/services';
import {
  SessionAvailability,
  CreateBookingApiRequest,
  CreateBookingApiResponse,
  formatPrice,
} from '@tanzmoment/shared/types';

type BookingStep = 'select-session' | 'details' | 'confirm' | 'processing' | 'redirecting' | 'success';

interface GuestFormValue {
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SessionSelectorComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
})
export class BookingFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bookingApi = inject(BookingApiService);
  readonly authState = inject(AuthStateService);
  private readonly platformId = inject(PLATFORM_ID);

  // ──────────────────────────────────────────────────────────────────────────
  // INPUTS
  // ──────────────────────────────────────────────────────────────────────────

  @Input({ required: true }) courseId!: string;
  @Input({ required: true }) courseTitle!: string;
  @Input({ required: true }) priceInCents!: number;
  @Input({ required: true }) sessions: SessionAvailability[] = [];
  @Input() cancellationPolicyName?: string;

  @Output() bookingCompleted = new EventEmitter<CreateBookingApiResponse>();
  @Output() bookingError = new EventEmitter<string>();
  @Output() stripeRedirect = new EventEmitter<string>();

  // ──────────────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────────────

  readonly step = signal<BookingStep>('select-session');
  readonly selectedSession = signal<SessionAvailability | null>(null);
  readonly error = signal<string | null>(null);
  readonly bookingResponse = signal<CreateBookingApiResponse | null>(null);

  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly isProcessing = computed(() =>
    this.step() === 'processing' || this.step() === 'redirecting'
  );
  readonly formattedPrice = computed(() =>
    this.priceInCents === 0 ? 'Kostenlos' : formatPrice(this.priceInCents)
  );
  readonly isFree = computed(() => this.priceInCents === 0);
  readonly isWaitlist = computed(() => {
    const session = this.selectedSession();
    return session ? session.availableSpots === 0 : false;
  });
  readonly ctaText = computed(() => {
    if (this.step() === 'processing') return 'Wird verarbeitet...';
    if (this.step() === 'redirecting') return 'Weiterleitung...';
    if (this.isWaitlist()) return 'Auf Warteliste setzen';
    if (this.isFree()) return 'Jetzt anmelden';
    return 'Jetzt buchen';
  });

  readonly totalSteps = computed(() => this.isAuthenticated() ? 2 : 3);
  readonly currentStepNumber = computed(() => {
    const s = this.step();
    if (s === 'select-session') return 1;
    if (s === 'details') return 2;
    return this.isAuthenticated() ? 2 : 3;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // FORMS
  // ──────────────────────────────────────────────────────────────────────────

  readonly guestForm: FormGroup = this.fb.group({
    guestEmail: ['', [Validators.required, Validators.email]],
    guestFirstName: ['', [Validators.required, Validators.minLength(2)]],
    guestLastName: [''],
    guestPhone: [''],
  });

  readonly confirmForm: FormGroup = this.fb.group({
    notes: ['', [Validators.maxLength(500)]],
    acceptTerms: [false, [Validators.requiredTrue]],
  });

  // ──────────────────────────────────────────────────────────────────────────
  // DATE FORMATTING
  // ──────────────────────────────────────────────────────────────────────────

  formatWeekday(d: string): string {
    return new Date(d).toLocaleDateString('de-DE', { weekday: 'short' });
  }

  formatDay(d: string): string {
    return new Date(d).getDate().toString().padStart(2, '0');
  }

  formatMonth(d: string): string {
    return (new Date(d).getMonth() + 1).toString().padStart(2, '0');
  }

  formatTime(d: string): string {
    return new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STEP NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────

  onSessionSelected(session: SessionAvailability): void {
    this.selectedSession.set(session);
    this.error.set(null);

    if (session.userHasBooking) return;

    this.step.set(this.isAuthenticated() ? 'confirm' : 'details');
  }

  onGuestDetailsNext(): void {
    if (this.guestForm.invalid) {
      this.guestForm.markAllAsTouched();
      return;
    }
    this.step.set('confirm');
  }

  goBack(): void {
    const s = this.step();
    if (s === 'confirm' && !this.isAuthenticated()) {
      this.step.set('details');
    } else if (s === 'confirm' || s === 'details') {
      this.step.set('select-session');
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUBMIT
  // ──────────────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    const session = this.selectedSession();
    if (!session) return;

    this.step.set('processing');
    this.error.set(null);

    const request: CreateBookingApiRequest = {
      courseId: this.courseId,
      sessionId: session.id,
      notes: this.confirmForm.value.notes || undefined,
    };

    if (!this.isAuthenticated()) {
      const guest = this.guestForm.value as GuestFormValue;
      request.guestEmail = guest.guestEmail;
      request.guestFirstName = guest.guestFirstName;
      request.guestLastName = guest.guestLastName || undefined;
      request.guestPhone = guest.guestPhone || undefined;
    }

    this.bookingApi.createBooking(request).subscribe({
      next: (response) => this.handleResponse(response),
      error: (err) => this.handleError(err),
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RESPONSE HANDLING
  // ──────────────────────────────────────────────────────────────────────────

  private handleResponse(response: CreateBookingApiResponse): void {
    if (response.checkoutUrl) {
      this.step.set('redirecting');
      this.stripeRedirect.emit(response.checkoutUrl);
      if (isPlatformBrowser(this.platformId)) {
        window.location.href = response.checkoutUrl;
      }
      return;
    }

    if (response.isWaitlisted) {
      this.bookingCompleted.emit(response);
      return;
    }

    this.bookingResponse.set(response);
    this.step.set('success');
  }

  onSuccessClose(): void {
    const response = this.bookingResponse();
    if (response) {
      this.bookingCompleted.emit(response);
    }
  }

  private handleError(err: { status: number; error?: { message?: string } }): void {
    this.step.set('confirm');
    const status = err.status;
    const message = err.error?.message;

    if (status === 409) {
      this.error.set(
        this.isAuthenticated()
          ? 'Du hast diesen Termin bereits gebucht.'
          : 'Es existiert bereits eine Buchung mit dieser E-Mail-Adresse für diesen Termin.'
      );
    } else if (status === 400 && message?.includes('waitlist')) {
      this.error.set(
        'Dieser Kurs ist ausgebucht. Erstelle ein Konto, um dich auf die Warteliste setzen zu lassen.'
      );
    } else if (status === 400 && message?.includes('full')) {
      this.error.set('Dieser Termin ist leider inzwischen ausgebucht.');
    } else {
      this.error.set('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }

    this.bookingError.emit(this.error()!);
  }
}

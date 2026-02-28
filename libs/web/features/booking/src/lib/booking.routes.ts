// ============================================================================
// BOOKING ROUTES
// ============================================================================
// No auth guards on payment redirect routes (guests need access).
// ============================================================================

import { Routes } from '@angular/router';

export const bookingRoutes: Routes = [
  {
    path: 'buchung',
    children: [
      {
        path: 'bezahlung-erfolgreich',
        loadComponent: () =>
          import('./pages/booking-redirect/booking-redirect.component').then(
            (m) => m.BookingRedirectComponent
          ),
      },
      {
        path: 'bezahlung-abgebrochen',
        loadComponent: () =>
          import('./pages/booking-redirect/booking-redirect.component').then(
            (m) => m.BookingRedirectComponent
          ),
      },
      {
        path: 'warteliste',
        loadComponent: () =>
          import('./pages/waitlist-confirmation/waitlist-confirmation.component').then(
            (m) => m.WaitlistConfirmationComponent
          ),
      },
      {
        path: 'stornieren',
        loadComponent: () =>
          import('./pages/guest-cancel/guest-cancel.component').then(
            (m) => m.GuestCancelComponent
          ),
      },
    ],
  },
];

import { Routes } from '@angular/router';

export const myBookingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/my-bookings-list/my-bookings-list.component').then(
        (m) => m.MyBookingsListComponent,
      ),
    title: 'Meine Buchungen | Tanzmoment',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/my-booking-detail/my-booking-detail.component').then(
        (m) => m.MyBookingDetailComponent,
      ),
    title: 'Buchung | Tanzmoment',
  },
];

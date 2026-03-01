import { Route } from '@angular/router';
import { BookingListComponent } from './components/booking-list/booking-list.component';
import { BookingDetailComponent } from './components/booking-detail/booking-detail.component';

export const adminBookingsRoutes: Route[] = [
  { path: '', component: BookingListComponent },
  { path: ':id', component: BookingDetailComponent },
];

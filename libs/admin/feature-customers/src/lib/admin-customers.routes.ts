import { Route } from '@angular/router';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerDetailComponent } from './components/customer-detail/customer-detail.component';

export const adminCustomersRoutes: Route[] = [
  { path: '', component: CustomerListComponent },
  { path: ':id', component: CustomerDetailComponent },
];

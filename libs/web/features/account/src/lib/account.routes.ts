import { Routes } from '@angular/router';
import { myBookingsRoutes } from '@tanzmoment/web/features/my-bookings';
import { AccountShellComponent } from './components/account-shell/account-shell.component';

export const accountRoutes: Routes = [
  {
    path: '',
    component: AccountShellComponent,
    children: [
      { path: '', redirectTo: 'uebersicht', pathMatch: 'full' },
      {
        path: 'uebersicht',
        loadComponent: () =>
          import('./pages/account-overview/account-overview.component').then(
            (m) => m.AccountOverviewComponent,
          ),
        title: 'Mein Bereich | Tanzmoment',
      },
      {
        path: 'buchungen',
        children: myBookingsRoutes,
      },
      {
        path: 'sicherheit',
        loadComponent: () =>
          import('./pages/account-security/account-security.component').then(
            (m) => m.AccountSecurityComponent,
          ),
        title: 'Sicherheit | Tanzmoment',
      },
      {
        path: 'kommunikation',
        loadComponent: () =>
          import('./pages/account-communication/account-communication.component').then(
            (m) => m.AccountCommunicationComponent,
          ),
        title: 'Kommunikation | Tanzmoment',
      },
    ],
  },
];

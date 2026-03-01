import { Route } from '@angular/router';
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';

export const adminRoutes: Route[] = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@tanzmoment/admin/feature-dashboard').then(
            (m) => m.AdminDashboardComponent
          ),
        title: 'Dashboard | Admin | Tanzmoment',
      },
      {
        path: 'courses',
        loadChildren: () =>
          import('@tanzmoment/admin/feature-courses').then(
            (m) => m.adminCoursesRoutes
          ),
        title: 'Kurse | Admin | Tanzmoment',
      },
      {
        path: 'buchungen',
        loadChildren: () =>
          import('@tanzmoment/admin/feature-bookings').then(
            (m) => m.adminBookingsRoutes
          ),
        title: 'Buchungen | Admin | Tanzmoment',
      },
      {
        path: 'kalender',
        loadChildren: () =>
          import('@tanzmoment/admin/feature-calendar').then(
            (m) => m.adminCalendarRoutes
          ),
        title: 'Kalender | Admin | Tanzmoment',
      },
    ],
  },
];

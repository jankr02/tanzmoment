import { Route } from '@angular/router';
import { bookingRoutes } from '@tanzmoment/web/features/booking';
import { adminAuthGuard } from '@tanzmoment/admin/data-access';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@tanzmoment/web/features/landing').then(
        (m) => m.LandingPageComponent
      ),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('@tanzmoment/web/features/courses').then(
        (m) => m.CourseOverviewComponent
      ),
  },
  {
    path: 'courses/:slug',
    loadComponent: () =>
      import('@tanzmoment/web/features/courses').then(
        (m) => m.CourseDetailComponent
      ),
    title: 'Kursdetail | Tanzmoment',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('@tanzmoment/web/features/about').then(
        (m) => m.AboutPageComponent
      ),
  },
  {
    path: 'kontakt',
    loadComponent: () =>
      import('@tanzmoment/web/features/contact').then(
        (m) => m.ContactPageComponent
      ),
    title: 'Kontakt | Tanzmoment',
  },
  // Target Group Pages
  {
    path: 'fuer-muetter',
    loadComponent: () =>
      import('@tanzmoment/web/features/target-groups').then(
        (m) => m.MothersPageComponent
      ),
  },
  {
    path: 'fuer-kinder',
    loadComponent: () =>
      import('@tanzmoment/web/features/target-groups').then(
        (m) => m.KidsPageComponent
      ),
  },
  {
    path: 'fuer-alle',
    loadComponent: () =>
      import('@tanzmoment/web/features/target-groups').then(
        (m) => m.AccessiblePageComponent
      ),
    title: 'Tanz für alle | Tanzmoment',
  },
  {
    path: 'ausdruckstanz',
    loadComponent: () =>
      import('@tanzmoment/web/features/target-groups').then(
        (m) => m.ExpressivePageComponent
      ),
  },
  // Booking Routes (payment redirect, guest cancellation, waitlist)
  ...bookingRoutes,
  // Admin Panel (lazy-loaded, guarded)
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadChildren: () =>
      import('@tanzmoment/admin/feature-shell').then((m) => m.adminRoutes),
    title: 'Admin | Tanzmoment',
  },
];

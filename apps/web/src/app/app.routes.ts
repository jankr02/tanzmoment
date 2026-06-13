import { Route } from '@angular/router';
import { bookingRoutes } from '@tanzmoment/web/features/booking';
import { legalRoutes } from '@tanzmoment/web/features/legal';
import { adminAuthGuard } from '@tanzmoment/admin/data-access';
import { authGuard, guestGuard } from '@tanzmoment/shared/services';

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
  // Auth routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@tanzmoment/web/features/auth').then((m) => m.LoginPageComponent),
        canActivate: [guestGuard],
        title: 'Anmelden | Tanzmoment',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@tanzmoment/web/features/auth').then((m) => m.RegisterPageComponent),
        canActivate: [guestGuard],
        title: 'Registrieren | Tanzmoment',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('@tanzmoment/web/features/auth').then((m) => m.ForgotPasswordPageComponent),
        canActivate: [guestGuard],
        title: 'Passwort vergessen | Tanzmoment',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('@tanzmoment/web/features/auth').then((m) => m.ResetPasswordPageComponent),
        title: 'Passwort zurücksetzen | Tanzmoment',
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('@tanzmoment/web/features/auth').then((m) => m.VerifyEmailPageComponent),
        title: 'E-Mail bestätigen | Tanzmoment',
      },
    ],
  },
  // News
  {
    path: 'news',
    loadChildren: () =>
      import('@tanzmoment/web/features/news').then((m) => m.newsRoutes),
  },
  // Newsletter (confirm + unsubscribe pages)
  {
    path: 'newsletter',
    loadChildren: () =>
      import('@tanzmoment/web/features/newsletter').then(
        (m) => m.newsletterRoutes,
      ),
  },
  // Account / Profile (authenticated user area, includes My Bookings)
  {
    path: 'mein-bereich',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@tanzmoment/web/features/account').then((m) => m.accountRoutes),
  },
  // Legacy My Bookings URLs – redirect to the account area
  {
    path: 'meine-buchungen',
    pathMatch: 'full',
    redirectTo: 'mein-bereich/buchungen',
  },
  {
    path: 'meine-buchungen/:id',
    redirectTo: 'mein-bereich/buchungen/:id',
  },
  // Booking Routes (payment redirect, guest cancellation, waitlist)
  ...bookingRoutes,
  // Legal Pages (Impressum, Datenschutz, AGB)
  ...legalRoutes,
  // Admin Panel (lazy-loaded, guarded)
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadChildren: () =>
      import('@tanzmoment/admin/feature-shell').then((m) => m.adminRoutes),
    title: 'Admin | Tanzmoment',
  },
];

import { Routes } from '@angular/router';

export const newsletterRoutes: Routes = [
  {
    path: 'bestaetigt',
    loadComponent: () =>
      import('./pages/newsletter-confirm-page.component').then(
        (m) => m.NewsletterConfirmPageComponent,
      ),
    title: 'Newsletter bestätigt | Tanzmoment',
  },
  {
    path: 'abgemeldet',
    loadComponent: () =>
      import('./pages/newsletter-unsubscribe-page.component').then(
        (m) => m.NewsletterUnsubscribePageComponent,
      ),
    title: 'Newsletter abgemeldet | Tanzmoment',
  },
];

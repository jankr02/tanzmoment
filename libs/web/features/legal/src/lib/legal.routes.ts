import { Routes } from '@angular/router';

export const legalRoutes: Routes = [
  {
    path: 'impressum',
    loadComponent: () =>
      import('./pages/imprint-page/imprint-page.component').then(
        (m) => m.ImprintPageComponent,
      ),
    title: 'Impressum | Tanzmoment',
  },
  {
    path: 'datenschutz',
    loadComponent: () =>
      import('./pages/privacy-page/privacy-page.component').then(
        (m) => m.PrivacyPageComponent,
      ),
    title: 'Datenschutz | Tanzmoment',
  },
  {
    path: 'agb',
    loadComponent: () =>
      import('./pages/terms-page/terms-page.component').then(
        (m) => m.TermsPageComponent,
      ),
    title: 'AGB | Tanzmoment',
  },
];

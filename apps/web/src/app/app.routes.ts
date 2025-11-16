import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@tanzmoment/web/features/landing').then(
        (m) => m.LandingPageComponent
      ),
  },
  // Add more routes here as needed
];

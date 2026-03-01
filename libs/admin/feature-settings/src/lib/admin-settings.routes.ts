import { Route } from '@angular/router';
import { SettingsShellComponent } from './components/settings-shell/settings-shell.component';

export const adminSettingsRoutes: Route[] = [
  {
    path: '',
    component: SettingsShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'profil',
        pathMatch: 'full',
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./components/tab-profile/tab-profile.component').then(
            (m) => m.TabProfileComponent
          ),
        title: 'Studio-Profil | Einstellungen | Admin',
      },
      {
        path: 'standorte',
        loadComponent: () =>
          import('./components/tab-locations/tab-locations.component').then(
            (m) => m.TabLocationsComponent
          ),
        title: 'Standorte | Einstellungen | Admin',
      },
      {
        path: 'konto',
        loadComponent: () =>
          import('./components/tab-account/tab-account.component').then(
            (m) => m.TabAccountComponent
          ),
        title: 'Konto | Einstellungen | Admin',
      },
    ],
  },
];

import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/account-shell/account-shell.component').then(
        (m) => m.AccountShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'profil', pathMatch: 'full' },
      {
        path: 'profil',
        loadComponent: () =>
          import('./pages/profile-tab/profile-tab.component').then(
            (m) => m.ProfileTabComponent,
          ),
        title: 'Profil | Tanzmoment',
      },
      {
        path: 'passwort',
        loadComponent: () =>
          import('./pages/password-tab/password-tab.component').then(
            (m) => m.PasswordTabComponent,
          ),
        title: 'Passwort | Tanzmoment',
      },
      {
        path: 'benachrichtigungen',
        loadComponent: () =>
          import('./pages/notifications-tab/notifications-tab.component').then(
            (m) => m.NotificationsTabComponent,
          ),
        title: 'Benachrichtigungen | Tanzmoment',
      },
      {
        path: 'verbundene-konten',
        loadComponent: () =>
          import(
            './pages/connected-accounts-tab/connected-accounts-tab.component'
          ).then((m) => m.ConnectedAccountsTabComponent),
        title: 'Verbundene Konten | Tanzmoment',
      },
      {
        path: 'loeschen',
        loadComponent: () =>
          import('./pages/delete-tab/delete-tab.component').then(
            (m) => m.DeleteTabComponent,
          ),
        title: 'Konto löschen | Tanzmoment',
      },
    ],
  },
];

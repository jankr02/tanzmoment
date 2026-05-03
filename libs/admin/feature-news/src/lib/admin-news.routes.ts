import { Routes } from '@angular/router';

export const adminNewsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/news-list/news-list.component').then(
        (m) => m.NewsListComponent,
      ),
    title: 'News | Admin | Tanzmoment',
  },
  {
    path: 'neu',
    loadComponent: () =>
      import('./components/news-form/news-form.component').then(
        (m) => m.NewsFormComponent,
      ),
    title: 'Neuer Artikel | Admin | Tanzmoment',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/news-form/news-form.component').then(
        (m) => m.NewsFormComponent,
      ),
    title: 'Artikel bearbeiten | Admin | Tanzmoment',
  },
];

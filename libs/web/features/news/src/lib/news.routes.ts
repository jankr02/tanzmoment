import { Routes } from '@angular/router';

export const newsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/news-list-page/news-list-page.component').then(
        (m) => m.NewsListPageComponent,
      ),
    title: 'News | Tanzmoment',
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./pages/news-detail-page/news-detail-page.component').then(
        (m) => m.NewsDetailPageComponent,
      ),
  },
];

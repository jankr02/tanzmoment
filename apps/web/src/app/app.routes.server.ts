import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'courses',
    renderMode: RenderMode.Server,
  },
  {
    path: 'courses/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'news',
    renderMode: RenderMode.Server,
  },
  {
    path: 'news/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'newsletter/bestaetigt',
    renderMode: RenderMode.Client,
  },
  {
    path: 'newsletter/abgemeldet',
    renderMode: RenderMode.Client,
  },
  {
    path: 'mein-bereich',
    renderMode: RenderMode.Client,
  },
  {
    path: 'mein-bereich/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'meine-buchungen',
    renderMode: RenderMode.Client,
  },
  {
    path: 'meine-buchungen/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

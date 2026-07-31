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
    path: 'kursplan',
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
  // The landing page opens with a one-time intro splash whose visibility depends
  // on localStorage (client-only). Prerendering it bakes in the post-splash state
  // (header + skeleton loaders), which then flashes before the client shows the
  // splash. Render the landing route on the client so the splash is the first
  // paint. Other catch-all routes have no such client-state dependency and stay
  // prerendered below.
  {
    path: '',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

import { RenderMode, ServerRoute } from '@angular/ssr';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

async function getCourseSlugs(): Promise<{ slug: string }[]> {
  const slugs: string[] = [];
  let page = 1;

  try {
    while (true) {
      const res = await fetch(`${API_URL}/api/courses?page=${page}&limit=50`);
      if (!res.ok) break;

      const json = (await res.json()) as {
        data?: Array<{ slug?: string }>;
        meta?: { totalPages?: number };
      };

      for (const item of json.data ?? []) {
        if (item.slug) slugs.push(item.slug);
      }

      const totalPages = json.meta?.totalPages ?? 1;
      if (page >= totalPages) break;
      page++;
    }
  } catch (error) {
    console.warn(
      `[prerender] Could not fetch course slugs from ${API_URL}. Course detail pages will be server-rendered on demand.`,
      error,
    );
    return [];
  }

  return slugs.map((slug) => ({ slug }));
}

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'courses/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: getCourseSlugs,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

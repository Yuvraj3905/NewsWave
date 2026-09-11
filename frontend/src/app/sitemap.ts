import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

export const revalidate = 3600;

const STATIC_PATHS: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[] = [
  { path: '', changeFrequency: 'hourly', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/advertise', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/subscribe', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://newswavetv.com'
  ).replace(/\/$/, '');
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  // ponytail: backend caps limit at 100, so page through. Hard stop at MAX_URLS
  // keeps one sitemap under the 50k spec limit; split into a sitemap index past that.
  const PAGE = 100;
  const MAX_URLS = 5000;
  const articleEntries: MetadataRoute.Sitemap = [];
  try {
    for (let offset = 0; offset < MAX_URLS; offset += PAGE) {
      const res = await api.listArticles({ limit: PAGE, offset });
      articleEntries.push(
        ...res.items.map((a) => ({
          url: `${base}/article/${a.slug}`,
          lastModified: new Date(a.updated_at || a.created_at),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        })),
      );
      if (res.items.length < PAGE || articleEntries.length >= res.total) break;
    }
  } catch {
    // partial list beats no list
  }

  return [...staticEntries, ...articleEntries];
}

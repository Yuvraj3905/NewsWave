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
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await api.listArticles({ limit: 1000 });
    articleEntries = res.items.map((a) => ({
      url: `${base}/article/${a.slug}`,
      lastModified: new Date(a.updated_at || a.created_at),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch {
    articleEntries = [];
  }

  return [...staticEntries, ...articleEntries];
}

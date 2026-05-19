'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Category } from '@/lib/types';
import { api } from '@/lib/api';
import { useNewsFilter } from './LocationContext';

const FALLBACK = [
  'National',
  'International',
  'Politics',
  'Business',
  'Sports',
  'Career/Job',
  'Tech',
  'Health',
  'Automobile',
  'Crime',
];

const HIDDEN_SLUGS = new Set(['entertainment']);

const EXTRA = [
  { id: 'static-national', name: 'National', slug: 'national' },
  { id: 'static-international', name: 'International', slug: 'international' },
  { id: 'static-career-job', name: 'Career/Job', slug: 'career-job' },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function FooterCategoryLinks() {
  const [cats, setCats] = useState<Category[]>([]);
  const { setCategory } = useNewsFilter();

  useEffect(() => {
    api
      .listCategories()
      .then((rows) => {
        const filtered = rows
          .filter((c) => !HIDDEN_SLUGS.has(c.slug.toLowerCase()))
          .map((c) =>
            c.slug.toLowerCase() === 'career-job' ||
            c.name.toLowerCase() === 'career/job'
              ? { ...c, name: 'Career/Job', slug: 'career-job' }
              : c,
          );
        const existing = new Set(filtered.map((c) => c.slug.toLowerCase()));
        const merged = [
          ...filtered,
          ...EXTRA.filter((e) => !existing.has(e.slug)),
        ];
        setCats(merged);
      })
      .catch(() =>
        setCats(
          FALLBACK.map((n, i) => ({
            id: `fb-${i}`,
            name: n,
            slug: slugify(n),
          })),
        ),
      );
  }, []);

  const list =
    cats.length > 0
      ? cats
      : FALLBACK.map((n, i) => ({ id: `f${i}`, name: n, slug: slugify(n) }));

  return (
    <ul className="text-sm grid grid-cols-2 gap-2 text-navy-200">
      {list.slice(0, 9).map((c) => (
        <li key={c.id}>
          <Link
            href="/"
            onClick={() => {
              setCategory(c.slug);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="hover:text-white"
          >
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

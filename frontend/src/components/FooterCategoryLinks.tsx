'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Category } from '@/lib/types';
import { api } from '@/lib/api';
import { useNewsFilter } from './LocationContext';

const FALLBACK = [
  'Politics',
  'Business',
  'Sports',
  'Entertainment',
  'Tech',
  'Health',
  'Automobile',
  'Crime',
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function FooterCategoryLinks() {
  const [cats, setCats] = useState<Category[]>([]);
  const { setCategory } = useNewsFilter();

  useEffect(() => {
    api
      .listCategories()
      .then(setCats)
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

  const list = cats.length > 0 ? cats : FALLBACK.map((n, i) => ({ id: `f${i}`, name: n, slug: slugify(n) }));

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

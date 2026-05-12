'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/lib/types';
import { api } from '@/lib/api';
import { useNewsFilter } from './LocationContext';

const ICONS: Record<string, string> = {
  politics: 'M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8',
  business: 'M3 21h18M5 21V10h14v11M9 7V3h6v4',
  sports: 'M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07',
  entertainment: 'M2 7h20v10H2zM6 7v10M18 7v10',
  tech: 'M5 4h14v12H5zM2 20h20M9 16v4M15 16v4',
  health: 'M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z',
  automobile: 'M3 12l2-6h14l2 6v5h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3v-5z',
  world: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a16 16 0 0 1 0 20',
  crime: 'M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z',
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function iconFor(name: string): string {
  const k = name.toLowerCase();
  return ICONS[k] || ICONS.world;
}

export function ExploreMore() {
  const [cats, setCats] = useState<Category[]>([]);
  const { setCategory } = useNewsFilter();

  useEffect(() => {
    api
      .listCategories()
      .then(setCats)
      .catch(() =>
        setCats(
          ['Politics', 'Business', 'Sports', 'Entertainment', 'Tech', 'Health', 'World', 'Crime'].map(
            (n, i) => ({ id: `fb-${i}`, name: n, slug: slugify(n) }),
          ),
        ),
      );
  }, []);

  return (
    <section className="bg-white border border-navy-100 rounded-lg shadow-card p-4 sm:p-5">
      <h3 className="font-bold text-navy-900 uppercase text-sm tracking-wider mb-3">
        Explore More
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {cats.slice(0, 8).map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCategory(c.slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-navy-100 hover:border-brand-500 hover:bg-brand-50 text-navy-700 text-sm font-semibold transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-500 shrink-0">
              <path d={iconFor(c.name)} />
            </svg>
            <span className="truncate">{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

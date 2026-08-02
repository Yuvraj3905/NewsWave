'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Article } from '@/lib/types';
import { api } from '@/lib/api';
import { useLanguage } from './LanguageContext';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&auto=format&fit=crop&q=60';

export function TrendingNow() {
  const { language } = useLanguage();
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    api
      .listArticles({ limit: 5, lang: language })
      .then((res) => setItems(res.items.slice(0, 5)))
      .catch(() => setItems([]));
  }, [language]);

  if (items.length === 0) return null;

  return (
    <section className="bg-white border border-navy-100 rounded-lg shadow-card overflow-hidden dark:bg-navy-800 dark:border-navy-700">
      <div className="px-4 py-3 border-b border-navy-100 flex items-center gap-2 dark:border-navy-700">
        <span className="text-brand-500 text-lg">&#128293;</span>
        <h3 className="font-bold text-navy-900 uppercase text-sm tracking-wider dark:text-white">
          Trending Now
        </h3>
      </div>
      <ul className="divide-y divide-navy-100 dark:divide-navy-700">
        {items.map((a, idx) => (
          <li key={a.id} className="hover:bg-surface-50 transition dark:hover:bg-navy-700">
            <Link
              href={`/article/${a.slug}`}
              className="flex items-center gap-3 p-3 group"
            >
              <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-surface-100 dark:bg-navy-700">
                <Image
                  src={a.image_url || FALLBACK_IMG}
                  alt=""
                  fill
                  sizes="48px"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <p className="text-[13px] font-semibold text-navy-900 leading-snug line-clamp-2 flex-1 group-hover:text-brand-600 dark:text-navy-50 dark:group-hover:text-brand-300">
                {a.title}
              </p>
              <span className={`text-sm font-bold w-5 text-center shrink-0 ${idx < 3 ? 'text-brand-500' : 'text-navy-400'}`}>
                {idx + 1}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

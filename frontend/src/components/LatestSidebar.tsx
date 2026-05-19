'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Article } from '@/lib/types';
import { api } from '@/lib/api';
import { formatTimeShort } from '@/lib/format';
import { useLanguage } from './LanguageContext';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&auto=format&fit=crop&q=60';

export function LatestSidebar() {
  const { language } = useLanguage();
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .latestHeadlines(language)
      .then((data) => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [language]);

  return (
    <section className="bg-white border border-navy-100 rounded-lg shadow-card overflow-hidden dark:bg-navy-800 dark:border-navy-700">
        <div className="px-4 py-3 border-b border-navy-100 flex items-center justify-between dark:border-navy-700">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-500 rounded-sm" />
            <h3 className="font-bold text-navy-900 uppercase text-sm tracking-wider dark:text-white">
              Latest Headlines
            </h3>
          </div>
          <Link
            href="/"
            className="text-xs text-brand-500 hover:text-brand-600 font-semibold dark:text-brand-300 dark:hover:text-brand-200"
          >
            View All
          </Link>
        </div>
        <ol className="divide-y divide-navy-100 dark:divide-navy-700">
          {loading && (
            <li className="p-4 text-sm text-navy-500 dark:text-navy-300">Loading headlines...</li>
          )}
          {!loading && items.length === 0 && (
            <li className="p-4 text-sm text-navy-500 dark:text-navy-300">No headlines yet.</li>
          )}
          {items.map((a, idx) => (
            <li key={a.id} className="p-3 hover:bg-surface-50 transition group dark:hover:bg-navy-700">
              <Link
                href={`/article/${a.slug}`}
                className="flex items-start gap-3"
              >
                <span className="w-6 h-6 grid place-items-center rounded-full bg-brand-500 text-white text-[11px] font-bold shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <img
                  src={a.image_url || FALLBACK_IMG}
                  alt=""
                  loading="lazy"
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-navy-900 leading-snug line-clamp-2 group-hover:text-brand-600 dark:text-navy-50 dark:group-hover:text-brand-300">
                    {a.title}
                  </p>
                  <p className="text-[11px] text-navy-500 mt-1 dark:text-navy-300">
                    {formatTimeShort(a.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
    </section>
  );
}

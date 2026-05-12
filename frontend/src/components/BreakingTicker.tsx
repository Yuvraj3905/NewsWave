'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Article } from '@/lib/types';
import { useLanguage } from './LanguageContext';

export function BreakingTicker() {
  const { language } = useLanguage();
  const [items, setItems] = useState<Article[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api
      .latestHeadlines(language)
      .then((data) => setItems((data || []).slice(0, 6)))
      .catch(() => setItems([]));
  }, [language]);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const visible = items[idx];
  const next = items[(idx + 1) % items.length];

  return (
    <div className="bg-white border-y border-navy-100">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="bg-brand-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded shrink-0">
          Breaking News
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-6 text-sm font-medium text-navy-900 whitespace-nowrap overflow-hidden">
            <Link
              href={`/article/${visible.slug}`}
              className="hover:text-brand-600 truncate"
            >
              {visible.title}
            </Link>
            <span className="text-brand-500 hidden md:inline">•</span>
            <Link
              href={`/article/${next.slug}`}
              className="hover:text-brand-600 truncate hidden md:block"
            >
              {next.title}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
            aria-label="Previous"
            className="w-7 h-7 grid place-items-center rounded border border-navy-200 hover:bg-surface-100 text-navy-700"
          >
            &lsaquo;
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % items.length)}
            aria-label="Next"
            className="w-7 h-7 grid place-items-center rounded border border-navy-200 hover:bg-surface-100 text-navy-700"
          >
            &rsaquo;
          </button>
        </div>
      </div>
    </div>
  );
}

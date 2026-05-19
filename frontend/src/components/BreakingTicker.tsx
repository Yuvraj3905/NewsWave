'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Article } from '@/lib/types';
import { useLanguage } from './LanguageContext';

export function BreakingTicker() {
  const { language } = useLanguage();
  const [items, setItems] = useState<Article[]>([]);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    api
      .latestHeadlines(language)
      .then((data) => setItems((data || []).slice(0, 10)))
      .catch(() => setItems([]));
  }, [language]);

  useEffect(() => {
    if (!trackRef.current) return;
    const w = trackRef.current.scrollWidth / 2;
    const seconds = Math.max(20, Math.min(90, Math.round(w / 60)));
    setDuration(seconds);
  }, [items]);

  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div className="bg-white border-y border-navy-100 dark:bg-navy-900 dark:border-navy-700">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-brand-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded shrink-0">
          <span className="relative inline-flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-white opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-white" />
          </span>
          LIVE
        </span>
        <span className="hidden sm:inline bg-navy-900 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded shrink-0 dark:bg-white dark:text-navy-900">
          Breaking
        </span>
        <div
          className="flex-1 overflow-hidden relative group cursor-pointer"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onClick={() => setPaused((p) => !p)}
          role="region"
          aria-label="Breaking news ticker, click to pause"
        >
          <div
            ref={trackRef}
            className="flex items-center gap-10 whitespace-nowrap will-change-transform nw-ticker-track"
            style={{
              animation: `nw-ticker ${duration}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {loop.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={`/article/${a.slug}`}
                className="text-sm font-medium text-navy-900 hover:text-brand-600 inline-flex items-center gap-3 dark:text-navy-50 dark:hover:text-brand-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>{a.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes nw-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

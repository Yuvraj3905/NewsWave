'use client';

import { useEffect, useState } from 'react';
import { useNewsFilter } from './LocationContext';
import { useLanguage } from './LanguageContext';
import { api } from '@/lib/api';
import { Article } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

export function MainFeed() {
  const { location, category, search } = useNewsFilter();
  const { language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      api
        .listArticles({
          location,
          category,
          q: search || undefined,
          limit: 20,
          lang: language,
        })
        .then((res) => setArticles(res.items))
        .catch((err) => setError(err.message || 'Failed to load articles'))
        .finally(() => setLoading(false));
    }, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [location, category, search, language]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-navy-100 rounded-lg overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-surface-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-surface-100 rounded w-3/4" />
              <div className="h-3 bg-surface-100 rounded w-full" />
              <div className="h-3 bg-surface-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-brand-500/40 rounded-lg p-6 text-sm text-brand-600">
        {error}
        <p className="text-navy-500 mt-1">Make sure the backend API is running.</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white border border-navy-100 rounded-lg p-6 text-sm text-navy-500">
        No news found for the selected filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
      {articles.map((a, idx) => (
        <ArticleCard
          key={a.id}
          article={a}
          variant={idx === 0 ? 'feature' : 'default'}
        />
      ))}
    </div>
  );
}

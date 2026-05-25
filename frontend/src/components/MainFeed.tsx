'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNewsFilter } from './LocationContext';
import { useLanguage } from './LanguageContext';
import { api } from '@/lib/api';
import { Article } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

const PAGE_SIZE = 12;

export function MainFeed() {
  const { location, category, search } = useNewsFilter();
  const { language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // initial + reset on filter change
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setOffset(0);

    const t = setTimeout(() => {
      api
        .listArticles({
          location,
          category,
          q: search || undefined,
          limit: PAGE_SIZE,
          offset: 0,
          lang: language,
        })
        .then((res) => {
          if (ctrl.signal.aborted) return;
          setArticles(res.items);
          setTotal(res.total);
          setOffset(res.items.length);
        })
        .catch((err) => {
          if (ctrl.signal.aborted) return;
          setError(err?.message || 'Failed to load articles');
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setLoading(false);
        });
    }, search ? 250 : 0);

    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [location, category, search, language]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return;
    if (articles.length >= total) return;
    setLoadingMore(true);
    try {
      const res = await api.listArticles({
        location,
        category,
        q: search || undefined,
        limit: PAGE_SIZE,
        offset,
        lang: language,
      });
      setArticles((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        const next = res.items.filter((a) => !seen.has(a.id));
        return [...prev, ...next];
      });
      setOffset((prev) => prev + res.items.length);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  }, [
    articles.length,
    category,
    language,
    loading,
    loadingMore,
    location,
    offset,
    search,
    total,
  ]);

  // IntersectionObserver triggers loadMore when sentinel near viewport
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '300px 0px' },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [loadMore]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-navy-100 rounded-lg overflow-hidden animate-pulse dark:bg-navy-800 dark:border-navy-700"
          >
            <div className="aspect-[4/3] bg-surface-100 dark:bg-navy-700" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-surface-100 rounded w-3/4 dark:bg-navy-700" />
              <div className="h-3 bg-surface-100 rounded w-full dark:bg-navy-700" />
              <div className="h-3 bg-surface-100 rounded w-2/3 dark:bg-navy-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="bg-white border border-brand-500/40 rounded-lg p-6 text-sm text-brand-600 dark:bg-navy-800">
        {error}
        <p className="text-navy-500 mt-1 dark:text-navy-300">
          Make sure the backend API is running.
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white border border-navy-100 rounded-lg p-6 text-sm text-navy-500 dark:bg-navy-800 dark:border-navy-700 dark:text-navy-300">
        No news found for the selected filters.
      </div>
    );
  }

  const hasMore = articles.length < total;

  return (
    <div>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {articles.map((a, idx) => (
          <ArticleCard
            key={a.id}
            article={a}
            variant={idx === 0 ? 'feature' : 'default'}
            priority={idx === 0}
          />
        ))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4 sm:mt-6"
          aria-hidden="true"
        >
          {loadingMore &&
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-navy-100 rounded-lg overflow-hidden animate-pulse dark:bg-navy-800 dark:border-navy-700"
              >
                <div className="aspect-[4/3] bg-surface-100 dark:bg-navy-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface-100 rounded w-3/4 dark:bg-navy-700" />
                  <div className="h-3 bg-surface-100 rounded w-full dark:bg-navy-700" />
                </div>
              </div>
            ))}
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <p className="text-center text-xs text-navy-500 mt-6 dark:text-navy-300">
          You&apos;re all caught up — {articles.length} of {total} stories.
        </p>
      )}

      {error && articles.length > 0 && (
        <p className="text-center text-xs text-brand-600 mt-3">{error}</p>
      )}
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { getToken, useRequireAuth } from '@/components/AdminAuth';
import { api } from '@/lib/api';

const AnalyticsCharts = dynamic(
  () =>
    import('@/components/AnalyticsCharts').then((m) => m.AnalyticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg border border-navy-100 shadow-card p-6 text-sm text-navy-500">
        Loading analytics...
      </div>
    ),
  },
);

interface Stats {
  total_articles: number;
  published_articles: number;
  total_views: number;
}

export default function DashboardPage() {
  const ready = useRequireAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [subCount, setSubCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const token = getToken();
    if (!token) return;
    Promise.all([api.adminStats(token), api.adminSubscriberCount(token)])
      .then(([s, c]) => {
        setStats(s);
        setSubCount(c.count);
      })
      .catch((err) => setError(err?.message || 'Failed to load stats'));
  }, [ready]);

  if (!ready) return null;

  return (
    <AdminShell>
      <h1 className="text-xl sm:text-2xl font-extrabold text-brand-900 mb-4 sm:mb-6">
        Overview
      </h1>

      {error && (
        <div className="bg-white border border-accent-500/40 rounded p-4 text-sm text-accent-600 mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Articles" value={stats?.total_articles ?? '-'} />
        <StatCard
          label="Published Articles"
          value={stats?.published_articles ?? '-'}
        />
        <StatCard label="Total Views" value={stats?.total_views ?? '-'} />
        <StatCard label="Active Subscribers" value={subCount ?? '-'} />
      </div>

      <div className="mt-6 sm:mt-8">
        <h2 className="font-bold text-brand-900 mb-4 text-lg">Analytics</h2>
        <AnalyticsCharts />
      </div>

      <div className="mt-6 sm:mt-8 bg-white rounded-lg border border-ink-300/40 shadow-card p-4 sm:p-6">
        <h2 className="font-bold text-brand-900 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3 text-sm">
          <Link
            href="/admin/articles/new"
            className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 rounded font-semibold"
          >
            Publish New Article
          </Link>
          <Link
            href="/admin/articles"
            className="bg-brand-700 hover:bg-brand-800 text-white px-3 py-1.5 rounded font-semibold"
          >
            Manage Articles
          </Link>
          <Link
            href="/admin/subscribers"
            className="bg-white border border-ink-300 text-ink-700 hover:bg-surface-100 px-3 py-1.5 rounded font-semibold"
          >
            View Subscribers
          </Link>
        </div>
      </div>

      <div className="mt-6 text-xs text-ink-500">
        For traffic source and device breakdowns, view the connected Google
        Analytics 4 property.
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white rounded-lg border border-ink-300/40 shadow-card p-3 sm:p-5">
      <div className="text-[10px] sm:text-xs uppercase tracking-widest text-ink-500">
        {label}
      </div>
      <div className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-900">
        {value}
      </div>
    </div>
  );
}

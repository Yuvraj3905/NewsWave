'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { getToken, useRequireAuth } from '@/components/AdminAuth';
import { api } from '@/lib/api';
import { Article } from '@/lib/types';
import { formatIST } from '@/lib/format';

export default function AdminArticlesPage() {
  const ready = useRequireAuth();
  const [items, setItems] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminListArticles(token, {
        q: search || undefined,
        limit: 100,
      });
      setItems(res.items);
    } catch (err: any) {
      setError(err?.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  async function onDelete(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    const token = getToken();
    if (!token) return;
    try {
      await api.adminDeleteArticle(token, id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    }
  }

  if (!ready) return null;

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-brand-900">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-3 py-1.5 rounded"
        >
          + New Article
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title..."
          className="flex-1 border border-ink-300 rounded px-3 py-2 text-sm bg-white"
        />
        <button className="bg-brand-700 text-white px-3 py-2 rounded text-sm font-semibold">
          Search
        </button>
      </form>

      {error && (
        <div className="bg-white border border-accent-500/40 rounded p-3 text-sm text-accent-600 mb-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-100 text-ink-700 text-left">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Views</th>
              <th className="px-4 py-2.5">Published</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-500">
                  No articles yet.
                </td>
              </tr>
            )}
            {items.map((a) => (
              <tr
                key={a.id}
                className="border-t border-ink-300/40 hover:bg-surface-50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {a.title}
                  </Link>
                  <div className="text-xs text-ink-500 mt-0.5">{a.slug}</div>
                </td>
                <td className="px-4 py-3">
                  {a.published ? (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-ink-500 bg-surface-100 px-2 py-0.5 rounded-full">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-700">{a.views}</td>
                <td className="px-4 py-3 text-ink-500">
                  {formatIST(a.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="text-brand-700 hover:underline text-xs font-semibold mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(a.id)}
                    className="text-accent-600 hover:underline text-xs font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

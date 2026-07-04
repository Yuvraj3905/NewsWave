'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { getToken, useRequireAuth } from '@/components/AdminAuth';
import { api } from '@/lib/api';
import { Article, Category, Language, Location } from '@/lib/types';
import { formatIST } from '@/lib/format';

type PresetKey =
  | 'all'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'this_week', label: 'This Week' },
  { key: 'last_week', label: 'Last Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'this_year', label: 'This Year' },
  { key: 'last_year', label: 'Last Year' },
];

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi',
  pa: 'Punjabi',
};

function isoStart(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function isoEnd(d: Date): string {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function presetRange(p: PresetKey): { from?: string; to?: string } {
  const now = new Date();
  if (p === 'all') return {};
  if (p === 'this_week') {
    const day = now.getDay() || 7;
    const start = new Date(now);
    start.setDate(now.getDate() - (day - 1));
    return { from: isoStart(start), to: isoEnd(now) };
  }
  if (p === 'last_week') {
    const day = now.getDay() || 7;
    const start = new Date(now);
    start.setDate(now.getDate() - (day - 1) - 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: isoStart(start), to: isoEnd(end) };
  }
  if (p === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: isoStart(start), to: isoEnd(now) };
  }
  if (p === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: isoStart(start), to: isoEnd(end) };
  }
  if (p === 'this_year') {
    const start = new Date(now.getFullYear(), 0, 1);
    return { from: isoStart(start), to: isoEnd(now) };
  }
  if (p === 'last_year') {
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    return { from: isoStart(start), to: isoEnd(end) };
  }
  return {};
}

function articleLangs(a: Article): Language[] {
  const set = new Set<Language>(['en']);
  for (const t of a.translations || []) set.add(t.language);
  return Array.from(set);
}

export default function AdminArticlesPage() {
  const ready = useRequireAuth();
  const [items, setItems] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [preset, setPreset] = useState<PresetKey>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [langFilter, setLangFilter] = useState<'' | Language>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderEdits, setOrderEdits] = useState<Record<string, string>>({});
  const [savingOrder, setSavingOrder] = useState(false);

  const range = useMemo(() => {
    if (preset !== 'all') return presetRange(preset);
    return {
      from: dateFrom ? isoStart(new Date(dateFrom)) : undefined,
      to: dateTo ? isoEnd(new Date(dateTo)) : undefined,
    };
  }, [preset, dateFrom, dateTo]);

  async function load() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminListArticles(token, {
        q: search || undefined,
        category: categoryFilter || undefined,
        location: locationFilter || undefined,
        lang: langFilter || undefined,
        date_from: range.from,
        date_to: range.to,
        limit: 100,
      });
      setItems(res.items);
      setOrderEdits({});
    } catch (err: any) {
      setError(err?.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }

  async function onSaveOrder() {
    const token = getToken();
    if (!token) return;
    const changes = Object.entries(orderEdits).map(([id, raw]) => {
      const trimmed = raw.trim();
      return {
        id,
        display_order: trimmed === '' ? null : parseInt(trimmed, 10),
      };
    });
    if (changes.length === 0) return;
    setSavingOrder(true);
    try {
      await api.adminReorderArticles(token, changes);
      setItems((prev) =>
        prev.map((a) => {
          const change = changes.find((c) => c.id === a.id);
          return change ? { ...a, display_order: change.display_order } : a;
        }),
      );
      setOrderEdits({});
    } catch (err: any) {
      alert(err?.message || 'Save order failed');
    } finally {
      setSavingOrder(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    api.listCategories().then(setCategories).catch(() => setCategories([]));
    api.listLocations().then(setLocations).catch(() => setLocations([]));
  }, [ready]);

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    preset,
    dateFrom,
    dateTo,
    categoryFilter,
    locationFilter,
    langFilter,
  ]);

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

  function resetFilters() {
    setSearch('');
    setPreset('all');
    setDateFrom('');
    setDateTo('');
    setCategoryFilter('');
    setLocationFilter('');
    setLangFilter('');
  }

  if (!ready) return null;

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-brand-900">
          Articles
        </h1>
        <Link
          href="/admin/articles/new"
          className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-3 py-1.5 rounded"
        >
          + New Article
        </Link>
      </div>

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-3 sm:p-4 mb-4 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search press notes..."
            className="flex-1 border border-ink-300 rounded px-3 py-2 text-sm bg-white"
          />
          <button className="bg-brand-700 text-white px-3 py-2 rounded text-sm font-semibold">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => {
            const active = preset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setPreset(p.key);
                  if (p.key !== 'all') {
                    setDateFrom('');
                    setDateTo('');
                  }
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${
                  active
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-white text-ink-700 border-ink-300 hover:border-brand-500'
                }`}
              >
                {p.label}
              </button>
            );
          })}
          <span className="text-xs text-ink-500 mx-1">or</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPreset('all');
            }}
            className="border border-ink-300 rounded px-2 py-1.5 text-xs"
            aria-label="Start date"
          />
          <span className="text-xs text-ink-500">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPreset('all');
            }}
            className="border border-ink-300 rounded px-2 py-1.5 text-xs"
            aria-label="End date"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-ink-300 rounded px-2 py-1.5 text-xs bg-white"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border border-ink-300 rounded px-2 py-1.5 text-xs bg-white"
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value as Language | '')}
            className="border border-ink-300 rounded px-2 py-1.5 text-xs bg-white"
            aria-label="Filter by language"
          >
            <option value="">All Languages</option>
            {(['en', 'hi', 'pa'] as Language[]).map((l) => (
              <option key={l} value={l}>
                {LANG_LABELS[l]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-ink-500 hover:text-brand-700 px-2 py-1.5"
          >
            Reset
          </button>
          <span className="ml-auto text-xs text-ink-500">
            {loading ? 'Loading...' : `${items.length} result${items.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-white border border-accent-500/40 rounded p-3 text-sm text-accent-600 mb-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p className="text-xs text-ink-500">
          Set <strong>Order</strong> to a number to pin an article higher (1 first). Blank uses default date order. Applies to Latest Headlines, Trending Now, and Breaking News.
        </p>
        <button
          type="button"
          onClick={onSaveOrder}
          disabled={savingOrder || Object.keys(orderEdits).length === 0}
          className="bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded"
        >
          {savingOrder
            ? 'Saving...'
            : `Save Order${Object.keys(orderEdits).length ? ` (${Object.keys(orderEdits).length})` : ''}`}
        </button>
      </div>

      <div className="hidden md:block bg-white border border-ink-300/40 rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-surface-100 text-ink-700 text-left">
            <tr>
              <th className="px-3 py-2.5 w-20">Order</th>
              <th className="px-3 py-2.5">Title</th>
              <th className="px-3 py-2.5">Category</th>
              <th className="px-3 py-2.5">Location</th>
              <th className="px-3 py-2.5">Language</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Views</th>
              <th className="px-3 py-2.5">Published</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-ink-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-ink-500">
                  No articles match the current filters.
                </td>
              </tr>
            )}
            {items.map((a) => {
              const cats = (a.categories || []).map((c) => c.name).join(', ');
              const locs = (a.locations || []).map((l) => l.name).join(', ');
              const langs = articleLangs(a)
                .map((l) => l.toUpperCase())
                .join(', ');
              const displayDate = a.published_at || a.created_at;
              const editedOrder = orderEdits[a.id];
              const currentOrder =
                editedOrder !== undefined
                  ? editedOrder
                  : a.display_order === null || a.display_order === undefined
                    ? ''
                    : String(a.display_order);
              return (
                <tr
                  key={a.id}
                  className="border-t border-ink-300/40 hover:bg-surface-50 align-top"
                >
                  <td className="px-3 py-3 w-20">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={currentOrder}
                      onChange={(e) =>
                        setOrderEdits((prev) => ({
                          ...prev,
                          [a.id]: e.target.value,
                        }))
                      }
                      placeholder="—"
                      className="w-16 border border-ink-300 rounded px-2 py-1 text-xs text-center"
                      aria-label={`Display order for ${a.title}`}
                    />
                  </td>
                  <td className="px-3 py-3 max-w-[260px]">
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="font-semibold text-brand-700 hover:underline line-clamp-2"
                    >
                      {a.title}
                    </Link>
                    <div className="text-xs text-ink-500 mt-0.5 truncate">
                      {a.slug}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-700 text-xs">
                    {cats || <span className="text-ink-500">—</span>}
                  </td>
                  <td className="px-3 py-3 text-ink-700 text-xs">
                    {locs || <span className="text-ink-500">—</span>}
                  </td>
                  <td className="px-3 py-3 text-ink-700 text-xs">{langs}</td>
                  <td className="px-3 py-3">
                    {a.published ? (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        Published
                      </span>
                    ) : a.scheduled_at ? (
                      <span
                        className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap"
                        title={`Auto-publishes ${formatIST(a.scheduled_at)}`}
                      >
                        Scheduled · {formatIST(a.scheduled_at)}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-ink-500 bg-surface-100 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-ink-700">{a.views}</td>
                  <td className="px-3 py-3 text-ink-500 text-xs whitespace-nowrap">
                    {formatIST(displayDate)}
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
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
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {loading && (
          <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-4 text-center text-sm text-ink-500">
            Loading...
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-4 text-center text-sm text-ink-500">
            No articles match the current filters.
          </div>
        )}
        {items.map((a) => {
          const cats = (a.categories || []).map((c) => c.name).join(', ');
          const locs = (a.locations || []).map((l) => l.name).join(', ');
          const langs = articleLangs(a)
            .map((l) => l.toUpperCase())
            .join(', ');
          const displayDate = a.published_at || a.created_at;
          const editedOrder = orderEdits[a.id];
          const currentOrder =
            editedOrder !== undefined
              ? editedOrder
              : a.display_order === null || a.display_order === undefined
                ? ''
                : String(a.display_order);
          return (
            <div
              key={a.id}
              className="bg-white border border-ink-300/40 rounded-lg shadow-card p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="font-semibold text-brand-700 hover:underline line-clamp-2 text-sm"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[11px] text-ink-500 mt-0.5 truncate">
                    {a.slug}
                  </div>
                </div>
                {a.published ? (
                  <span className="shrink-0 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    Published
                  </span>
                ) : a.scheduled_at ? (
                  <span className="shrink-0 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    Scheduled
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-semibold text-ink-500 bg-surface-100 px-2 py-0.5 rounded-full">
                    Draft
                  </span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-ink-700">
                <div>
                  <span className="text-ink-500">Cat:</span>{' '}
                  {cats || <span className="text-ink-500">—</span>}
                </div>
                <div>
                  <span className="text-ink-500">Loc:</span>{' '}
                  {locs || <span className="text-ink-500">—</span>}
                </div>
                <div>
                  <span className="text-ink-500">Lang:</span> {langs}
                </div>
                <div>
                  <span className="text-ink-500">Views:</span> {a.views}
                </div>
                <div className="col-span-2 text-ink-500">
                  {formatIST(displayDate)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-[11px] text-ink-700">
                  <span>Order</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={currentOrder}
                    onChange={(e) =>
                      setOrderEdits((prev) => ({
                        ...prev,
                        [a.id]: e.target.value,
                      }))
                    }
                    placeholder="—"
                    className="w-16 border border-ink-300 rounded px-2 py-1 text-xs text-center"
                    aria-label={`Display order for ${a.title}`}
                  />
                </label>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="text-brand-700 hover:underline text-xs font-semibold"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(a.id)}
                    className="text-accent-600 hover:underline text-xs font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}

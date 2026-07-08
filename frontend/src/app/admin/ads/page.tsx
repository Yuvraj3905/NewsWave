'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { getToken, useRequireAuth } from '@/components/AdminAuth';
import { api } from '@/lib/api';
import { Ad, AdSlot, AdType } from '@/lib/types';

const SLOTS: { value: AdSlot; label: string }[] = [
  { value: 'home_banner', label: 'Homepage Banner' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'in_article', label: 'In-Article' },
];
const SLOT_LABEL: Record<AdSlot, string> = {
  home_banner: 'Homepage Banner',
  sidebar: 'Sidebar',
  in_article: 'In-Article',
};

const BLANK = {
  name: '',
  slot: 'sidebar' as AdSlot,
  type: 'image' as AdType,
  image_url: '',
  target_url: '',
  html: '',
  active: true,
  priority: 0,
};

export default function AdminAdsPage() {
  const ready = useRequireAuth();
  const [items, setItems] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Ad>>({ ...BLANK });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      setItems(await api.adminListAds(token));
    } catch (err: any) {
      setError(err?.message || 'Failed to load ads');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  function resetForm() {
    setForm({ ...BLANK });
    setEditingId(null);
  }

  function editAd(ad: Ad) {
    setEditingId(ad.id);
    setForm({
      name: ad.name,
      slot: ad.slot,
      type: ad.type,
      image_url: ad.image_url || '',
      target_url: ad.target_url || '',
      html: ad.html || '',
      active: ad.active,
      priority: ad.priority,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await api.adminUpdateAd(token, editingId, form);
      } else {
        await api.adminCreateAd(token, form);
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this ad?')) return;
    const token = getToken();
    if (!token) return;
    try {
      await api.adminDeleteAd(token, id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    }
  }

  async function toggleActive(ad: Ad) {
    const token = getToken();
    if (!token) return;
    try {
      const updated = await api.adminUpdateAd(token, ad.id, {
        active: !ad.active,
      });
      setItems((prev) => prev.map((a) => (a.id === ad.id ? updated : a)));
    } catch (err: any) {
      alert(err?.message || 'Update failed');
    }
  }

  if (!ready) return null;

  const isHtml = form.type === 'html';

  return (
    <AdminShell>
      <h1 className="text-xl sm:text-2xl font-extrabold text-brand-900 mb-6">
        Ad Placements
      </h1>

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-3 sm:p-6 mb-6">
        <h2 className="font-bold text-ink-900 text-sm mb-3">
          {editingId ? 'Edit Ad' : 'New Ad'}
        </h2>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Name
            </label>
            <input
              required
              value={form.name || ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Slot
              </label>
              <select
                value={form.slot}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slot: e.target.value as AdSlot }))
                }
                className="w-full border border-ink-300 rounded px-3 py-2 text-sm bg-white"
              >
                {SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as AdType }))
                }
                className="w-full border border-ink-300 rounded px-3 py-2 text-sm bg-white"
              >
                <option value="image">Image</option>
                <option value="html">HTML / Script</option>
              </select>
            </div>
          </div>

          {isHtml ? (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-700 mb-1">
                HTML / Ad-network snippet
              </label>
              <textarea
                rows={4}
                value={form.html || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, html: e.target.value }))
                }
                className="w-full border border-ink-300 rounded px-3 py-2 text-sm font-mono"
                placeholder="<script>...</script> or <ins class='adsbygoogle'>..."
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={form.image_url || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image_url: e.target.value }))
                  }
                  className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Target URL (click-through)
                </label>
                <input
                  type="url"
                  value={form.target_url || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, target_url: e.target.value }))
                  }
                  className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Priority (lower shows first)
            </label>
            <input
              type="number"
              value={form.priority ?? 0}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: Number(e.target.value) }))
              }
              className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <span>Active</span>
          </label>

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded text-sm"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Ad'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-ink-500 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-white border border-accent-500/40 rounded p-3 text-sm text-accent-600 mb-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-surface-100 text-ink-700 text-left">
            <tr>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Slot</th>
              <th className="px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5">Priority</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-500">
                  No ads yet.
                </td>
              </tr>
            )}
            {items.map((ad) => (
              <tr key={ad.id} className="border-t border-ink-300/40">
                <td className="px-3 py-3 font-semibold text-ink-900">
                  {ad.name}
                </td>
                <td className="px-3 py-3 text-ink-700 text-xs">
                  {SLOT_LABEL[ad.slot]}
                </td>
                <td className="px-3 py-3 text-ink-700 text-xs">{ad.type}</td>
                <td className="px-3 py-3 text-ink-700">{ad.priority}</td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => toggleActive(ad)}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      ad.active
                        ? 'text-green-700 bg-green-50'
                        : 'text-ink-500 bg-surface-100'
                    }`}
                  >
                    {ad.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => editAd(ad)}
                    className="text-brand-700 hover:underline text-xs font-semibold mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(ad.id)}
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

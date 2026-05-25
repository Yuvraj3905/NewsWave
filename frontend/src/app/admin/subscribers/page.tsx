'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { getToken, useRequireAuth } from '@/components/AdminAuth';
import { api } from '@/lib/api';
import {
  Subscriber,
  SubscriberCounts,
  SubscriberStatus,
} from '@/lib/types';
import { formatIST } from '@/lib/format';

type TabKey = 'all' | SubscriberStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

const STATUS_PILL: Record<SubscriberStatus, string> = {
  pending: 'text-amber-700 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-200',
  approved: 'text-green-700 bg-green-50 dark:bg-green-900/40 dark:text-green-200',
  rejected: 'text-ink-500 bg-surface-100 dark:bg-navy-700 dark:text-navy-300',
};

export default function SubscribersPage() {
  const ready = useRequireAuth();
  const [items, setItems] = useState<Subscriber[]>([]);
  const [counts, setCounts] = useState<SubscriberCounts | null>(null);
  const [tab, setTab] = useState<TabKey>('pending');
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const token = getToken();
    if (!token) return;
    try {
      const [list, c] = await Promise.all([
        api.adminListSubscribers(
          token,
          tab === 'all' ? undefined : (tab as SubscriberStatus),
        ),
        api.adminSubscriberCount(token),
      ]);
      setItems(list);
      setCounts(c);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    }
  }

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tab]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail) return;
    setAdding(true);
    setError(null);
    try {
      await api.subscribe(newEmail, newName || undefined);
      setNewEmail('');
      setNewName('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  }

  async function onAction(
    id: string,
    action: 'approve' | 'reject' | 'delete',
  ) {
    if (action === 'delete' && !confirm('Permanently remove this subscriber?'))
      return;
    const token = getToken();
    if (!token) return;
    setBusyId(id);
    try {
      if (action === 'approve') await api.adminApproveSubscriber(token, id);
      else if (action === 'reject') await api.adminRejectSubscriber(token, id);
      else await api.adminDeleteSubscriber(token, id);
      await load();
    } catch (err: any) {
      alert(err?.message || `${action} failed`);
    } finally {
      setBusyId(null);
    }
  }

  if (!ready) return null;

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-brand-900 dark:text-white">
          Subscribers
        </h1>
        {counts && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold dark:bg-amber-900/40 dark:text-amber-200">
              Pending: {counts.pending}
            </span>
            <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-semibold dark:bg-green-900/40 dark:text-green-200">
              Approved: {counts.approved}
            </span>
            <span className="px-2 py-1 rounded-full bg-surface-100 text-ink-700 font-semibold dark:bg-navy-700 dark:text-navy-200">
              Rejected: {counts.rejected}
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={onAdd}
        className="bg-white border border-ink-300/40 rounded-lg shadow-card p-4 mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] dark:bg-navy-800 dark:border-navy-700"
      >
        <input
          type="email"
          required
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="border border-ink-300 rounded px-3 py-2 text-sm dark:bg-navy-700 dark:border-navy-600 dark:text-navy-50"
        />
        <input
          type="text"
          placeholder="Name (optional)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="border border-ink-300 rounded px-3 py-2 text-sm dark:bg-navy-700 dark:border-navy-600 dark:text-navy-50"
        />
        <button
          disabled={adding}
          className="bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded text-sm"
        >
          {adding ? 'Adding...' : 'Add (Pending)'}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {TABS.map((t) => {
          const active = tab === t.key;
          const badge =
            counts && t.key !== 'all'
              ? counts[t.key as SubscriberStatus]
              : counts?.total;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${
                active
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-ink-700 border-ink-300 hover:border-brand-500 dark:bg-navy-800 dark:text-navy-100 dark:border-navy-600'
              }`}
            >
              {t.label}
              {badge !== undefined && (
                <span className="ml-1.5 opacity-70">({badge})</span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-white border border-accent-500/40 rounded p-3 text-sm text-accent-600 mb-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card overflow-x-auto dark:bg-navy-800 dark:border-navy-700">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-surface-100 text-ink-700 text-left dark:bg-navy-700 dark:text-navy-100">
            <tr>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Subscribed</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-500">
                  No subscribers in this view.
                </td>
              </tr>
            )}
            {items.map((s) => {
              const status: SubscriberStatus = s.status || 'pending';
              const busy = busyId === s.id;
              return (
                <tr
                  key={s.id}
                  className="border-t border-ink-300/40 hover:bg-surface-50 dark:border-navy-700 dark:hover:bg-navy-700/60"
                >
                  <td className="px-4 py-3 font-medium dark:text-navy-50">
                    {s.email}
                  </td>
                  <td className="px-4 py-3 text-ink-700 dark:text-navy-200">
                    {s.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[status]}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500 dark:text-navy-300 whitespace-nowrap">
                    {formatIST(s.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {status !== 'approved' && (
                      <button
                        disabled={busy}
                        onClick={() => onAction(s.id, 'approve')}
                        className="text-green-700 hover:underline disabled:opacity-50 text-xs font-semibold mr-3 dark:text-green-300"
                      >
                        Approve
                      </button>
                    )}
                    {status !== 'rejected' && (
                      <button
                        disabled={busy}
                        onClick={() => onAction(s.id, 'reject')}
                        className="text-ink-700 hover:underline disabled:opacity-50 text-xs font-semibold mr-3 dark:text-navy-200"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      disabled={busy}
                      onClick={() => onAction(s.id, 'delete')}
                      className="text-accent-600 hover:underline disabled:opacity-50 text-xs font-semibold"
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

      <p className="text-[11px] text-ink-500 mt-3 dark:text-navy-300">
        Newsletter delivery targets only <strong>approved</strong> subscribers. New signups
        from the public site arrive as <strong>pending</strong> and must be approved here.
      </p>
    </AdminShell>
  );
}

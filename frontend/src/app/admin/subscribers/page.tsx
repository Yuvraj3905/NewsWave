'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { getToken, useRequireAuth } from '@/components/AdminAuth';
import { api } from '@/lib/api';
import { Subscriber } from '@/lib/types';
import { formatIST } from '@/lib/format';

export default function SubscribersPage() {
  const ready = useRequireAuth();
  const [items, setItems] = useState<Subscriber[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  async function load() {
    const token = getToken();
    if (!token) return;
    try {
      const list = await api.adminListSubscribers(token);
      setItems(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    }
  }

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail) return;
    setAdding(true);
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

  async function onRevoke(id: string) {
    const token = getToken();
    if (!token) return;
    try {
      await api.adminRevokeSubscriber(token, id);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Revoke failed');
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Permanently remove this subscriber?')) return;
    const token = getToken();
    if (!token) return;
    try {
      await api.adminDeleteSubscriber(token, id);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    }
  }

  if (!ready) return null;

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold text-brand-900 mb-6">
        Subscribers
      </h1>

      <form
        onSubmit={onAdd}
        className="bg-white border border-ink-300/40 rounded-lg shadow-card p-4 mb-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          type="email"
          required
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="border border-ink-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Name (optional)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="border border-ink-300 rounded px-3 py-2 text-sm"
        />
        <button
          disabled={adding}
          className="bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded text-sm"
        >
          {adding ? 'Adding...' : 'Add'}
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
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Subscribed</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-500">
                  No subscribers yet.
                </td>
              </tr>
            )}
            {items.map((s) => (
              <tr
                key={s.id}
                className="border-t border-ink-300/40 hover:bg-surface-50"
              >
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3 text-ink-700">{s.name || '-'}</td>
                <td className="px-4 py-3">
                  {s.active ? (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-ink-500 bg-surface-100 px-2 py-0.5 rounded-full">
                      Revoked
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {formatIST(s.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  {s.active && (
                    <button
                      onClick={() => onRevoke(s.id)}
                      className="text-ink-700 hover:underline text-xs font-semibold mr-3"
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(s.id)}
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
